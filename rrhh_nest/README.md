# rrhh_nest — Módulo 3: Seguridad, Archivos y Automatización

Backend NestJS del **Módulo 3** del sistema RRHH. Implementa:

1. **Gestión de Privilegios y Grupos** — control de acceso fino sobre archivos.
2. **Gestión de Archivos (S3 / MinIO)** — upload/download con presigned URLs.
3. **Bitácora de Accesos (DynamoDB)** — schema oficial `USER#id` / `DOC#id` con TTL 365 días.
4. **Justificaciones de Ausencia + Webhook n8n** — flujo Telegram → Nest → Gmail.

## Stack

| Pieza | Versión / Detalle |
|---|---|
| Framework | NestJS 11 |
| Lenguaje | TypeScript 5.7 |
| API | GraphQL (code-first, Apollo) + REST (solo webhooks) |
| ORM | Prisma 6 (multi-schema: `public` lectura + `seguridad` writable) |
| Postgres | Compartido con Spring Boot (`rrhh_db`, schema `seguridad`) |
| S3 | AWS SDK v3 — MinIO en local |
| DynamoDB | AWS SDK v3 — DynamoDB Local en docker |
| Auth | JWT HS256 compartido con `rrhh_spring_boot` (mismo `JWT_SECRET`) |

## Estructura

```
rrhh_nest/
├── prisma/
│   ├── schema.prisma          # multi-schema: public (lectura) + seguridad (writable)
│   ├── seed.ts                # privilegios + grupos base
│   └── migrations/            # generadas por `prisma migrate dev`
├── src/
│   ├── main.ts                # bootstrap (ValidationPipe + CORS)
│   ├── app.module.ts
│   ├── config/
│   │   └── env.validation.ts  # validación estricta de envs
│   ├── auth/
│   │   ├── jwt.strategy.ts    # valida HS256 con secret Base64 (compatible Spring Boot)
│   │   ├── auth.service.ts    # carga roles + privilegios desde DB
│   │   ├── decorators/        # @Public, @Roles, @RequirePrivilege, @CurrentUser, @ClientIp
│   │   └── guards/            # JwtAuthGuard, RolesGuard, PrivilegeGuard (globales)
│   ├── shared/
│   │   ├── prisma/            # PrismaService global
│   │   ├── s3/                # S3Service (presigned upload/download)
│   │   └── dynamo/            # DynamoService (auto-crea tabla con schema oficial)
│   └── modules/
│       ├── privilegios/       # CRUD privilegios
│       ├── grupos/            # CRUD grupos + asignación priv/usuarios
│       ├── archivos/          # upload/download S3 + control fino
│       ├── bitacora/          # DynamoDB queries por usuario / por archivo
│       ├── canales/           # mapeo Empleado ↔ Telegram/WhatsApp
│       ├── justificaciones/   # aprobar/rechazar + creación desde webhook
│       └── webhooks/          # REST /api/v3/webhooks (n8n)
├── .env                       # config local (NO commitear)
├── .env.example
├── Dockerfile
├── postman_modulo3.json       # colección de Postman lista para importar
└── package.json
```

## Setup desde cero

### Opción A — Con Docker Compose (recomendada)

```bash
# Desde la raíz del repo
docker compose up --build -d
```

Esto levanta: `postgres`, `dynamodb`, `minio` + `minio_init` (crea bucket), `rrhh_nest`, `rrhh_spring_boot`, `rrhh_fastapi`, `rrhh_front_angular`, `n8n`.

Luego, **dentro del container `rrhh_nest`** (o desde tu host con `DATABASE_URL` apuntando a `localhost:5432`):

```bash
docker compose exec rrhh_nest npm run prisma:migrate:dev   # crea schema "seguridad" + tablas
docker compose exec rrhh_nest npx prisma db seed           # inserta privilegios + grupos base
```

### Opción B — Local sin Docker

Requiere: Node 22+, Postgres 17 en `localhost:5432` con DB `rrhh_db` (de Spring Boot).

```bash
cd rrhh_nest
cp .env.example .env
# Ajustá DB_HOST=localhost y DATABASE_URL para tu Postgres local
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

> Para correr local **necesitás DynamoDB Local y MinIO arriba** (puedes seguir usando los containers del docker-compose con solo `docker compose up -d postgres dynamodb minio minio_init`).

## URLs útiles

| Servicio | URL |
|---|---|
| GraphQL Playground | http://localhost:3000/graphql |
| Webhook n8n | http://localhost:3000/api/v3/webhooks/justificacion-ausencia |
| Health | http://localhost:3000/api/v3/webhooks/health |
| MinIO Console | http://localhost:9001 (`minioadmin` / `minioadmin`) |
| DynamoDB Local | http://localhost:8000 |
| n8n | http://localhost:5678 (`admin` / `admin`) |

## Probar de extremo a extremo

1. **Login en Spring Boot** para obtener un JWT:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password123"}'
   ```
2. Usar el `accessToken` como `Authorization: Bearer <token>` en GraphQL Playground (Nest):
   ```graphql
   query { misPrivilegios }
   ```
   (Si sos `ROLE_ADMIN`, el ADMIN bypasea privilegios; asignate a un grupo si querés ver el listado.)
3. **Subir un archivo**:
   ```graphql
   mutation {
     iniciarSubidaArchivo(input: {
       nombre: "Contrato Juan Perez",
       categoria: CONTRATO,
       contentType: "application/pdf",
       empleadoId: "5",
       privilegioLecturaCodigo: "ARCHIVO_LEER_CONTRATO",
       privilegioDescargaCodigo: "ARCHIVO_DESCARGAR_CONTRATO"
     }) {
       archivo { id s3Key }
       presignedUrl
       expiresInSeconds
     }
   }
   ```
   Subí el binario con `curl -X PUT --data-binary @contrato.pdf '<presignedUrl>'`.
   Luego confirmá:
   ```graphql
   mutation {
     confirmarSubidaArchivo(input: { archivoId: "1", tamanioBytes: 12345 }) { id estado }
   }
   ```
4. **Descargar** (registra automáticamente en bitácora):
   ```graphql
   query { urlDescargaArchivo(id: "1") }
   ```
5. **Ver bitácora**:
   ```graphql
   query { bitacoraPorArchivo(archivoId: "1") { timestamp accion usuarioId resultado ipOrigen } }
   ```

## Variables de entorno principales

Ver `.env.example` para la lista completa.

| Variable | Para qué |
|---|---|
| `DATABASE_URL` | URL completa Postgres incluyendo `?schema=seguridad` |
| `JWT_SECRET` | **Debe coincidir** con el de `rrhh_spring_boot/.env` (Base64) |
| `AWS_S3_ENDPOINT` | URL de MinIO (`http://minio:9000`) o vacío para AWS real |
| `AWS_S3_FORCE_PATH_STYLE` | `true` para MinIO, `false` para AWS |
| `DYNAMODB_TABLE_BITACORA` | Default `rrhh_bitacora_auditoria` (se autocrea al boot) |
| `BITACORA_TTL_DAYS` | TTL nativo de DynamoDB (default 365) |
| `N8N_WEBHOOK_SECRET` | Secret que valida el header `X-N8N-Webhook-Secret` |

## Roles y privilegios

El sistema combina dos capas de autorización:

- **Roles** (`ROLE_ADMIN`, `ROLE_RRHH`, `ROLE_SUPERVISOR`, `ROLE_EMPLEADO`) → autorización gruesa, los hereda del JWT de Spring Boot.
- **Privilegios** (`ARCHIVO_LEER_CONTRATO`, `BITACORA_CONSULTAR`, etc.) → autorización fina, vienen de los grupos asignados al usuario.

**`ROLE_ADMIN` bypasea todos los privilegios** (acceso total).

Para asignar un usuario a un grupo:

```graphql
mutation {
  asignarUsuarioAGrupo(usuarioId: "3", grupoId: "2") { id nombre totalUsuarios }
}
```

## Schema oficial DynamoDB (BitacoraAuditoria)

Tal como lo define la documentación del equipo en `Documentacion Contexto/gemini-code-*.html`:

| Atributo | Valor |
|---|---|
| `PK` | `USER#<usuario_id>` |
| `SK` | `<ISO_timestamp>#<uuid>` |
| `GSI1PK` | `DOC#<documento_s3_id>` |
| `GSI1SK` | `<ISO_timestamp>` |
| `accion` | `VISTA_PREVIA \| DESCARGA_PDF \| REENVIO_EMAIL \| SUBIDA \| ELIMINACION \| ACCESO_DENEGADO` |
| `ttl` | Epoch seconds (auto-expiración a los 365 días) |

La tabla se crea automáticamente al boot del servicio (`DynamoService.ensureTable`).

## n8n

El flujo de automatización 24/7 vive en `../n8n/` — ver `n8n/README.md` para configurar el bot de Telegram, Gmail y el workflow exportable.
