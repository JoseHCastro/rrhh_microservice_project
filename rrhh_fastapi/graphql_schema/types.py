import strawberry
from typing import Optional

@strawberry.type
class MarcacionType:
    id: int
    empleado_id: int
    hora_entrada: str
    hora_salida: Optional[str]
    ubicacion_gps: Optional[str]
    estado: str
    estado_planilla: str
    foto_uri: Optional[str]

@strawberry.type
class RegistroResponse:
    success: bool
    message: str
    marcacion: Optional[MarcacionType]

@strawberry.type
class ReconocimientoType:
    id: int
    empleado_id: int
    fecha_registro: str
    activo: bool

@strawberry.type
class EnrolamientoResponse:
    success: bool
    message: str
    reconocimiento: Optional[ReconocimientoType]

@strawberry.type
class RiesgoResponse:
    empleado_id: int
    riesgo_ausentismo: float
    mensaje: str
