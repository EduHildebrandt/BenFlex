import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  Product,
  Order,
  OrderStatus,
  CartItem,
  CreateOrderPayload,
  CustomerInquiry,
} from '@/types';
import { BENFLEX_PRODUCTS } from '@/data/products';
import { isSanJuanPostalCodeServer, OrderBusinessError } from '@/lib/db';

interface LocalStoreData {
  products: Product[];
  orders: Order[];
  inquiries: CustomerInquiry[];
  updatedAt: string;
}

const LOCAL_STORE_PATH = path.join(process.cwd(), 'src', 'data', 'local_storage.json');

let memoryStore: LocalStoreData | null = null;

function getInitialStore(): LocalStoreData {
  return {
    products: JSON.parse(JSON.stringify(BENFLEX_PRODUCTS)),
    orders: [
      {
        id: 'BF-DEMO-01',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        customerName: 'Martín Rodríguez',
        customerEmail: 'martin.rodriguez@gmail.com',
        customerPhone: '+54 9 264 456-7890',
        customerDni: '34567890',
        deliveryMethod: 'showroom',
        postalCode: '5425',
        city: 'Villa Krause',
        province: 'San Juan',
        notes: 'Retira por la tarde en Showroom',
        paymentMethod: 'transferencia',
        items: [
          {
            id: 'colchon-imperial-alta-densidad-2-plazas',
            productId: 'colchon-imperial-alta-densidad',
            product: BENFLEX_PRODUCTS[0],
            variationName: '2 Plazas (140x190)',
            quantity: 1,
            unitPrice: 380000,
            subtotal: 380000,
          },
        ],
        subtotal: 380000,
        shippingOriginal: 0,
        shippingDiscount: 0,
        shippingFinal: 0,
        transferDiscount: 57000,
        total: 323000,
        status: 'APROBADO',
        accessToken: 'demo-token-1',
        idempotencyKey: 'idemp-demo-1',
      },
      {
        id: 'BF-DEMO-02',
        date: new Date(Date.now() - 3600000 * 12).toISOString(),
        customerName: 'Lucía Fernández',
        customerEmail: 'lucia.f@hotmail.com',
        customerPhone: '+54 9 264 512-3456',
        customerDni: '38123456',
        deliveryMethod: 'delivery',
        postalCode: '5400',
        address: 'Av. Libertador 1850 Este',
        city: 'San Juan Capital',
        province: 'San Juan',
        notes: 'Piso 3 Depto B - Timbre Fernández',
        paymentMethod: 'credito',
        items: [
          {
            id: 'almohada-inteligente-cervical-estandar',
            productId: 'almohada-inteligente-cervical',
            product: BENFLEX_PRODUCTS[2] || BENFLEX_PRODUCTS[0],
            variationName: 'Estándar (70x40)',
            quantity: 2,
            unitPrice: 42000,
            subtotal: 84000,
          },
        ],
        subtotal: 84000,
        shippingOriginal: 8400,
        shippingDiscount: 8400,
        shippingFinal: 0,
        transferDiscount: 0,
        total: 84000,
        installments: 3,
        status: 'EN_PREPARACION',
        accessToken: 'demo-token-2',
        idempotencyKey: 'idemp-demo-2',
      },
      {
        id: 'BF-DEMO-03',
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        customerName: 'Gonzalo Morales',
        customerEmail: 'gonzalo.m@yahoo.com.ar',
        customerPhone: '+54 9 264 498-1122',
        customerDni: '29876543',
        deliveryMethod: 'delivery',
        postalCode: '5402',
        address: 'Calle Mendoza 940 Sur',
        city: 'Rivadavia',
        province: 'San Juan',
        paymentMethod: 'transferencia',
        items: [
          {
            id: 'colchon-nuage-resortes-pocket-queen',
            productId: 'colchon-nuage-resortes-pocket',
            product: BENFLEX_PRODUCTS[1] || BENFLEX_PRODUCTS[0],
            variationName: 'Queen (160x200)',
            quantity: 1,
            unitPrice: 590000,
            subtotal: 590000,
          },
        ],
        subtotal: 590000,
        shippingOriginal: 59000,
        shippingDiscount: 59000,
        shippingFinal: 0,
        transferDiscount: 88500,
        total: 501500,
        status: 'PENDIENTE_COMPROBANTE',
        accessToken: 'demo-token-3',
        idempotencyKey: 'idemp-demo-3',
      },
    ],
    inquiries: [
      {
        id: 1,
        name: 'Roberto Gómez',
        phone: '+54 9 264 422-9988',
        subject: 'Consulta por Sommier 2 Plazas y Garantía',
        message: 'Hola, quería consultar si tienen stock para entrega inmediata en el Showroom de Villa Krause del Colchón Imperial.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function loadStore(): LocalStoreData {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(LOCAL_STORE_PATH)) {
      const content = fs.readFileSync(LOCAL_STORE_PATH, 'utf8');
      const parsed = JSON.parse(content) as LocalStoreData;
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (err) {
    console.warn('[LocalStore] Error leyendo archivo de almacenamiento local, inicializando:', err);
  }

  memoryStore = getInitialStore();
  saveStore(memoryStore);
  return memoryStore;
}

function saveStore(data: LocalStoreData): void {
  memoryStore = data;
  data.updatedAt = new Date().toISOString();
  try {
    const dir = path.dirname(LOCAL_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('[LocalStore] Error persistiendo a disco (usando copia en memoria):', err);
  }
}

// ---------------------------------------------------------------------------
// OPERACIONES ATM (ALTA, BAJA, MODIFICACIÓN) PARA PRODUCTOS
// ---------------------------------------------------------------------------

export function getLocalProducts(): Product[] {
  const store = loadStore();
  return store.products.filter((p) => (p as any).isActive !== false);
}

export function upsertLocalProduct(product: Product): Product {
  const store = loadStore();
  const index = store.products.findIndex((p) => p.id === product.id);

  const cleanProduct: Product = {
    ...product,
    id: product.id,
    slug: product.slug || product.id,
    basePrice: Number(product.basePrice),
    transferDiscountPercent: Number(product.transferDiscountPercent ?? 15),
    stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
  };

  (cleanProduct as any).isActive = true;

  if (index >= 0) {
    store.products[index] = cleanProduct;
  } else {
    store.products.unshift(cleanProduct);
  }

  saveStore(store);
  return cleanProduct;
}

export function deleteLocalProduct(id: string): void {
  const store = loadStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index >= 0) {
    // Soft delete para mantener integridad referencial
    (store.products[index] as any).isActive = false;
    saveStore(store);
  }
}

// ---------------------------------------------------------------------------
// OPERACIONES DE PEDIDOS Y VENTAS (LOCAL STORE)
// ---------------------------------------------------------------------------

export function getLocalOrders(): Order[] {
  const store = loadStore();
  return store.orders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getLocalOrderByIdAndToken(
  orderId: string,
  token?: string | null,
  isAdmin: boolean = false
): Order | null {
  const store = loadStore();
  const found = store.orders.find((o) => o.id === orderId);
  if (!found) return null;

  if (isAdmin) return found;

  if (!token || !found.accessToken) return null;

  const hashA = crypto.createHash('sha256').update(String(token)).digest();
  const hashB = crypto.createHash('sha256').update(String(found.accessToken)).digest();
  if (crypto.timingSafeEqual(hashA, hashB)) {
    return found;
  }
  return null;
}

export function createValidatedLocalOrder(
  payload: CreateOrderPayload
): { order: Order; accessToken: string; deduplicated: boolean } {
  const store = loadStore();

  // 1. Idempotencia
  const existing = store.orders.find((o) => o.idempotencyKey === payload.idempotencyKey);
  if (existing) {
    return {
      order: existing,
      accessToken: existing.accessToken || '',
      deduplicated: true,
    };
  }

  // 2. Validación de Stock
  const qtyByProduct = new Map<string, number>();
  for (const item of payload.items) {
    qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) || 0) + item.quantity);
  }

  for (const [pid, requestedQty] of qtyByProduct.entries()) {
    const prod = store.products.find((p) => p.id === pid && (p as any).isActive !== false);
    if (!prod) {
      throw new OrderBusinessError(`El producto con ID ${pid} ya no está disponible.`, 404);
    }
    if (prod.stock < requestedQty) {
      throw new OrderBusinessError(
        `Stock insuficiente para "${prod.name}". Solicitado: ${requestedQty}, Disponible: ${prod.stock}.`,
        409
      );
    }
  }

  // 3. Recálculo server-side
  const validatedItems: CartItem[] = [];
  let subtotal = 0;
  let transferDiscount = 0;

  for (const item of payload.items) {
    const p = store.products.find((prod) => prod.id === item.productId)!;
    const variation = p.variations.find((v) => v.name === item.variationName);
    const priceMod = variation ? variation.priceModifier : 0;
    const unitPrice = Math.max(1, p.basePrice + priceMod);
    const itemSubtotal = unitPrice * item.quantity;
    subtotal += itemSubtotal;

    const discountPct = p.transferDiscountPercent ?? 15;
    const unitTransfer = Math.round(unitPrice * (1 - discountPct / 100));
    const lineTransfer = unitTransfer * item.quantity;
    const lineDiscount = itemSubtotal - lineTransfer;
    transferDiscount += lineDiscount;

    validatedItems.push({
      id: `${p.id}-${item.variationName}${item.fabric ? `-${item.fabric}` : ''}`,
      productId: p.id,
      product: p,
      variationName: item.variationName,
      fabric: item.fabric,
      quantity: item.quantity,
      unitPrice,
      subtotal: itemSubtotal,
    });
  }

  const isShowroom = payload.deliveryMethod === 'showroom';
  const isSanJuan = isSanJuanPostalCodeServer(payload.postalCode);

  let shippingOriginal = 0;
  let shippingDiscount = 0;
  let shippingFinal = 0;

  if (isShowroom) {
    shippingOriginal = 0;
    shippingDiscount = 0;
    shippingFinal = 0;
  } else if (isSanJuan) {
    shippingOriginal = Math.round(subtotal * 0.1);
    shippingDiscount = shippingOriginal;
    shippingFinal = 0;
  } else {
    shippingOriginal = Math.round(subtotal * 0.15);
    shippingDiscount = 0;
    shippingFinal = shippingOriginal;
  }

  const isTransfer = payload.paymentMethod === 'transferencia';
  const finalTransferDiscount = isTransfer ? transferDiscount : 0;
  const total = subtotal + shippingFinal - finalTransferDiscount;

  // 4. Descontar stock
  for (const [pid, requestedQty] of qtyByProduct.entries()) {
    const prod = store.products.find((p) => p.id === pid)!;
    prod.stock = Math.max(0, prod.stock - requestedQty);
  }

  const orderId = `BF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const accessToken = crypto.randomBytes(16).toString('hex');
  const initialStatus: OrderStatus = isTransfer ? 'PENDIENTE_COMPROBANTE' : 'PENDIENTE_PAGO';

  const newOrder: Order = {
    id: orderId,
    date: new Date().toISOString(),
    customerName: payload.customerName.trim(),
    customerEmail: payload.customerEmail.trim(),
    customerPhone: payload.customerPhone.trim(),
    customerDni: payload.customerDni?.trim() || undefined,
    deliveryMethod: payload.deliveryMethod,
    postalCode: payload.postalCode.trim(),
    address: isShowroom ? undefined : payload.address?.trim() || undefined,
    city: isShowroom ? 'Villa Krause' : payload.city.trim(),
    province: isShowroom ? 'San Juan' : payload.province.trim(),
    notes: payload.notes?.trim() || undefined,
    paymentMethod: payload.paymentMethod,
    items: validatedItems,
    subtotal,
    shippingOriginal,
    shippingDiscount,
    shippingFinal,
    transferDiscount: finalTransferDiscount,
    total,
    installments: payload.paymentMethod === 'credito' ? payload.installments || 1 : undefined,
    status: initialStatus,
    accessToken,
    idempotencyKey: payload.idempotencyKey,
  };

  store.orders.unshift(newOrder);
  saveStore(store);

  return {
    order: newOrder,
    accessToken,
    deduplicated: false,
  };
}

export function updateLocalOrderStatus(orderId: string, status: OrderStatus): Order {
  const store = loadStore();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order) {
    throw new Error(`Pedido #${orderId} no encontrado`);
  }

  const prevStatus = order.status;
  order.status = status;

  // Si pasa a CANCELADO, restauramos stock
  if (status === 'CANCELADO' && prevStatus !== 'CANCELADO') {
    for (const item of order.items) {
      const prod = store.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock += item.quantity;
      }
    }
  } else if (prevStatus === 'CANCELADO' && status !== 'CANCELADO') {
    // Si se reactiva, descontamos stock
    for (const item of order.items) {
      const prod = store.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }
  }

  saveStore(store);
  return order;
}

// ---------------------------------------------------------------------------
// OPERACIONES DE CONSULTAS WEB (LOCAL STORE)
// ---------------------------------------------------------------------------

export function getLocalInquiries(): CustomerInquiry[] {
  const store = loadStore();
  return store.inquiries.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createLocalInquiry(
  name: string,
  phone: string,
  subject: string,
  message: string
): CustomerInquiry {
  const store = loadStore();
  const newInq: CustomerInquiry = {
    id: store.inquiries.length + 1,
    name: name.trim(),
    phone: phone.trim(),
    subject: subject.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
  };
  store.inquiries.unshift(newInq);
  saveStore(store);
  return newInq;
}
