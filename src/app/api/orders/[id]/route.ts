import { NextRequest, NextResponse } from 'next/server';
import { getDbOrderByIdAndToken } from '@/lib/db';
import { getAdminSessionFromRequest } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`order-lookup:${ip}`, 30, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: 'Demasiadas consultas seguidas.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const { id } = await params;
    const orderId = (id || '').trim();
    if (!orderId || orderId.length > 40) {
      return NextResponse.json(
        { success: false, error: 'Código de pedido inválido.' },
        { status: 400 }
      );
    }

    const adminSession = getAdminSessionFromRequest(req);
    const token = req.nextUrl.searchParams.get('token');

    const order = await getDbOrderByIdAndToken(orderId, token, Boolean(adminSession));
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se encontró el pedido o el token de acceso no es válido.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[API /orders/[id] GET] Error consultando pedido:', error);
    return NextResponse.json(
      { success: false, error: 'Error al consultar la confirmación del pedido.' },
      { status: 500 }
    );
  }
}
