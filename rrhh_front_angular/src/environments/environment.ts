// Entorno de DESARROLLO LOCAL.
// Estas URLs apuntan a los servicios corriendo en tu máquina con docker-compose o de forma manual.
// Al compilar con `ng build --configuration production`, Angular reemplaza este archivo por environment.prod.ts.
export const environment = {
  production: false,
  // Spring Boot local (Módulos 1/2). En la nube (Abel) sería, p.ej.:
  // 'http://beanstalk-rrhh-app-prod.eba-rvkrzdtv.us-east-2.elasticbeanstalk.com'
  apiUrl: 'http://localhost:8080',
  graphqlPath: '/graphql',
  loginPath: '/api/v1/auth/login',
  refreshPath: '/api/v1/auth/refresh',
  // Microservicio NestJS (Módulo 3): expone la Bitácora de Auditoría (DynamoDB)
  // vía GraphQL. En desarrollo local apunta al Nest en :3000.
  // En la nube sería la URL pública del túnel cloudflared, p.ej.
  // 'https://xxxx.trycloudflare.com' (ojo: esa URL cambia en cada arranque del túnel).
  nestUrl: 'http://localhost:3000',
  // FastAPI (Módulo 1, Jose): URL base y endpoint GraphQL del servicio de asistencia/ML.
  fastapiUrl: 'http://localhost:8001',
  fastapiGql: 'http://localhost:8001/graphql',
};
