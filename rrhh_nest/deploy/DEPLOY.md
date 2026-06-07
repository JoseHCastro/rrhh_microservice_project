# Despliegue en la nube — Módulo 3 (Seguridad / Archivos / Automatización)

Guía para desplegar el microservicio NestJS del Módulo 3 en una **VM de Azure** con
`docker-compose`, usando **Neon** (Postgres serverless), **AWS S3/DynamoDB** y **n8n + cloudflared**
para la automatización de justificaciones por Telegram.

> ⚠️ **Sin secretos en el repo.** Los valores reales viven solo en el `.env` de la VM
> (plantilla: [`.env.cloud.example`](./.env.cloud.example)). El `.env` está ignorado por `.gitignore`.

## Arquitectura del despliegue

```
Telegram ──▶ cloudflared (HTTPS público) ──▶ n8n (:5678) ──▶ rrhh_nest (:3000)
                                                                  │
                          Neon (Postgres)  ◀───────────┼───────▶ AWS S3 + DynamoDB
```

- **rrhh_nest** — imagen construida localmente y subida al **ACR** (Azure Container Registry).
- **n8n** — orquesta el flujo Telegram → análisis IA → correo de aprobación; datos en volumen `n8n_data`.
- **cloudflared** — expone n8n en una URL `https://…` pública para que Telegram alcance el webhook.

## Requisitos previos

- Cuenta de Azure (sirve *Azure for Students*) + **Azure CLI** (`az`) instalado y `az login` hecho.
- Proyecto **Neon** creado con la BD y las tablas `public.*` (Módulo 2 / Spring Boot) ya migradas.
- Bucket **S3** y tabla **DynamoDB** del equipo (ya existen).
- Bot de Telegram (token de @BotFather).

---

## 1. Crear recursos en Azure

```bash
# Variables (ajústalas)
RG=rrhh-rg
LOC=eastus2
ACR=turregistro            # nombre global único, minúsculas
VM=rrhh-vm

# Grupo de recursos
az group create -n $RG -l $LOC

# Azure Container Registry (para la imagen del Nest)
az acr create -n $ACR -g $RG --sku Basic --admin-enabled true

# VM Ubuntu (con Docker se instala en el paso 4)
az vm create -n $VM -g $RG --image Ubuntu2204 \
  --size Standard_B2s --admin-username azureuser --generate-ssh-keys

# Abrir puertos: 3000 (Nest) y 5678 (n8n)
az vm open-port -g $RG -n $VM --port 3000 --priority 1001
az vm open-port -g $RG -n $VM --port 5678 --priority 1002
```

## 2. Construir y subir la imagen del Nest al ACR

```bash
# Desde la carpeta rrhh_nest/ (donde está el Dockerfile)
az acr login -n $ACR

docker build -t $ACR.azurecr.io/rrhh-nest:latest .
docker push $ACR.azurecr.io/rrhh-nest:latest
```

> En `docker-compose.cloud.yml`, ajusta `image:` a `TU-ACR.azurecr.io/rrhh-nest:latest`.

## 3. Aplicar las migraciones del esquema `seguridad` en Neon

Con las tablas `public.*` ya creadas por Spring Boot, aplica los SQL aditivos del Módulo 3
**en orden** (usan `IF NOT EXISTS`, son idempotentes):

```bash
# DATABASE_URL apuntando a Neon (pooled, sslmode=require)
for f in seguridad_init seguridad_v2_ia_aprobacion seguridad_v3_ia_error seguridad_v4_codigo_vinculacion; do
  npx prisma db execute --schema prisma/schema.prisma --file prisma/sql/$f.sql
done
```

## 4. Preparar la VM y copiar la configuración

```bash
# Instalar Docker + Compose en la VM (vía SSH)
ssh azureuser@TU-IP-PUBLICA-VM
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER     # reconecta la sesión SSH tras esto
exit

# Copiar el compose y crear el .env REAL en la VM (NO se versiona)
scp rrhh_nest/deploy/docker-compose.cloud.yml azureuser@TU-IP-PUBLICA-VM:~/
cp rrhh_nest/deploy/.env.cloud.example /tmp/.env   # rellena los valores reales...
scp /tmp/.env azureuser@TU-IP-PUBLICA-VM:~/.env
```

> Rellena el `.env` con los valores reales (Neon, JWT igual al de Spring Boot, AWS, Gemini,
> `N8N_WEBHOOK_SECRET`, etc.). Ver comentarios en `.env.cloud.example`.

## 5. Levantar los servicios

```bash
ssh azureuser@TU-IP-PUBLICA-VM

# login al ACR desde la VM (usuario/clave: az acr credential show -n $ACR)
docker login TU-ACR.azurecr.io

docker compose -f docker-compose.cloud.yml --env-file .env up -d
docker compose -f docker-compose.cloud.yml ps
```

## 6. Exponer n8n con cloudflared y fijar la URL pública

```bash
# La URL pública del túnel aparece en los logs de cloudflared:
docker logs rrhh_cloudflared 2>&1 | grep trycloudflare
#   → https://xxxx-xxxx.trycloudflare.com

# Pon esa URL en WEBHOOK_URL del servicio n8n (docker-compose.cloud.yml) y recrea n8n:
docker compose -f docker-compose.cloud.yml up -d --force-recreate n8n
```

> El túnel "rápido" cambia de URL en cada arranque. Para una URL estable usa un
> **Named Tunnel** de Cloudflare con un dominio propio.

## 7. Registrar el webhook de Telegram

Apunta el bot al endpoint de webhook que expone n8n (a través del túnel):

```bash
curl "https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://xxxx.trycloudflare.com/webhook/telegram"
# Verifica:
curl "https://api.telegram.org/bot<TU_TOKEN>/getWebhookInfo"
```

> Sustituye `/webhook/telegram` por la ruta real del nodo Webhook de tu workflow en n8n.
> Importa el flujo desde `rrhh_nest/n8n/workflows/` y actívalo antes de registrar el webhook.

---

## Verificación rápida

- `GET http://TU-IP-PUBLICA-VM:3000/` → el Nest responde.
- n8n accesible en `https://xxxx.trycloudflare.com` (auth básica).
- Enviar una justificación por Telegram → llega el correo de aprobación con análisis IA.
- Aprobar desde el correo → el empleado recibe el aviso por Telegram.

## Notas de seguridad

- `N8N_WEBHOOK_SECRET` debe ser **idéntico** en el `.env` del Nest y en el servicio n8n.
- El `JWT_SECRET` debe ser **el mismo** que el de Spring Boot (Módulo 2).
- Nunca subas el `.env` real ni el `docker-compose.cloud.yml` con valores reales rellenados.
