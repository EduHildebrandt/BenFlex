export type ProductCategory =
  | 'colchones-sommiers'
  | 'sillones-sofas'
  | 'almohadas-confort'
  | 'combos-benflex';

export type ProductTechnology =
  | 'alta_densidad'
  | 'resortes_pocket'
  | 'viscoelastica'
  | 'espuma_inteligente'
  | 'fibra_siliconada'
  | 'anti_desgarro';

export type ProductMeasure =
  | '1 Plaza (80x190)'
  | '1½ Plaza (90x190)'
  | '2 Plazas (140x190)'
  | 'Queen (160x200)'
  | 'King (200x200)'
  | '2 Cuerpos'
  | '3 Cuerpos'
  | 'Esquinero L'
  | 'Estándar (70x40)'
  | 'Cervical Ergonómica';

export interface ProductVariation {
  name: string;
  priceModifier: number;
  measure?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  categoryLabel: string;
  technology: ProductTechnology;
  technologyLabel: string;
  measure: string;
  firmness?: 'Suave' | 'Media' | 'Firme' | 'Extra Firme';
  basePrice: number; // Precio de lista en cuotas
  transferDiscountPercent: number; // Por defecto 15%
  variations: ProductVariation[];
  features: string[];
  fabrics?: string[]; // Telas disponibles para sillones o fundas
  image: string;
  badge?: string;
  stock: number;
  weightSupport?: string; // Ej: "Hasta 120 kg por plaza"
  warranty?: string; // Ej: "5 años de garantía de fábrica"
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  id: string; // productId + variationName + fabric
  productId: string;
  product: Product;
  variationName: string;
  fabric?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface LocationState {
  postalCode: string;
  city: string;
  province: string;
  isSanJuan: boolean;
}

export type PaymentMethod =
  | 'transferencia'
  | 'mercadopago'
  | 'credito'
  | 'debito';

export type DeliveryMethod =
  | 'showroom' // Retiro gratis en sucursal Villa Krause, San Juan
  | 'delivery'; // Envío a domicilio (bonificado en San Juan, a cotizar resto del país)

export type OrderStatus =
  | 'PENDIENTE_COMPROBANTE'
  | 'PENDIENTE_PAGO'
  | 'APROBADO'
  | 'EN_PREPARACION'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni?: string;
  deliveryMethod: DeliveryMethod;
  postalCode: string;
  address?: string;
  city: string;
  province: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  shippingOriginal: number;
  shippingDiscount: number;
  shippingFinal: number;
  transferDiscount: number;
  total: number;
  installments?: number;
  status: OrderStatus;
  accessToken?: string;
  idempotencyKey?: string;
}

export interface CreateOrderPayload {
  idempotencyKey: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDni?: string;
  deliveryMethod: DeliveryMethod;
  postalCode: string;
  address?: string;
  city: string;
  province: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  installments?: number;
  items: Array<{
    productId: string;
    variationName: string;
    fabric?: string;
    quantity: number;
  }>;
}

export interface CustomerInquiry {
  id: number;
  name: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface BenFlexBankData {
  bankName: string;
  accountType: string;
  holder: string;
  cuit: string;
  cbu: string;
  alias: string;
}

export const BENFLEX_BANK_INFO: BenFlexBankData = {
  bankName: 'Banco Santander Argentina',
  accountType: 'Cuenta Corriente Especial',
  holder: 'BenFlex Confort y Descanso S.R.L.',
  cuit: '30-71842918-6',
  cbu: '0720194820000001239845',
  alias: 'BENFLEX.DESCANSO.SJ',
};

export const BENFLEX_CONTACT = {
  phone: '+54 9 264 543-9821',
  phoneDisplay: '+54 9 264 543-9821',
  whatsappRaw: '5492645439821',
  email: 'contacto@benflex.com.ar',
  address: 'Castaño Oeste y Conector Sur',
  city: 'Villa Krause',
  province: 'San Juan',
  postalCode: '5425',
  schedule: 'Lunes a Sábado: 09:00 a 13:00 y 17:00 a 21:00 hs',
  googleMapsUrl: 'https://maps.google.com/?q=Villa+Krause+San+Juan+Argentina',
  instagramHandle: '@benflex_fabrica',
  instagramUrl: 'https://www.instagram.com/benflex_fabrica/',
};
