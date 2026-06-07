#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════════
#  Módulo 3 — deploy.sh
#  Automatiza el despliegue del microservicio NestJS en una VM de Azure:
#    build  → construye la imagen Docker del Nest
#    push   → login al ACR + push de la imagen
#    remote-up → en la VM: docker compose up -d con el compose cloud
#    all    → build + push + remote-up
#
#  ⚠️  NO contiene secretos. Los valores sensibles viven en el `.env` de la VM.
#      Los parámetros de infraestructura (NO secretos) se configuran por:
#        1) variables de entorno, o
#        2) un archivo `deploy.config.sh` junto a este script (gitignorado).
#
#  Uso:
#    ./deploy.sh build
#    ./deploy.sh push
#    ./deploy.sh remote-up
#    ./deploy.sh all
# ════════════════════════════════════════════════════════════════════════════
set -euo pipefail

# ──────────── Rutas ────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NEST_DIR="$(dirname "$SCRIPT_DIR")"   # carpeta rrhh_nest/ (donde está el Dockerfile)
COMPOSE_FILE="docker-compose.cloud.yml"

# ──────────── Config (sobre-escribible por env o deploy.config.sh) ────────────
# Carga opcional de parámetros NO secretos desde un archivo local gitignorado.
if [[ -f "$SCRIPT_DIR/deploy.config.sh" ]]; then
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/deploy.config.sh"
fi

ACR_NAME="${ACR_NAME:-}"                       # ej: turregistro (sin .azurecr.io)
IMAGE_NAME="${IMAGE_NAME:-rrhh-nest}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
VM_HOST="${VM_HOST:-}"                          # ej: azureuser@20.10.30.40
VM_REMOTE_DIR="${VM_REMOTE_DIR:-~}"             # carpeta en la VM con el compose + .env

# ──────────── Salida con color ────────────
c_info()  { printf "\033[1;34m[deploy]\033[0m %s\n" "$*"; }
c_ok()    { printf "\033[1;32m[ ok ]\033[0m %s\n" "$*"; }
c_err()   { printf "\033[1;31m[err ]\033[0m %s\n" "$*" >&2; }

require() {
  local var="$1" hint="${2:-}"
  if [[ -z "${!var:-}" ]]; then
    c_err "Falta la variable '$var'. $hint"
    c_err "Defínela por entorno (export $var=...) o en deploy.config.sh"
    exit 1
  fi
}

acr_image() {
  require ACR_NAME "Nombre del Azure Container Registry (sin .azurecr.io)."
  echo "${ACR_NAME}.azurecr.io/${IMAGE_NAME}:${IMAGE_TAG}"
}

# ──────────── Comandos ────────────
cmd_build() {
  local img; img="$(acr_image)"
  c_info "Construyendo imagen: $img"
  c_info "Contexto de build: $NEST_DIR"
  docker build -t "$img" "$NEST_DIR"
  c_ok "Imagen construida: $img"
}

cmd_push() {
  local img; img="$(acr_image)"
  require ACR_NAME
  c_info "Login al ACR '$ACR_NAME'..."
  az acr login -n "$ACR_NAME"
  c_info "Subiendo imagen: $img"
  docker push "$img"
  c_ok "Imagen publicada en el ACR."
}

cmd_remote_up() {
  require VM_HOST "Host SSH de la VM, ej: azureuser@<IP-PUBLICA>."
  local img; img="$(acr_image)"
  c_info "Copiando $COMPOSE_FILE a $VM_HOST:$VM_REMOTE_DIR ..."
  scp "$SCRIPT_DIR/$COMPOSE_FILE" "$VM_HOST:$VM_REMOTE_DIR/$COMPOSE_FILE"

  c_info "Levantando servicios en la VM (requiere .env ya presente en $VM_REMOTE_DIR)..."
  # Nota: el `.env` real NO se sube desde aquí; debe existir ya en la VM (ver DEPLOY.md §4).
  ssh "$VM_HOST" bash -s <<REMOTE
set -euo pipefail
cd "$VM_REMOTE_DIR"
if [[ ! -f .env ]]; then
  echo "[err ] No existe .env en \$(pwd). Cópialo primero (ver DEPLOY.md §4)." >&2
  exit 1
fi
echo "[deploy] Trayendo imagen $img ..."
docker pull "$img"
echo "[deploy] docker compose up -d ..."
docker compose -f "$COMPOSE_FILE" --env-file .env up -d
docker compose -f "$COMPOSE_FILE" ps
REMOTE
  c_ok "Servicios levantados en la VM."
  c_info "URL pública del túnel (cuando cloudflared arranque):"
  c_info "  ssh $VM_HOST 'docker logs rrhh_cloudflared 2>&1 | grep trycloudflare'"
}

cmd_all() {
  cmd_build
  cmd_push
  cmd_remote_up
}

usage() {
  cat <<EOF
deploy.sh — despliegue del Módulo 3 (NestJS) en Azure

Comandos:
  build       Construye la imagen Docker del Nest (contexto: $NEST_DIR)
  push        az acr login + docker push al ACR
  remote-up   Copia el compose a la VM y hace 'docker compose up -d' (vía SSH)
  all         build + push + remote-up

Config (env o deploy.config.sh — NO secretos):
  ACR_NAME       Nombre del ACR sin sufijo. Ej: turregistro        (requerido)
  IMAGE_NAME     Nombre de la imagen. Default: rrhh-nest
  IMAGE_TAG      Tag de la imagen. Default: latest
  VM_HOST        Host SSH de la VM. Ej: azureuser@20.10.30.40       (para remote-up)
  VM_REMOTE_DIR  Carpeta en la VM con el compose + .env. Default: ~

Ejemplos:
  ACR_NAME=turregistro ./deploy.sh build
  ACR_NAME=turregistro VM_HOST=azureuser@20.10.30.40 ./deploy.sh all
EOF
}

# ──────────── Dispatch ────────────
case "${1:-}" in
  build)      cmd_build ;;
  push)       cmd_push ;;
  remote-up)  cmd_remote_up ;;
  all)        cmd_all ;;
  ""|-h|--help|help) usage ;;
  *) c_err "Comando desconocido: $1"; echo; usage; exit 1 ;;
esac
