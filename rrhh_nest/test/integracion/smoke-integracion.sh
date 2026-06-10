#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════════
#  Pruebas de integración Módulo 2 (Spring Boot / Auth) ↔ Módulo 3 (Nest)
#
#  Solo-lectura: NO modifica código ni datos de otros módulos. Hace login en
#  Spring Boot, usa ese MISMO token JWT contra el Nest y valida el handshake.
#
#  Uso (Git Bash / WSL / Linux):
#     bash rrhh_nest/test/integracion/smoke-integracion.sh
#
#  Requiere: curl. (jq es opcional; si no está, se usa sed para extraer el token.)
# ════════════════════════════════════════════════════════════════════════════
set -uo pipefail

# ──────────── URLs de los despliegues (ajusta si cambian) ────────────
SB_URL="${SB_URL:-http://beanstalk-rrhh-app-prod.eba-rvkrzdtv.us-east-2.elasticbeanstalk.com}"  # Módulo 2 (AWS Beanstalk)
NEST_URL="${NEST_URL:-https://tomorrow-pictures-guidelines-applicable.trycloudflare.com}"        # Módulo 3 (túnel cloudflared → Neon)
FASTAPI_URL="${FASTAPI_URL:-http://localhost:8001}"                                              # Módulo 1 (solo local)

# ──────────── Credenciales de prueba ────────────
USER="${USER_TEST:-admin}"
PASS="${PASS_TEST:-password123}"

pass(){ echo "  ✅ $1"; }
fail(){ echo "  ❌ $1"; }
code(){ # $1=url $2=method $3=data $4=authHeader  → imprime solo el HTTP code
  curl -s -o /dev/null -w "%{http_code}" -X "$2" "$1" \
    -H "Content-Type: application/json" ${4:+-H "Authorization: Bearer $4"} ${3:+-d "$3"}; }

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  SMOKE TEST — Integración RRHH (Módulo 2 ↔ Módulo 3)          ║"
echo "╚══════════════════════════════════════════════════════════════╝"

# ── 1. Salud de los servicios ───────────────────────────────────────────────
echo ""; echo "▶ 1. Health checks"
[ "$(curl -s -o /dev/null -w '%{http_code}' "$SB_URL/actuator/health")" = "200" ] \
  && pass "Spring Boot (Módulo 2) UP" || fail "Spring Boot NO responde"
# El Nest protege TODO con el guard JWT global: `GET /` responde 401 (no 200),
# pero un 401 ya prueba que el servicio/túnel está vivo.
NEST_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$NEST_URL/")
case "$NEST_CODE" in 200|401) pass "Nest (Módulo 3) UP (HTTP $NEST_CODE)";; *) fail "Nest NO responde (HTTP $NEST_CODE)";; esac

# ── 2. Login en Spring Boot → obtener JWT ───────────────────────────────────
echo ""; echo "▶ 2. Login en Spring Boot ($USER)"
LOGIN_JSON=$(curl -s -X POST "$SB_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}")
if command -v jq >/dev/null 2>&1; then
  TOKEN=$(echo "$LOGIN_JSON" | jq -r '.accessToken // empty')
  ROLES=$(echo "$LOGIN_JSON" | jq -rc '.roles // empty')
else
  TOKEN=$(echo "$LOGIN_JSON" | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')
  ROLES=$(echo "$LOGIN_JSON" | sed -E 's/.*("roles":\[[^]]*\]).*/\1/')
fi
if [ -n "${TOKEN:-}" ] && [ "$TOKEN" != "$LOGIN_JSON" ]; then
  pass "Login OK — roles: ${ROLES:-?}  token: ${TOKEN:0:25}..."
else
  fail "Login falló: $LOGIN_JSON"; echo "  (abortando pruebas que dependen del token)"; exit 1
fi

# ── 3. HANDSHAKE: token de Spring Boot contra el Nest ───────────────────────
echo ""; echo "▶ 3. Handshake JWT (token Módulo 2 → query protegida Módulo 3)"
Q_ARCHIVOS='{"query":"{ archivos { content { id nombre categoria estado } pageInfo { totalElements } } }"}'
HS=$(code "$NEST_URL/graphql" POST "$Q_ARCHIVOS" "$TOKEN")
RESP=$(curl -s -X POST "$NEST_URL/graphql" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d "$Q_ARCHIVOS")
if echo "$RESP" | grep -q '"data"' && ! echo "$RESP" | grep -q 'UNAUTHENTICATED'; then
  N=$(echo "$RESP" | sed -E 's/.*"totalElements":([0-9]+).*/\1/')
  pass "Nest ACEPTA el token de Spring Boot (HTTP $HS) — archivos visibles: ${N:-?}"
else
  fail "Nest RECHAZÓ el token (HTTP $HS): $RESP"
fi

# ── 4. Controles negativos (deben rechazar) ─────────────────────────────────
echo ""; echo "▶ 4. Controles de seguridad (deben rechazar)"
R_NOAUTH=$(curl -s -X POST "$NEST_URL/graphql" -H "Content-Type: application/json" -d "$Q_ARCHIVOS")
echo "$R_NOAUTH" | grep -q 'UNAUTHENTICATED' && pass "Sin token → rechazado" || fail "Sin token NO fue rechazado"
R_BAD=$(curl -s -X POST "$NEST_URL/graphql" -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.firma_falsa" -d "$Q_ARCHIVOS")
echo "$R_BAD" | grep -q 'UNAUTHENTICATED' && pass "Token con firma inválida → rechazado" || fail "Firma falsa NO fue rechazada"

# ── 5. (OPCIONAL) Descarga de archivo + presigned URL ───────────────────────
echo ""; echo "▶ 5. Descarga (presigned URL S3) — archivo id 5"
Q_DL='{"query":"{ urlDescargaArchivo(id: 5) }"}'
R_DL=$(curl -s -X POST "$NEST_URL/graphql" -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d "$Q_DL")
if echo "$R_DL" | grep -q 'http'; then
  pass "Generó presigned URL de descarga (se registró DESCARGAR_S3 en la bitácora)"
else
  echo "  ⚠ Respuesta: $R_DL"
fi

echo ""
echo "── Nota: 'admin' entra por bypass ROLE_ADMIN. Para probar privilegio FINO"
echo "   (no-admin) asigna grupos en Neon y forja/login con otro usuario."
echo "── FastAPI (Módulo 1) es solo local: levántalo con docker-compose para probar :8001."
echo "Listo."
