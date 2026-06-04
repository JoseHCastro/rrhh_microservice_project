import strawberry
from graphql_schema.mutations import Mutation

@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "Servicio de Biometría y Asistencia"

schema = strawberry.Schema(query=Query, mutation=Mutation)
