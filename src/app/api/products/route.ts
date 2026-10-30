import { NextRequest, NextResponse } from 'next/server';
import { getDbProducts, upsertDbProduct, deleteDbProduct } from '@/lib/db';
import { BENFLEX_PRODUCTS } from '@/data/products';
import { requireAdmin } from '@/lib/auth';
import { validateProductInput } from '@/lib/validation';

export async function GET() {
  try {
    const products = await getDbProducts();
    return NextResponse.json({ source: 'supabase', products });
  } catch (error) {
    console.error('[API /products GET] Fallback local activado:', error);
    return NextResponse.json(
      {
        source: 'fallback',
        products: BENFLEX_PRODUCTS,
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const rawBody = await req.json();
    const validation = validateProductInput(rawBody);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const saved = await upsertDbProduct(validation.data);
    return NextResponse.json({ success: true, product: saved });
  } catch (error) {
    console.error('[API /products POST] Error guardando producto:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo guardar el producto en la base de datos.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = (searchParams.get('id') || '').trim();
    if (!id || !/^[a-z0-9-]+$/.test(id)) {
      return NextResponse.json(
        { success: false, error: 'Identificador de producto inválido.' },
        { status: 400 }
      );
    }

    await deleteDbProduct(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[API /products DELETE] Error eliminando producto:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo ocultar el producto en la base de datos.' },
      { status: 500 }
    );
  }
}
