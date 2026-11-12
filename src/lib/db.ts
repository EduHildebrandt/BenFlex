import crypto from 'crypto';
import { Pool, PoolClient } from 'pg';
import {
  Product,
  Category,
  Order,
  OrderStatus,
  CartItem,
  CreateOrderPayload,
  CustomerInquiry,
  BENFLEX_CONTACT,
} from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';
import { safeCompareStrings } from '@/lib/auth';
import {
  DEFAULT_CATEGORIES,
  getLocalCategories,
  upsertLocalCategory,
  deleteLocalCategory,
  getLocalProducts,
  upsertLocalProduct,
  deleteLocalProduct,
  getLocalOrders,
  getLocalOrderByIdAndToken,
  createValidatedLocalOrder,
  updateLocalOrderStatus,
  lookupLocalOrder,
  revokeLocalOrder,
  getLocalInquiries,
  createLocalInquiry,
} from '@/lib/localStore';

const globalForPg = globalThis as unknown as {
  pgPool: Pool | undefined;
  schemaInitialized: boolean | undefined;
};

export class OrderBusinessError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'OrderBusinessError';
    this.statusCode = statusCode;
  }
}

export function isSanJuanPostalCodeServer(cpInput?: string): boolean {
  if (!cpInput) return false;
  const num = parseInt(cpInput.replace(/\D/g, ''), 10);
  return !Number.isNaN(num) && num >= 5400 && num <= 5499;
}

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(
    url &&
      url.trim().length > 0 &&
      !url.includes('[PROJECT-REF]') &&
      !url.includes('change-this')
  );
}

export function getPool(): Pool {
  if (!globalForPg.pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1') ||
      connectionString.includes('sslmode=disable');

    globalForPg.pgPool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return globalForPg.pgPool;
}

export async function ensureSchema(): Promise<void> {
  if (globalForPg.schemaInitialized) return;

  const pool = getPool();
  await pool.query(`
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

    ALTER TABLE public.benflex_orders
      ADD COLUMN IF NOT EXISTS customer_dni TEXT,
      ADD COLUMN IF NOT EXISTS access_token TEXT,
      ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
      ADD COLUMN IF NOT EXISTS stock_deducted BOOLEAN NOT NULL DEFAULT true;

    ALTER TABLE public.benflex_products
      ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_benflex_orders_idempotency
      ON public.benflex_orders(idempotency_key)
      WHERE idempotency_key IS NOT NULL;

    CREATE TABLE IF NOT EXISTS public.benflex_inquiries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.benflex_categories (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Habilitar Row Level Security (RLS) en todas las tablas públicas (PostgREST Hardening)
    ALTER TABLE public.benflex_categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.benflex_products ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.benflex_orders ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.benflex_inquiries ENABLE ROW LEVEL SECURITY;

    DO $
    BEGIN
      -- Si existe el rol anon (Supabase/PostgREST), creamos la política de lectura pública
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = 'public'
            AND tablename = 'benflex_products'
            AND policyname = 'benflex_products_public_select'
        ) THEN
          CREATE POLICY benflex_products_public_select
            ON public.benflex_products
            FOR SELECT
            TO anon
            USING (is_active = true);
        END IF;
      END IF;
    END
    $;
  `);

  // 1. Seed inicial de categorías desde almacenamiento local si la tabla está vacía
  const catCountRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM public.benflex_categories');
  if ((catCountRes.rows[0]?.cnt ?? 0) === 0) {
    const catsToSeed = getLocalCategories();
    for (const cat of catsToSeed) {
      await pool.query(
        `INSERT INTO public.benflex_categories (id, label, description, is_active, updated_at)
         VALUES ($1, $2, $3, true, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.label, cat.description || null]
      );
    }
  }

  // 2. Seed inicial de productos desde almacenamiento local si la tabla está vacía
  const prodCountRes = await pool.query(
    'SELECT COUNT(*)::int AS cnt FROM public.benflex_products WHERE is_active = true'
  );
  if ((prodCountRes.rows[0]?.cnt ?? 0) === 0) {
    const prodsToSeed = getLocalProducts();
    for (const p of prodsToSeed) {
      await upsertDbProductInternal(pool, p);
    }
  }

  globalForPg.schemaInitialized = true;
}

export async function getDbCategories(): Promise<Category[]> {
  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query(
        'SELECT id, label, description FROM public.benflex_categories WHERE is_active = true ORDER BY created_at ASC'
      );
      const map = new Map<string, Category>();
      for (const row of res.rows) {
        map.set(row.id, {
          id: row.id,
          label: row.label,
          description: row.description || undefined,
        });
      }
      // Incluir categorías presentes en productos activos por si alguna se creó directo desde producto
      const prodCats = await pool.query(
        'SELECT DISTINCT category, category_label FROM public.benflex_products WHERE is_active = true'
      );
      for (const r of prodCats.rows) {
        if (r.category && !map.has(r.category)) {
          map.set(r.category, { id: r.category, label: r.category_label || r.category });
        }
      }
      return Array.from(map.values());
    } catch (err) {
      console.warn('[DB Categories] Error consultando Supabase, usando almacenamiento local:', err);
    }
  }
  return getLocalCategories();
}

export async function upsertDbCategory(cat: Category): Promise<Category> {
  const localSaved = upsertLocalCategory(cat);

  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      await pool.query(
        `INSERT INTO public.benflex_categories (id, label, description, is_active, updated_at)
         VALUES ($1, $2, $3, true, NOW())
         ON CONFLICT (id) DO UPDATE SET
           label = EXCLUDED.label,
           description = EXCLUDED.description,
           is_active = true,
           updated_at = NOW()`,
        [cat.id, cat.label, cat.description || null]
      );
      // Actualizar en cascada todos los productos de esta categoría
      await pool.query(
        'UPDATE public.benflex_products SET category_label = $2, updated_at = NOW() WHERE category = $1',
        [cat.id, cat.label]
      );
    } catch (err) {
      console.warn('[DB Categories] Error guardando en Supabase, persistido en local store:', err);
    }
  }
  return localSaved;
}

export async function deleteDbCategory(id: string, deleteProducts: boolean = false): Promise<void> {
  deleteLocalCategory(id, deleteProducts);

  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      await pool.query(
        'UPDATE public.benflex_categories SET is_active = false, updated_at = NOW() WHERE id = $1',
        [id]
      );
      if (deleteProducts) {
        await pool.query(
          'UPDATE public.benflex_products SET is_active = false, updated_at = NOW() WHERE category = $1',
          [id]
        );
      }
    } catch (err) {
      console.warn('[DB Categories] Error eliminando en Supabase, eliminado localmente:', err);
    }
  }
}

export function mapRowToProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description,
    category: row.category,
    categoryLabel: row.category_label,
    technology: row.technology,
    technologyLabel: row.technology_label,
    measure: row.measure,
    firmness: row.firmness || undefined,
    basePrice: Number(row.base_price),
    transferDiscountPercent: Number(row.transfer_discount_percent ?? 15),
    variations: Array.isArray(row.variations) ? row.variations : [],
    features: Array.isArray(row.features) ? row.features : [],
    fabrics: Array.isArray(row.fabrics) ? row.fabrics : undefined,
    image: row.image,
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : (row.image ? [row.image] : []),
    badge: row.badge || undefined,
    stock: Number(row.stock),
    weightSupport: row.weight_support || undefined,
    warranty: row.warranty || undefined,
    rating: Number(row.rating),
    reviewsCount: Number(row.reviews_count),
  };
}

export function mapRowToOrder(row: any): Order {
  const rawDate = row.date || row.created_at;
  return {
    id: row.id,
    date: rawDate ? new Date(rawDate).toISOString() : new Date().toISOString(),
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerDni: row.customer_dni || undefined,
    deliveryMethod: row.delivery_method,
    postalCode: row.postal_code,
    address: row.address || undefined,
    city: row.city,
    province: row.province,
    notes: row.notes || undefined,
    paymentMethod: row.payment_method,
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    shippingOriginal: Number(row.shipping_original),
    shippingDiscount: Number(row.shipping_discount),
    shippingFinal: Number(row.shipping_final),
    transferDiscount: Number(row.transfer_discount),
    total: Number(row.total),
    installments: row.installments ? Number(row.installments) : undefined,
    status: row.status as OrderStatus,
  };
}

export async function getDbProducts(): Promise<Product[]> {
  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query(
        'SELECT * FROM public.benflex_products WHERE is_active = true ORDER BY created_at ASC'
      );
      return res.rows.map(mapRowToProduct);
    } catch (err) {
      console.warn('[DB Products] Error consultando Supabase, usando almacenamiento local:', err);
    }
  }
  return getLocalProducts();
}

async function upsertDbProductInternal(db: Pool | PoolClient, p: Product): Promise<Product> {
  // Asegurar que la categoría exista en benflex_categories
  if (p.category) {
    await db.query(
      `INSERT INTO public.benflex_categories (id, label, is_active, updated_at)
       VALUES ($1, $2, true, NOW())
       ON CONFLICT (id) DO UPDATE SET
         label = EXCLUDED.label,
         is_active = true,
         updated_at = NOW()`,
      [p.category, p.categoryLabel || p.category]
    );
  }
  const res = await db.query(
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
    RETURNING *;
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
      p.transferDiscountPercent ?? 15,
      JSON.stringify(p.variations || []),
      JSON.stringify(p.features || []),
      p.fabrics ? JSON.stringify(p.fabrics) : null,
      p.image,
      JSON.stringify(p.images && p.images.length > 0 ? p.images : [p.image]),
      p.badge || null,
      p.stock ?? 10,
      p.weightSupport || null,
      p.warranty || null,
      p.rating ?? 4.9,
      p.reviewsCount ?? 25,
    ]
  );

  return mapRowToProduct(res.rows[0]);
}

export async function upsertDbProduct(p: Product): Promise<Product> {
  // Sincronizar siempre con almacenamiento local
  const localSaved = upsertLocalProduct(p);

  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      return await upsertDbProductInternal(pool, p);
    } catch (err) {
      console.warn('[DB Products] Error guardando en Supabase, persistido en local store:', err);
      return localSaved;
    }
  }

  return localSaved;
}

export async function deleteDbProduct(id: string): Promise<void> {
  deleteLocalProduct(id);

  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      await pool.query(
        'UPDATE public.benflex_products SET is_active = false, updated_at = NOW() WHERE id = $1',
        [id]
      );
    } catch (err) {
      console.warn('[DB Products] Error eliminando en Supabase, eliminado localmente:', err);
    }
  }
}

export async function createValidatedDbOrder(
  payload: CreateOrderPayload
): Promise<{ order: Order; accessToken: string; deduplicated: boolean }> {
  if (!isDbConfigured()) {
    return createValidatedLocalOrder(payload);
  }

  let client: PoolClient | null = null;
  try {
    await ensureSchema();
    const pool = getPool();
    client = await pool.connect();
    await client.query('BEGIN');

    // 1. Verificar clave de idempotencia para evitar cobros / órdenes duplicadas
    const existingRes = await client.query(
      'SELECT * FROM public.benflex_orders WHERE idempotency_key = $1 LIMIT 1',
      [payload.idempotencyKey]
    );
    if (existingRes.rows.length > 0) {
      await client.query('COMMIT');
      const existingRow = existingRes.rows[0];
      return {
        order: mapRowToOrder(existingRow),
        accessToken: existingRow.access_token || '',
        deduplicated: true,
      };
    }

    // 2. Agrupar cantidades solicitadas por productId y ordenar IDs para evitar deadlocks en FOR UPDATE
    const qtyByProduct = new Map<string, number>();
    for (const item of payload.items) {
      qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) || 0) + item.quantity);
    }
    const sortedProductIds = Array.from(qtyByProduct.keys()).sort();

    const lockedProducts = new Map<string, Product>();
    for (const pid of sortedProductIds) {
      const pRes = await client.query(
        'SELECT * FROM public.benflex_products WHERE id = $1 AND is_active = true FOR UPDATE',
        [pid]
      );
      if (pRes.rows.length === 0) {
        throw new OrderBusinessError(
          `El producto "${pid}" ya no se encuentra disponible en el catálogo.`,
          404
        );
      }
      const prod = mapRowToProduct(pRes.rows[0]);
      const requestedQty = qtyByProduct.get(pid) || 0;
      if (prod.stock < requestedQty) {
        throw new OrderBusinessError(
          prod.stock <= 0
            ? `Lo sentimos, "${prod.name}" acaba de agotarse.`
            : `Stock insuficiente para "${prod.name}" (disponibles: ${prod.stock}, solicitados: ${requestedQty}).`,
          409
        );
      }
      lockedProducts.set(pid, prod);
    }

    // 3. Descontar stock atómicamente dentro de la misma transacción
    for (const pid of sortedProductIds) {
      const requestedQty = qtyByProduct.get(pid) || 0;
      await client.query(
        'UPDATE public.benflex_products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
        [requestedQty, pid]
      );
      const locked = lockedProducts.get(pid)!;
      locked.stock = locked.stock - requestedQty;
    }

    // 4. Recalcular precios, variaciones y descuentos 100% desde la base de datos (Zero Client Trust)
    const validatedItems: CartItem[] = [];
    let subtotal = 0;
    let totalTransferDiscount = 0;

    for (const reqItem of payload.items) {
      const prod = lockedProducts.get(reqItem.productId)!;
      let matchedVar = prod.variations.find((v) => v.name === reqItem.variationName);

      if (!matchedVar) {
        if (prod.variations.length === 0 && reqItem.variationName === 'Estándar') {
          matchedVar = { name: 'Estándar', priceModifier: 0 };
        } else {
          throw new OrderBusinessError(
            `La medida o variación "${reqItem.variationName}" no es válida para "${prod.name}".`,
            400
          );
        }
      }

      if (reqItem.fabric && prod.fabrics && prod.fabrics.length > 0) {
        if (!prod.fabrics.includes(reqItem.fabric)) {
          throw new OrderBusinessError(
            `La tela seleccionada "${reqItem.fabric}" no está disponible para "${prod.name}".`,
            400
          );
        }
      }

      const unitPrice = Math.round(prod.basePrice + Number(matchedVar.priceModifier || 0));
      const lineSubtotal = unitPrice * reqItem.quantity;

      const discountPct = Number(prod.transferDiscountPercent ?? 15);
      const unitTransferPrice = Math.round(unitPrice * (1 - discountPct / 100));
      const lineTransferDiscount = (unitPrice - unitTransferPrice) * reqItem.quantity;

      subtotal += lineSubtotal;
      totalTransferDiscount += lineTransferDiscount;

      validatedItems.push({
        id: `${prod.id}__${matchedVar.name}${reqItem.fabric ? `__${reqItem.fabric}` : ''}`,
        productId: prod.id,
        product: prod,
        variationName: matchedVar.name,
        fabric: reqItem.fabric || (prod.fabrics?.[0] ?? undefined),
        quantity: reqItem.quantity,
        unitPrice,
        subtotal: lineSubtotal,
      });
    }

    // 5. Reglas de envío geográficas (Bonificado en San Juan CP 5400-5499 o retiro en Showroom Villa Krause)
    const finalPostalCode =
      payload.deliveryMethod === 'showroom' ? BENFLEX_CONTACT.postalCode : payload.postalCode;
    const finalCity =
      payload.deliveryMethod === 'showroom' ? BENFLEX_CONTACT.city : payload.city;
    const finalProvince =
      payload.deliveryMethod === 'showroom' ? BENFLEX_CONTACT.province : payload.province;
    const finalAddress =
      payload.deliveryMethod === 'showroom'
        ? `Showroom BenFlex - ${BENFLEX_CONTACT.address}`
        : payload.address;

    const isFreeShipping =
      payload.deliveryMethod === 'showroom' || isSanJuanPostalCodeServer(finalPostalCode);
    const shippingOriginal = isFreeShipping ? Math.round(subtotal * 0.1) : 0;
    const shippingDiscount = isFreeShipping ? shippingOriginal : 0;
    const shippingFinal = 0;

    const transferDiscount =
      payload.paymentMethod === 'transferencia' ? totalTransferDiscount : 0;
    const total = Math.max(0, subtotal - transferDiscount);

    // 6. Identificador no secuencial + Token de acceso criptográfico anti-IDOR
    const orderId = `BF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const accessToken = crypto.randomBytes(16).toString('hex');
    const initialStatus: OrderStatus =
      payload.paymentMethod === 'transferencia' ? 'PENDIENTE_COMPROBANTE' : 'PENDIENTE_PAGO';

    const insertRes = await client.query(
      `
      INSERT INTO public.benflex_orders (
        id, date, customer_name, customer_email, customer_phone, customer_dni,
        delivery_method, postal_code, address, city, province, notes,
        payment_method, items, subtotal, shipping_original, shipping_discount,
        shipping_final, transfer_discount, total, installments, status,
        access_token, idempotency_key, stock_deducted
      ) VALUES (
        $1, NOW(), $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13::jsonb, $14, $15, $16,
        $17, $18, $19, $20, $21,
        $22, $23, true
      )
      RETURNING *;
      `,
      [
        orderId,
        payload.customerName,
        payload.customerEmail,
        payload.customerPhone,
        payload.customerDni || null,
        payload.deliveryMethod,
        finalPostalCode,
        finalAddress || null,
        finalCity,
        finalProvince,
        payload.notes || null,
        payload.paymentMethod,
        JSON.stringify(validatedItems),
        subtotal,
        shippingOriginal,
        shippingDiscount,
        shippingFinal,
        transferDiscount,
        total,
        payload.paymentMethod === 'credito' ? payload.installments || 1 : null,
        initialStatus,
        accessToken,
        payload.idempotencyKey,
      ]
    );

    await client.query('COMMIT');
    const confirmedOrder = mapRowToOrder(insertRes.rows[0]);

    // También reflejar en almacenamiento local
    try {
      createValidatedLocalOrder(payload);
    } catch {}

    return {
      order: confirmedOrder,
      accessToken,
      deduplicated: false,
    };
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    if (err instanceof OrderBusinessError) {
      throw err;
    }
    console.warn('[DB Orders] Error procesando en Supabase, procesando en almacenamiento local:', err);
    return createValidatedLocalOrder(payload);
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function getDbOrders(): Promise<Order[]> {
  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query('SELECT * FROM public.benflex_orders ORDER BY date DESC');
      if (res.rows.length > 0) {
        return res.rows.map(mapRowToOrder);
      }
    } catch (err) {
      console.warn('[DB Orders] Error consultando Supabase, leyendo pedidos locales:', err);
    }
  }
  return getLocalOrders();
}

export async function getDbOrderByIdAndToken(
  orderId: string,
  token?: string | null,
  isAdmin: boolean = false
): Promise<Order | null> {
  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query('SELECT * FROM public.benflex_orders WHERE id = $1 LIMIT 1', [
        orderId,
      ]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        if (isAdmin) {
          return mapRowToOrder(row);
        }
        if (token && row.access_token && safeCompareStrings(token, row.access_token)) {
          return mapRowToOrder(row);
        }
        return null;
      }
    } catch (err) {
      console.warn('[DB Order ID] Error consultando Supabase:', err);
    }
  }
  return getLocalOrderByIdAndToken(orderId, token, isAdmin);
}

export async function updateDbOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<Order> {
  // Siempre actualizar copia local
  try {
    updateLocalOrderStatus(orderId, newStatus);
  } catch {}

  if (isDbConfigured()) {
    let client: PoolClient | null = null;
    try {
      await ensureSchema();
      const pool = getPool();
      client = await pool.connect();
      await client.query('BEGIN');

      const orderRes = await client.query(
        'SELECT * FROM public.benflex_orders WHERE id = $1 FOR UPDATE',
        [orderId]
      );
      if (orderRes.rows.length > 0) {
        const row = orderRes.rows[0];
        const items: CartItem[] = Array.isArray(row.items) ? row.items : [];
        const wasDeducted = Boolean(row.stock_deducted);
        let nextStockDeducted = wasDeducted;

        // Agrupar items por productId en orden determinístico
        const qtyByProduct = new Map<string, number>();
        for (const item of items) {
          if (item?.productId && Number(item?.quantity) > 0) {
            qtyByProduct.set(
              item.productId,
              (qtyByProduct.get(item.productId) || 0) + Number(item.quantity)
            );
          }
        }
        const sortedProductIds = Array.from(qtyByProduct.keys()).sort();

        if (newStatus === 'CANCELADO' && wasDeducted) {
          // Devolver stock al catálogo al cancelar un pedido activo
          for (const pid of sortedProductIds) {
            const qty = qtyByProduct.get(pid) || 0;
            await client.query(
              'UPDATE public.benflex_products SET stock = stock + $1, updated_at = NOW() WHERE id = $2',
              [qty, pid]
            );
          }
          nextStockDeducted = false;
        } else if (newStatus !== 'CANCELADO' && !wasDeducted) {
          // Si se reactiva un pedido previamente cancelado, volver a verificar y reservar stock
          for (const pid of sortedProductIds) {
            const qty = qtyByProduct.get(pid) || 0;
            const pRes = await client.query(
              'SELECT name, stock FROM public.benflex_products WHERE id = $1 FOR UPDATE',
              [pid]
            );
            if (pRes.rows.length === 0 || Number(pRes.rows[0].stock) < qty) {
              throw new OrderBusinessError(
                `No hay stock suficiente para reactivar el pedido (${pRes.rows[0]?.name || pid}).`,
                409
              );
            }
            await client.query(
              'UPDATE public.benflex_products SET stock = stock - $1, updated_at = NOW() WHERE id = $2',
              [qty, pid]
            );
          }
          nextStockDeducted = true;
        }

        const updatedRes = await client.query(
          `
          UPDATE public.benflex_orders
          SET status = $2, stock_deducted = $3
          WHERE id = $1
          RETURNING *;
          `,
          [orderId, newStatus, nextStockDeducted]
        );

        await client.query('COMMIT');
        return mapRowToOrder(updatedRes.rows[0]);
      }
    } catch (err) {
      if (client) {
        try {
          await client.query('ROLLBACK');
        } catch {}
      }
      console.warn('[DB Orders] Error actualizando estado en Supabase:', err);
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  const local = getLocalOrderByIdAndToken(orderId, null, true);
  if (local) return local;
  throw new Error(`Pedido #${orderId} no encontrado`);
}

export async function createDbInquiry(data: {
  name: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<CustomerInquiry> {
  const localInq = createLocalInquiry(data.name, data.phone, data.subject, data.message);

  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query(
        `
        INSERT INTO public.benflex_inquiries (name, phone, subject, message)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `,
        [data.name, data.phone, data.subject, data.message]
      );
      const row = res.rows[0];
      return {
        id: Number(row.id),
        name: row.name,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[DB Inquiries] Error guardando consulta en Supabase:', err);
    }
  }

  return localInq;
}

export async function getDbInquiries(): Promise<CustomerInquiry[]> {
  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query(
        'SELECT * FROM public.benflex_inquiries ORDER BY created_at DESC LIMIT 200'
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: Number(row.id),
          name: row.name,
          phone: row.phone,
          subject: row.subject,
          message: row.message,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('[DB Inquiries] Error consultando Supabase:', err);
    }
  }
  return getLocalInquiries();
}

// ---------------------------------------------------------------------------
// OPERACIONES DE ARREPENTIMIENTO Y SEGUIMIENTO (RES. 424/2020)
// ---------------------------------------------------------------------------

function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export async function lookupDbOrder(
  orderId: string,
  contact: string
): Promise<{ order: Order; daysRemaining: number; canRevoke: boolean } | null> {
  const cleanId = orderId.trim().toUpperCase().replace(/^#/, '');
  const cleanContact = contact.trim().toLowerCase();
  const phoneDigits = normalizePhoneDigits(cleanContact);

  if (isDbConfigured()) {
    try {
      await ensureSchema();
      const pool = getPool();
      const res = await pool.query(
        'SELECT * FROM public.benflex_orders WHERE UPPER(id) = $1 LIMIT 1',
        [cleanId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const emailMatch = (row.customer_email || '').toLowerCase().trim() === cleanContact;
        const foundPhoneDigits = normalizePhoneDigits(row.customer_phone || '');
        const phoneMatch =
          phoneDigits.length >= 6 &&
          (foundPhoneDigits.endsWith(phoneDigits) || phoneDigits.endsWith(foundPhoneDigits));
        const dniMatch =
          row.customer_dni &&
          phoneDigits.length >= 6 &&
          row.customer_dni.replace(/\D/g, '') === phoneDigits;

        if (emailMatch || phoneMatch || dniMatch) {
          const mapped = mapRowToOrder(row);
          const orderTime = new Date(mapped.date).getTime();
          const now = Date.now();
          const diffDays = Math.floor((now - orderTime) / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.max(0, 10 - diffDays);
          const canRevoke = mapped.status !== 'CANCELADO';
          return { order: mapped, daysRemaining, canRevoke };
        }
        return null;
      }
    } catch (err) {
      console.warn('[DB Lookup Order] Error consultando Supabase, probando en local:', err);
    }
  }

  return lookupLocalOrder(orderId, contact);
}

export async function revokeDbOrder(
  orderId: string,
  contact: string,
  reason?: string
): Promise<{ success: boolean; revocationCode: string; order: Order; error?: string }> {
  const lookup = await lookupDbOrder(orderId, contact);
  if (!lookup) {
    return {
      success: false,
      revocationCode: '',
      order: null as any,
      error: 'No se encontró ningún pedido con el número y dato de contacto ingresados.',
    };
  }

  if (lookup.order.status === 'CANCELADO') {
    return {
      success: false,
      revocationCode: '',
      order: lookup.order,
      error: `El pedido #${lookup.order.id} ya se encuentra cancelado.`,
    };
  }

  // Cancelar pedido y restituir stock automáticamente
  const updatedOrder = await updateDbOrderStatus(lookup.order.id, 'CANCELADO');
  const revocationCode = `REV-${updatedOrder.id}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  // Registrar notificación en consultas
  await createDbInquiry({
    name: `ARREPENTIMIENTO - ${updatedOrder.customerName}`,
    phone: updatedOrder.customerPhone,
    subject: `Trámite de Revocación ${revocationCode}`,
    message: `El cliente ejerció el Derecho de Arrepentimiento (Res. 424/2020 - Art. 34 Ley 24.240) sobre el pedido #${updatedOrder.id}.\nMotivo: ${
      reason?.trim() || 'Sin expresión de causa (facultad legal dentro de los 10 días)'
    }.\nTotal a reintegrar: $${updatedOrder.total.toLocaleString('es-AR')}.\nContacto: ${
      updatedOrder.customerEmail
    } / ${updatedOrder.customerPhone}.`,
  });

  return {
    success: true,
    revocationCode,
    order: updatedOrder,
  };
}
