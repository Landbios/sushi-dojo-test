import { Product, CartItem, Coupon } from '@/types';

export const TAX_RATE = 0.08; // 8%
export const SERVICE_FEE_CENTS = 250; // €2.50 fixed

export interface PricingBreakdown {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  serviceFeeCents: number;
  totalCents: number;
}

export const calculatePricing = (
  items: CartItem[],
  products: Product[],
  coupon?: Coupon
): PricingBreakdown => {
  let subtotalCents = 0;

  items.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return;

    let itemBasePrice = product.priceCents;
    
    // Sum modifiers
    if (product.modifierGroups) {
      product.modifierGroups.forEach((group) => {
        const selectedOptions = item.selectedModifiers[group.id] || [];
        selectedOptions.forEach((optId) => {
          const opt = group.options.find((o) => o.id === optId);
          if (opt) itemBasePrice += opt.priceCents;
        });
      });
    }

    subtotalCents += itemBasePrice * item.quantity;
  });

  // Calculate discount
  let discountCents = 0;
  if (coupon) {
    if (!coupon.minSubtotalCents || subtotalCents >= coupon.minSubtotalCents) {
      if (coupon.discountType === 'PERCENTAGE') {
        discountCents = Math.round(subtotalCents * (coupon.discountValue / 100));
      } else {
        discountCents = coupon.discountValue;
      }
    }
  }

  const taxableAmount = Math.max(0, subtotalCents - discountCents);
  const taxCents = Math.round(taxableAmount * TAX_RATE);
  const serviceFeeCents = subtotalCents > 0 ? SERVICE_FEE_CENTS : 0;
  const totalCents = taxableAmount + taxCents + serviceFeeCents;

  return {
    subtotalCents,
    discountCents,
    taxCents,
    serviceFeeCents,
    totalCents,
  };
};
