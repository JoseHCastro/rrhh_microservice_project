import strawberry
from typing import Optional, List
from graphql_schema.mutations import Mutation
from graphql_schema.types import ReconocimientoType, RiesgoResponse
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

    @strawberry.field
    def obtener_prediccion_riesgo(self, empleado_id: Optional[int] = None) -> List[RiesgoResponse]:
        """
        Devuelve la predicción del modelo Random Forest sobre el riesgo de ausentismo.
        """
        db = next(get_db())
        from services.ml_random_forest_service import train_and_predict_risk
        
        try:
            resultados = train_and_predict_risk(db, target_empleado_id=empleado_id)
            return [
                RiesgoResponse(
                    empleado_id=r["empleado_id"],
                    riesgo_ausentismo=r["riesgo_ausentismo"],
                    mensaje=r["mensaje"]
                ) for r in resultados
            ]
        except Exception as e:
            return [
                RiesgoResponse(
                    empleado_id=empleado_id or 0,
                    riesgo_ausentismo=0.0,
                    mensaje=f"Error en predicción ML: {str(e)}"
                )
            ]

schema = strawberry.Schema(query=Query, mutation=Mutation)
