import strawberry
from typing import Optional
from database import get_db
from models import RegistroAsistencia
from graphql_schema.types import RegistroResponse, MarcacionType
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
        
        # MOCK LIVENESS & FACE MATCH (CU-03 & CU-04)
        is_live = True
        is_match = True

        if not is_live:
            return RegistroResponse(
                success=False,
                message="Prueba de vida fallida. Intento de spoofing detectado.",
                marcacion=None
            )
            
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
                # PostgreSQL cast date
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
                # Actualizamos la foto_uri a la foto de salida si se requiere (o creamos log de fotos)
                # Por ahora sobreescribimos o dejamos la de entrada si foto_uri es None
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
