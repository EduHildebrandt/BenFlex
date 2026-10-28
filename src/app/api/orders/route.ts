import { NextRequest, NextResponse } from 'next/server';
import { getDbOrders, createDbOrder, updateDbOrderStatus } from '@/lib/db';

export async function GET() {
  try {
    const orders = await getDbOrders();
    return NextResponse.json({
      success: true,
      source: 'supabase_postgres',
      orders,
    });
  } catch (error: any) {
    console.error('Error fetching orders from Supabase:', error.message);
    return NextResponse.json(
      { success: false, error: error.message, orders: [] },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = await createDbOrder(body);
    return NextResponse.json({
      success: true,
      source: 'supabase_postgres',
      order: saved,
    });
  } catch (error: any) {
    console.error('Error creating order in Supabase:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json();
    await updateDbOrderStatus(orderId, status);
    return NextResponse.json({
      success: true,
      source: 'supabase_postgres',
    });
  } catch (error: any) {
    console.error('Error updating order status in Supabase:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
