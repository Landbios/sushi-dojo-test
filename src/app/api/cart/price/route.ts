import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatePricing } from '@/lib/pricing';
import { createEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, couponCode, userId } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing items' }, { status: 400 });
    }

    const products = db.getProducts();
    const coupon = couponCode ? db.getCoupon(couponCode) : undefined;
    
    const pricing = calculatePricing(items, products, coupon);

    // Audit Event
    const event = createEvent(
      'cart-session', // Temporary ID before order creation
      'PRICING_CALCULATED',
      { itemsCount: items.length, couponCode, pricing },
      userId || 'user-123'
    );
    db.appendEvent(event);

    return NextResponse.json({
      ...pricing,
      couponApplied: !!coupon,
      couponCode: coupon?.code
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Payload size exceeds 16KB limit') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Pricing calculation failed', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
