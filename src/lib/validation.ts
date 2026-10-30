import type {
  Product,
  ProductCategory,
  ProductTechnology,
  CreateOrderPayload,
  OrderStatus,
  PaymentMethod,
  DeliveryMethod,
} from '@/types';

const VALID_CATEGORIES: ProductCategory[] = [
  'colchones-sommiers',
  'sillones-sofas',
  'almohadas-confort',
  'combos-benflex',
];

const VALID_TECHNOLOGIES: ProductTechnology[] = [
  'alta_densidad',
  'resortes_pocket',
  'viscoelastica',
  'espuma_inteligente',
  'fibra_siliconada',
  'anti_desgarro',
];

const VALID_PAYMENT_METHODS: PaymentMethod[] = [
  'transferencia',
  'mercadopago',
  'credito',
  'debito',
];

const VALID_DELIVERY_METHODS: DeliveryMethod[] = ['showroom', 'delivery'];

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'PENDIENTE_COMPROBANTE',
  'PENDIENTE_PAGO',
  'APROBADO',
  'EN_PREPARACION',
  'ENTREGADO',
  'CANCELADO',
];

function cleanText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, maxLen);
}

export function isSafeImageUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  if (url.startsWith('https://')) return url.length <= 2048;
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) {
    return url.length <= 900_000; // Máx ~650 KB binario comprimido
  }
  return false;
}

export function validateProductInput(
  raw: any
): { valid: true; data: Product } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Formato de producto inválido.' };
  }

  const id = cleanText(raw.id, 140);
  const name = cleanText(raw.name, 200);
  if (!id || !/^[a-z0-9-]+$/.test(id)) {
    return { valid: false, error: 'El identificador (slug/id) del producto es inválido.' };
  }
  if (name.length < 3) {
    return { valid: false, error: 'El nombre del producto debe tener al menos 3 caracteres.' };
  }

  const category = raw.category as ProductCategory;
  if (!VALID_CATEGORIES.includes(category)) {
    return { valid: false, error: 'Categoría de producto no permitida.' };
  }

  const technology = raw.technology as ProductTechnology;
  if (!VALID_TECHNOLOGIES.includes(technology)) {
    return { valid: false, error: 'Tecnología de producto no permitida.' };
  }

  const basePrice = Number(raw.basePrice);
  if (!Number.isFinite(basePrice) || basePrice <= 0 || basePrice > 50_000_000) {
    return { valid: false, error: 'El precio base debe ser un número positivo válido.' };
  }

  const transferDiscountPercent = Number(raw.transferDiscountPercent ?? 15);
  if (
    !Number.isFinite(transferDiscountPercent) ||
    transferDiscountPercent < 0 ||
    transferDiscountPercent > 60
  ) {
    return { valid: false, error: 'El porcentaje de descuento debe estar entre 0% y 60%.' };
  }

  const stock = Math.floor(Number(raw.stock ?? 0));
  if (!Number.isFinite(stock) || stock < 0 || stock > 100_000) {
    return { valid: false, error: 'El stock debe ser un entero mayor o igual a 0.' };
  }

  const image = typeof raw.image === 'string' ? raw.image.trim() : '';
  if (!isSafeImageUrl(image)) {
    return {
      valid: false,
      error: 'La imagen debe ser una URL HTTPS segura o una foto JPEG/PNG/WebP comprimida (< 650 KB).',
    };
  }

  const variations = Array.isArray(raw.variations)
    ? raw.variations
        .slice(0, 20)
        .map((v: any) => ({
          name: cleanText(v?.name, 100),
          priceModifier: Number.isFinite(Number(v?.priceModifier)) ? Number(v.priceModifier) : 0,
          measure: cleanText(v?.measure, 60) || undefined,
        }))
        .filter((v: any) => v.name.length > 0)
    : [];

  const features = Array.isArray(raw.features)
    ? raw.features.slice(0, 20).map((f: any) => cleanText(f, 220)).filter(Boolean)
    : [];

  const fabrics = Array.isArray(raw.fabrics)
    ? raw.fabrics.slice(0, 20).map((f: any) => cleanText(f, 100)).filter(Boolean)
    : undefined;

  const firmnessAllowed = ['Suave', 'Media', 'Firme', 'Extra Firme'];
  const firmness = firmnessAllowed.includes(raw.firmness) ? raw.firmness : undefined;

  const description = cleanText(raw.description, 3000) || name;
  const shortDescription = cleanText(raw.shortDescription, 300) || description.slice(0, 120);

  return {
    valid: true,
    data: {
      id,
      slug: cleanText(raw.slug, 140) || id,
      name,
      description,
      shortDescription,
      category,
      categoryLabel: cleanText(raw.categoryLabel, 80) || category,
      technology,
      technologyLabel: cleanText(raw.technologyLabel, 100) || technology,
      measure: cleanText(raw.measure, 80) || 'Estándar',
      firmness,
      basePrice: Math.round(basePrice),
      transferDiscountPercent: Math.round(transferDiscountPercent),
      variations: variations.length > 0 ? variations : [{ name: 'Estándar', priceModifier: 0 }],
      features,
      fabrics: fabrics && fabrics.length > 0 ? fabrics : undefined,
      image,
      badge: cleanText(raw.badge, 60) || undefined,
      stock,
      weightSupport: cleanText(raw.weightSupport, 100) || undefined,
      warranty: cleanText(raw.warranty, 100) || undefined,
      rating: Number.isFinite(Number(raw.rating)) ? Math.min(5, Math.max(1, Number(raw.rating))) : 5.0,
      reviewsCount: Number.isFinite(Number(raw.reviewsCount))
        ? Math.max(0, Math.floor(Number(raw.reviewsCount)))
        : 25,
    },
  };
}

export function validateCreateOrderPayload(
  raw: any
): { valid: true; data: CreateOrderPayload } | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Datos de pedido inválidos.' };
  }

  const idempotencyKey = cleanText(raw.idempotencyKey, 128);
  if (idempotencyKey.length < 8) {
    return { valid: false, error: 'Falta clave de idempotencia de la transacción.' };
  }

  const customerName = cleanText(raw.customerName, 120);
  if (customerName.length < 2) {
    return { valid: false, error: 'Ingresá tu nombre y apellido completo.' };
  }

  const customerEmail = cleanText(raw.customerEmail, 150);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return { valid: false, error: 'Ingresá un correo electrónico válido.' };
  }

  const customerPhone = cleanText(raw.customerPhone, 40);
  if (customerPhone.replace(/\D/g, '').length < 8) {
    return { valid: false, error: 'Ingresá un número de WhatsApp / teléfono válido.' };
  }

  const deliveryMethod = raw.deliveryMethod as DeliveryMethod;
  if (!VALID_DELIVERY_METHODS.includes(deliveryMethod)) {
    return { valid: false, error: 'Método de entrega inválido.' };
  }

  const postalCode = cleanText(raw.postalCode, 16) || '5425';
  const address = cleanText(raw.address, 220);
  if (deliveryMethod === 'delivery' && address.length < 3) {
    return { valid: false, error: 'Ingresá la dirección de entrega (calle y altura).' };
  }

  const paymentMethod = raw.paymentMethod as PaymentMethod;
  if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    return { valid: false, error: 'Medio de pago inválido.' };
  }

  const allowedInstallments = [1, 3, 6, 12];
  const installments =
    paymentMethod === 'credito' && allowedInstallments.includes(Number(raw.installments))
      ? Number(raw.installments)
      : undefined;

  if (!Array.isArray(raw.items) || raw.items.length === 0 || raw.items.length > 25) {
    return { valid: false, error: 'El carrito de compra está vacío o excede el límite permitido.' };
  }

  const items: CreateOrderPayload['items'] = [];
  for (const item of raw.items) {
    const productId = cleanText(item?.productId, 140);
    const variationName = cleanText(item?.variationName, 120) || 'Estándar';
    const fabric = cleanText(item?.fabric, 100) || undefined;
    const quantity = Math.floor(Number(item?.quantity));

    if (!productId || !Number.isFinite(quantity) || quantity < 1 || quantity > 50) {
      return { valid: false, error: 'Uno de los productos seleccionados tiene cantidad inválida.' };
    }
    items.push({ productId, variationName, fabric, quantity });
  }

  return {
    valid: true,
    data: {
      idempotencyKey,
      customerName,
      customerEmail,
      customerPhone,
      customerDni: cleanText(raw.customerDni, 30) || undefined,
      deliveryMethod,
      postalCode,
      address: address || undefined,
      city: cleanText(raw.city, 100) || 'San Juan',
      province: cleanText(raw.province, 100) || 'San Juan',
      notes: cleanText(raw.notes, 500) || undefined,
      paymentMethod,
      installments,
      items,
    },
  };
}

export function validateInquiryInput(
  raw: any
):
  | { valid: true; data: { name: string; phone: string; subject: string; message: string } }
  | { valid: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Consulta inválida.' };
  }
  const name = cleanText(raw.name, 120);
  const phone = cleanText(raw.phone, 40);
  const subject = cleanText(raw.subject, 140) || 'Consulta general';
  const message = cleanText(raw.message, 1500);

  if (name.length < 2) return { valid: false, error: 'Ingresá tu nombre.' };
  if (phone.replace(/\D/g, '').length < 7) return { valid: false, error: 'Ingresá un teléfono válido.' };
  if (message.length < 4) return { valid: false, error: 'Escribí tu consulta.' };

  return { valid: true, data: { name, phone, subject, message } };
}
