#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Respaldo Diario Automatizado de Base de Datos y Datos
# Horario Programado: Todos los días a las 02:00 AM (0 2 * * *)
# ==============================================================================
set -euo pipefail

BACKUP_DIR="/opt/benflex/backups"
APP_DIR="/opt/benflex"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
SQL_BACKUP="${BACKUP_DIR}/benflex_db_${TIMESTAMP}.sql.gz"
JSON_BACKUP="${BACKUP_DIR}/local_storage_${TIMESTAMP}.json.gz"
LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

echo "${LOG_PREFIX} 📦 Iniciando respaldo diario de BenFlex..."

# 1. Asegurar existencia de directorio de respaldos
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

# 2. Respaldo de PostgreSQL con pg_dump comprimido con gzip
if command -v pg_dump >/dev/null 2>&1; then
  echo "${LOG_PREFIX} 💾 Extrayendo base de datos PostgreSQL (benflex_db)..."
  if sudo -u postgres pg_dump --clean --if-exists benflex_db | gzip > "${SQL_BACKUP}"; then
    if [ -s "${SQL_BACKUP}" ]; then
      FILE_SIZE=$(du -h "${SQL_BACKUP}" | cut -f1)
      echo "${LOG_PREFIX} ✅ Respaldo PostgreSQL generado con éxito: ${SQL_BACKUP} (${FILE_SIZE})"
    else
      echo "${LOG_PREFIX} ⚠️ Advertencia: El archivo SQL generado está vacío."
    fi
  else
    echo "${LOG_PREFIX} ❌ Error al ejecutar pg_dump sobre benflex_db."
  fi
else
  echo "${LOG_PREFIX} ⚠️ Advertencia: pg_dump no encontrado en el PATH."
fi

# 3. Respaldo redundante de almacenamiento local JSON
if [ -f "${APP_DIR}/src/data/local_storage.json" ]; then
  echo "${LOG_PREFIX} 📄 Respaldando copia de local_storage.json..."
  gzip -c "${APP_DIR}/src/data/local_storage.json" > "${JSON_BACKUP}"
  echo "${LOG_PREFIX} ✅ Respaldo JSON generado: ${JSON_BACKUP}"
fi

# 4. Política de retención: Eliminar respaldos con más de 30 días
echo "${LOG_PREFIX} 🧹 Aplicando política de retención (conservar últimos 30 días)..."
find "${BACKUP_DIR}" -type f -name "benflex_db_*.sql.gz" -mtime +30 -delete || true
find "${BACKUP_DIR}" -type f -name "local_storage_*.json.gz" -mtime +30 -delete || true

echo "${LOG_PREFIX} 🎉 Respaldo diario completado exitosamente."
