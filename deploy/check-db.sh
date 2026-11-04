#!/usr/bin/env bash
# ==============================================================================
# BenFlex E-Commerce — Verificador de Base de Datos PostgreSQL
# ==============================================================================
set -euo pipefail

echo "=================================================================="
echo "🔍 Verificando Estado y Datos en PostgreSQL (benflex_db)"
echo "=================================================================="

# 1. Disparar inicialización mediante la API interna de Next.js
echo "📡 Contactando a Next.js para asegurar inicialización de tablas..."
curl -s http://127.0.0.1:3000/api/products > /dev/null || true
curl -s http://127.0.0.1:3000/api/categories > /dev/null || true
sleep 1

# 2. Consultar conteo de registros en las tablas de PostgreSQL
echo "📊 Conteo de registros migrados en PostgreSQL:"
sudo -u postgres psql -d benflex_db -c "
SELECT 'Categorías' AS tabla, count(*) AS total_registros FROM benflex_categories
UNION ALL
SELECT 'Productos', count(*) FROM benflex_products
UNION ALL
SELECT 'Órdenes / Pedidos', count(*) FROM benflex_orders
UNION ALL
SELECT 'Consultas / Reclamos', count(*) FROM benflex_inquiries;
"

echo "=================================================================="
echo "✅ Si ves tus productos y categorías listados arriba, la migración está 100% activa."
echo "=================================================================="
