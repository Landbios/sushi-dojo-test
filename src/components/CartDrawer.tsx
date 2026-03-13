'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Product, CartItem } from '@/types';
import { Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import ProductModal from './ProductModal';

export default function CartDrawer({ isOpen, onClose, products }: { isOpen: boolean; onClose: () => void; products: Product[] }) {
  const { items, removeItem, clearCart } = useCartStore();
  const [pricing, setPricing] = useState<{ subtotalCents: number; discountCents: number; taxCents: number; serviceFeeCents: number; totalCents: number; couponApplied?: boolean; couponCode?: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const fetchPricing = useCallback(async () => {
    if (items.length === 0) {
      setPricing(null);
      return;
    }
    
    setIsCalculating(true);
    try {
      const res = await fetch('/api/cart/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, couponCode: appliedCoupon }),
      });
      if (res.ok) {
        const data = await res.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Failed to calculate pricing', error);
    } finally {
      setIsCalculating(false);
    }
  }, [items, appliedCoupon]);

  useEffect(() => {
    const debounce = setTimeout(fetchPricing, 300);
    return () => clearTimeout(debounce);
  }, [fetchPricing]);

  const handleApplyCoupon = () => {
    setAppliedCoupon(couponInput.toUpperCase());
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const idempotencyKey = uuidv4();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ items, couponCode: appliedCoupon, userId: 'user-123' }),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        onClose();
        router.push(`/orders/${data.orderId}`);
      } else if (res.status === 409) {
        alert('Duplicate checkout detected. Please check your orders.');
      } else {
        const error = await res.json();
        alert(`Checkout failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Checkout error', error);
      alert('Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1a1a] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#d4af37]/30">
        <div className="p-5 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#141414]">
          <h2 className="text-[#d4af37] text-xl font-semibold uppercase tracking-widest">Carrito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="text-gray-500 text-center mt-10 text-sm tracking-wider uppercase">Tu carrito está vacío</div>
          ) : (
            items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;

              return (
                <div key={item.id} className="flex gap-4 items-start border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                  <div className="text-gray-400 text-sm mt-1 font-mono">{item.quantity}x</div>
                  <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-md object-cover border border-gray-800" />
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium tracking-wide">{item.quantity}x {product.name}</div>
                    <div className="text-gray-500 text-xs mt-1.5 space-y-0.5">
                      {Object.entries(item.selectedModifiers).map(([groupId, optionIds]) => {
                        const group = product.modifierGroups?.find((g) => g.id === groupId);
                        if (!group) return null;
                        const optionNames = optionIds
                          .map((id) => group.options.find((o) => o.id === id)?.name)
                          .filter(Boolean)
                          .join(', ');
                        return optionNames ? <div key={groupId} className="truncate">{optionNames}</div> : null;
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => setEditingItem(item)} className="text-[10px] uppercase tracking-wider text-gray-400 border border-gray-600 rounded px-2 py-1 hover:text-[#d4af37] hover:border-[#d4af37] transition-colors">Edit</button>
                    <button onClick={() => removeItem(item.id)} className="text-[10px] uppercase tracking-wider text-red-400 border border-red-900/50 rounded px-2 py-1 hover:text-red-300 hover:border-red-500 transition-colors">Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-[#d4af37]/20 bg-[#141414]">
            {/* Coupon Section */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cupón (ej. OFF10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-black/50 border border-gray-800 rounded px-3 py-2 text-sm text-white focus:border-[#d4af37] outline-none transition-colors uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded text-xs uppercase font-bold tracking-wider transition-colors"
                >
                  Aplicar
                </button>
              </div>
              {pricing?.couponApplied && (
                <div className="text-green-400 text-[10px] uppercase mt-1 tracking-widest font-bold">
                  ✓ Cupón {pricing.couponCode} aplicado
                </div>
              )}
            </div>

            {isCalculating || !pricing ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-[#d4af37] animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 mb-6 text-sm tracking-wide">
                <div className="flex justify-between text-gray-400">
                  <span className="uppercase text-xs">Subtotal</span>
                  <span className="text-white">€{(pricing.subtotalCents / 100).toFixed(2)}</span>
                </div>
                {pricing.discountCents > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="uppercase text-xs">Descuento</span>
                    <span>-€{(pricing.discountCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span className="uppercase text-xs">Impuestos (8%)</span>
                  <span className="text-white">€{(pricing.taxCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span className="uppercase text-xs">Tarifa Servicio</span>
                  <span className="text-white">€{(pricing.serviceFeeCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#d4af37] font-bold text-lg pt-3 border-t border-gray-800 mt-3">
                  <span className="uppercase">Total</span>
                  <span>€{(pricing.totalCents / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="mb-4 flex items-center gap-2 border border-gray-800 rounded-md px-3 py-2 bg-black/50">
              <span className="text-gray-500 text-xs uppercase">Idempotency-Key</span>
              <span className="text-gray-400 text-xs font-mono truncate">Idempotencia-12345</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || isCalculating || !pricing}
              className="w-full py-3.5 rounded-md bg-[#d4af37] hover:bg-[#e5c158] disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold uppercase tracking-widest text-sm transition-colors flex justify-center items-center gap-2"
            >
              {isCheckingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Realizar Pedido'}
            </button>
          </div>
        )}

        {editingItem && (
          <ProductModal
            product={products.find(p => p.id === editingItem.productId)!}
            onClose={() => setEditingItem(null)}
            initialModifiers={editingItem.selectedModifiers}
            cartItemId={editingItem.id}
          />
        )}
      </div>
    </div>
  );
}
