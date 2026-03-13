import { EventType, OrderEvent } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const MAX_PAYLOAD_SIZE = 16 * 1024; // 16KB

export const maskPII = (text: string): string => {
  // Simple regex for email and phone numbers
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  
  return text
    .replace(emailRegex, (match) => match[0] + '****@' + match.split('@')[1])
    .replace(phoneRegex, '***-***-****');
};

export const createEvent = (
  orderId: string,
  type: EventType,
  payload: Record<string, unknown>,
  userId: string = 'user-123',
  correlationId: string = uuidv4()
): OrderEvent => {
  const event: OrderEvent = {
    eventId: uuidv4(),
    timestamp: new Date().toISOString(),
    orderId,
    userId,
    type,
    source: 'api',
    correlationId,
    payload,
  };

  // Size check
  const payloadSize = Buffer.byteLength(JSON.stringify(payload));
  if (payloadSize > MAX_PAYLOAD_SIZE) {
    throw new Error('Payload size exceeds 16KB limit');
  }

  // Mask PII in audit logs
  console.log(`[AUDIT LOG] ${event.timestamp} | ${event.type} | Correlation: ${event.correlationId} | Payload: ${maskPII(JSON.stringify(payload))}`);

  return event;
};
