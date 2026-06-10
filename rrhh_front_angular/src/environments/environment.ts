// Configuración de entorno. apiUrl apunta al backend Spring Boot + GraphQL.
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
};
