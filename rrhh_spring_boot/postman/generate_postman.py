import json

collection = {
    "info": {
        "name": "TechVentures RRHH API",
        "description": "Postman Collection for Spring Boot + GraphQL RRHH System. Generated directly from source schema.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
        {"key": "baseUrl", "value": "http://localhost:8080", "type": "string"},
        {"key": "jwtToken", "value": "", "type": "string"},
        {"key": "empleadoId", "value": "1", "type": "string"},
        {"key": "departamentoId", "value": "1", "type": "string"},
        {"key": "cargoId", "value": "1", "type": "string"},
        {"key": "usuarioId", "value": "1", "type": "string"},
        {"key": "solicitudAusenciaId", "value": "1", "type": "string"},
        {"key": "tipoAusenciaId", "value": "1", "type": "string"},
        {"key": "preplanillaId", "value": "1", "type": "string"},
        {"key": "codigoFacial", "value": "FACE_XYZ_123", "type": "string"}
    ],
    "item": []
}

def create_graphql_request(name, query, variables=None, test_script=None):
    req = {
        "name": name,
        "request": {
            "method": "POST",
            "header": [
                {"key": "Authorization", "value": "Bearer {{jwtToken}}"},
                {"key": "Content-Type", "value": "application/json"}
            ],
            "url": {
                "raw": "{{baseUrl}}/graphql",
                "host": ["{{baseUrl}}"],
                "path": ["graphql"]
            },
            "body": {
                "mode": "graphql",
                "graphql": {
                    "query": query,
                    "variables": json.dumps(variables) if variables else "{}"
                }
            }
        },
        "response": []
    }
    
    events = []
    default_test = """pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
pm.test("No GraphQL errors", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.errors).to.be.undefined;
});"""
    
    if test_script:
        events.append({
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": (default_test + "\n" + test_script).split('\n')
            }
        })
    else:
        events.append({
            "listen": "test",
            "script": {
                "type": "text/javascript",
                "exec": default_test.split('\n')
            }
        })
        
    if events:
        req["event"] = events
        
    return req

# Build Folders
auth_folder = {
    "name": "1. Authentication",
    "item": [
        {
            "name": "Login",
            "event": [
                {
                    "listen": "test",
                    "script": {
                        "exec": [
                            "pm.test(\"Status code is 200\", function () {",
                            "    pm.response.to.have.status(200);",
                            "});",
                            "var jsonData = pm.response.json();",
                            "if(jsonData.accessToken) {",
                            "    pm.collectionVariables.set(\"jwtToken\", jsonData.accessToken);",
                            "}"
                        ],
                        "type": "text/javascript"
                    }
                }
            ],
            "request": {
                "method": "POST",
                "header": [{"key": "Content-Type", "value": "application/json"}],
                "body": {
                    "mode": "raw",
                    "raw": json.dumps({"username": "admin", "password": "password123"}, indent=2)
                },
                "url": {
                    "raw": "{{baseUrl}}/api/v1/auth/login",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "v1", "auth", "login"]
                }
            }
        },
        {
            "name": "Refresh Token",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "X-Refresh-Token", "value": "{{jwtToken}}"}
                ],
                "url": {
                    "raw": "{{baseUrl}}/api/v1/auth/refresh",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "v1", "auth", "refresh"]
                }
            }
        }
    ]
}

dept_folder = {
    "name": "2. Departamentos",
    "item": [
        create_graphql_request(
            "Crear Departamento",
            "mutation CrearDepartamento($nombre: String!) {\n  crearDepartamento(nombre: $nombre) {\n    id\n    nombre\n  }\n}",
            {"nombre": "Operaciones IT"},
            """var res = pm.response.json();
if(res.data && res.data.crearDepartamento) {
    pm.collectionVariables.set("departamentoId", res.data.crearDepartamento.id);
}"""
        ),
        create_graphql_request(
            "Consultar Departamentos",
            "query {\n  departamentos {\n    id\n    nombre\n    gerente {\n      nombreCompleto\n    }\n  }\n}"
        ),
        create_graphql_request(
            "Consultar Departamento por ID",
            "query Departamento($id: ID!) {\n  departamento(id: $id) {\n    id\n    nombre\n  }\n}",
            {"id": "{{departamentoId}}"}
        )
    ]
}

cargos_folder = {
    "name": "3. Cargos",
    "item": [
        create_graphql_request(
            "Consultar Cargos",
            "query {\n  cargos {\n    id\n    nombre\n    salarioPorHora\n  }\n}",
            None,
            """var res = pm.response.json();
if(res.data && res.data.cargos && res.data.cargos.length > 0) {
    pm.collectionVariables.set("cargoId", res.data.cargos[0].id);
}"""
        ),
        create_graphql_request(
            "Consultar Cargo por ID",
            "query Cargo($id: ID!) {\n  cargo(id: $id) {\n    id\n    nombre\n    salarioPorHora\n  }\n}",
            {"id": "{{cargoId}}"}
        )
    ]
}

empleados_folder = {
    "name": "4. Empleados",
    "item": [
        create_graphql_request(
            "Crear Empleado",
            """mutation CrearEmpleado($input: EmpleadoInput!) {
  crearEmpleado(input: $input) {
    id
    nombre
    apellido
    nombreCompleto
    estado
  }
}""",
            {
                "input": {
                    "nombre": "Juan",
                    "apellido": "Pérez",
                    "fechaContratacion": "2026-06-01",
                    "departamentoId": "{{departamentoId}}",
                    "cargoId": "{{cargoId}}",
                    "horaEntrada": "08:00:00",
                    "horaSalida": "17:00:00",
                    "telefono": "70012345",
                    "carnetIdentidad": "1234567"
                }
            },
            """var res = pm.response.json();
if(res.data && res.data.crearEmpleado) {
    pm.collectionVariables.set("empleadoId", res.data.crearEmpleado.id);
}"""
        ),
        create_graphql_request(
            "Consultar Empleados",
            """query Empleados($page: Int, $size: Int, $estado: EstadoEmpleado) {
  empleados(page: $page, size: $size, estado: $estado) {
    content {
      id
      nombreCompleto
      estado
      departamento { nombre }
    }
    pageInfo {
      totalElements
    }
  }
}""",
            {"page": 0, "size": 10, "estado": "ACTIVO"}
        ),
        create_graphql_request(
            "Consultar Empleado por ID",
            """query Empleado($id: ID!) {
  empleado(id: $id) {
    id
    nombreCompleto
    fechaContratacion
    estado
  }
}""",
            {"id": "{{empleadoId}}"}
        ),
        create_graphql_request(
            "Actualizar Empleado",
            """mutation ActualizarEmpleado($id: ID!, $input: EmpleadoInput!) {
  actualizarEmpleado(id: $id, input: $input) {
    id
    telefono
  }
}""",
            {
                "id": "{{empleadoId}}",
                "input": {
                    "nombre": "Juan Carlos",
                    "apellido": "Pérez",
                    "fechaContratacion": "2026-06-01",
                    "departamentoId": "{{departamentoId}}",
                    "cargoId": "{{cargoId}}",
                    "horaEntrada": "08:00:00",
                    "horaSalida": "17:00:00",
                    "telefono": "70099999"
                }
            }
        ),
        create_graphql_request(
            "Desactivar Empleado",
            """mutation DesactivarEmpleado($id: ID!) {
  desactivarEmpleado(id: $id)
}""",
            {"id": "{{empleadoId}}"}
        )
    ]
}

usuarios_folder = {
    "name": "5. Usuarios",
    "item": [
        create_graphql_request(
            "Consultar Usuarios",
            """query {
  usuarios {
    id
    username
    activo
    roles {
      rol { nombre }
    }
  }
}""",
            None,
            """var res = pm.response.json();
if(res.data && res.data.usuarios && res.data.usuarios.length > 0) {
    pm.collectionVariables.set("usuarioId", res.data.usuarios[0].id);
}"""
        ),
        create_graphql_request(
            "Consultar Usuario por ID",
            """query Usuario($id: ID!) {
  usuario(id: $id) {
    id
    username
    activo
  }
}""",
            {"id": "{{usuarioId}}"}
        ),
        create_graphql_request(
            "Activar Usuario",
            """mutation ActivarUsuario($id: ID!) {
  activarUsuario(id: $id)
}""",
            {"id": "{{usuarioId}}"}
        ),
        create_graphql_request(
            "Desactivar Usuario",
            """mutation DesactivarUsuario($id: ID!) {
  desactivarUsuario(id: $id)
}""",
            {"id": "{{usuarioId}}"}
        ),
        create_graphql_request(
            "Asignar Rol",
            """mutation AsignarRol($usuarioId: ID!, $rol: NombreRol!) {
  asignarRol(usuarioId: $usuarioId, rol: $rol) {
    id
    username
    roles {
      rol { nombre }
    }
  }
}""",
            {"usuarioId": "{{usuarioId}}", "rol": "ROLE_EMPLEADO"}
        )
    ]
}

reconocimiento_folder = {
    "name": "6. Reconocimiento Facial",
    "item": [
        create_graphql_request(
            "Enrolar Rostro",
            """mutation EnrolarRostro($empleadoId: ID!, $codigoFacial: String!) {
  enrolarRostro(empleadoId: $empleadoId, codigoFacial: $codigoFacial) {
    id
    fechaRegistro
  }
}""",
            {"empleadoId": "{{empleadoId}}", "codigoFacial": "{{codigoFacial}}"}
        )
    ]
}

asistencia_folder = {
    "name": "7. Asistencia",
    "item": [
        create_graphql_request(
            "Registrar Entrada",
            """mutation RegistrarEntrada($input: RegistroAsistenciaInput!) {
  registrarEntrada(input: $input) {
    id
    horaEntrada
    estado
  }
}""",
            {
                "input": {
                    "codigoFacial": "{{codigoFacial}}",
                    "ubicacionGps": "10.4806,-66.9036"
                }
            }
        ),
        create_graphql_request(
            "Registrar Salida",
            """mutation RegistrarSalida($codigoFacial: String!) {
  registrarSalida(codigoFacial: $codigoFacial) {
    id
    horaSalida
  }
}""",
            {"codigoFacial": "{{codigoFacial}}"}
        ),
        create_graphql_request(
            "Consultar Asistencia",
            """query RegistrosAsistencia($empleadoId: ID, $page: Int, $size: Int) {
  registrosAsistencia(empleadoId: $empleadoId, page: $page, size: $size) {
    content {
      id
      horaEntrada
      horaSalida
      estado
      empleado { nombreCompleto }
    }
  }
}""",
            {"empleadoId": "{{empleadoId}}", "page": 0, "size": 20}
        )
    ]
}

ausencias_folder = {
    "name": "8. Ausencias",
    "item": [
        create_graphql_request(
            "Tipos de Ausencia",
            """query {
  tiposAusencia {
    id
    nombre
  }
}""",
            None,
            """var res = pm.response.json();
if(res.data && res.data.tiposAusencia && res.data.tiposAusencia.length > 0) {
    pm.collectionVariables.set("tipoAusenciaId", res.data.tiposAusencia[0].id);
}"""
        ),
        create_graphql_request(
            "Crear Solicitud de Ausencia",
            """mutation CrearSolicitudAusencia($input: SolicitudAusenciaInput!) {
  crearSolicitudAusencia(input: $input) {
    id
    estado
  }
}""",
            {
                "input": {
                    "empleadoId": "{{empleadoId}}",
                    "tipoAusenciaId": "{{tipoAusenciaId}}",
                    "fechaInicio": "2026-08-01",
                    "fechaFin": "2026-08-05"
                }
            },
            """var res = pm.response.json();
if(res.data && res.data.crearSolicitudAusencia) {
    pm.collectionVariables.set("solicitudAusenciaId", res.data.crearSolicitudAusencia.id);
}"""
        ),
        create_graphql_request(
            "Consultar Solicitudes de Ausencia",
            """query SolicitudesAusencia($estado: EstadoSolicitud, $empleadoId: ID) {
  solicitudesAusencia(estado: $estado, empleadoId: $empleadoId) {
    id
    estado
    fechaInicio
    fechaFin
  }
}""",
            {"estado": "PENDIENTE", "empleadoId": "{{empleadoId}}"}
        ),
        create_graphql_request(
            "Aprobar Solicitud de Ausencia",
            """mutation AprobarSolicitudAusencia($id: ID!) {
  aprobarSolicitudAusencia(id: $id) {
    id
    estado
  }
}""",
            {"id": "{{solicitudAusenciaId}}"}
        ),
        create_graphql_request(
            "Rechazar Solicitud de Ausencia",
            """mutation RechazarSolicitudAusencia($id: ID!) {
  rechazarSolicitudAusencia(id: $id) {
    id
    estado
  }
}""",
            {"id": "{{solicitudAusenciaId}}"}
        )
    ]
}

planillas_folder = {
    "name": "9. Planillas",
    "item": [
        create_graphql_request(
            "Generar Preplanilla",
            """mutation GenerarPreplanilla($empleadoId: ID!, $periodo: String!) {
  generarPreplanilla(empleadoId: $empleadoId, periodo: $periodo) {
    id
    s3KeyUri
    diasTrabajados
  }
}""",
            {"empleadoId": "{{empleadoId}}", "periodo": "2026-07"},
            """var res = pm.response.json();
if(res.data && res.data.generarPreplanilla) {
    pm.collectionVariables.set("preplanillaId", res.data.generarPreplanilla.id);
}"""
        ),
        create_graphql_request(
            "Consultar Preplanillas",
            """query Preplanillas($empleadoId: ID, $periodo: String) {
  preplanillas(empleadoId: $empleadoId, periodo: $periodo) {
    id
    periodo
    s3KeyUri
    empleado { nombreCompleto }
  }
}""",
            {"empleadoId": "{{empleadoId}}", "periodo": "2026-07"}
        ),
        create_graphql_request(
            "Consultar Preplanilla por ID",
            """query Preplanilla($id: ID!) {
  preplanilla(id: $id) {
    id
    periodo
    diasTrabajados
    horasExtra
  }
}""",
            {"id": "{{preplanillaId}}"}
        )
    ]
}

push_folder = {
    "name": "10. Push Notifications",
    "item": [
        create_graphql_request(
            "Registrar Token Push",
            """mutation RegistrarTokenPush($input: TokenPushInput!) {
  registrarTokenPush(input: $input) {
    id
    tokenFcm
    activo
  }
}""",
            {"input": {"tokenFcm": "fcm_token_example", "dispositivo": "Android Device"}}
        ),
        create_graphql_request(
            "Revocar Token Push",
            """mutation RevocarTokenPush($tokenFcm: String!) {
  revocarTokenPush(tokenFcm: $tokenFcm)
}""",
            {"tokenFcm": "fcm_token_example"}
        )
    ]
}

sistema_folder = {
    "name": "11. Sistema",
    "item": [
        create_graphql_request(
            "Consultar Estado del Sistema",
            """query {
  sistemaConfigEstado {
    id
    estado
    fechaHoraEstado
  }
}"""
        ),
        create_graphql_request(
            "Cambiar Estado del Sistema",
            """mutation CambiarEstadoSistema($estado: EstadoSistema!) {
  cambiarEstadoSistema(estado: $estado) {
    id
    estado
  }
}""",
            {"estado": "EMPAREJAR"}
        )
    ]
}

collection["item"].extend([
    auth_folder,
    dept_folder,
    cargos_folder,
    empleados_folder,
    usuarios_folder,
    reconocimiento_folder,
    asistencia_folder,
    ausencias_folder,
    planillas_folder,
    push_folder,
    sistema_folder
])

with open("postman/postman.json", "w", encoding="utf-8") as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

print("Collection created successfully.")
