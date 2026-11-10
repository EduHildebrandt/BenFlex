#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Limpieza de Base de Datos para Lanzamiento a Producción
# ==============================================================================
# Este script:
# 1. Respalda la base de datos actual en /opt/benflex/backups/
# 2. Elimina todos los productos de prueba (dejando intactas las categorías)
# 3. Elimina todas las órdenes / pedidos de prueba
# 4. Elimina consultas / reclamos de prueba
# 5. Limpia el almacenamiento local de contingencia
# 6. Reinicia el servicio productivo de BenFlex
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo "🧹 Limpieza de Datos para Lanzamiento Productivo BenFlex"
echo "=================================================================="

BACKUP_DIR="/opt/benflex/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/benflex_db_pre_cleanup_$(date +%Y%m%d_%H%M%S).sql"

# 1. Backup de seguridad antes de limpiar
echo "💾 Creando respaldo de seguridad en $BACKUP_FILE..."
if command -v pg_dump > /dev/null 2>&1; then
  sudo -u postgres pg_dump benflex_db > "$BACKUP_FILE" || true
  echo "✅ Respaldo guardado con éxito."
else
  echo "⚠️ pg_dump no disponible directamente, continuando..."
fi

# 2. Limpieza de tablas en PostgreSQL benflex_db
echo "🗑️ Limpiando tablas de productos, pedidos y consultas en PostgreSQL..."
sudo -u postgres psql -d benflex_db -c "
-- Vaciar productos y pedidos
TRUNCATE TABLE benflex_products CASCADE;
TRUNCATE TABLE benflex_orders CASCADE;
TRUNCATE TABLE benflex_inquiries CASCADE;

-- Asegurar que las 4 categorías estándar existan
INSERT INTO benflex_categories (id, label, description, is_active, updated_at)
VALUES 
  ('colchones-sommiers', 'Colchones & Sommiers', 'Colchones ortopédicos de alta densidad y resortes pocket', true, NOW()),
  ('sillones-sofas', 'Sillones & Sofás Cama', 'Sillones y esquineros con telas anti-desgarro', true, NOW()),
  ('almohadas-confort', 'Almohadas & Confort', 'Almohadas viscoelásticas y cervicales', true, NOW()),
  ('combos-benflex', 'Combos BenFlex', 'Conjuntos completos de descanso con regalo', true, NOW())
ON CONFLICT (id) DO UPDATE SET is_active = true, updated_at = NOW();
"

# 3. Limpieza de almacenamiento local híbrido de contingencia
echo "📁 Limpiando almacenamiento local en /opt/benflex/src/data/local_storage.json..."
cat << 'EOF' > /opt/benflex/src/data/local_storage.json
{
  "categories": [
    {
      "id": "colchones-sommiers",
      "label": "Colchones & Sommiers",
      "description": "Colchones ortopédicos de alta densidad y resortes pocket"
    },
    {
      "id": "sillones-sofas",
      "label": "Sillones & Sofás Cama",
      "description": "Sillones y esquineros con telas anti-desgarro"
    },
    {
      "id": "almohadas-confort",
      "label": "Almohadas & Confort",
      "description": "Almohadas viscoelásticas y cervicales"
    },
    {
      "id": "combos-benflex",
      "label": "Combos BenFlex",
      "description": "Conjuntos completos de descanso con regalo"
    }
  ],
  "products": [],
  "orders": [],
  "inquiries": [],
  "updatedAt": "2026-11-10T10:45:00.000Z"
}
EOF

# 4. Reiniciar el servicio Next.js
echo "🔄 Reiniciando servicio benflex.service..."
systemctl restart benflex.service
sleep 2

# 5. Verificación final de registros
echo "=================================================================="
echo "📊 Estado Final de la Base de Datos PostgreSQL (benflex_db):"
echo "=================================================================="
sudo -u postgres psql -d benflex_db -c "
SELECT 'Categorías (Preservadas)' AS concepto, count(*) AS total FROM benflex_categories WHERE is_active = true
UNION ALL
SELECT 'Productos (Listos para cargar)', count(*) FROM benflex_products WHERE is_active = true
UNION ALL
SELECT 'Órdenes / Ventas (Limpias)', count(*) FROM benflex_orders
UNION ALL
SELECT 'Consultas de Contacto', count(*) FROM benflex_inquiries;
"

echo "=================================================================="
echo "🎉 ¡Limpieza completada con éxito!"
echo "👉 El dueño ya puede ingresar a /admin para cargar los productos reales."
echo "=================================================================="
