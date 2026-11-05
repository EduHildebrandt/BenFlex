import { NextRequest, NextResponse } from 'next/server';
import { getMercadoPagoPayment, isMercadoPagoConfigured } from '@/lib/mercadopago';
import { updateDbOrderStatus } from '@/lib/db';

/**
 * Webhook Receptor de Notificaciones IPN de Mercado Pago
 * POST https://www.benflex.online/api/webhooks/mercadopago
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);

    // 1. Intentar extraer ID del pago desde Query Params
    let paymentId =
      url.searchParams.get('data.id') ||
      url.searchParams.get('id') ||
      url.searchParams.get('data[id]');

    let topic = url.searchParams.get('type') || url.searchParams.get('topic');

    // 2. Intentar extraer desde el cuerpo JSON si no venía en URL
    let body: any = null;
    try {
      body = await req.json();
      if (body) {
        if (!paymentId && body.data?.id) {
          paymentId = String(body.data.id);
        } else if (!paymentId && body.id) {
          paymentId = String(body.id);
        }
        if (!topic && body.type) {
          topic = body.type;
        }
      }
    } catch {
      // Body vacío o no-JSON (típico en algunos pings de prueba)
    }

    console.log(`[Mercado Pago Webhook] Notificación recibida: topic=${topic}, paymentId=${paymentId}`);

    // Si Mercado Pago no está configurado todavía, responder 200 para evitar reintentos infinitos
    if (!isMercadoPagoConfigured()) {
      console.warn('[Mercado Pago Webhook] MERCADOPAGO_ACCESS_TOKEN no configurado en servidor.');
      return NextResponse.json({ received: true, status: 'unconfigured' }, { status: 200 });
    }

    // Si no identificamos un ID de pago, responder 200 (puede ser notificación de merchant_order u otro topic)
    if (!paymentId) {
      return NextResponse.json({ received: true, note: 'no_payment_id' }, { status: 200 });
    }

    // 3. Consultar la API oficial de Mercado Pago para verificar la autenticidad y el estado del pago
    const payment = await getMercadoPagoPayment(paymentId);
    if (!payment) {
      console.warn(`[Mercado Pago Webhook] No se pudo obtener el detalle del pago #${paymentId}`);
      return NextResponse.json({ received: true, note: 'payment_not_found' }, { status: 200 });
    }

    const orderId = (payment.external_reference || '').trim();
    if (!orderId) {
      console.warn(`[Mercado Pago Webhook] El pago #${paymentId} no tiene external_reference vinculado.`);
      return NextResponse.json({ received: true, note: 'no_order_reference' }, { status: 200 });
    }

    // 4. Si el pago fue aprobado, actualizar la orden en PostgreSQL / Local a APROBADO
    if (payment.status === 'approved') {
      console.log(`[Mercado Pago Webhook] ✅ ¡Pago Aprobado! Orden: ${orderId}, Monto: $${payment.transaction_amount}, Pago MP: #${payment.id}`);
      await updateDbOrderStatus(orderId, 'APROBADO');
    } else {
      console.log(`[Mercado Pago Webhook] Pago #${payment.id} para orden ${orderId} en estado: ${payment.status} (${payment.status_detail})`);
    }

    return NextResponse.json({ received: true, orderId, paymentStatus: payment.status }, { status: 200 });
  } catch (err: any) {
    console.error('[Mercado Pago Webhook] Error procesando notificación:', err);
    // Siempre devolver 200 a Mercado Pago para evitar saturación de reintentos
    return NextResponse.json({ received: true, error: err?.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'BenFlex Mercado Pago Webhook Gateway',
    timestamp: new Date().toISOString(),
  });
}
