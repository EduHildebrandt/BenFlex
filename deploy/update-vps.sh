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
  node -e '
    const fs = require("fs");
    try {
      const backup = JSON.parse(fs.readFileSync("/tmp/benflex_local_storage.backup.json", "utf8"));
      const current = JSON.parse(fs.readFileSync("src/data/local_storage.json", "utf8"));
      if (backup.orders && backup.orders.length > 0) current.orders = backup.orders;
      if (backup.inquiries && backup.inquiries.length > 0) current.inquiries = backup.inquiries;
      if ((!current.products || current.products.length === 0) && backup.products && backup.products.length > 0) {
        current.products = backup.products;
      }
      fs.writeFileSync("src/data/local_storage.json", JSON.stringify(current, null, 2), "utf8");
    } catch (e) {
      console.warn("No se pudo fusionar respaldo local_storage:", e);
    }
  ' || true
  rm -f /tmp/benflex_local_storage.backup.json
fi

npm install
npm run build
systemctl restart benflex.service

echo "✅ BenFlex actualizado y reiniciado con systemd (benflex.service)."
