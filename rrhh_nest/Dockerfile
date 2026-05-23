FROM node:22-alpine
# Node 24 is not currently an LTS alpine image, we will use node:22 or node:current. We use node:22-alpine for stability.
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
