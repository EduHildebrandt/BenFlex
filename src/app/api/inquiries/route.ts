import { NextRequest, NextResponse } from 'next/server';
import { createDbInquiry, getDbInquiries } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { validateInquiryInput } from '@/lib/validation';

export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const inquiries = await getDbInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error('[API /inquiries GET] Error consultando mensajes:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudieron cargar las consultas web.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`inquiries-create:${ip}`, 8, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Recibimos varias consultas seguidas desde tu conexión. Intentá en unos minutos.',
      },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const rawBody = await req.json();
    const validation = validateInquiryInput(rawBody);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const inquiry = await createDbInquiry(validation.data);
    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error('[API /inquiries POST] Error registrando consulta:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo enviar tu consulta. Probá vía WhatsApp directo.' },
      { status: 500 }
    );
  }
}
