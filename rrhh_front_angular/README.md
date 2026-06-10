# Sistema de Gestión de Recursos Humanos (RRHH) — Frontend Angular

Aplicación cliente (**SPA**) del sistema RRHH, desarrollada con **Angular 16**. Se conecta a tres microservicios backend:

| Microservicio | Tecnología | URL de producción |
|---|---|---|
| Core HR & Auth | Spring Boot (AWS Elastic Beanstalk) | `https://rrhh-prod.eba-p8y8badt.us-east-2.elasticbeanstalk.com` |
| Seguridad / Bitácora | NestJS (Cloudflare Tunnel) | `https://tomorrow-pictures-guidelines-applicable.trycloudflare.com/graphql` |
| Asistencia / IA | FastAPI (DuckDNS) | `https://hr-fastapi.duckdns.org` |

> ⚠️ La URL del túnel de NestJS (`trycloudflare.com`) **cambia cada vez que se reinicia el túnel**. Actualiza `nestUrl` en los environments cuando esto ocurra.

---

## Funcionalidades

- **Empleados** — CRUD completo del personal de la organización.
- **Departamentos** — Estructura organizacional y asignación de áreas.
- **Asistencia** — Control de entradas/salidas con reconocimiento facial.
- **Preplanillas** — Cálculo preliminar de nómina basado en asistencia.
- **Bitácora de Auditoría** — Logs de seguridad desde NestJS/DynamoDB vía GraphQL.
- **Reportes con IA** — Generación de reportes con Gemini y exportación CSV/PDF.

---

## Tecnologías

| Paquete | Versión |
|---|---|
| Angular | `16.2.0` |
| Node.js | `18.x` — `20.x` |
| Bootstrap | `5.3.2` |
| RxJS | `7.8.0` |
| Chart.js | `4.5.1` |
| face-api.js | `0.22.2` |

---

## Requisitos previos

1. [Node.js 18+](https://nodejs.org/) instalado.
2. Angular CLI 16 instalado globalmente:
   ```bash
   npm install -g @angular/cli@16
   ```

---

## 🖥️ Inicio en local (desarrollo)

### 1. Instalar dependencias

```bash
cd rrhh_front_angular
npm install
```

> Si hay conflictos de versiones entre paquetes usa: `npm install --legacy-peer-deps`

### 2. Variables de entorno para desarrollo

El archivo [`src/environments/environment.ts`](src/environments/environment.ts) se usa automáticamente con `npm start`.  
Los valores actuales apuntan a los servicios cloud del equipo:

```typescript
export const environment = {
  production: false,
  apiUrl:       'https://rrhh-prod.eba-p8y8badt.us-east-2.elasticbeanstalk.com',
  graphqlPath:  '/graphql',
  loginPath:    '/api/v1/auth/login',
  refreshPath:  '/api/v1/auth/refresh',
  nestUrl:      'https://tomorrow-pictures-guidelines-applicable.trycloudflare.com/graphql',
  fastapiUrl:   'https://hr-fastapi.duckdns.org',
  fastapiGql:   'https://hr-fastapi.duckdns.org/graphql',
};
```

Si levantas los backends localmente, cambia `apiUrl` a `http://localhost:8080`, `nestUrl` a `http://localhost:3000` y `fastapiUrl`/`fastapiGql` a `http://localhost:8000`.

### 3. Levantar el servidor de desarrollo

```bash
npm start
```

> Internamente ejecuta `ng serve`. Escucha en **http://localhost:4200** con *Live Reload* activo.

### 4. Abrir en el navegador

[http://localhost:4200](http://localhost:4200)

---

## 🐳 Inicio con Docker (local)

El [`Dockerfile`](Dockerfile) incluido levanta el servidor de desarrollo dentro de un contenedor.

```bash
# Construir la imagen
docker build -t rrhh-frontend .

# Ejecutar el contenedor
docker run -p 4200:4200 rrhh-frontend
```

Accede en: [http://localhost:4200](http://localhost:4200)

---

## 🚀 Build y despliegue en producción

### 1. Variables de entorno para producción

Edita [`src/environments/environment.prod.ts`](src/environments/environment.prod.ts) si necesitas cambiar alguna URL de producción:

```typescript
export const environment = {
  production: true,
  apiUrl:       'https://rrhh-prod.eba-p8y8badt.us-east-2.elasticbeanstalk.com',
  graphqlPath:  '/graphql',
  loginPath:    '/api/v1/auth/login',
  refreshPath:  '/api/v1/auth/refresh',
  nestUrl:      'https://tomorrow-pictures-guidelines-applicable.trycloudflare.com/graphql',
  fastapiUrl:   'https://hr-fastapi.duckdns.org',
  fastapiGql:   'https://hr-fastapi.duckdns.org/graphql',
};
```

> **Nunca** edites `environment.ts` para producción. Angular lo reemplaza automáticamente con `environment.prod.ts` al compilar con `--configuration production`.

### 2. Generar el bundle de producción

```bash
npm run build:prod
```

> Equivale a `ng build --configuration production`. Los artefactos optimizados y minificados se generan en **`dist/code-prueba/`**.

### 3. Opciones de despliegue

#### Netlify (recomendado)

| Campo | Valor |
|---|---|
| Build command | `npm run build:prod` |
| Publish directory | `dist/code-prueba` |

Conecta el repositorio en [app.netlify.com](https://app.netlify.com). El despliegue es automático en cada `git push` a `master`.

#### Servidor estático (Nginx)

Copia el contenido de `dist/code-prueba/` a la raíz del servidor web y redirige todas las rutas a `index.html` para el enrutamiento SPA:

```nginx
server {
    listen 80;
    root /var/www/rrhh-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Inicia el servidor de desarrollo (`ng serve`) en `localhost:4200` |
| `npm run build` | Build de desarrollo (sin optimizaciones) |
| `npm run build:prod` | **Build de producción** con `--configuration production` |
| `npm run watch` | Build en modo watch (reconstruye al guardar cambios) |
| `npm test` | Ejecuta los tests unitarios con Karma + Jasmine |

---

## Estructura de archivos relevante

```
rrhh_front_angular/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/               # Login, guards, JWT
│   │   │   └── core-hr/            # Empleados, Departamentos, Asistencia
│   │   ├── pages/
│   │   │   └── dashboard/          # Dashboard con reportes IA
│   │   └── _metronic/
│   │       └── shared/
│   │           └── interceptors/
│   │               └── auth.interceptor.ts  # Adjunta JWT a microservicios propios
│   └── environments/
│       ├── environment.ts           # ← Desarrollo (npm start)
│       └── environment.prod.ts      # ← Producción (npm run build:prod)
├── Dockerfile
└── package.json
```

---

## Solución de problemas frecuentes

### `npm error Missing script: "dev"`
Este proyecto usa `npm start`, no `npm run dev`:
```bash
npm start
```

### La Bitácora de Auditoría no carga datos
El `nestUrl` apunta a un túnel Cloudflare que cambia en cada reinicio. Actualiza `nestUrl` en ambos environments con la nueva URL del túnel y reinicia el servidor.

### `Property 'fastapiUrl' does not exist`
Asegúrate de que `src/environments/environment.ts` y `environment.prod.ts` contengan la propiedad `fastapiUrl`. Ver sección [Variables de entorno](#2-variables-de-entorno-para-desarrollo).

### Conflictos de dependencias en `npm install`
```bash
npm install --legacy-peer-deps
```
