import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const orders = await db.getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch all orders', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
