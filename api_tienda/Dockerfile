FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para build)
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

# Eliminar devDependencies
RUN npm prune --production

EXPOSE 3000

CMD ["node", "dist/app.js"]