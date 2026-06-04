import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from database import engine, Base
from graphql_schema.schema import schema

# Initialize database tables
Base.metadata.create_all(bind=engine)

graphql_app = GraphQLRouter(schema)

app = FastAPI(title="RRHH Biometric Service")
app.include_router(graphql_app, prefix="/graphql")

@app.get("/")
def read_root():
    return {"message": "FastAPI Biometric Service is running"}
