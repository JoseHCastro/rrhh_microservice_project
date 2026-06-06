import strawberry
import json
from typing import Optional
from database import get_db
from models import RegistroAsistencia, ReconocimientoFacial
from graphql_schema.types import RegistroResponse, MarcacionType, EnrolamientoResponse, ReconocimientoType
from services.s3_service import upload_base64_image
from datetime import datetime

@strawberry.type
class Mutation:
    @strawberry.mutation
    def registrar_asistencia(
        self, 
        empleado_id: int, 
        foto_base64: str, 
        latitud: float, 
        longitud: float, 
        tipo: str
    ) -> RegistroResponse:
        
        import base64
        from services.liveness_service import check_liveness

        # LIVENESS DETECTION (CU-03)
        try:
            # Eliminar el encabezado "data:image/jpeg;base64," si viene del frontend
            if "," in foto_base64:
                foto_base64_data = foto_base64.split(",")[1]
            else:
                foto_base64_data = foto_base64
            
            image_bytes = base64.b64decode(foto_base64_data)
        except Exception as e:
            return RegistroResponse(
                success=False,
                message=f"Error al decodificar la imagen: {str(e)}",
                marcacion=None
            )

        is_live, liveness_score = check_liveness(image_bytes)

        if not is_live:
            return RegistroResponse(
                success=False,
                message=f"Prueba de vida fallida (Score: {liveness_score:.2f}). Intento de spoofing detectado.",
                marcacion=None
            )

        # MOCK FACE MATCH (CU-04) — pendiente implementación con embeddings
        is_match = True

        if not is_match:
            return RegistroResponse(
                success=False,
                message="El rostro no coincide con el perfil del empleado.",
                marcacion=None
            )

        db = next(get_db())
        try:
            try:
                foto_uri = upload_base64_image(foto_base64)
            except Exception as e:
                foto_uri = None
                print(f"Advertencia: No se pudo subir a S3: {e}")

            ubicacion_gps = f"{latitud},{longitud}"

            if tipo == 'ENTRADA':
                marcacion = RegistroAsistencia(
                    empleado_id=empleado_id,
                    hora_entrada=datetime.now(),
                    ubicacion_gps=ubicacion_gps,
                    estado='PRESENTE',
                    estado_planilla='PENDIENTE',
                    foto_uri=foto_uri
                )
                db.add(marcacion)
            else:
                # Buscar la entrada del día actual para marcar la salida
                hoy = datetime.now().date()
                marcacion = db.query(RegistroAsistencia).filter(
                    RegistroAsistencia.empleado_id == empleado_id,
                    db.func.date(RegistroAsistencia.hora_entrada) == hoy,
                    RegistroAsistencia.hora_salida.is_(None)
                ).first()

                if not marcacion:
                    return RegistroResponse(
                        success=False,
                        message="No se encontró una marca de ENTRADA sin salida para hoy.",
                        marcacion=None
                    )
                
                marcacion.hora_salida = datetime.now()
                if foto_uri:
                    marcacion.foto_uri = foto_uri

            db.commit()
            db.refresh(marcacion)
            
            return RegistroResponse(
                success=True,
                message="Asistencia registrada exitosamente.",
                marcacion=MarcacionType(
                    id=marcacion.id,
                    empleado_id=marcacion.empleado_id,
                    hora_entrada=str(marcacion.hora_entrada),
                    hora_salida=str(marcacion.hora_salida) if marcacion.hora_salida else None,
                    ubicacion_gps=marcacion.ubicacion_gps,
                    estado=marcacion.estado,
                    estado_planilla=marcacion.estado_planilla,
                    foto_uri=marcacion.foto_uri
                )
            )
        except Exception as e:
            db.rollback()
            return RegistroResponse(
                success=False,
                message=f"Error en base de datos: {str(e)}",
                marcacion=None
            )

    @strawberry.mutation
    def enrolar_rostro(
        self,
        empleado_id: int,
        descriptor: str,  # JSON string de array de 128 floats extraído por face-api.js
    ) -> EnrolamientoResponse:
        """
        Guarda el embedding facial de un empleado en la tabla reconocimiento_facial.
        El 'descriptor' es un JSON array de 128 números flotantes generado por face-api.js
        en el navegador del usuario.
        """
        # Validar que el descriptor sea un JSON array válido de 128 floats
        try:
            parsed = json.loads(descriptor)
            if not isinstance(parsed, list) or len(parsed) != 128:
                return EnrolamientoResponse(
                    success=False,
                    message=f"El descriptor debe ser un array de exactamente 128 valores. Se recibieron {len(parsed) if isinstance(parsed, list) else 'N/A'}.",
                    reconocimiento=None
                )
            # Verificar que todos sean números
            for val in parsed:
                if not isinstance(val, (int, float)):
                    raise ValueError("El array debe contener solo números.")
        except json.JSONDecodeError:
            return EnrolamientoResponse(
                success=False,
                message="El descriptor no es un JSON válido.",
                reconocimiento=None
            )
        except ValueError as e:
            return EnrolamientoResponse(
                success=False,
                message=str(e),
                reconocimiento=None
            )

        db = next(get_db())
        try:
            # Buscar si el empleado ya tiene un registro de reconocimiento
            existente = db.query(ReconocimientoFacial).filter(
                ReconocimientoFacial.empleado_id == empleado_id
            ).first()

            if existente:
                # Actualizar el existente
                existente.descriptor = descriptor
                existente.fecha_registro = datetime.now()
                existente.activo = True
                nuevo = existente
            else:
                # Crear el nuevo registro
                nuevo = ReconocimientoFacial(
                    empleado_id=empleado_id,
                    codigo_facial=f"BIOMETRIC_{empleado_id}",
                    descriptor=descriptor,
                    fecha_registro=datetime.now(),
                    activo=True
                )
                db.add(nuevo)
            
            db.commit()
            db.refresh(nuevo)

            return EnrolamientoResponse(
                success=True,
                message=f"Rostro del empleado {empleado_id} enrolado exitosamente.",
                reconocimiento=ReconocimientoType(
                    id=nuevo.id,
                    empleado_id=nuevo.empleado_id,
                    fecha_registro=str(nuevo.fecha_registro),
                    activo=nuevo.activo
                )
            )
        except Exception as e:
            db.rollback()
            return EnrolamientoResponse(
                success=False,
                message=f"Error al guardar en base de datos: {str(e)}",
                reconocimiento=None
            )
