-- V1: Esquema base de Usuarios y Roles

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
);

-- Note: empleados se crea en V2, pero usuarios depende de él,
-- Para evitar ciclos en V1 creamos la tabla empleados vacía solo con id
-- y luego la modificaremos en V2. O mejor, unimos V1 y V2 lógicamente.

-- Vamos a crear primero la tabla vacía de empleados para la FK de usuario
CREATE TABLE empleados (
    id BIGSERIAL PRIMARY KEY
);

CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    empleado_id BIGINT UNIQUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    CONSTRAINT uq_usuario_username UNIQUE (username),
    CONSTRAINT fk_usuario_empleado FOREIGN KEY (empleado_id) REFERENCES empleados (id)
);

CREATE TABLE usuario_roles (
    usuario_id BIGINT NOT NULL,
    rol_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    CONSTRAINT fk_ur_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    CONSTRAINT fk_ur_rol FOREIGN KEY (rol_id) REFERENCES roles (id)
);
