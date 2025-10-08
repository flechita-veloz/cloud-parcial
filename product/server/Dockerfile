# Etapa 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar solo los archivos necesarios para la instalación de dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto de los archivos del proyecto
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar el proyecto TypeScript
RUN npx tsc

# Etapa final
FROM node:20-alpine
WORKDIR /app

# Copiar los archivos desde la etapa de build
COPY --from=builder /app ./

# Copiar el script de entrada y otorgar permisos de ejecución
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Exponer el puerto 8000
EXPOSE 8000

# Comando para iniciar la aplicación
CMD ["./entrypoint.sh"]