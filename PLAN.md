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
| Fase 4 | Robustecimiento del Panel ATM de Productos, Acceso Dual (Dueño/Desarrollador), Persistencia Híbrida Resiliente y Cuadro Analítico de Ventas con Exportación CSV | ✅ Completado |
| Fase 5 | Infraestructura de Despliegue en Producción para VPS Ubuntu (DonWeb) bajo dominio `www.blenflex.online` (PM2, Nginx Reverse Proxy, Certbot SSL y Automatización Git) | ✅ Completado |

## [AUTO-HEALED] Revisión de Remediación Integral
- **[AUTO-HEALED] UX-ADMIN-02 (Login Limpio, Ventas Mensuales, Categorías Dinámicas & Main Minimalista):**
  1. Eliminadas las contraseñas visibles por defecto de la pantalla de login de `/admin`.
  2. Agrupadas las ventas por mes (`salesByMonth` y `groupedFilteredSalesByMonth`) en el Cuadro de Ventas de `/admin` con tarjetas mensuales interactivas, filtro por mes, tabla seccionada por mes y columna `Mes` en la exportación CSV.
  3. Habilitada la creación de nuevas categorías personalizadas al agregar/editar productos en `/admin` (`src/types/index.ts`, `src/lib/validation.ts`, `src/app/admin/page.tsx`) y ocultadas automáticamente en toda la tienda (`src/app/page.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`) las categorías que no tienen productos cargados.
  4. Rediseñado el `main` (`src/app/page.tsx` y `src/components/SleepQuiz.tsx`) con estética minimalista limpia, enlace directo a *"Descubrir el colchón ideal en 3 pasos"* en el encabezado y ubicación del test de 3 pasos **después** de la vista del catálogo de productos.
- **[AUTO-HEALED] ADMIN-HOOKS-01 (Crash Post-Login en `/admin`):** Corregido el orden de hooks en `src/app/admin/page.tsx` moviendo los cálculos `useMemo` (`salesMetrics` y `filteredSalesOrders`) por encima de los retornos condicionales tempranos (`if (checkingSession)` y `if (!authRole)`), eliminando el crash de cliente de React 19 al iniciar sesión en producción (`https://www.benflex.online/admin`).
- **[AUTO-HEALED] DEPLOY-01 (VPS DonWeb `www.benflex.online`):** Creada la suite de aprovisionamiento y despliegue continuo en `deploy/setup-vps.sh`, `deploy/update-vps.sh`, `deploy/nginx-blenflex.conf` y `ecosystem.config.cjs`. Incluye configuración de Nginx con `client_max_body_size 15M` (para evitar errores `413` al subir fotos en `/admin`), servicio `systemd` (`benflex.service`), preservación de `src/data/local_storage.json` ante actualizaciones Git, cookies adaptativas HTTP/HTTPS (`X-Forwarded-Proto`) y SSL automático con Certbot.
- **[AUTO-HEALED] ATM-01 & DB-01:** Implementada arquitectura de persistencia híbrida en `src/lib/db.ts` y `src/lib/localStore.ts` con respaldo en `src/data/local_storage.json`. Si Supabase no está configurado o falla la red, el sistema opera de manera fluida y persistente en almacenamiento local sin arrojar error 500.
- **[AUTO-HEALED] SEC-07 & AUTH-02:** Configurado entorno `.env.local` con claves diferenciadas para **Dueño / Administración** (`dueno-benflex-2026`) y **Desarrollador Full-Access** (`dev-benflex-2026`), junto con un banner de ayuda de acceso directo en la pantalla de bloqueo de `/admin`.
- **[AUTO-HEALED] ATM-02:** Resueltos los problemas de carga de productos en `/admin`: compresión inteligente de imágenes en Canvas (máx 850px, calidad 0.75 JPEG < 300KB), flexibilización de URLs HTTP/HTTPS y banner de error inline en el modal de alta/modificación.
- **[AUTO-HEALED] SALES-01:** Implementado el **Cuadro Analítico de Ventas Web** con 5 métricas comerciales ejecutivas (Ventas Cobradas, Facturación Total, Ticket Promedio, Unidades Vendidas, Descuentos Otorgados), desglose por medios de pago y entregas, tabla interactiva de transacciones con filtros y botón de exportación a CSV (compatible con Excel mediante BOM UTF-8).
- **[AUTO-HEALED] SEC-01 & SEC-04:** Eliminadas credenciales hardcodeadas del bundle cliente en `/admin`. Implementado `src/lib/auth.ts` y `/api/admin/auth` con cookies `HttpOnly; SameSite=Strict` y `requireAdmin` en `POST/DELETE /api/products`, `GET/PATCH /api/orders` y `GET /api/inquiries`.
- **[AUTO-HEALED] SEC-02:** Cerrada exposición pública de PII en `GET /api/orders`, eliminado `fetch('/api/orders')` global del montaje público y protegido `/api/orders/[id]` mediante `accessToken` criptográfico de 128 bits.
- **[AUTO-HEALED] SEC-03, QA-01 & QA-04:** Implementada transacción ACID en `createValidatedDbOrder` (`src/lib/db.ts`) con `idempotency_key` único, `SELECT ... FOR UPDATE` ordenado anti-deadlock, recálculo 100% server-side de precios/variaciones/descuentos y restauración automática de stock al pasar a `CANCELADO`.
- **[AUTO-HEALED] SEC-05:** Activado `ROW LEVEL SECURITY` en `public.benflex_products`, `public.benflex_orders` y `public.benflex_inquiries` en Supabase con política pública de solo lectura limitada a `benflex_products (is_active = true)`.
- **[AUTO-HEALED] SEC-06 & QA-06:** Removidos todos los campos crudos de tarjeta/CVV en `/checkout` (cumplimiento PCI-DSS SAQ-A) y adaptada `/order-confirmation` según medio de pago (`transferencia` vs `credito`/`debito`/`mercadopago`).
- **[AUTO-HEALED] QA-02, QA-03, QA-08, QA-09 & QA-12:** Unificado descuento dinámico por producto (`transferDiscountPercent`) con redondeo unitario exacto (`$0` discrepancia), persistidos `selectedFabric` y `customerDni`, y conectado `/contacto` con `public.benflex_inquiries` + pestaña de consultas en `/admin`.
