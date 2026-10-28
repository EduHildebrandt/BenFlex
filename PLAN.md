# Master Roadmap: Benflex - Tienda Online de Descanso y Confort

## 1. Visión del Producto y Justificación (The WHY)
Benflex es una marca líder de descanso y bienestar postural con local físico y showroom en **Castaño Oeste y Conector Sur, Villa Krause, San Juan**.
El objetivo de este e-commerce es:
1. **Maximizar la conversión y la confianza**:
   - Resaltar la presencia física (Showroom en Villa Krause, San Juan) y retiro gratuito en sucursal.
   - Claridad total en precios con doble visualización: **Precio de Lista en Cuotas** vs. **Precio con 15% OFF por Transferencia Bancaria**.
   - Flete calculado (10%) y **100% bonificado/tachado** a nivel nacional y provincial para eliminar la fricción del carrito abandonado.
2. **Experiencia de Descanso Guiada y Personalizada**:
   - Quiz interactivo en 3 pasos: "¿Cómo dormís?", "¿Prioridad de descanso?", "¿Medida de cama?", arrojando la recomendación ideal de colchón o combo al instante.
   - Consultas técnicas de telas o medidas con 1 clic a WhatsApp directo con un asesor del showroom.
3. **Flujo de Pago y Cierre Eficiente por WhatsApp**:
   - Checkout en 1 solo paso con selector dinámico de métodos de pago (Mercado Pago, Tarjeta de Crédito con calculadora de cuotas, Tarjeta de Débito, Transferencia con datos bancarios y botón de copia).
   - Generación de comprobante y mensaje automatizado en URL encoded para enviar la constancia por WhatsApp con el ID de orden y dirección.

---

## 2. Decisiones de Arquitectura y UI/UX
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Glassmorphism modular.
- **Identidad Visual**:
  - Paleta: Tonos neutros (blanco roto `#faf9f5`, marfil `#f4efe6`, arena `#ebe5d8`), acento azul noche profundo (`#0f172a` / `#1e293b`) y verde salvia (`#2d5a3f` / `#407b55`), con CTAs vibrantes de alta conversión.
  - Tipografía: Plus Jakarta Sans & Outfit.
  - Componentes: Header con barra de avisos, buscador predictivo, selector de Código Postal persistente, Drawer Cart con cross-selling, Quiz Interactivo de 3 pasos, PDP enriquecida, Checkout One-Step y Panel Admin Benflex.
- **Gestión de Estado**:
  - `LocationContext`: Código Postal, Localidad y Provincia seleccionada, persistido en localStorage.
  - `CartContext`: Gestión de ítems, cálculo de subtotal, flete del 10% bonificado ($0 final), descuento del 15% por transferencia y cross-selling.
  - `ProductContext`: Catálogo completo con variantes de medidas, tecnologías (alta densidad, resortes pocket), telas anti-desgarro, etc.

---

## 3. Fases de Ejecución

### Fase 1: Arquitectura Base, Catálogo y Contextos
- [x] Configuración de tipos (`Product`, `CartItem`, `Order`, `LocationState`) y datos iniciales de Benflex con las 4 categorías:
  - Colchones & Sommiers (1 Plaza, 1½, 2 Plazas, Queen, King; alta densidad y resortes pocket).
  - Sillones & Sofás Cama (2 y 3 cuerpos, esquineros, telas anti-desgarro/anti-manchas).
  - Almohadas & Confort (viscoelásticas, inteligentes, cervicales, protector impermeable).
  - Combos Benflex (sets de colchón + sommier + juego de almohadas de regalo).
- [x] Contexto de Geolocalización (`LocationContext`) para selector de CP/Provincia persistente.
- [x] Contexto de Carrito (`CartContext`) actualizado con flete ficticio 10% bonificado y descuento 15% transferencia.

### Fase 2: Identidad Visual, Layout Global y Puntos de Contacto
- [x] Global CSS con la paleta Benflex (neutros, arena, azul noche, verde salvia, glassmorphism limpio).
- [x] `Header` renovado: Barra superior con avisos, buscador predictivo, selector de CP y botón de carrito con badge.
- [x] `Footer` renovado: Sección "Nuestro Showroom en Villa Krause, San Juan" con mapa, horarios de atención y opciones de retiro gratis.
- [x] Botón flotante persistente de WhatsApp con mensaje personalizado.

### Fase 3: Home Page Orientada a la Conversión
- [x] Hero Banner sensorial y cálido con llamadas a la acción directas y badges de confianza.
- [x] Quiz interactivo "Descubrí tu colchón ideal en 3 preguntas" con resultado y botón de compra inmediato.
- [x] Grilla de productos destacados con comparador de precios (Precio Lista vs 15% OFF Transferencia).
- [x] Badges de beneficios: Garantía de fábrica de 5 años, asesoramiento por WhatsApp, Showroom San Juan, Flete 100% bonificado.

### Fase 4: Experiencia de Catálogo y Ficha de Producto (PDP)
- [x] Selector interactivo de medidas y telas con actualización de precio en vivo.
- [x] Calculador de cuotas con tarjeta (3, 6, 12) y destaque de precio con transferencia.
- [x] Calculador / Selector de CP con badge "Envío Gratis a tu zona".
- [x] Botón de consulta directa a WhatsApp: "Consultar medidas o telas por WhatsApp".
- [x] Especificaciones ergonómicas, soporte de peso y garantía.

### Fase 5: Carrito Lateral con Cross-Selling y Checkout One-Step
- [x] `CartDrawer` con barra de progreso de envío bonificado y sugerencias de venta cruzada (protectores de colchón, almohadas).
- [x] `CheckoutPage` One-Step:
  - Datos de contacto y entrega (opción Retiro en Showroom Villa Krause gratis o Envío a Domicilio).
  - Medios de pago: Mercado Pago, Tarjeta de Crédito/Débito, y Transferencia Bancaria (con recálculo del 15% OFF y despliegue de CBU/CVU/Alias/CUIT con botón de copiar).
  - Desglose transparente: Subtotal, Descuento Transferencia, Flete Bonificado (-10%) y Total a pagar.
- [x] Pantalla de Confirmación de Orden (`/order-confirmation`):
  - Botón principal destacado: "Enviar comprobante y coordinar envío por WhatsApp" con mensaje preformateado en URL encode.

### Fase 6: Auditoría, Verificación y Compilación
- [x] Restauración de paquetes truncados en unidad virtual (`Z:\`) y compilación limpia de TypeScript (`tsc --noEmit` con 0 errores).
- [x] Suite automatizada de auditoría de negocio (`scratch/verify-benflex.ts`) con 13 aserciones verificadas.

---

## 4. Revisión y Auto-Resolución [AUTO-HEALED]
- **[AUTO-HEALED] Restauración de Módulos en Unidad Sincronizada (`Z:\`)**: Se detectaron carpetas temporales `.pkg-hash` en `node_modules` producto de bloqueos previos de sincronización de Google Drive (`next`, `typescript`, `@types/node`, `lucide-react`). Se restauraron programáticamente y se reconstruyeron las definiciones tipadas faltantes, logrando compilación estricta con 0 errores (`tsc --noEmit`).
- **[AUTO-HEALED] Compatibilidad Dual de Tipos TypeScript / Node 24**: Se estandarizó el uso de `import type` y `allowImportingTsExtensions` para permitir que los módulos de datos (`src/data/products.ts` y `src/types/index.ts`) sean ejecutados tanto por Next.js 16 como por el motor nativo de pruebas de Node 24 (`--experimental-strip-types`).
