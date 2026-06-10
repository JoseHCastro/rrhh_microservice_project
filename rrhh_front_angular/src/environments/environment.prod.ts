// Entorno de PRODUCCIÓN (nube).
// Este archivo es usado automáticamente al compilar con `ng build --configuration production`.
// NO modificar environment.ts para cambios de producción; modificar este archivo.
export const environment = {
  production: true,

  // Spring Boot — Elastic Beanstalk (AWS us-east-2)
  apiUrl: 'https://rrhh-prod.eba-p8y8badt.us-east-2.elasticbeanstalk.com',
  graphqlPath: '/graphql',
  loginPath: '/api/v1/auth/login',
  refreshPath: '/api/v1/auth/refresh',

  // NestJS — URL pública de tu servidor NestJS en producción.
  nestUrl: 'https://tomorrow-pictures-guidelines-applicable.trycloudflare.com/graphql',

  // FastAPI — Servicio Biométrico e IA (DuckDNS)
  fastapiUrl: 'https://hr-fastapi.duckdns.org',
  // fastapiGql mantiene compatibilidad con el código existente que apunta al endpoint GraphQL.
  fastapiGql: 'https://hr-fastapi.duckdns.org/graphql',
};
