#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Provisioning & Deploy Automatizado para VPS Ubuntu (DonWeb)
# Hostname: vps-6592055-x.dattaweb.com | IP: 179.43.120.63 | Dominio: www.blenflex.online
# ==============================================================================
set -euo pipefail

DOMAIN="blenflex.online"
WWW_DOMAIN="www.blenflex.online"
APP_DIR="/opt/benflex"
REPO_URL="https://github.com/EduHildebrandt/BenFlex.git"

echo "=================================================================="
echo "🚀 Iniciando aprovisionamiento de BenFlex en Ubuntu VPS (DonWeb)"
echo "=================================================================="

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Ejecutá este script como root o con sudo."
  exit 1
fi

# 1. Actualizar índice de paquetes e instalar dependencias base (SIN ufw ni upgrade completo)
echo "📦 [1/6] Actualizando índice de paquetes e instalando Nginx y utilidades..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git rsync nginx ca-certificates gnupg build-essential

# 2. Instalar Node.js 22 LTS desde NodeSource
echo "🟢 [2/6] Verificando / instalando Node.js 22 LTS desde NodeSource..."
NEED_NODE=0
if ! command -v node >/dev/null 2>&1; then
  NEED_NODE=1
else
  NODE_MAJOR=$(node -v | cut -d. -f1 | tr -d 'v')
  if [ "${NODE_MAJOR}" -lt 20 ]; then
    NEED_NODE=1
  fi
fi

if [ "${NEED_NODE}" -eq 1 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | DEBIAN_FRONTEND=noninteractive bash -
  DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
echo "✅ Node: $(node -v) | NPM: $(npm -v)"

# 3. Sincronizar código en /opt/benflex preservando datos locales
echo "📥 [3/6] Sincronizando aplicación en ${APP_DIR}..."
mkdir -p "${APP_DIR}"
if [ -f "${APP_DIR}/src/data/local_storage.json" ]; then
  cp "${APP_DIR}/src/data/local_storage.json" /tmp/benflex_local_storage.backup.json
fi

if [ -d "${APP_DIR}/.git" ]; then
  cd "${APP_DIR}"
  git fetch origin main
  git reset --hard origin/main
else
  git clone "${REPO_URL}" "${APP_DIR}"
  cd "${APP_DIR}"
fi

if [ -f /tmp/benflex_local_storage.backup.json ]; then
  mkdir -p "${APP_DIR}/src/data"
  cp /tmp/benflex_local_storage.backup.json "${APP_DIR}/src/data/local_storage.json"
  rm -f /tmp/benflex_local_storage.backup.json
fi

# 4. Instalar dependencias y compilar Next.js para producción
echo "🏗️ [4/6] Instalando dependencias NPM y compilando aplicación..."
cd "${APP_DIR}"
npm install
npm run build

# 5. Configurar servicio systemd (benflex.service)
echo "⚙️ [5/6] Configurando servicio systemd benflex.service..."
cat > /etc/systemd/system/benflex.service <<EOF
[Unit]
Description=BenFlex E-Commerce Next.js Production Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
Environment=NODE_ENV=production
Environment=PORT=3000
EnvironmentFile=-${APP_DIR}/.env
EnvironmentFile=-${APP_DIR}/.env.local
ExecStart=/usr/bin/node ${APP_DIR}/node_modules/next/dist/bin/next start -p 3000 -H 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable benflex.service
systemctl restart benflex.service

# 6. Configurar Nginx como Reverse Proxy en puerto 80
echo "🌐 [6/6] Configurando Nginx como Reverse Proxy..."
cp "${APP_DIR}/deploy/nginx-blenflex.conf" /etc/nginx/sites-available/benflex
ln -sf /etc/nginx/sites-available/benflex /etc/nginx/sites-enabled/benflex
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx

echo "✅ Despliegue base completado en http://vps-6592055-x.dattaweb.com y http://179.43.120.63"
