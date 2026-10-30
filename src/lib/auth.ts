import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export type AdminRole = 'owner' | 'developer';

export interface AdminSessionPayload {
  role: AdminRole;
  iat: number;
  exp: number;
}

export const ADMIN_COOKIE_NAME = 'benflex_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 horas

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 24) {
    return secret;
  }
  // Fallback derivado en entorno local si aún no se definió ADMIN_SESSION_SECRET explícito
  const fallbackSeed =
    process.env.DATABASE_URL || 'benflex-local-dev-fallback-secret-change-in-prod';
  return crypto.createHash('sha256').update(`benflex-session::${fallbackSeed}`).digest('hex');
}

export function safeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function verifyAdminPassword(passwordInput: string): AdminRole | null {
  const clean = passwordInput.trim();
  if (!clean) return null;

  const ownerKey = process.env.ADMIN_OWNER_KEY;
  const devKey = process.env.ADMIN_DEV_KEY;

  if (!ownerKey && !devKey) {
    console.error('SECURITY WARNING: ADMIN_OWNER_KEY / ADMIN_DEV_KEY are not configured in environment.');
    return null;
  }

  if (ownerKey && safeCompareStrings(clean, ownerKey)) {
    return 'owner';
  }
  if (devKey && safeCompareStrings(clean, devKey)) {
    return 'developer';
  }
  return null;
}

export function createAdminSessionToken(role: AdminRole): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null): AdminSessionPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');

  if (!safeCompareStrings(providedSig, expectedSig)) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as AdminSessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!decoded.exp || decoded.exp < now) {
      return null;
    }
    if (decoded.role !== 'owner' && decoded.role !== 'developer') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function getAdminSessionFromRequest(req: NextRequest): AdminSessionPayload | null {
  const cookieVal = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(cookieVal);
}

export function requireAdmin(
  req: NextRequest
): { session: AdminSessionPayload; errorResponse?: never } | { session?: never; errorResponse: NextResponse } {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'No autorizado. Se requiere sesión administrativa activa.',
        },
        { status: 401 }
      ),
    };
  }
  return { session };
}

export function applyAdminSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}
