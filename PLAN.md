# Master Roadmap & Registro de Remediación — BenFlex E-Commerce

## Arquitectura Base
- **Stack:** Next.js 16.2.7 (App Router) + React 19.2.4 + PostgreSQL Nativo (Ubuntu VPS DonWeb `benflex_db`) con fallback híbrido resiliente en `src/data/local_storage.json`.
- **Reglas Comerciales Activas:**
  - Marca estandarizada: **BenFlex**.
  - Envíos 100% bonificados exclusivamente dentro de **San Juan (`CP 5400–5499`)** y retiro sin cargo en **Showroom Villa Krause** (`Castaño Oeste y Conector Sur`). Envíos al resto del país: **A cotizar**.
  - Canales oficiales: WhatsApp `+54 9 264 443-6961` (`5492644436961`) e Instagram `@benflex_fabrica`.

## Squad Status — Auditoría QA Funcional & Seguridad (OWASP / ASVS / PCI-DSS)

| Fase | Módulo / Objetivo | Estado |
| :--- | :--- | :---: |
| Fase 1 | Autenticación server-side (`HttpOnly` + HMAC-SHA256), cierre de rutas admin (`401`), eliminación de secretos en cliente y activación de RLS en Supabase | ✅ Completado |
| Fase 2 | Remoción de inputs PAN/CVV (PCI-DSS SAQ-A), recálculo server-side de precios/descuentos, bloqueo atómico de stock (`FOR UPDATE`), idempotencia y protección anti-IDOR con `accessToken` | ✅ Completado |
| Fase 3 | Validación estricta de esquemas, Rate Limiting por IP, cabeceras HTTP de seguridad, persistencia de consultas `/contacto` y restauración de stock en `CANCELADO` | ✅ Completado |
| Fase 4 | Robustecimiento del Panel ATM de Productos, Acceso Dual (Dueño/Desarrollador), Persistencia Híbrida Resiliente y Cuadro Analítico de Ventas con Exportación CSV | ✅ Completado |
| Fase 5 | Infraestructura de Despliegue en Producción para VPS Ubuntu (DonWeb) bajo dominio `www.blenflex.online` (PM2, Nginx Reverse Proxy, Certbot SSL y Automatización Git) | ✅ Completado |
| Fase 6 | Adecuación a Legislaciones Argentinas (ARCA QR 960/D, Titular Gabriel Perez Zapata, Arrepentimiento en Carrito, Garantía Legal, Términos y Privacidad Ley 25.326) | ✅ Completado |
| Fase 7 | Base de Datos PostgreSQL Nativa en VPS DonWeb (`benflex_db`), script de instalación desatendida y migración automática | ✅ Completado |
| Fase 8 | Soporte Multi-Imagen en Productos (Galería interactiva en PDP, selector múltiple con compresión en `/admin`, compatibilidad PostgreSQL y fallback local) | 🔄 En Progreso |

## [AUTO-HEALED] Registro de Remediación Integral
- **[AUTO-HEALED] MULTI-IMG-01 (Soporte Multi-Imagen y Galería de Productos):**
  1. **Tipado & Modelo (`src/types/index.ts`):** Incorporación del campo `images?: string[]` en la interfaz `Product`, preservando `image: string` como portada primaria para retrocompatibilidad total con el carrito, checkout y confirmación.
  2. **Persistencia Relacional & Local (`src/lib/db.ts` & `src/lib/localStore.ts`):** Adición automática de la columna `images JSONB` en PostgreSQL mediante `ALTER TABLE public.benflex_products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;` y normalización automática en el almacén local.
  3. **Validación Segura (`src/lib/validation.ts`):** Sanitización individual de URLs y DataURLs con compresión, límite de hasta 8 imágenes por producto y validación de cobertura.
  4. **Panel de Control `/admin` (`src/app/admin/page.tsx`):** Selector de subida múltiple con compresión concurrente en Canvas (< 200KB por foto), selector de portada ("Hacer Principal"), borrado unitario y soporte mixto de URLs y archivos.
  5. **Ficha de Producto PDP (`src/app/product/[id]/page.tsx`):** Galería interactiva con visor principal ampliado, carrusel/tira de miniaturas interactivas y navegación fluida entre fotos.
