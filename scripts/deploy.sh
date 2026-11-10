#!/usr/bin/env bash
# ==============================================================================
# Automated Zero-Downtime Production Deployment Script for HTX OCOP
# ==============================================================================

set -euo pipefail

echo "=========================================================================="
echo " Starting HTX OCOP Production Deployment: $(date)"
echo "=========================================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
cd "${ROOT_DIR}"

# 1. Check SSL Certificates
if [ ! -f "docker/ssl/server.crt" ] || [ ! -f "docker/ssl/server.key" ]; then
    echo ">>> SSL Certificate missing! Generating self-signed fallback..."
    bash scripts/generate_ssl_certs.sh
fi

# 2. Pull Latest Git Changes
echo ">>> Pulling latest code changes from Git..."
git pull origin feature/36-toan-dien-nghiep-vu-cai-tien

# 3. Build & Update Docker Containers
echo ">>> Building and updating production containers..."
docker compose -f docker-compose.prod.yml build --pull
docker compose -f docker-compose.prod.yml up -d

# 4. Wait for Database Ready
echo ">>> Waiting for PostgreSQL database to be healthy..."
docker compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres -d htx_ocop -h 127.0.0.1

# 5. Database Migrations
echo ">>> Running database migrations in safe production mode..."
docker compose -f docker-compose.prod.yml exec -T backend php artisan migrate --force

# 6. Optimize Caching (Routes, Configs, Views, Events)
echo ">>> Optimizing Laravel configurations, routes, and views..."
docker compose -f docker-compose.prod.yml exec -T backend php artisan config:cache
docker compose -f docker-compose.prod.yml exec -T backend php artisan route:cache
docker compose -f docker-compose.prod.yml exec -T backend php artisan view:cache
docker compose -f docker-compose.prod.yml exec -T backend php artisan event:cache

# 7. Restart Queue Workers
echo ">>> Restarting async queue workers..."
docker compose -f docker-compose.prod.yml exec -T backend php artisan queue:restart

# 8. Health Check Verification
echo ">>> Performing automated HTTP/HTTPS health checks..."
HEALTH_STATUS=$(docker compose -f docker-compose.prod.yml exec -T backend curl -k -s -o /dev/null -w "%{http_code}" https://localhost/health || true)

if [ "${HEALTH_STATUS}" = "200" ]; then
    echo "=========================================================================="
    echo " DEPLOYMENT SUCCESSFUL! All services healthy (HTTP 200)."
    echo "=========================================================================="
else
    echo ">>> WARNING: Health check returned HTTP ${HEALTH_STATUS}. Please inspect logs:"
    docker compose -f docker-compose.prod.yml logs --tail=50 nginx backend
fi
