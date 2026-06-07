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
        tipo: Optional[str] = None
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

        db = next(get_db())
        try:
            # Verificación de Enrolamiento y Face Match real
            enrolamiento = db.query(ReconocimientoFacial).filter(
                ReconocimientoFacial.empleado_id == empleado_id,
                ReconocimientoFacial.activo == True
            ).first()

            if not enrolamiento:
                return RegistroResponse(
                    success=False,
                    message="El empleado no tiene un rostro enrolado activo. Por favor, enrolar primero.",
                    marcacion=None
                )

            from services.face_recognition_service import verify_face
            import json
            
            try:
                known_descriptor_list = json.loads(enrolamiento.descriptor)
                is_match = verify_face(known_descriptor_list, image_bytes)
                
                if not is_match:
                    return RegistroResponse(
                        success=False,
                        message="El rostro no coincide con el perfil del empleado (Face Match fallido).",
                        marcacion=None
                    )
            except Exception as e:
                return RegistroResponse(
                    success=False,
                    message=f"Error en la verificación facial: {str(e)}",
                    marcacion=None
                )

            # Lógica Automática de ENTRADA / SALIDA
            hoy = datetime.now().date()
            
            from sqlalchemy import func
            
            entrada_pendiente = db.query(RegistroAsistencia).filter(
                RegistroAsistencia.empleado_id == empleado_id,
                func.date(RegistroAsistencia.hora_entrada) == hoy,
                RegistroAsistencia.hora_salida.is_(None)
            ).first()
            
            entrada_completa = db.query(RegistroAsistencia).filter(
                RegistroAsistencia.empleado_id == empleado_id,
                func.date(RegistroAsistencia.hora_entrada) == hoy,
                RegistroAsistencia.hora_salida.is_not(None)
            ).first()

            if entrada_completa and not entrada_pendiente:
                return RegistroResponse(
                    success=False,
                    message="Ya has registrado tanto la entrada como la salida para el día de hoy.",
                    marcacion=None
                )
            
            es_entrada = not entrada_pendiente

            try:
                foto_uri = upload_base64_image(foto_base64)
            except Exception as e:
                foto_uri = None
                print(f"Advertencia: No se pudo subir a S3: {e}")

            ubicacion_gps = f"{latitud},{longitud}"
            ahora = datetime.now()

            if es_entrada:
                # Calcular ESTADO
                hora_limite = ahora.replace(hour=8, minute=0, second=0, microsecond=0)
                estado_actual = 'REGISTRADO' if ahora <= hora_limite else 'RETRASO'

                marcacion = RegistroAsistencia(
                    empleado_id=empleado_id,
                    hora_entrada=ahora,
                    ubicacion_gps=ubicacion_gps,
                    estado=estado_actual,
                    estado_planilla='NORMAL',
                    foto_uri=foto_uri
                )
                db.add(marcacion)
            else:
                # Registrar SALIDA
                marcacion = entrada_pendiente
                marcacion.hora_salida = ahora

            db.commit()
            db.refresh(marcacion)
            
            return RegistroResponse(
                success=True,
                message=f"Asistencia de {'ENTRADA' if es_entrada else 'SALIDA'} registrada exitosamente.",
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
        foto_base64: str,
    ) -> EnrolamientoResponse:
        """
        Guarda el embedding facial de un empleado en la tabla reconocimiento_facial.
        El backend extrae el descriptor usando face_recognition.
        """
        import base64
        import json
        from services.face_recognition_service import get_face_descriptor

        try:
            if "," in foto_base64:
                foto_base64_data = foto_base64.split(",")[1]
            else:
                foto_base64_data = foto_base64
            
            image_bytes = base64.b64decode(foto_base64_data)
        except Exception as e:
            return EnrolamientoResponse(
                success=False,
                message=f"Error al decodificar la imagen: {str(e)}",
                reconocimiento=None
            )

        # Extraer descriptor
        descriptor_list = get_face_descriptor(image_bytes)
        
        if not descriptor_list:
            return EnrolamientoResponse(
                success=False,
                message="No se detectó ningún rostro claro en la imagen enviada. Intenta nuevamente.",
                reconocimiento=None
            )
            
        descriptor = json.dumps(descriptor_list)

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
