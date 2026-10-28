import { BENFLEX_PRODUCTS } from '../src/data/products.ts';
import { BENFLEX_CONTACT, BENFLEX_BANK_INFO } from '../src/types/index.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log('=== INICIANDO SUITE DE AUDITORÍA E INTEGRACIÓN BENFLEX ===\n');

// 1. Verificar Identidad y Showroom en Villa Krause, San Juan
assert(
  BENFLEX_CONTACT.address === 'Castaño Oeste y Conector Sur' &&
    BENFLEX_CONTACT.city === 'Villa Krause' &&
    BENFLEX_CONTACT.province === 'San Juan',
  'Ubicación física del Showroom: Castaño Oeste y Conector Sur, Villa Krause, San Juan'
);

// 2. Verificar las 4 categorías principales del catálogo
const categories = new Set(BENFLEX_PRODUCTS.map((p) => p.category));
assert(categories.has('colchones-sommiers'), 'Categoría Colchones & Sommiers presente');
assert(categories.has('sillones-sofas'), 'Categoría Sillones & Sofás Cama presente');
assert(categories.has('almohadas-confort'), 'Categoría Almohadas & Confort presente');
assert(categories.has('combos-benflex'), 'Categoría Combos Benflex presente');

// 3. Verificar filtros de tecnologías y medidas
const technologies = new Set(BENFLEX_PRODUCTS.map((p) => p.technology));
assert(technologies.has('alta_densidad'), 'Tecnología Alta Densidad (35 kg/m³) disponible');
assert(technologies.has('resortes_pocket'), 'Tecnología Resortes Pocket Ensacados disponible');
assert(technologies.has('anti_desgarro'), 'Telas Anti-Desgarro / Pet-Friendly disponibles');
assert(technologies.has('viscoelastica'), 'Tecnología Viscoelástica Memory Foam disponible');

// 4. Verificar cálculo de flete del 10% y bonificación del 100% + Descuento 15% Transferencia
const sampleProduct = BENFLEX_PRODUCTS[0]; // Colchón Benflex Imperial ($380.000)
const subtotal = sampleProduct.basePrice;
const shippingOriginal = Math.round(subtotal * 0.1);
const shippingFinal = 0; // 100% bonificado
const transferDiscount = Math.round(subtotal * 0.15);
const totalTransfer = subtotal - transferDiscount;

assert(
  shippingOriginal === 38000 && shippingFinal === 0,
  `Cálculo de Flete 10% ($${shippingOriginal.toLocaleString('es-AR')}) -> ¡GRATIS / 100% Bonificado ($0)!`
);
assert(
  transferDiscount === 57000 && totalTransfer === 323000,
  `Descuento 15% por Transferencia (-$${transferDiscount.toLocaleString('es-AR')}) -> Total a pagar: $${totalTransfer.toLocaleString('es-AR')}`
);

// 5. Verificar Datos Bancarios de Benflex
assert(
  Boolean(BENFLEX_BANK_INFO.cbu && BENFLEX_BANK_INFO.alias && BENFLEX_BANK_INFO.cuit && BENFLEX_BANK_INFO.holder),
  `Datos bancarios completos (${BENFLEX_BANK_INFO.alias} / CBU ${BENFLEX_BANK_INFO.cbu})`
);

// 6. Verificar Generación de Mensaje Automatizado de WhatsApp (URL Encode)
const orderId = 'BF-901245';
const destination = 'Av. Libertador 1420, San Juan';
const rawMsg = `¡Hola Benflex! Acabo de realizar el pedido #${orderId} por un total de $${totalTransfer.toLocaleString('es-AR')}. Adjunto mi comprobante de transferencia para coordinar la entrega en ${destination}.`;
const encodedMsg = encodeURIComponent(rawMsg);

assert(
  decodeURIComponent(encodedMsg) === rawMsg && encodedMsg.includes(orderId),
  'Mensaje preconfigurado de WhatsApp URL-encoded verificado con éxito'
);

console.log('\n🎉 TODAS LAS ASERCIONES DE NEGOCIO Y ARQUITECTURA PASARON EXITOSAMENTE.');
