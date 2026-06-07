import strawberry
from typing import Optional, List
from graphql_schema.mutations import Mutation
from graphql_schema.types import ReconocimientoType
from database import get_db
from models import ReconocimientoFacial

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Servicio de Biometría y Asistencia"

    @strawberry.field
    def reconocimiento_facial(self, empleado_id: int) -> Optional[ReconocimientoType]:
        """
        Retorna el reconocimiento facial activo de un empleado,
        o None si aún no ha sido enrolado.
        """
        db = next(get_db())
        registro = db.query(ReconocimientoFacial).filter(
            ReconocimientoFacial.empleado_id == empleado_id,
            ReconocimientoFacial.activo == True
        ).first()
        if not registro:
            return None
        return ReconocimientoType(
            id=registro.id,
            empleado_id=registro.empleado_id,
            fecha_registro=str(registro.fecha_registro),
            activo=registro.activo
        )

schema = strawberry.Schema(query=Query, mutation=Mutation)
