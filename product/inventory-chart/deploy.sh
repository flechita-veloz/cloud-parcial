#!/bin/bash
set -e  # Detener si ocurre un error

# Variables
AWS_REGION="us-east-1"
ECR_ID="454488457447"
NAMESPACE="inventory"
FRONTEND_IMAGE="$ECR_ID.dkr.ecr.$AWS_REGION.amazonaws.com/inventory-frontend:latest"
BACKEND_IMAGE="$ECR_ID.dkr.ecr.$AWS_REGION.amazonaws.com/inventory-backend:latest"

# 1️⃣ Obtener URL interna del backend (estable)
BACKEND_URL="http://backend-service:8000"
echo "✅ Usando BACKEND_URL: $BACKEND_URL"

# 2️⃣ Construir y subir el backend
echo "🚀 Construyendo backend..."
docker buildx build --platform linux/amd64 \
  -t $BACKEND_IMAGE \
  ../server \
  --push

# 3️⃣ Construir y subir el frontend con la URL interna del backend
echo "🚀 Construyendo frontend con NEXT_PUBLIC_API_URL=$BACKEND_URL ..."
docker buildx build --platform linux/amd64 \
  -t $FRONTEND_IMAGE \
  --build-arg NEXT_PUBLIC_API_URL=$BACKEND_URL \
  ../client \
  --push

# 4️⃣ Desplegar con Helm (actualiza si ya existe)
echo "🧩 Desplegando en Kubernetes con Helm..."
helm upgrade --install inventory ../inventory-chart -n $NAMESPACE

echo "🎉 Despliegue completado exitosamente"