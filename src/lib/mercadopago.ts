import { Order } from '@/types';

/**
 * Módulo de Integración Oficial con la API REST de Mercado Pago
 * Basado en la documentación oficial: https://documenter.getpostman.com/view/15366798/2sAXjKasp4
 */

export function isMercadoPagoConfigured(): boolean {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  return Boolean(
    token &&
      token.trim().length > 10 &&
      !token.includes('YOUR_ACCESS_TOKEN') &&
      !token.includes('pega_aqui_tu_token')
  );
}

export function getMercadoPagoAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado en las variables de entorno.');
  }
  return token.trim();
}

export interface MercadoPagoPreferenceResult {
  success: boolean;
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  error?: string;
}

export interface MercadoPagoPaymentData {
  id: number;
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded' | string;
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
  payment_type_id: string;
  date_approved?: string;
  payer?: {
    email?: string;
    id?: string;
  };
}

/**
 * Crea una preferencia de pago en Mercado Pago Checkout Pro (Preferences API)
 * POST https://api.mercadopago.com/checkout/preferences
 */
export async function createMercadoPagoPreference(
  order: Order,
  options?: { origin?: string }
): Promise<MercadoPagoPreferenceResult> {
  if (!isMercadoPagoConfigured()) {
    return {
      success: false,
      error: 'Mercado Pago no está configurado. Agregá MERCADOPAGO_ACCESS_TOKEN en .env.local',
    };
  }

  const accessToken = getMercadoPagoAccessToken();
  const baseUrl = (
    options?.origin ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.benflex.online'
  ).replace(/\/+$/, '');

  // 1. Mapear los ítems del pedido respetando precios y cantidades exactas
  const items = order.items.map((item, idx) => ({
    id: item.productId || `item-${idx + 1}`,
    title: `${item.product?.name || 'Producto BenFlex'} - ${item.variationName || 'Estándar'}`.slice(0, 120),
    description: `Medida: ${item.variationName || 'Estándar'}${item.fabric ? ` / Tela: ${item.fabric}` : ''}`.slice(0, 200),
    picture_url: item.product?.image || undefined,
    category_id: 'home',
    quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    currency_id: 'ARS',
    unit_price: Math.round(Number(item.unitPrice) || 0),
  }));

  // Si hay costo de flete final facturado, agregarlo como ítem adicional
  if (order.shippingFinal > 0) {
    items.push({
      id: 'shipping-charge',
      title: 'Flete y Envío BenFlex'.slice(0, 120),
      description: `Envío a ${order.city}, ${order.province} (CP ${order.postalCode})`.slice(0, 200),
      picture_url: undefined,
      category_id: 'shipping',
      quantity: 1,
      currency_id: 'ARS',
      unit_price: Math.round(Number(order.shippingFinal)),
    });
  }

  // 2. Extraer nombre y apellido del cliente
  const nameParts = (order.customerName || 'Cliente BenFlex').trim().split(/\s+/);
  const firstName = nameParts[0] || 'Cliente';
  const lastName = nameParts.slice(1).join(' ') || firstName;
  const rawPhone = (order.customerPhone || '').replace(/\D/g, '');

  // 3. URLs de retorno automático
  const tokenParam = order.accessToken ? `&token=${encodeURIComponent(order.accessToken)}` : '';
  const backUrls = {
    success: `${baseUrl}/order-confirmation?id=${encodeURIComponent(order.id)}${tokenParam}&status=approved`,
    failure: `${baseUrl}/order-confirmation?id=${encodeURIComponent(order.id)}${tokenParam}&status=failure`,
    pending: `${baseUrl}/order-confirmation?id=${encodeURIComponent(order.id)}${tokenParam}&status=pending`,
  };

  // 4. Payload de la preferencia de Mercado Pago
  const payload = {
    items,
    payer: {
      name: firstName,
      surname: lastName,
      email: order.customerEmail || 'cliente@benflex.online',
      phone: rawPhone
        ? {
            area_code: rawPhone.length > 8 ? rawPhone.slice(0, rawPhone.length - 8) : '264',
            number: rawPhone.slice(-8),
          }
        : undefined,
      identification: order.customerDni
        ? {
            type: 'DNI',
            number: order.customerDni.replace(/\D/g, ''),
          }
        : undefined,
      address: {
        street_name: order.address || 'Showroom Central BenFlex',
        zip_code: order.postalCode || '5400',
      },
    },
    back_urls: backUrls,
    auto_return: 'approved',
    notification_url: `${baseUrl}/api/webhooks/mercadopago`,
    external_reference: order.id,
    statement_descriptor: 'BENFLEX SAN JUAN',
    metadata: {
      order_id: order.id,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
    },
  };

  try {
    const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'X-Idempotency-Key': `pref-${order.id}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      console.error('[Mercado Pago] Error creando preferencia:', data);
      return {
        success: false,
        error: data.message || data.error || 'Error de comunicación con la pasarela de Mercado Pago.',
      };
    }

    return {
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point,
    };
  } catch (err: any) {
    console.error('[Mercado Pago] Excepción de conexión:', err);
    return {
      success: false,
      error: 'No se pudo contactar a Mercado Pago. Verificá la conexión a Internet o las credenciales.',
    };
  }
}

/**
 * Consulta un pago registrado en Mercado Pago a partir de su ID
 * GET https://api.mercadopago.com/v1/payments/{id}
 */
export async function getMercadoPagoPayment(paymentId: string | number): Promise<MercadoPagoPaymentData | null> {
  if (!isMercadoPagoConfigured()) return null;

  const accessToken = getMercadoPagoAccessToken();
  try {
    const res = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn(`[Mercado Pago Webhook] Pago ${paymentId} no encontrado en la API (status ${res.status})`);
      return null;
    }

    const data = await res.json();
    return {
      id: Number(data.id),
      status: data.status,
      status_detail: data.status_detail,
      external_reference: data.external_reference,
      transaction_amount: Number(data.transaction_amount),
      payment_method_id: data.payment_method_id,
      payment_type_id: data.payment_type_id,
      date_approved: data.date_approved,
      payer: data.payer,
    };
  } catch (err) {
    console.error(`[Mercado Pago Webhook] Error consultando pago ${paymentId}:`, err);
    return null;
  }
}
