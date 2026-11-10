import { NextRequest, NextResponse } from 'next/server';
import { getDbOrderByIdAndToken } from '@/lib/db';
import { createMercadoPagoPreference, isMercadoPagoConfigured } from '@/lib/mercadopago';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const accessToken = typeof body.accessToken === 'string' ? body.accessToken.trim() : '';

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Identificador de pedido (orderId) requerido.' },
        { status: 400 }
      );
    }

    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Mercado Pago no está configurado aún en el servidor. Por favor, definí MERCADOPAGO_ACCESS_TOKEN en .env.local.',
          notConfigured: true,
        },
        { status: 503 }
      );
    }

    // Buscar la orden validando token de acceso
    const order = await getDbOrderByIdAndToken(orderId, accessToken, false);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Pedido no encontrado o token de seguridad inválido.' },
        { status: 404 }
      );
    }

    // Determinar la URL base de origen (respetando proxy Nginx)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'www.benflex.online';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const origin = `${proto}://${host}`;

    const prefResult = await createMercadoPagoPreference(order, { origin });

    if (!prefResult.success) {
      return NextResponse.json(
        { success: false, error: prefResult.error || 'No se pudo generar la preferencia en Mercado Pago.' },
        { status: 502 }
      );
    }

    const isSandbox =
      process.env.MERCADOPAGO_SANDBOX === 'true' ||
      (process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim().startsWith('TEST-');
    const initPoint = isSandbox && prefResult.sandboxInitPoint
      ? prefResult.sandboxInitPoint
      : (prefResult.initPoint || prefResult.sandboxInitPoint);

    return NextResponse.json({
      success: true,
      preferenceId: prefResult.preferenceId,
      initPoint,
      sandboxInitPoint: prefResult.sandboxInitPoint,
      isSandbox,
    });
  } catch (err: any) {
    console.error('[API /payments/mercadopago/preference] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor procesando la preferencia de pago.' },
      { status: 500 }
    );
  }
}
