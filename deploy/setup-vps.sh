#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Provisioning & Deploy Automatizado para VPS Ubuntu (DonWeb)
# Dominio objetivo: www.blenflex.online / blenflex.online
# ==============================================================================
set -euo pipefail

DOMAIN="blenflex.online"
WWW_DOMAIN="www.blenflex.online"
APP_DIR="/var/www/benflex"
REPO_URL="https://github.com/EduHildebrandt/BenFlex.git"
ADMIN_EMAIL="${CERTBOT_EMAIL:-admin@blenflex.online}"

echo "=================================================================="
echo "🚀 Iniciando aprovisionamiento de BenFlex en Ubuntu VPS (DonWeb)"
echo "🌐 Dominio configurado: ${WWW_DOMAIN} (${DOMAIN})"
echo "=================================================================="

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Ejecutá este script como root o con sudo: sudo bash deploy/setup-vps.sh"
  exit 1
fi

# 1. Actualizar paquetes base del sistema
echo "📦 [1/8] Actualizando paquetes del sistema e instalando dependencias..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git nginx ufw certbot python3-certbot-nginx ca-certificates gnupg build-essential

# 2. Instalar Node.js 22 LTS (si no está instalado o es < v20)
echo "🟢 [2/8] Verificando Node.js..."
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
  echo "⬇️ Instalando Node.js 22 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
echo "✅ Node: $(node -v) | NPM: $(npm -v)"

# 3. Instalar PM2 globalmente
echo "⚙️ [3/8] Instalando gestor de procesos PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

# 4. Clonar o actualizar el repositorio en /var/www/benflex preservando datos locales
echo "📥 [4/8] Sincronizando código desde GitHub (${REPO_URL})..."
mkdir -p /var/www
if [ -f "${APP_DIR}/src/data/local_storage.json" ]; then
  cp "${APP_DIR}/src/data/local_storage.json" /tmp/benflex_local_storage.backup.json
fi

if [ -d "${APP_DIR}/.git" ]; then
  cd "${APP_DIR}"
  git fetch origin main
  git reset --hard origin/main
else
  rm -rf "${APP_DIR}"
  git clone "${REPO_URL}" "${APP_DIR}"
  cd "${APP_DIR}"
fi

if [ -f /tmp/benflex_local_storage.backup.json ]; then
  mkdir -p "${APP_DIR}/src/data"
  cp /tmp/benflex_local_storage.backup.json "${APP_DIR}/src/data/local_storage.json"
  rm -f /tmp/benflex_local_storage.backup.json
fi

# 5. Configurar variables de entorno (.env.local) y permisos de persistencia híbrida
echo "🔐 [5/8] Configurando variables de entorno y almacenamiento persistente..."
if [ ! -f "${APP_DIR}/.env.local" ]; then
  GENERATED_SECRET=$(openssl rand -hex 32)
  cat > "${APP_DIR}/.env.local" <<EOF
# Entorno de Producción — BenFlex VPS (www.blenflex.online)
ADMIN_OWNER_KEY=${ADMIN_OWNER_KEY:-dueno-benflex-2026}
ADMIN_DEV_KEY=${ADMIN_DEV_KEY:-dev-benflex-2026}
ADMIN_SESSION_SECRET=${GENERATED_SECRET}
NEXT_PUBLIC_SITE_URL=https://${WWW_DOMAIN}
# Descomentar y completar si se desea conectar a Supabase PostgreSQL externo:
# DATABASE_URL=postgresql://postgres.[REF]:[PASS]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
EOF
  chmod 600 "${APP_DIR}/.env.local"
  echo "✅ Archivo .env.local creado con secreto HMAC aleatorio."
else
  echo "ℹ️ Se conserva el archivo .env.local existente."
fi

mkdir -p "${APP_DIR}/src/data"
if [ ! -f "${APP_DIR}/src/data/local_storage.json" ]; then
  echo '{"products":[],"orders":[],"inquiries":[],"updatedAt":"2026-11-03T00:00:00.000Z"}' > "${APP_DIR}/src/data/local_storage.json"
fi
chmod -R 755 "${APP_DIR}/src/data"

# 6. Instalar dependencias y compilar Next.js para producción
echo "🏗️ [6/8] Instalando paquetes NPM y compilando build de producción..."
cd "${APP_DIR}"
npm install
npm run build

# 7. Iniciar/Recargar aplicación con PM2 y configurar arranque automático
echo "🚀 [7/8] Levantando servidor Next.js con PM2..."
pm2 delete benflex-web >/dev/null 2>&1 || true
pm2 start "${APP_DIR}/ecosystem.config.cjs"
pm2 save
env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# 8. Configurar Nginx y Firewall UFW
echo "🌐 [8/8] Configurando Reverse Proxy Nginx y Firewall..."
cp "${APP_DIR}/deploy/nginx-blenflex.conf" /etc/nginx/sites-available/blenflex.online
ln -sf /etc/nginx/sites-available/blenflex.online /etc/nginx/sites-enabled/blenflex.online
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx

ufw allow OpenSSH >/dev/null 2>&1 || true
ufw allow 'Nginx Full' >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true

# Intentar emitir certificado SSL con Let's Encrypt si el DNS ya apunta a este VPS
echo "🔒 Verificando certificado SSL Let's Encrypt para ${DOMAIN} y ${WWW_DOMAIN}..."
if certbot --nginx -d "${DOMAIN}" -d "${WWW_DOMAIN}" --non-interactive --agree-tos -m "${ADMIN_EMAIL}" --redirect; then
  echo "✅ Certificado SSL HTTPS activado exitosamente en https://${WWW_DOMAIN}"
else
  echo "⚠️ Aún no se pudo emitir el certificado SSL (verificá que los registros DNS A de @ y www apunten a la IP de este VPS)."
  echo "👉 El sitio ya está funcionando por HTTP en http://${WWW_DOMAIN} y por la IP del VPS."
  echo "👉 Cuando el DNS propague, ejecutá: sudo certbot --nginx -d ${DOMAIN} -d ${WWW_DOMAIN}"
fi

echo "=================================================================="
echo "🎉 ¡DESPLIEGUE COMPLETADO CON ÉXITO!"
echo "🔗 Tienda Pública:     https://${WWW_DOMAIN} (o http://${WWW_DOMAIN})"
echo "🔐 Panel Admin (ATM):  https://${WWW_DOMAIN}/admin"
echo "🔑 Clave Dueño:        dueno-benflex-2026"
echo "🔑 Clave Desarrollador: dev-benflex-2026"
echo "=================================================================="
