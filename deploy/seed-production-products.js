#!/usr/bin/env node
/**
 * BenFlex E-Commerce — Script de carga directa de catálogo en PostgreSQL de producción
 * Uso en VPS:
 *   node /opt/benflex/deploy/seed-production-products.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('📦 Iniciando carga de productos de catálogo en PostgreSQL...');

  const dbUrl = process.env.DATABASE_URL || 'postgresql://benflex_user:BenFlexSanJuan2026Secure!@localhost:5432/benflex_db';
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: false
  });

  const storagePath = path.resolve(__dirname, '../src/data/local_storage.json');
  if (!fs.existsSync(storagePath)) {
    console.error('❌ No se encontró local_storage.json en:', storagePath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
  const products = data.products || [];
  console.log(`📋 Total de productos a cargar: ${products.length}`);

  for (const p of products) {
    if (p.category) {
      await pool.query(
        `INSERT INTO public.benflex_categories (id, label, is_active, updated_at)
         VALUES ($1, $2, true, NOW())
         ON CONFLICT (id) DO UPDATE SET
           label = EXCLUDED.label,
           is_active = true,
           updated_at = NOW()`,
        [p.category, p.categoryLabel || p.category]
      );
    }

    await pool.query(
      `
      INSERT INTO public.benflex_products (
        id, slug, name, description, short_description,
        category, category_label, technology, technology_label,
        measure, firmness, base_price, transfer_discount_percent,
        variations, features, fabrics, image, images, badge,
        stock, weight_support, warranty, rating, reviews_count, is_active, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14::jsonb, $15::jsonb, $16::jsonb, $17, $18::jsonb, $19,
        $20, $21, $22, $23, $24, true, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        short_description = EXCLUDED.short_description,
        category = EXCLUDED.category,
        category_label = EXCLUDED.category_label,
        technology = EXCLUDED.technology,
        technology_label = EXCLUDED.technology_label,
        measure = EXCLUDED.measure,
        firmness = EXCLUDED.firmness,
        base_price = EXCLUDED.base_price,
        transfer_discount_percent = EXCLUDED.transfer_discount_percent,
        variations = EXCLUDED.variations,
        features = EXCLUDED.features,
        fabrics = EXCLUDED.fabrics,
        image = EXCLUDED.image,
        images = EXCLUDED.images,
        badge = EXCLUDED.badge,
        stock = EXCLUDED.stock,
        weight_support = EXCLUDED.weight_support,
        warranty = EXCLUDED.warranty,
        rating = EXCLUDED.rating,
        reviews_count = EXCLUDED.reviews_count,
        is_active = true,
        updated_at = NOW()
      `,
      [
        p.id,
        p.slug || p.id,
        p.name,
        p.description,
        p.shortDescription,
        p.category,
        p.categoryLabel,
        p.technology,
        p.technologyLabel,
        p.measure,
        p.firmness || null,
        p.basePrice,
        p.transferDiscountPercent || 15,
        JSON.stringify(p.variations || []),
        JSON.stringify(p.features || []),
        p.fabrics ? JSON.stringify(p.fabrics) : null,
        p.image,
        JSON.stringify(p.images || [p.image]),
        p.badge || null,
        p.stock || 5,
        p.weightSupport || null,
        p.warranty || null,
        p.rating || 4.9,
        p.reviewsCount || 20
      ]
    );
    console.log(`  ✅ [${p.category}] ${p.name} ($${p.basePrice.toLocaleString('es-AR')})`);
  }

  await pool.end();
  console.log('🎉 Carga completa y exitosa en PostgreSQL.');
}

main().catch(err => {
  console.error('❌ Error en la carga de productos:', err);
  process.exit(1);
});
