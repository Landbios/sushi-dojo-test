import { Product, Order, OrderEvent, Coupon } from '@/types';

// In-memory persistence across reloads in dev mode
const globalForDb = globalThis as unknown as {
  orders: Order[];
  events: OrderEvent[];
  idempotencyKeys: Set<string>;
};

const orders = globalForDb.orders || [];
const events = globalForDb.events || [];
const idempotencyKeys = globalForDb.idempotencyKeys || new Set<string>();

if (process.env.NODE_ENV !== 'production') {
  globalForDb.orders = orders;
  globalForDb.events = events;
  globalForDb.idempotencyKeys = idempotencyKeys;
}

const products: Product[] = [
  {
    id: 'poke-1',
    name: 'Classic Salmon Poke',
    description: 'Fresh salmon with avocado, edamame, and our special house sauce.',
    priceCents: 1450,
    imageUrl: 'https://picsum.photos/seed/salmon/400/300',
    modifierGroups: [
      {
        id: 'protein',
        name: 'Protein',
        type: 'protein',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'extra-salmon', name: 'Extra Salmon', priceCents: 300 },
          { id: 'tuna', name: 'Tuna Substitute', priceCents: 0 },
        ]
      },
      {
        id: 'toppings',
        name: 'Toppings',
        type: 'topping',
        required: false,
        maxSelections: 3,
        options: [
          { id: 'avocado', name: 'Avocado', priceCents: 150 },
          { id: 'edamame', name: 'Edamame', priceCents: 50 },
          { id: 'ginger', name: 'Ginger', priceCents: 0 },
        ]
      },
      {
        id: 'sauce',
        name: 'Sauce',
        type: 'sauce',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'spicy-mayo', name: 'Spicy Mayo', priceCents: 0 },
          { id: 'classic-shoyu', name: 'Classic Shoyu', priceCents: 0 },
        ]
      }
    ]
  },
  {
    id: 'roll-1',
    name: 'Dragon Roll',
    description: 'Tempura shrimp, cucumber, topped with avocado and unagi sauce.',
    priceCents: 1600,
    imageUrl: 'https://picsum.photos/seed/dragon/400/300',
    modifierGroups: [
      {
        id: 'protein',
        name: 'Protein',
        type: 'protein',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'shrimp', name: 'Tempura Shrimp', priceCents: 0 },
          { id: 'crab', name: 'Real Crab', priceCents: 400 },
        ]
      },
      {
        id: 'sauce',
        name: 'Extra Sauce',
        type: 'sauce',
        required: false,
        maxSelections: 2,
        options: [
          { id: 'eel-sauce', name: 'Eel Sauce', priceCents: 50 },
          { id: 'wasabi-mayo', name: 'Wasabi Mayo', priceCents: 50 },
        ]
      }
    ]
  },
  { id: 'sushi-1', name: 'Nigiri Combo', description: 'Assorted 8 pieces of premium nigiri.', priceCents: 2200, imageUrl: 'https://picsum.photos/seed/nigiri/400/300' },
  { id: 'sushi-2', name: 'Maki Mix', description: 'Assorted 12 pieces of fresh maki rolls.', priceCents: 1850, imageUrl: 'https://picsum.photos/seed/maki/400/300' },
  { id: 'side-1', name: 'Miso Soup', description: 'Traditional Japanese soup with tofu and seaweed.', priceCents: 450, imageUrl: 'https://picsum.photos/seed/miso/400/300' },
  { id: 'side-2', name: 'Gyoza', description: 'Pan-fried pork and vegetable dumplings (6pcs).', priceCents: 800, imageUrl: 'https://picsum.photos/seed/gyoza/400/300' },
  { id: 'drink-1', name: 'Green Tea', description: 'Hot premium Japanese green tea.', priceCents: 350, imageUrl: 'https://picsum.photos/seed/tea/400/300' }
];

const coupons: Coupon[] = [
  { id: 'c-1', code: 'OFF10', discountType: 'PERCENTAGE', discountValue: 10 },
  { id: 'c-2', code: 'SUSHI5', discountType: 'FIXED', discountValue: 500, minSubtotalCents: 2000 }
];

export const db = {
  getProducts: () => products,
  getProduct: (id: string) => products.find(p => p.id === id),
  getCoupons: () => coupons,
  getCoupon: (code: string) => coupons.find(c => c.code === code.toUpperCase()),
  
  saveOrder: (order: Order) => {
    orders.push(order);
    return order;
  },
  
  getOrder: (id: string) => orders.find(o => o.id === id),
  
  appendEvent: (event: OrderEvent) => {
    events.push(event);
    return event;
  },
  
  getTimeline: (orderId: string, page: number = 1, pageSize: number = 50) => {
    const filtered = events
      .filter(e => e.orderId === orderId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  },
  
  checkIdempotency: (key: string) => {
    if (idempotencyKeys.has(key)) return true;
    idempotencyKeys.add(key);
    return false;
  }
};
