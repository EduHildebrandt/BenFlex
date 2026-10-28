import { Pool } from 'pg';
import { BENFLEX_PRODUCTS } from '../data/products';
import type { Product, Order } from '@/types';

const DEFAULT_DB_URL = process.env.DATABASE_URL || '';

let pool: Pool | null = null;
let isInitialized = false;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: DEFAULT_DB_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      connectionTimeoutMillis: 8000,
    });
  }
  return pool;
}

export async function ensureDatabaseInitialized(): Promise<void> {
  if (isInitialized) return;
  const db = getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS public.benflex_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
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
      fabrics JSONB DEFAULT '[]'::jsonb,
      image TEXT NOT NULL,
      badge TEXT,
      stock INTEGER NOT NULL DEFAULT 10,
      weight_support TEXT,
      warranty TEXT,
      rating NUMERIC NOT NULL DEFAULT 5.0,
      reviews_count INTEGER NOT NULL DEFAULT 50,
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
      delivery_method TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      address TEXT,
      city TEXT NOT NULL,
      province TEXT NOT NULL,
      notes TEXT,
      payment_method TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      subtotal NUMERIC NOT NULL,
      shipping_original NUMERIC NOT NULL,
      shipping_discount NUMERIC NOT NULL,
      shipping_final NUMERIC NOT NULL DEFAULT 0,
      transfer_discount NUMERIC NOT NULL DEFAULT 0,
      total NUMERIC NOT NULL,
      installments INTEGER,
      status TEXT NOT NULL DEFAULT 'PENDIENTE_COMPROBANTE',
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
  `);

  // Seed products if empty or upsert missing products
  for (const p of BENFLEX_PRODUCTS) {
    await db.query(
      `
      INSERT INTO public.benflex_products (
        id, name, slug, description, short_description, category, category_label,
        technology, technology_label, measure, firmness, base_price,
        transfer_discount_percent, variations, features, fabrics, image,
        badge, stock, weight_support, warranty, rating, reviews_count
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
      ON CONFLICT (id) DO NOTHING;
      `,
      [
        p.id,
        p.name,
        p.slug,
        p.description,
        p.shortDescription,
        p.category,
        p.categoryLabel,
        p.technology,
        p.technologyLabel,
        p.measure,
        p.firmness || null,
        p.basePrice,
        p.transferDiscountPercent,
        JSON.stringify(p.variations),
        JSON.stringify(p.features),
        JSON.stringify(p.fabrics || []),
        p.image,
        p.badge || null,
        p.stock,
        p.weightSupport || null,
        p.warranty || null,
        p.rating,
        p.reviewsCount,
      ]
    );
  }

  isInitialized = true;
}

export async function getDbProducts(): Promise<Product[]> {
  await ensureDatabaseInitialized();
  const db = getPool();
  const res = await db.query(
    `SELECT * FROM public.benflex_products WHERE is_active = true ORDER BY created_at ASC`
  );

  return res.rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    categoryLabel: row.category_label,
    technology: row.technology,
    technologyLabel: row.technology_label,
    measure: row.measure,
    firmness: row.firmness || undefined,
    basePrice: Number(row.base_price),
    transferDiscountPercent: Number(row.transfer_discount_percent),
    variations: row.variations || [],
    features: row.features || [],
    fabrics: row.fabrics && row.fabrics.length > 0 ? row.fabrics : undefined,
    image: row.image,
    badge: row.badge || undefined,
    stock: Number(row.stock),
    weightSupport: row.weight_support || undefined,
    warranty: row.warranty || undefined,
    rating: Number(row.rating),
    reviewsCount: Number(row.reviews_count),
  }));
}

export async function getDbOrders(): Promise<Order[]> {
  await ensureDatabaseInitialized();
  const db = getPool();
  const res = await db.query(
    `SELECT * FROM public.benflex_orders ORDER BY created_at DESC LIMIT 100`
  );

  return res.rows.map((row) => ({
    id: row.id,
    date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    deliveryMethod: row.delivery_method,
    postalCode: row.postal_code,
    address: row.address || undefined,
    city: row.city,
    province: row.province,
    notes: row.notes || undefined,
    paymentMethod: row.payment_method,
    items: row.items || [],
    subtotal: Number(row.subtotal),
    shippingOriginal: Number(row.shipping_original),
    shippingDiscount: Number(row.shipping_discount),
    shippingFinal: Number(row.shipping_final),
    transferDiscount: Number(row.transfer_discount),
    total: Number(row.total),
    installments: row.installments ? Number(row.installments) : undefined,
    status: row.status,
  }));
}

export async function createDbOrder(order: Order): Promise<Order> {
  await ensureDatabaseInitialized();
  const db = getPool();

  await db.query(
    `
    INSERT INTO public.benflex_orders (
      id, date, customer_name, customer_email, customer_phone,
      delivery_method, postal_code, address, city, province, notes,
      payment_method, items, subtotal, shipping_original, shipping_discount,
      shipping_final, transfer_discount, total, installments, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status;
    `,
    [
      order.id,
      order.date,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      order.deliveryMethod,
      order.postalCode,
      order.address || null,
      order.city,
      order.province,
      order.notes || null,
      order.paymentMethod,
      JSON.stringify(order.items),
      order.subtotal,
      order.shippingOriginal,
      order.shippingDiscount,
      order.shippingFinal,
      order.transferDiscount,
      order.total,
      order.installments || null,
      order.status,
    ]
  );

  return order;
}

export async function updateDbOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<void> {
  await ensureDatabaseInitialized();
  const db = getPool();
  await db.query(`UPDATE public.benflex_orders SET status = $1 WHERE id = $2`, [
    status,
    orderId,
  ]);
}

export async function upsertDbProduct(p: Product): Promise<Product> {
  await ensureDatabaseInitialized();
  const db = getPool();
  await db.query(
    `
    INSERT INTO public.benflex_products (
      id, name, slug, description, short_description, category, category_label,
      technology, technology_label, measure, firmness, base_price,
      transfer_discount_percent, variations, features, fabrics, image,
      badge, stock, weight_support, warranty, rating, reviews_count, is_active, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, true, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      slug = EXCLUDED.slug,
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
      badge = EXCLUDED.badge,
      stock = EXCLUDED.stock,
      weight_support = EXCLUDED.weight_support,
      warranty = EXCLUDED.warranty,
      rating = EXCLUDED.rating,
      reviews_count = EXCLUDED.reviews_count,
      is_active = true,
      updated_at = NOW();
    `,
    [
      p.id,
      p.name,
      p.slug || p.id,
      p.description,
      p.shortDescription || p.description.slice(0, 110),
      p.category,
      p.categoryLabel,
      p.technology,
      p.technologyLabel,
      p.measure,
      p.firmness || null,
      p.basePrice,
      p.transferDiscountPercent ?? 15,
      JSON.stringify(p.variations || []),
      JSON.stringify(p.features || []),
      JSON.stringify(p.fabrics || []),
      p.image,
      p.badge || null,
      p.stock ?? 10,
      p.weightSupport || null,
      p.warranty || null,
      p.rating ?? 5.0,
      p.reviewsCount ?? 50,
    ]
  );
  return p;
}

export async function deleteDbProduct(id: string): Promise<void> {
  await ensureDatabaseInitialized();
  const db = getPool();
  await db.query(
    `UPDATE public.benflex_products SET is_active = false, updated_at = NOW() WHERE id = $1`,
    [id]
  );
}
