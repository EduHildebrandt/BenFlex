import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminSessionFromRequest,
  verifyAdminPassword,
  createAdminSessionToken,
  applyAdminSessionCookie,
  clearAdminSessionCookie,
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(req: NextRequest) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false, role: null }, { status: 200 });
  }
  return NextResponse.json({
    authenticated: true,
    role: session.role,
    expiresAt: session.exp * 1000,
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Demasiados intentos fallidos. Esperá ${Math.ceil(
          rl.retryAfterSeconds / 60
        )} min antes de reintentar.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await req.json();
    const password = typeof body?.password === 'string' ? body.password : '';
    const role = verifyAdminPassword(password);

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          error: 'Clave de acceso incorrecta. Solo autorizado para Dueño o Desarrollador.',
        },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(role);
    const res = NextResponse.json({ success: true, role });
    applyAdminSessionCookie(res, token);
    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Solicitud de inicio de sesión inválida.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  clearAdminSessionCookie(res);
  return res;
}
