# Master Roadmap & Registro de Remediación — BenFlex E-Commerce

## Arquitectura Base
- **Stack:** Next.js 16.2.7 (App Router) + React 19.2.4 + PostgreSQL Nativo (Ubuntu VPS DonWeb `benflex_db`) con fallback híbrido resiliente en `src/data/local_storage.json`.
- **Reglas Comerciales Activas:**
  - Marca estandarizada: **BenFlex**.
  - Envíos 100% bonificados exclusivamente dentro de **San Juan (`CP 5400–5499`)** con CP por defecto `5400 (San Juan Capital)` y retiro sin cargo en **Showroom Villa Krause** (`Castaño Oeste y Conector Sur`). Envíos al resto del país: **A cotizar**.
  - Canales oficiales: WhatsApp `+54 9 264 443-6961` (`5492644436961`) e Instagram `@benflex_fabrica`.
  - Crédito de desarrollo: **VAME Soft** con logo oficial en el footer.

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
| Fase 8 | Soporte Multi-Imagen en Productos (Galería en PDP, selector múltiple con compresión en `/admin`) y CP 5400 por defecto | ✅ Completado |
| Fase 9 | Integración de Pagos con Mercado Pago (Checkout Pro Preferences API, Webhooks IPN, sincronización de órdenes y redirección segura) | ✅ Completado |

## [AUTO-HEALED] Registro de Remediación Integral
- **[AUTO-HEALED] MP-01 (Integración Oficial Mercado Pago Checkout Pro):**
  1. **Investigación de Colección Postman (`https://documenter.getpostman.com/view/15366798/2sAXjKasp4`):**
     - Utiliza la API de Checkout Pro (`POST https://api.mercadopago.com/checkout/preferences`).
     - Requiere `MERCADOPAGO_ACCESS_TOKEN` y opcionalmente `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`.
     - Permite pago con Tarjetas de Crédito, Débito, Dinero en cuenta de Mercado Pago y efectivo (Pago Fácil / Rapipago).
  2. **Arquitectura de Pagos BenFlex:**
     - Endpoint Server-Side `/api/payments/mercadopago/preference`: recibe `orderId` o `payload`, calcula los montos exactos en el servidor y genera la preferencia con `init_point`, `back_urls` (`success`, `failure`, `pending`), `notification_url` y `auto_return: "approved"`.
     - Endpoint Webhook `/api/webhooks/mercadopago`: receptor de notificaciones IPN con validación de pago en `GET https://api.mercadopago.com/v1/payments/{id}` y actualización de estado de orden a `APROBADO`.
     - Experiencia en Checkout: Al seleccionar Mercado Pago o Tarjeta, tras validar el formulario se redirige automáticamente al portal oficial de pago seguro de Mercado Pago (`init_point`).
