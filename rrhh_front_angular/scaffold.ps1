# ============================================================
#  Scaffolding - Arquitectura tipo Metronic (Angular 16, NgModules)
#  Ejecutar desde:  C:\Users\LEGION\Desktop\code-prueba
# ============================================================
$ErrorActionPreference = "Stop"
$env:NG_CLI_ANALYTICS = "false"              # evita prompt interactivo de analytics

# Wrappers: NgNew usa CLI v16 via npx; Ng usa el CLI local ya instalado
function NgNew { npx -p @angular/cli@16 ng @args; if ($LASTEXITCODE -ne 0) { throw "ng new fallo" } }
function Ng    { npx ng @args;                    if ($LASTEXITCODE -ne 0) { throw "ng $args fallo" } }

# --- 1. Crear el workspace en la carpeta actual -------------
NgNew new code-prueba --directory . --routing --style scss --skip-git

# --- 2. Capa UI/Layout (_metronic) --------------------------
#     Shell con <router-outlet> + parciales visuales. SIN logica de negocio.
Ng g c _metronic/layout/layout --skip-tests
Ng g c _metronic/layout/components/header
Ng g c _metronic/layout/components/sidebar
Ng g c _metronic/layout/components/footer
Ng g c _metronic/layout/components/toolbar

#     Servicios de UI, interceptores y guards genericos
Ng g s _metronic/shared/services/layout
Ng g s _metronic/shared/services/theme-mode          # Dark/Light
Ng g interceptor _metronic/shared/interceptors/auth --skip-tests   # adjunta JWT
Ng g interceptor _metronic/shared/interceptors/error --skip-tests  # maneja 401 global
Ng g guard _metronic/shared/guards/auth --skip-tests --implements CanActivate

# --- 3. Dominios de negocio (modules) -----------------------
Ng g m modules/auth --routing
Ng g c modules/auth/login --skip-tests
Ng g c modules/auth/registration --skip-tests
Ng g c modules/auth/forgot-password --skip-tests
Ng g s modules/auth/services/auth          # negocio de autenticacion
Ng g s modules/auth/services/auth-http     # acceso a datos (HTTP)

# --- 4. Paginas / orquestadores (pages) ---------------------
Ng g m pages/dashboard --routing
Ng g c pages/dashboard/dashboard --skip-tests

# --- 5. Mocks (_fake) ---------------------------------------
Ng g s _fake/fake-api          # angular-in-memory-web-api

# --- 6. Dependencias del stack ------------------------------
npm install bootstrap@5.3.2 @popperjs/core `
            @ng-bootstrap/ng-bootstrap `
            sweetalert2 @sweetalert2/ngx-sweetalert2 `
            @fortawesome/fontawesome-free bootstrap-icons `
            angular-in-memory-web-api
if ($LASTEXITCODE -ne 0) { throw "npm install fallo" }

Write-Host "`n=== Scaffolding completado ===" -ForegroundColor Green
