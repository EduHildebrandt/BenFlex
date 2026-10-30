# Lecciones Aprendidas & Reglas de Ingeniería (BenFlex)

## 1. Seguridad de E-Commerce & Postura OWASP / ASVS
- **Cero Confianza en Precios del Cliente (Zero Client Trust):** Nunca aceptar `total`, `subtotal`, `unitPrice`, `transferDiscount` ni `status` desde el payload HTTP del navegador en `POST /api/orders`. El servidor siempre debe recalcular importes leyendo `base_price`, `variations` y `transfer_discount_percent` desde PostgreSQL dentro de la transacción.
- **Control de Acceso Administrativo (`HttpOnly` + `SameSite=Strict`):** Jamás declarar contraseñas ni claves en archivos con `'use client'` ni variables `NEXT_PUBLIC_*`. Validar credenciales exclusivamente en Route Handlers usando `crypto.timingSafeEqual` y cookies firmadas con HMAC-SHA256.
- **Protección de PII y Anti-IDOR (`BOLA`):** `GET /api/orders` solo debe responder a sesiones administrativas autenticadas. Para la pantalla pública `/order-confirmation`, utilizar identificadores no secuenciales (`BF-<HEX>`) combinados con un `accessToken` criptográfico de 128 bits verificado en tiempo constante en `GET /api/orders/[id]?token=...`.
- **Cumplimiento PCI-DSS SAQ-A:** Nunca renderizar `<input>` propios para números de tarjeta (PAN), vencimiento o CVV en formularios propios; delegar siempre la captura a links/pasarelas oficiales encriptadas.
- **Defensa en Profundidad en Supabase:** Toda tabla en el esquema `public` (`benflex_products`, `benflex_orders`, `benflex_inquiries`) debe tener `ENABLE ROW LEVEL SECURITY` activo para impedir acceso directo no autorizado vía PostgREST (`anon` key).

## 2. Consistencia Transaccional, Stock y Redondeo en Next.js 16
- **Concurrencia de Stock sin Deadlocks:** Agrupar cantidades por `productId`, ordenar los IDs alfabéticamente antes de ejecutar `SELECT ... FOR UPDATE`, descontar stock dentro de `BEGIN ... COMMIT` y restaurarlo automáticamente si el pedido pasa a `CANCELADO`.
- **Idempotencia en Checkout:** Enviar un `idempotencyKey` (`UUID`) único por intento de compra y esperar (`await`) la confirmación `201/200` del servidor antes de vaciar el carrito (`clearCart()`), evitando pérdidas de carrito ante errores de red o falta de stock (`HTTP 409`).
- **Redondeo Exacto en Pesos (ARS):** Calcular el descuento por transferencia a nivel unitario (`unitTransfer = Math.round(unitPrice * (1 - pct / 100))`) tanto en el carrito como en PostgreSQL para asegurar `$0` de diferencia entre la suma de líneas y el total final.
- **Frontera Server/Client en App Router:** No importar funciones utilitarias desde módulos marcados con `'use client'` dentro de código de servidor (`src/lib/db.ts`); mantener helpers puros en módulos de servidor o compartidos sin `'use client'`.
