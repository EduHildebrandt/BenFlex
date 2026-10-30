import { NextRequest, NextResponse } from 'next/server';
import {
  getDbOrders,
  createValidatedDbOrder,
  updateDbOrderStatus,
  OrderBusinessError,
} from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { validateCreateOrderPayload, VALID_ORDER_STATUSES } from '@/lib/validation';
import type { OrderStatus } from '@/types';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const orders = await getDbOrders();
    return NextResponse.json({ source: 'supabase', orders });
  } catch (error) {
    console.error('[API /orders GET] Error consultando pedidos:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron recuperar los pedidos.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`orders-create:${ip}`, 15, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Se alcanzó el límite temporal de solicitudes. Intentá nuevamente en unos minutos.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSeconds) },
      }
    );
  }

  try {
    const rawBody = await req.json();
    const validation = validateCreateOrderPayload(rawBody);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const result = await createValidatedDbOrder(validation.data);
    return NextResponse.json(
      {
        success: true,
        order: result.order,
        accessToken: result.accessToken,
        deduplicated: result.deduplicated,
      },
      { status: result.deduplicated ? 200 : 201 }
    );
  } catch (error) {
    if (error instanceof OrderBusinessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('[API /orders POST] Error procesando pedido:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Ocurrió un error al registrar tu pedido. Por favor intentá nuevamente.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await req.json();
    const orderId = typeof body?.orderId === 'string' ? body.orderId.trim() : '';
    const status = body?.status as OrderStatus;

    if (!orderId || !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Identificador de pedido o estado inválido.' },
        { status: 400 }
      );
    }

    const updatedOrder = await updateDbOrderStatus(orderId, status);
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    if (error instanceof OrderBusinessError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('[API /orders PATCH] Error actualizando estado:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo actualizar el estado del pedido.' },
      { status: 500 }
    );
  }
}
