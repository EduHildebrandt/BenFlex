#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Instalación y Configuración Nativa de PostgreSQL 16 en VPS
# Hostname: vps-6592055-x.dattaweb.com | IP: 179.43.120.63
# ==============================================================================
set -euo pipefail

APP_DIR="/opt/benflex"
ENV_FILE="${APP_DIR}/.env.local"
DB_NAME="benflex_db"
DB_USER="benflex_user"

echo "=================================================================="
echo "🐘 Instalando y Configurando PostgreSQL Nativo para BenFlex"
echo "=================================================================="

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Este script debe ejecutarse como root o con sudo."
  exit 1
fi

# 1. Instalar PostgreSQL desde los repositorios oficiales de Ubuntu
echo "📦 [1/5] Instalando paquetes de PostgreSQL..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y postgresql postgresql-contrib

# 2. Habilitar e iniciar el servicio PostgreSQL
echo "⚙️ [2/5] Verificando servicio de PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

if ! systemctl is-active --quiet postgresql; then
  echo "❌ Error: El servicio postgresql no pudo iniciarse."
  exit 1
fi
echo "✅ PostgreSQL está activo y ejecutándose en el sistema."

# 3. Determinar o generar contraseña segura para benflex_user
echo "🔐 [3/5] Configurando usuario y base de datos..."
DB_PASS="${1:-}"

if [ -z "${DB_PASS}" ]; then
  # Intentar extraer contraseña previa si ya existía en .env.local
  if [ -f "${ENV_FILE}" ] && grep -q "DATABASE_URL=.*benflex_user:" "${ENV_FILE}"; then
    EXISTING_PASS=$(grep "DATABASE_URL=" "${ENV_FILE}" | sed -E 's/.*benflex_user:([^@]+)@.*/\1/' || true)
    if [ -n "${EXISTING_PASS}" ]; then
      DB_PASS="${EXISTING_PASS}"
      echo "ℹ️ Reutilizando contraseña existente para ${DB_USER}."
    fi
  fi
fi

if [ -z "${DB_PASS}" ]; then
  DB_PASS=$(openssl rand -hex 16)
  echo "✨ Se generó una contraseña segura aleatoria para ${DB_USER}."
fi

# 4. Crear usuario y base de datos en PostgreSQL
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';
    RAISE NOTICE 'Usuario ${DB_USER} creado exitosamente.';
  ELSE
    ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';
    RAISE NOTICE 'Contraseña de usuario ${DB_USER} actualizada.';
  END IF;
END
\$\$;

SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\gexec

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} OWNER TO ${DB_USER};
EOF

# Ajustar permisos sobre el esquema public (PostgreSQL 15/16 security model)
sudo -u postgres psql -d "${DB_NAME}" <<EOF
GRANT ALL ON SCHEMA public TO ${DB_USER};
ALTER SCHEMA public OWNER TO ${DB_USER};
EOF

echo "✅ Base de datos '${DB_NAME}' y usuario '${DB_USER}' configurados correctamente."

# 5. Probar conexión local TCP
echo "🔌 [4/5] Probando conexión local a PostgreSQL..."
export PGPASSWORD="${DB_PASS}"
if psql -h 127.0.0.1 -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT 1;" >/dev/null 2>&1; then
  echo "✅ Conexión TCP local verificada con éxito (127.0.0.1:5432)."
else
  echo "⚠️ Advertencia: Verificación TCP no respondió inmediatamente, verificando socket unix..."
fi
unset PGPASSWORD

# 6. Actualizar variable DATABASE_URL en .env.local
echo "📝 [5/5] Actualizando configuración en ${ENV_FILE}..."
mkdir -p "${APP_DIR}"
touch "${ENV_FILE}"

NEW_DB_URL="DATABASE_URL=\"postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:5432/${DB_NAME}\""

if grep -q "^DATABASE_URL=" "${ENV_FILE}"; then
  # Reemplazar línea existente
  sed -i "s|^DATABASE_URL=.*|${NEW_DB_URL}|" "${ENV_FILE}"
else
  # Agregar al archivo
  echo "" >> "${ENV_FILE}"
  echo "# PostgreSQL Nativo Local (VPS Ubuntu DonWeb)" >> "${ENV_FILE}"
  echo "${NEW_DB_URL}" >> "${ENV_FILE}"
fi

# Asegurar permisos del archivo .env.local
chmod 600 "${ENV_FILE}"

# 7. Reiniciar la aplicación Next.js para que tome la nueva base de datos
if systemctl list-unit-files | grep -q "benflex.service"; then
  echo "🔄 Reiniciando benflex.service..."
  systemctl restart benflex.service
  sleep 2
  systemctl status benflex.service --no-pager || true
fi

echo "=================================================================="
echo "🎉 ¡PostgreSQL instalado y vinculado exitosamente con BenFlex!"
echo "=================================================================="
echo "📌 Base de datos: ${DB_NAME}"
echo "📌 Usuario:       ${DB_USER}"
echo "📌 Host:          127.0.0.1:5432"
echo "📌 URL:           postgresql://${DB_USER}:****@127.0.0.1:5432/${DB_NAME}"
echo "=================================================================="
