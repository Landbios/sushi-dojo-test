import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatePricing } from '@/lib/pricing';
import { createEvent } from '@/lib/audit';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '@/types';

export async function POST(req: Request) {
  try {
    const idempotencyKey = req.headers.get('Idempotency-Key');
    if (!idempotencyKey) {
      return NextResponse.json({ error: 'Missing Idempotency-Key' }, { status: 400 });
    }

    // Check Idempotency
    if (db.checkIdempotency(idempotencyKey)) {
      // In a real app, you'd return the existing order's response
      return NextResponse.json({ error: 'Conflict: Duplicate request' }, { status: 409 });
    }

    const body = await req.json();
    const { items, couponCode, userId } = body;

    const products = db.getProducts();
    const coupon = couponCode ? db.getCoupon(couponCode) : undefined;
    const pricing = calculatePricing(items, products, coupon);

    const orderId = uuidv4();
    const order: Order = {
      id: orderId,
      userId: userId || 'user-123',
      status: 'PENDING',
      items,
      subtotalCents: pricing.subtotalCents,
      discountCents: pricing.discountCents,
      couponCode,
      taxCents: pricing.taxCents,
      serviceFeeCents: pricing.serviceFeeCents,
      totalCents: pricing.totalCents,
      createdAt: new Date().toISOString(),
    };

    // Save Order
    db.saveOrder(order);

    // Initial Event
    const orderPlacedEvent = createEvent(
      orderId,
      'ORDER_PLACED',
      { orderId, totalCents: order.totalCents, idempotencyKey },
      order.userId
    );
    db.appendEvent(orderPlacedEvent);

    // Return 202 Accepted as required
    return NextResponse.json({ orderId, status: 'ACCEPTED' }, { status: 202 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Payload size exceeds 16KB limit') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Order creation failed', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
