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
