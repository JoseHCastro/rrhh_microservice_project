FROM node:22-alpine

# Prisma necesita openssl en alpine para generar el cliente
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copiar manifiestos primero para aprovechar cache
COPY package*.json ./
COPY prisma ./prisma

RUN npm install

# Generar cliente Prisma con los binarios correctos para alpine
RUN npx prisma generate

# Copiar el resto del código
COPY . .

RUN npm run build

CMD ["npm", "run", "start:prod"]
