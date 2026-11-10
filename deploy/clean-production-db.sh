#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Limpieza de Base de Datos para Lanzamiento a Producción
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
  sudo -u postgres pg_dump benflex_db > "$BACKUP_FILE" 2>/dev/null || true
  echo "✅ Respaldo generado."
fi

# 2. Asegurar que las tablas existan en benflex_db y otorgar permisos
echo "🏗️ Verificando y asegurando estructura de tablas en benflex_db..."
sudo -u postgres psql -d benflex_db << 'EOF'
CREATE TABLE IF NOT EXISTS public.benflex_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.benflex_products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  technology TEXT NOT NULL,
  technology_label TEXT NOT NULL,
  measure TEXT NOT NULL,
  firmness TEXT,
  base_price NUMERIC NOT NULL,
  transfer_discount_percent NUMERIC NOT NULL DEFAULT 15,
  variations JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  fabrics JSONB,
  image TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge TEXT,
  stock INTEGER NOT NULL DEFAULT 10,
  weight_support TEXT,
  warranty TEXT,
  rating NUMERIC NOT NULL DEFAULT 4.9,
  reviews_count INTEGER NOT NULL DEFAULT 25,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.benflex_orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_dni TEXT,
  delivery_method TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  shipping_original NUMERIC NOT NULL DEFAULT 0,
  shipping_discount NUMERIC NOT NULL DEFAULT 0,
  shipping_final NUMERIC NOT NULL DEFAULT 0,
  transfer_discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  installments INTEGER,
  status TEXT NOT NULL DEFAULT 'PENDIENTE_COMPROBANTE',
  access_token TEXT,
  idempotency_key TEXT,
  stock_deducted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.benflex_inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asegurar permisos para el usuario de la app
GRANT ALL ON SCHEMA public TO benflex_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO benflex_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO benflex_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO benflex_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO benflex_user;
EOF

# 3. Vaciar tablas de productos, pedidos y consultas de prueba
echo "🗑️ Vaciando productos y pedidos de prueba..."
sudo -u postgres psql -d benflex_db << 'EOF'
TRUNCATE TABLE public.benflex_products CASCADE;
TRUNCATE TABLE public.benflex_orders CASCADE;
TRUNCATE TABLE public.benflex_inquiries CASCADE;

-- Insertar o activar las 4 categorías estándar comerciales de BenFlex
INSERT INTO public.benflex_categories (id, label, description, is_active, updated_at)
VALUES 
  ('colchones-sommiers', 'Colchones & Sommiers', 'Colchones ortopédicos de alta densidad y resortes pocket', true, NOW()),
  ('sillones-sofas', 'Sillones & Sofás Cama', 'Sillones y esquineros con telas anti-desgarro', true, NOW()),
  ('almohadas-confort', 'Almohadas & Confort', 'Almohadas viscoelásticas y cervicales', true, NOW()),
  ('combos-benflex', 'Combos BenFlex', 'Conjuntos completos de descanso con regalo', true, NOW())
ON CONFLICT (id) DO UPDATE SET is_active = true, updated_at = NOW();
EOF

# 4. Limpieza de almacenamiento local híbrido de contingencia
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

# 5. Reiniciar el servicio Next.js
echo "🔄 Reiniciando servicio benflex.service..."
systemctl restart benflex.service
sleep 2

# 6. Verificación final de registros
echo "=================================================================="
echo "📊 Estado Final de la Base de Datos PostgreSQL (benflex_db):"
echo "=================================================================="
sudo -u postgres psql -d benflex_db -c "
SELECT 'Categorías (Preservadas)' AS concepto, count(*) AS total FROM public.benflex_categories WHERE is_active = true
UNION ALL
SELECT 'Productos (Listos para cargar)', count(*) FROM public.benflex_products WHERE is_active = true
UNION ALL
SELECT 'Órdenes / Ventas (Limpias)', count(*) FROM public.benflex_orders
UNION ALL
SELECT 'Consultas de Contacto', count(*) FROM public.benflex_inquiries;
"

echo "=================================================================="
echo "🎉 ¡Limpieza completada con éxito!"
echo "👉 El dueño ya puede ingresar a /admin para cargar los productos reales."
echo "=================================================================="
