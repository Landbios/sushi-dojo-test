import { create } from 'zustand';
import { CartItem, Product } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, selectedModifiers: Record<string, string[]>, comment?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemModifiers: (id: string, selectedModifiers: Record<string, string[]>) => void;
  updateItemComment: (id: string, comment: string) => void;
  clearCart: () => void;
  getSubtotal: (products: Product[]) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product, selectedModifiers, comment) => {
    set((state) => {
      // Check if item with same product, modifiers AND comment exists
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.productId === product.id &&
          JSON.stringify(item.selectedModifiers) === JSON.stringify(selectedModifiers) &&
          item.comment === comment
      );

      if (existingItemIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += 1;
        return { items: newItems };
      }

      return {
        items: [
          ...state.items,
          {
            id: uuidv4(),
            productId: product.id,
            quantity: 1,
            selectedModifiers,
            comment,
          },
        ],
      };
    });
  },
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  },
  updateItemModifiers: (id, selectedModifiers) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, selectedModifiers } : item
      ),
    }));
  },
  updateItemComment: (id, comment) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, comment } : item
      ),
    }));
  },
  clearCart: () => set({ items: [] }),
  getSubtotal: (products) => {
    const { items } = get();
    let subtotal = 0;
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        let itemPrice = product.priceCents;
        if (product.modifierGroups) {
          product.modifierGroups.forEach((group) => {
            const selectedOptions = item.selectedModifiers[group.id] || [];
            selectedOptions.forEach((optId) => {
              const opt = group.options.find((o) => o.id === optId);
              if (opt) itemPrice += opt.priceCents;
            });
          });
        }
        subtotal += itemPrice * item.quantity;
      }
    });
    return subtotal;
  },
}));
