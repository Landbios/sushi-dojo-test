import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createEvent } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, type, payload, userId, correlationId } = body;

    const event = createEvent(
      orderId || 'client-side',
      type,
      payload,
      userId || 'user-123',
      correlationId
    );

    await db.appendEvent(event);

    return NextResponse.json({ success: true, eventId: event.eventId });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Payload size exceeds 16KB limit') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Failed to log event', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
