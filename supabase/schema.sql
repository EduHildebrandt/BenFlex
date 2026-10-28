-- =========================================================================
-- ESQUEMA OFICIAL SUPABASE / POSTGRESQL: BENFLEX E-COMMERCE SAN JUAN
-- Proyecto: mmzauqmrrjmytippbuqf.supabase.co
-- =========================================================================

-- 1. Tabla de Catálogo de Productos (Colchones, Sommiers, Sillones, Almohadas, Combos)
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

-- 2. Tabla de Pedidos Online (One-Step Checkout, Flete Bonificado y Transferencia 15% OFF)
CREATE TABLE IF NOT EXISTS public.benflex_orders (
  id TEXT PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_method TEXT NOT NULL, -- 'showroom' | 'delivery'
  postal_code TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  notes TEXT,
  payment_method TEXT NOT NULL, -- 'transferencia' | 'credito' | 'debito' | 'mercadopago'
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL,
  shipping_original NUMERIC NOT NULL,
  shipping_discount NUMERIC NOT NULL,
  shipping_final NUMERIC NOT NULL DEFAULT 0,
  transfer_discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL,
  installments INTEGER,
  status TEXT NOT NULL DEFAULT 'PENDIENTE_COMPROBANTE', -- 'PENDIENTE_COMPROBANTE' | 'APROBADO' | 'EN_PREPARACION' | 'ENTREGADO'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Consultas del Showroom Villa Krause (/contacto)
CREATE TABLE IF NOT EXISTS public.benflex_inquiries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_benflex_products_category ON public.benflex_products (category);
CREATE INDEX IF NOT EXISTS idx_benflex_orders_status ON public.benflex_orders (status);
CREATE INDEX IF NOT EXISTS idx_benflex_orders_created_at ON public.benflex_orders (created_at DESC);

-- Políticas de Row Level Security (RLS) para acceso desde cliente y API
ALTER TABLE public.benflex_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benflex_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benflex_inquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'benflex_products' AND policyname = 'Public read access for products'
  ) THEN
    CREATE POLICY "Public read access for products" ON public.benflex_products FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'benflex_orders' AND policyname = 'Public insert and read orders'
  ) THEN
    CREATE POLICY "Public insert and read orders" ON public.benflex_orders FOR ALL USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'benflex_inquiries' AND policyname = 'Public insert inquiries'
  ) THEN
    CREATE POLICY "Public insert inquiries" ON public.benflex_inquiries FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
