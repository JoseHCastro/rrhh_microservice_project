# Usando una imagen Maven con JDK 21 (25 aún no es LTS estándar en Docker)
FROM maven:3.9.6-eclipse-temurin-21
WORKDIR /app
COPY . .
# En desarrollo, esto usará el código fuente montado y compilará al vuelo
CMD ["mvn", "spring-boot:run"]
