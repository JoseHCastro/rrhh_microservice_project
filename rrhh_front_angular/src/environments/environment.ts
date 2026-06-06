// Configuración de entorno. apiUrl apunta al backend Spring Boot + GraphQL.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  graphqlPath: '/graphql',
  loginPath: '/api/v1/auth/login',
  refreshPath: '/api/v1/auth/refresh',
  fastapiGql: 'http://localhost:8001/graphql',
};
