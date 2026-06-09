import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from database import engine, Base
from graphql_schema.schema import schema

# Initialize database tables
# Base.metadata.create_all(bind=engine)


from fastapi.middleware.cors import CORSMiddleware

graphql_app = GraphQLRouter(schema)

app = FastAPI(title="RRHH Biometric Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from routers import dashboard

app.include_router(graphql_app, prefix="/graphql")
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "FastAPI Biometric Service is running"}
