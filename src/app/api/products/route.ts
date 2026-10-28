import { NextResponse } from 'next/server';
import { getDbProducts } from '@/lib/db';
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
