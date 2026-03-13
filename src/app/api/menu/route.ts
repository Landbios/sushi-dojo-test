import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const products = await db.getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch menu', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
