# Master Roadmap & Registro de Remediación — BenFlex E-Commerce

## Arquitectura Base
- **Stack:** Next.js 16.2.7 (App Router) + React 19.2.4 + Supabase PostgreSQL (`pg` Pooler IPv4 + RLS).
- **Reglas Comerciales Activas:**
  - Marca estandarizada: **BenFlex**.
  - Envíos 100% bonificados exclusivamente dentro de **San Juan (`CP 5400–5499`)** y retiro sin cargo en **Showroom Villa Krause** (`Castaño Oeste y Conector Sur`). Envíos al resto del país: **A cotizar**.

## Squad Status — Auditoría QA Funcional & Seguridad (OWASP / ASVS / PCI-DSS)

| Fase | Módulo / Objetivo | Estado |
| :--- | :--- | :---: |
| Fase 1 | Autenticación server-side (`HttpOnly` + HMAC-SHA256), cierre de rutas admin (`401`), eliminación de secretos en cliente y activación de RLS en Supabase | ✅ Completado |
| Fase 2 | Remoción de inputs PAN/CVV (PCI-DSS SAQ-A), recálculo server-side de precios/descuentos, bloqueo atómico de stock (`FOR UPDATE`), idempotencia y protección anti-IDOR con `accessToken` | ✅ Completado |
| Fase 3 | Validación estricta de esquemas, Rate Limiting por IP, cabeceras HTTP de seguridad, persistencia de consultas `/contacto` y restauración de stock en `CANCELADO` | ✅ Completado |

## [AUTO-HEALED] Revisión de Remediación Integral
- **[AUTO-HEALED] SEC-01 & SEC-04:** Eliminadas credenciales hardcodeadas del bundle cliente en `/admin`. Implementado `src/lib/auth.ts` y `/api/admin/auth` con cookies `HttpOnly; SameSite=Strict` y `requireAdmin` en `POST/DELETE /api/products`, `GET/PATCH /api/orders` y `GET /api/inquiries`.
- **[AUTO-HEALED] SEC-02:** Cerrada exposición pública de PII en `GET /api/orders`, eliminado `fetch('/api/orders')` global del montaje público y protegido `/api/orders/[id]` mediante `accessToken` criptográfico de 128 bits.
- **[AUTO-HEALED] SEC-03, QA-01 & QA-04:** Implementada transacción ACID en `createValidatedDbOrder` (`src/lib/db.ts`) con `idempotency_key` único, `SELECT ... FOR UPDATE` ordenado anti-deadlock, recálculo 100% server-side de precios/variaciones/descuentos y restauración automática de stock al pasar a `CANCELADO`.
- **[AUTO-HEALED] SEC-05:** Activado `ROW LEVEL SECURITY` en `public.benflex_products`, `public.benflex_orders` y `public.benflex_inquiries` en Supabase con política pública de solo lectura limitada a `benflex_products (is_active = true)`.
- **[AUTO-HEALED] SEC-06 & QA-06:** Removidos todos los campos crudos de tarjeta/CVV en `/checkout` (cumplimiento PCI-DSS SAQ-A) y adaptada `/order-confirmation` según medio de pago (`transferencia` vs `credito`/`debito`/`mercadopago`).
- **[AUTO-HEALED] QA-02, QA-03, QA-08, QA-09 & QA-12:** Unificado descuento dinámico por producto (`transferDiscountPercent`) con redondeo unitario exacto (`$0` discrepancia), persistidos `selectedFabric` y `customerDni`, y conectado `/contacto` con `public.benflex_inquiries` + pestaña de consultas en `/admin`.
