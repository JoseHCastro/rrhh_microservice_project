// Entorno de DESARROLLO LOCAL.
// Estas URLs apuntan a los servicios corriendo en tu máquina con docker-compose o de forma manual.
// Al compilar con `ng build --configuration production`, Angular reemplaza este archivo por environment.prod.ts.
export const environment = {
  production: false,

  // Spring Boot — Autenticación, GraphQL, gestión RRHH principal.
  apiUrl: 'http://localhost:8080',
  graphqlPath: '/graphql',
  loginPath: '/api/v1/auth/login',
  refreshPath: '/api/v1/auth/refresh',

  // NestJS — Subida de archivos (S3/MinIO), automatizaciones n8n, bitácora DynamoDB.
  nestUrl: 'http://localhost:3000',

  // FastAPI — Servicio Biométrico e IA.
  fastapiUrl: 'http://localhost:8001',
  // fastapiGql: mantiene compatibilidad con código existente que apunta directo al endpoint GraphQL.
  fastapiGql: 'http://localhost:8001/graphql',
};
