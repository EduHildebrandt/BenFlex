import { NextRequest, NextResponse } from 'next/server';
import { lookupDbOrder, revokeDbOrder } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`order-lookup-revocation:${ip}`, 25, 10 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas consultas seguidas. Por favor esperá unos minutos.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Cuerpo de la solicitud inválido o ausente.' },
      { status: 400 }
    );
  }

  try {
    const action = body?.action || 'lookup';
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
    const contact = typeof body?.contact === 'string' ? body.contact.trim() : '';
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';

    if (!orderId || orderId.length < 3 || orderId.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Por favor ingresá un número de pedido válido (ej: BF-XXXX).' },
        { status: 400 }
      );
    }

    if (!contact || contact.length < 4 || contact.length > 120) {
      return NextResponse.json(
        {
          success: false,
          error: 'Por favor ingresá el email o teléfono registrado al realizar la compra.',
        },
        { status: 400 }
      );
    }

    if (action === 'revoke') {
      const result = await revokeDbOrder(orderId, contact, reason);
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || 'No se pudo procesar la solicitud de revocación.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        action: 'revoke',
        revocationCode: result.revocationCode,
        order: {
          id: result.order.id,
          date: result.order.date,
          status: result.order.status,
          customerName: result.order.customerName,
          total: result.order.total,
        },
      });
    }

    // Default: lookup
    const lookup = await lookupDbOrder(orderId, contact);
    if (!lookup) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No encontramos un pedido con ese código y dato de contacto. Verificá los datos ingresados.',
        },
        { status: 404 }
      );
    }

    // Retornamos solo datos pertinentes sin exponer secretos ni tokens
    return NextResponse.json({
      success: true,
      action: 'lookup',
      daysRemaining: lookup.daysRemaining,
      canRevoke: lookup.canRevoke,
      order: {
        id: lookup.order.id,
        date: lookup.order.date,
        status: lookup.order.status,
        customerName: lookup.order.customerName,
        customerPhone: lookup.order.customerPhone,
        customerEmail: lookup.order.customerEmail,
        deliveryMethod: lookup.order.deliveryMethod,
        paymentMethod: lookup.order.paymentMethod,
        total: lookup.order.total,
        items: lookup.order.items.map((i) => ({
          name: i.product?.name || 'Producto',
          variationName: i.variationName,
          fabric: i.fabric,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          subtotal: i.subtotal,
        })),
      },
    });
  } catch (error) {
    console.error('[API /orders/lookup POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ocurrió un error al procesar tu solicitud.' },
      { status: 500 }
    );
  }
}
