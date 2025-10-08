#!/bin/sh
set -e

# Extraer host y puerto de DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -E 's#postgresql://[^:]+:[^@]+@([^:/]+):([0-9]+)/.*#\1#')
DB_PORT=$(echo $DATABASE_URL | sed -E 's#postgresql://[^:]+:[^@]+@([^:/]+):([0-9]+)/.*#\2#')

echo "sperando a que la base de datos esté lista en $DB_HOST:$DB_PORT..."
while ! nc -z $DB_HOST $DB_PORT; do
  echo "Base de datos no disponible, esperando 2s..."
  sleep 2
done

echo "Base de datos lista. Aplicando migraciones..."
npx prisma migrate deploy

echo "Ejecutando seed..."
npx ts-node prisma/seed.ts

echo "Iniciando backend..."
exec node dist/src/index.js