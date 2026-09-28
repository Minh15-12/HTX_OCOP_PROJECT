#!/bin/bash

# HTX_OCOP_PROJECT Deployment Script
# Usage: ./deploy.sh [environment]

ENV=${1:-production}
echo "Starting deployment for environment: $ENV"

# 1. Pull latest code
echo "Pulling latest code..."
git pull origin main

# 2. Build and start Docker containers
echo "Building and starting Docker containers..."
docker-compose down
docker-compose up -d --build

# 3. Backend Setup
echo "Setting up backend..."
docker exec htx-ocop-backend composer install --optimize-autoloader --no-dev
docker exec htx-ocop-backend php artisan config:cache
docker exec htx-ocop-backend php artisan route:cache
docker exec htx-ocop-backend php artisan view:cache
docker exec htx-ocop-backend php artisan migrate --force

echo "Deployment completed successfully!"
