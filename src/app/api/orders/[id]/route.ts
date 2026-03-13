import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createEvent } from '@/lib/audit';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await db.getOrder(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, workerId } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    const order = await db.getOrder(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;
    await db.updateOrderStatus(id, status);

    // Initial Event
    const statusChangedEvent = createEvent(
      id,
      'ORDER_STATUS_CHANGED',
      { oldStatus, newStatus: status, updatedAt: new Date().toISOString() },
      workerId || 'worker-001',
      undefined,
      'worker'
    );
    await db.appendEvent(statusChangedEvent);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Failed to update order status', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
