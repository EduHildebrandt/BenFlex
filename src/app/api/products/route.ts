import { NextRequest, NextResponse } from 'next/server';
import { getDbProducts, upsertDbProduct, deleteDbProduct } from '@/lib/db';
import { BENFLEX_PRODUCTS } from '@/data/products';

export async function GET() {
  try {
    const products = await getDbProducts();
    return NextResponse.json({
      success: true,
      source: 'supabase_postgres',
      products: products.length > 0 ? products : BENFLEX_PRODUCTS,
    });
  } catch (error: any) {
    console.error('Fallback to static products due to DB error:', error.message);
    return NextResponse.json({
      success: true,
      source: 'local_fallback',
      products: BENFLEX_PRODUCTS,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const product = await req.json();
    const saved = await upsertDbProduct(product);
    return NextResponse.json({
      success: true,
      source: 'supabase_postgres',
      product: saved,
    });
  } catch (error: any) {
    console.error('Error upserting product in Supabase:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await deleteDbProduct(id);
    return NextResponse.json({
      success: true,
      source: 'supabase_postgres',
    });
  } catch (error: any) {
    console.error('Error deleting product in Supabase:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
