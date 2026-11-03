#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Script de Actualización Rápida en VPS (Zero Data Loss)
# ==============================================================================
set -euo pipefail

APP_DIR="/var/www/benflex"

echo "🔄 Actualizando BenFlex en ${APP_DIR} desde GitHub..."
cd "${APP_DIR}"

# Respaldar base de datos local híbrida antes de actualizar git
if [ -f "src/data/local_storage.json" ]; then
  cp "src/data/local_storage.json" /tmp/benflex_local_storage.backup.json
fi

git fetch origin main
git reset --hard origin/main

# Restaurar datos persistidos en producción (productos ATM, ventas y consultas)
if [ -f /tmp/benflex_local_storage.backup.json ]; then
  cp /tmp/benflex_local_storage.backup.json "src/data/local_storage.json"
  rm -f /tmp/benflex_local_storage.backup.json
fi

npm install
npm run build
pm2 reload benflex-web || pm2 start ecosystem.config.cjs

echo "✅ BenFlex actualizado y recargado en producción (www.blenflex.online)."
