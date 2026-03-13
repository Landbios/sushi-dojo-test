'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Product, CartItem } from '@/types';
import { Loader2, X, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import ProductModal from './ProductModal';

import Image from 'next/image';

export default function CartDrawer({ isOpen, onClose, products }: { isOpen: boolean; onClose: () => void; products: Product[] }) {
  const { items, removeItem, clearCart, updateQuantity, correlationId } = useCartStore();
  const [pricing, setPricing] = useState<{ subtotalCents: number; discountCents: number; taxCents: number; serviceFeeCents: number; totalCents: number; couponApplied?: boolean; couponCode?: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
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
      setPricingError(null);
      return;
    }
    
    setIsCalculating(true);
    setPricingError(null);
    try {
      const res = await fetch('/api/cart/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, couponCode: appliedCoupon, correlationId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPricing(data);
      } else {
        throw new Error('Pricing service unavailable');
      }
    } catch (error) {
      console.error('Failed to calculate pricing', error);
      setPricingError('Failed to sync pricing');
    } finally {
      setIsCalculating(false);
    }
  }, [items, appliedCoupon, correlationId]);

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
        body: JSON.stringify({ items, couponCode: appliedCoupon, userId: 'user-123', correlationId }),
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#121212] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-800">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#121212]">
          <h2 className="text-white text-xl font-black uppercase tracking-[0.2em] flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#6b141a]" />
            Cart
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30 select-none">
              <ShoppingBag className="w-16 h-16 text-gray-400" />
              <div className="text-gray-400 text-sm tracking-[0.3em] uppercase font-black">Empty</div>
            </div>
          ) : (
            items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) return null;

              return (
                <div key={item.id} className="flex gap-4 items-start pb-8 border-b border-gray-900 last:border-0 last:pb-0 group">
                  <div className="relative w-24 h-24 bg-transparent rounded-lg shrink-0 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-contain drop-shadow-lg p-2" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h3 className="text-white text-sm font-bold tracking-tight truncate">{product.name}</h3>
                      <span className="text-white font-black text-sm shrink-0">${((product.priceCents * item.quantity) / 100).toFixed(2)}</span>
                    </div>

                    {/* Modifiers & Comment */}
                    <div className="text-gray-500 text-[11px] leading-relaxed mb-4">
                      {Object.entries(item.selectedModifiers).map(([groupId, optionIds]) => {
                        const group = product.modifierGroups?.find((g) => g.id === groupId);
                        if (!group) return null;
                        const optionNames = optionIds
                          .map((id) => group.options.find((o) => o.id === id)?.name)
                          .filter(Boolean)
                          .join(', ');
                        return optionNames ? <div key={groupId} className="truncate italic">+ {optionNames}</div> : null;
                      })}
                      {item.comment && (
                        <div className="text-[#d4af37] mt-1 font-medium bg-[#d4af37]/5 px-2 py-1 rounded border border-[#d4af37]/10 inline-block w-full">
                          Note: {item.comment}
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center bg-black/40 border border-gray-800 rounded-sm overflow-hidden h-8">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 hover:bg-[#6b141a]/10 text-gray-400 hover:text-[#6b141a] transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 text-white text-[10px] font-black border-x border-gray-800 min-w-[32px] text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 hover:bg-[#6b141a]/10 text-gray-400 hover:text-green-500 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button onClick={() => setEditingItem(item)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Edit</button>
                        <button onClick={() => removeItem(item.id)} className="text-[10px] font-black uppercase tracking-widest text-[#6b141a] hover:text-[#8b1a22] transition-colors">Del</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-gray-800 bg-[#121212]">
            {/* Coupon Section */}
            <div className="mb-8">
              <div className="flex gap-2 bg-black/40 border border-gray-900 rounded-sm p-1">
                <input
                  type="text"
                  placeholder="Promotion Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-[11px] text-white focus:outline-none uppercase tracking-widest"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="bg-white text-black px-4 py-2 rounded-sm text-[10px] uppercase font-black tracking-widest transition-all hover:bg-gray-200"
                >
                  Apply
                </button>
              </div>
              {pricing?.couponApplied && (
                <div className="text-green-500 text-[10px] uppercase mt-2 tracking-widest font-black flex items-center gap-1.5 px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Code {pricing.couponCode} Activated
                </div>
              )}
            </div>

            {isCalculating ? (
              <div className="flex justify-center py-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
                  <span className="text-[9px] uppercase tracking-widest text-[#d4af37]">Calculating...</span>
                </div>
              </div>
            ) : pricingError ? (
              <div className="bg-[#6b141a]/10 border border-[#6b141a]/30 p-4 rounded mb-8 text-center">
                <AlertCircle className="w-6 h-6 text-[#6b141a] mx-auto mb-2" />
                <div className="text-[#6b141a] text-[10px] font-black uppercase tracking-widest">{pricingError}</div>
                <button onClick={fetchPricing} className="text-[#d4af37] text-[9px] uppercase font-black tracking-widest mt-2 hover:underline flex items-center justify-center gap-1.5 mx-auto">
                  <RefreshCw className="w-3 h-3" /> Retry Sync
                </button>
              </div>
            ) : !pricing ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-[#6b141a] animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 mb-8 text-[11px] tracking-widest font-medium">
                <div className="flex justify-between text-gray-500">
                  <span className="uppercase">Subtotal</span>
                  <span className="text-white">${(pricing.subtotalCents / 100).toFixed(2)}</span>
                </div>
                {pricing.discountCents > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span className="uppercase font-black">Promo Applied</span>
                    <span>-${(pricing.discountCents / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span className="uppercase">Service Fee</span>
                  <span className="text-white">${(pricing.serviceFeeCents / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-black text-xl pt-6 border-t border-gray-800 mt-6 tracking-widest">
                  <span className="uppercase">Total</span>
                  <span className="text-[#6b141a]">${(pricing.totalCents / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isCheckingOut || isCalculating || !pricing}
              className="w-full py-4 rounded-sm bg-[#6b141a] hover:bg-[#8b1a22] disabled:bg-gray-900 disabled:text-gray-700 text-white font-black uppercase tracking-[0.3em] text-xs transition-all shadow-2xl active:scale-95 flex justify-center items-center gap-3"
            >
              {isCheckingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
            </button>
            <p className="text-center text-gray-600 text-[9px] uppercase tracking-widest mt-4 opacity-50">
              Tax (8%) included in prices
            </p>
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
