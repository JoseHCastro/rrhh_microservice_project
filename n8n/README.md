# n8n — Workflows del Módulo 3

Esta carpeta contiene los **workflows exportables de n8n** para el flujo de automatización 24/7 del Módulo 3.

n8n corre como servicio en `docker-compose.yml` en el puerto **5678**.

## Acceso

- URL: http://localhost:5678
- Usuario: `admin`
- Password: `admin`
- (Cambiar en producción vía `N8N_BASIC_AUTH_USER` y `N8N_BASIC_AUTH_PASSWORD` en `docker-compose.yml`.)

## Workflows incluidos

### `telegram-justificacion.json`

Flujo: **Empleado envía mensaje a bot Telegram → n8n empuja a NestJS → Nest sube archivo a S3 + crea justificación → n8n notifica al jefe vía Gmail → confirma al empleado.**

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Telegram Bot    │───▶│ Mapear       │───▶│ POST a NestJS   │───▶│ ¿Jefe?          │
│ (Trigger)       │    │ Payload      │    │ webhook         │    │ (If branching)  │
└─────────────────┘    └──────────────┘    └─────────────────┘    └────────┬────────┘
                                                                           │
                                          ┌─────────────────┐    ┌─────────▼───────┐
                                          │ Confirmar al    │◀───│ Email al Jefe   │
                                          │ Empleado        │    │ (Gmail)         │
                                          └─────────────────┘    └─────────────────┘
```

## Importar el workflow

1. Abrí http://localhost:5678 y logueate.
2. **Workflows** → **Import from File** → seleccioná `telegram-justificacion.json`.
3. Antes de activar, configurá las credenciales:
   - **Telegram Bot** (nodo `Telegram Trigger`): pegá el token de tu bot (creado via `@BotFather`).
   - **Gmail OAuth2** (nodo `Gmail al Jefe`): autorizá la cuenta corporativa que enviará los emails.
4. Configurá la variable `N8N_WEBHOOK_SECRET` en el entorno de n8n con el mismo valor que `rrhh_nest/.env`.
5. Cambiá `fromEmail` y la lógica `toEmail` del nodo Gmail según tu mapeo `username → email` real (por defecto asume `{username}@empresa.com`).
6. Activá el workflow (toggle arriba a la derecha).

## Probar el flujo end-to-end

1. Antes de probar, registrá un canal Telegram para un empleado vía GraphQL en `http://localhost:3000/graphql`:
   ```graphql
   mutation {
     registrarCanalEmpleado(input: {
       empleadoId: "5",
       tipoCanal: TELEGRAM,
       identificador: "123456789",   # tu chat_id real
       verificado: true
     }) {
       id
     }
   }
   ```
   (Necesitas un JWT con privilegio `CANAL_EMPLEADO_GESTIONAR`.)
2. Enviá un mensaje (texto + foto/PDF opcional) al bot desde el chat de Telegram cuyo `chat_id` sea `123456789`.
3. Verificá:
   - El workflow se ejecutó en n8n (badge verde).
   - La justificación aparece en NestJS:
     ```graphql
     query { justificacionesAusencia(filtros: { estado: PENDIENTE }) { id empleadoId mensajeOriginal archivoId } }
     ```
   - El jefe recibió el email.
   - El bot le respondió al empleado.

## Notas de seguridad

- El header `X-N8N-Webhook-Secret` es el **único** mecanismo de autenticación del endpoint webhook. Tratá el valor como secreto.
- El bucket S3 (MinIO local o real) **no** debe ser público — los archivos solo se acceden vía presigned URLs.
- En producción, cambiá `MINIO_ROOT_USER/PASSWORD` y `N8N_BASIC_AUTH_USER/PASSWORD` del `docker-compose.yml`.
