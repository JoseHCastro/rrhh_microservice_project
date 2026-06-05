# Sistema de Gestión de Recursos Humanos (RRHH) - Frontend

Este repositorio contiene la aplicación cliente (frontend) para el Sistema de Gestión de Recursos Humanos (RRHH). Está desarrollado como una Single Page Application (SPA) utilizando **Angular**, proporcionando una interfaz de usuario moderna, reactiva y altamente interactiva para la administración integral del personal de la empresa.

## Funcionalidades Principales

El sistema está compuesto por los siguientes módulos y funcionalidades clave:

- **Gestión de Empleados:** Alta, baja, modificación y consulta de la información detallada del personal de la organización.
- **Gestión de Departamentos:** Administración de la estructura organizacional, creación de áreas y asignación de departamentos.
- **Registro de Asistencia:** Control y seguimiento de la asistencia diaria de los empleados, gestionando entradas y salidas.
- **Gestión de Preplanillas:** Cálculo preliminar y generación de la nómina (preplanilla) en base a la asistencia y los datos del empleado.

## Tecnologías y Versiones

- **Angular:** `16.2.0` (Framework principal).
- **Node.js:** Versión `18.x` o superior recomendada (el proyecto es compatible y ha sido probado con la versión `20.x`).
- **NPM:** Gestor de paquetes de Node.js.
- **Bootstrap:** `5.3.2` (Framework CSS para diseño responsivo).
- **RxJS:** `7.8.0` (Librería para programación reactiva).

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes en tu máquina local antes de iniciar el proyecto:

1. [Node.js](https://nodejs.org/) (Versión 18 o superior).
2. [Angular CLI](https://angular.io/cli) (Puedes instalarlo globalmente ejecutando: `npm install -g @angular/cli@16`).

## Instrucciones para Iniciar el Proyecto

Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Navegar al directorio del proyecto:**
   Abre tu terminal y ubícate en la carpeta raíz del frontend:
   ```bash
   cd rrhh_front_angular
   ```

2. **Instalar las dependencias:**
   Descarga e instala todas las librerías necesarias ejecutando:
   ```bash
   npm install
   ```
   *(Nota: si experimentas algún problema o conflicto de versiones con paquetes de terceros, puedes probar instalando con la bandera `npm install --legacy-peer-deps`).*

3. **Ejecutar el servidor de desarrollo:**
   Una vez instaladas las dependencias, inicia la aplicación localmente con el comando:
   ```bash
   npm start
   ```
   *(Este comando ejecuta internamente `ng serve`).*

4. **Acceder a la aplicación:**
   Cuando la compilación finalice exitosamente, abre tu navegador web preferido y dirígete a:
   [http://localhost:4200/](http://localhost:4200/)

   El servidor cuenta con *Live Reload*, por lo que la aplicación se recargará automáticamente en el navegador cada vez que guardes cambios en el código fuente.

## Construcción para Producción (Build)

Si necesitas generar los archivos optimizados para desplegar la aplicación en un entorno de producción, ejecuta:

```bash
npm run build
```

Los artefactos finales compilados, minificados y listos para producción se generarán dentro del directorio `dist/`.
