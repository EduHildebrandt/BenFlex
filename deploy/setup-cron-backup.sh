#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Instalador de Cron Job para Respaldo Diario a las 02:00 AM
# ==============================================================================
set -euo pipefail

CRON_FILE="/etc/cron.d/benflex-backup"
BACKUP_SCRIPT="/opt/benflex/deploy/daily-backup.sh"

echo "=================================================================="
echo "🕒 Configurando Respaldo Automático Diario (02:00 AM) para BenFlex"
echo "=================================================================="

if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Este script debe ejecutarse como root o con sudo."
  exit 1
fi

# 1. Permisos del script de respaldo
chmod +x "${BACKUP_SCRIPT}"
echo "✅ Permisos de ejecución otorgados a ${BACKUP_SCRIPT}."

# 2. Configurar la tarea cron en /etc/cron.d/
cat << 'EOF' > "${CRON_FILE}"
# Respaldo automático de base de datos BenFlex todos los días a las 02:00 AM
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

0 2 * * * root /bin/bash /opt/benflex/deploy/daily-backup.sh >> /var/log/benflex_backup.log 2>&1
EOF

chmod 644 "${CRON_FILE}"
echo "✅ Tarea programada configurada en ${CRON_FILE}:"
cat "${CRON_FILE}"

# 3. Reiniciar cron para asegurar lectura de la nueva tarea
if systemctl is-active --quiet cron; then
  systemctl reload cron || systemctl restart cron
  echo "✅ Servicio cron actualizado."
elif systemctl is-active --quiet crond; then
  systemctl reload crond || systemctl restart crond
  echo "✅ Servicio crond actualizado."
fi

# 4. Ejecutar una corrida de prueba inmediata
echo "🧪 Ejecutando respaldo de prueba inmediato para verificar funcionamiento..."
bash "${BACKUP_SCRIPT}"

echo ""
echo "=================================================================="
echo "🎉 ¡Configuración Exitosa!"
echo "• Horario de ejecución: Todos los días a las 02:00 AM"
echo "• Directorio de respaldos: /opt/benflex/backups/"
echo "• Registro de ejecución (log): /var/log/benflex_backup.log"
echo "• Política de retención: Se conservan los respaldos de los últimos 30 días"
echo "=================================================================="
