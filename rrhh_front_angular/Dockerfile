FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código del proyecto
COPY . .

# Exponer el puerto por defecto de Angular CLI
EXPOSE 4200

# Ejecutar el servidor de desarrollo de Angular vinculándolo a 0.0.0.0
# para permitir conexiones externas y deshabilitando la comprobación de host
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--disable-host-check"]
