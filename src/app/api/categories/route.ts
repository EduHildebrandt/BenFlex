import { NextRequest, NextResponse } from 'next/server';
import {
  getDbCategories,
  upsertDbCategory,
  deleteDbCategory,
  isDbConfigured,
} from '@/lib/db';
import { DEFAULT_CATEGORIES } from '@/lib/localStore';
import { requireAdmin } from '@/lib/auth';
import { validateCategoryInput, slugifyText } from '@/lib/validation';

export async function GET() {
  try {
    const categories = await getDbCategories();
    const source = isDbConfigured() ? 'supabase' : 'local';
    return NextResponse.json({ source, categories });
  } catch (error) {
    console.error('[API /categories GET] Fallback local activado:', error);
    return NextResponse.json(
      {
        source: 'fallback',
        categories: DEFAULT_CATEGORIES,
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
    const validation = validateCategoryInput(rawBody);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const saved = await upsertDbCategory(validation.data);
    const source = isDbConfigured() ? 'supabase' : 'local';
    return NextResponse.json({ success: true, category: saved, source });
  } catch (error) {
    console.error('[API /categories POST] Error guardando categoría:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo guardar la categoría.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = requireAdmin(req);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = slugifyText(searchParams.get('id') || '');
    const deleteProducts = searchParams.get('deleteProducts') === 'true';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Identificador de categoría inválido.' },
        { status: 400 }
      );
    }

    await deleteDbCategory(id, deleteProducts);
    return NextResponse.json({ success: true, deletedId: id, deleteProducts });
  } catch (error) {
    console.error('[API /categories DELETE] Error eliminando categoría:', error);
    return NextResponse.json(
      { success: false, error: 'No se pudo eliminar la categoría.' },
      { status: 500 }
    );
  }
}
