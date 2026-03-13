export type ModifierType = 'protein' | 'topping' | 'sauce';

export interface ModifierOption {
  id: string;
  name: string;
  priceCents: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  type: ModifierType;
  required: boolean;
  maxSelections?: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  modifierGroups?: ModifierGroup[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedModifiers: Record<string, string[]>; // groupId -> optionId[]
  comment?: string;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'BEING_DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: CartItem[];
  subtotalCents: number;
  discountCents: number;
  couponCode?: string;
  taxCents: number;
  serviceFeeCents: number;
  totalCents: number;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number; // Percentage (e.g. 10) or Cents (e.g. 500)
  minSubtotalCents?: number;
}

export type EventType =
  | 'CART_ITEM_ADDED'
  | 'CART_ITEM_UPDATED'
  | 'CART_ITEM_REMOVED'
  | 'COUPON_APPLIED'
  | 'PRICING_CALCULATED'
  | 'ORDER_PLACED'
  | 'ORDER_STATUS_CHANGED'
  | 'VALIDATION_FAILED';

export interface OrderEvent {
  eventId: string;
  timestamp: string;
  orderId: string;
  userId: string;
  type: EventType;
  source: 'web' | 'api' | 'worker';
  correlationId: string;
  payload: Record<string, unknown>;
}
