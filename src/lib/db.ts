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
    id: 'roll-1',
    name: 'Philadelphia Deluxe',
    description: 'Creamy Philadelphia cheese, avocado, and cucumber wrapped in fresh salmon. Customize your experience with premium modifiers.',
    priceCents: 575,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=400&h=400&fit=crop',
    modifierGroups: [
      {
        id: 'protein-1',
        name: 'Protein',
        type: 'protein',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'steamed-shrimp', name: 'Steamed Shrimp', priceCents: 150 },
          { id: 'smoked-salmon', name: 'Smoked Salmon', priceCents: 200 },
          { id: 'tuna-tartar', name: 'Tuna Tartar', priceCents: 180 },
        ]
      },
      {
        id: 'toppings-1',
        name: 'Toppings',
        type: 'topping',
        required: false,
        maxSelections: 3,
        options: [
          { id: 'avocado-extra', name: 'Extra Avocado', priceCents: 80 },
          { id: 'tempura-flakes', name: 'Tempura Flakes', priceCents: 50 },
          { id: 'tobiko', name: 'Flying Fish Roe', priceCents: 120 },
        ]
      },
      {
        id: 'sauces-1',
        name: 'Sauces',
        type: 'sauce',
        required: false,
        maxSelections: 2,
        options: [
          { id: 'unagi-sauce', name: 'Unagi Sauce', priceCents: 40 },
          { id: 'spicy-mayo-sauce', name: 'Spicy Mayo', priceCents: 40 },
          { id: 'ponzu', name: 'Ponzu Special', priceCents: 50 },
        ]
      }
    ]
  },
  {
    id: 'roll-2',
    name: 'Dragon King Roll',
    description: 'A majestic creation featuring eel and cucumber, draped with avocado and mango. A true masterpiece.',
    priceCents: 850,
    imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=400&h=400&fit=crop',
    modifierGroups: [
      {
        id: 'protein-2',
        name: 'Protein Base',
        type: 'protein',
        required: true,
        maxSelections: 1,
        options: [
          { id: 'eel-base', name: 'BBQ Eel', priceCents: 0 },
          { id: 'crab-base', name: 'Snow Crab', priceCents: 100 },
        ]
      },
      {
        id: 'toppings-2',
        name: 'Toppings',
        type: 'topping',
        required: false,
        maxSelections: 2,
        options: [
          { id: 'mango-extra', name: 'Extra Mango', priceCents: 60 },
          { id: 'cucumber-extra', name: 'Extra Cucumber', priceCents: 30 },
          { id: 'gold-flakes', name: 'Gold Flakes', priceCents: 500 },
        ]
      },
      {
        id: 'sauces-2',
        name: 'Sauces',
        type: 'sauce',
        required: false,
        maxSelections: 2,
        options: [
          { id: 'eel-sauce-extra', name: 'Extra Eel Sauce', priceCents: 50 },
          { id: 'mango-puree', name: 'Mango Puree', priceCents: 60 },
        ]
      }
    ]
  },
  {
    id: 'roll-3',
    name: 'Yuzu Special',
    description: 'A refreshing citrus twist with yellowtail, scallions, and yuzu zest.',
    priceCents: 793,
    imageUrl: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?q=80&w=400&h=400&fit=crop',
  },
  {
    id: 'roll-4',
    name: 'Ebispirng Roll',
    description: 'Crispy tempura shrimp with spring vegetables and sesame seeds.',
    priceCents: 505,
    imageUrl: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=400&h=400&fit=crop',
  },
  {
    id: 'roll-5',
    name: 'Geisha Roll',
    description: 'Delicate roll with tuna, crab meat, and a hint of sweet eel sauce.',
    priceCents: 670,
    imageUrl: 'https://images.unsplash.com/photo-1563612116625-3012372fccce?q=80&w=400&h=400&fit=crop',
  },
  {
    id: 'roll-6',
    name: 'Philadelphia Black',
    description: 'Premium black rice roll with salmon, avocado, and truffle oil.',
    priceCents: 834,
    imageUrl: '/images/philadelphia-black.png',
  },
  {
    id: 'roll-7',
    name: 'Hokkaido Roll',
    description: 'Fresh scallops from Hokkaido with spicy mayo and cucumber.',
    priceCents: 813,
    imageUrl: '/images/hokkaido-scallop.png',
  }
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
  
  getOrders: (userId: string = 'user-123') => {
    return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
