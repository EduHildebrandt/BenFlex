#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Script de Actualización Rápida en VPS (/opt/benflex)
# ==============================================================================
set -euo pipefail

APP_DIR="/opt/benflex"

echo "🔄 Actualizando BenFlex en ${APP_DIR} desde GitHub..."
cd "${APP_DIR}"

if [ -f "src/data/local_storage.json" ]; then
  cp "src/data/local_storage.json" /tmp/benflex_local_storage.backup.json
fi

git fetch origin main
git reset --hard origin/main

if [ -f /tmp/benflex_local_storage.backup.json ]; then
  cp /tmp/benflex_local_storage.backup.json "src/data/local_storage.json"
  rm -f /tmp/benflex_local_storage.backup.json
fi

npm install
npm run build
systemctl restart benflex.service

echo "✅ BenFlex actualizado y reiniciado con systemd (benflex.service)."
