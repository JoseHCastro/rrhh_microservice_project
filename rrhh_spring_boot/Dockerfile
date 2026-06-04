FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Al montar el volumen en docker-compose (- ./rrhh_spring_boot:/app) 
# el código fuente de la máquina local reemplazará esta carpeta.
# Instalamos bash y dependencias necesarias si es requerido por mvnw
RUN apk add --no-cache bash

# Comando por defecto para correr la aplicación en modo desarrollo
CMD ["./mvnw", "spring-boot:run"]
