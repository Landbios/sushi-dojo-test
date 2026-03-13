'use client';

import { useState } from 'react';
import { Product, ModifierGroup } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { X } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  initialModifiers?: Record<string, string[]>;
  cartItemId?: string;
}

export default function ProductModal({ product, onClose, initialModifiers, cartItemId }: ProductModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const updateItemModifiers = useCartStore((state) => state.updateItemModifiers);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string[]>>(initialModifiers || {});

  const handleToggleOption = (groupId: string, optionId: string, maxSelections?: number) => {
    setSelectedModifiers((prev) => {
      const currentSelections = prev[groupId] || [];
      if (currentSelections.includes(optionId)) {
        return {
          ...prev,
          [groupId]: currentSelections.filter((id) => id !== optionId),
        };
      }

      if (maxSelections && currentSelections.length >= maxSelections) {
        return prev;
      }

      return {
        ...prev,
        [groupId]: [...currentSelections, optionId],
      };
    });
  };

  const handleSelectRadio = (groupId: string, optionId: string) => {
    setSelectedModifiers((prev) => ({
      ...prev,
      [groupId]: [optionId],
    }));
  };

  const isValid = () => {
    if (!product.modifierGroups) return true;
    return product.modifierGroups.every((group) => {
      if (group.required) {
        const selections = selectedModifiers[group.id] || [];
        return selections.length > 0;
      }
      return true;
    });
  };

  const handleAddToCart = () => {
    if (!isValid()) return;
    if (cartItemId) {
      updateItemModifiers(cartItemId, selectedModifiers);
    } else {
      addItem(product, selectedModifiers);
    }
    onClose();
  };

  let currentPrice = product.priceCents;
  if (product.modifierGroups) {
    product.modifierGroups.forEach((group) => {
      const selections = selectedModifiers[group.id] || [];
      selections.forEach((optId) => {
        const opt = group.options.find((o) => o.id === optId);
        if (opt) currentPrice += opt.priceCents;
      });
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] border border-[#d4af37]/30 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-gray-800 flex justify-between items-start bg-[#141414]">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">{product.name}</h2>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{product.description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {product.modifierGroups?.map((group) => (
            <div key={group.id}>
              <div className="flex items-baseline gap-2 mb-4">
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">{group.name}</h3>
                {group.required && <span className="text-xs text-red-400 font-medium tracking-wide">(Required)</span>}
                {!group.required && <span className="text-xs text-gray-500 tracking-wide">(Opcional)</span>}
              </div>

              <div className="space-y-3">
                {group.options.map((option) => {
                  const isSelected = (selectedModifiers[group.id] || []).includes(option.id);
                  const isRadio = group.maxSelections === 1;

                  return (
                    <label
                      key={option.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-800 hover:border-gray-600 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 flex items-center justify-center border ${!isRadio ? 'rounded' : 'rounded-full'} ${isSelected ? 'border-[#d4af37] bg-[#d4af37]/20' : 'border-gray-600 group-hover:border-gray-400'}`}>
                          {isSelected && (
                            <div className={`w-2.5 h-2.5 bg-[#d4af37] ${!isRadio ? 'rounded-sm' : 'rounded-full'}`} />
                          )}
                        </div>
                        <input
                          type={isRadio ? 'radio' : 'checkbox'}
                          name={group.id}
                          checked={isSelected}
                          onChange={() =>
                            isRadio
                              ? handleSelectRadio(group.id, option.id)
                              : handleToggleOption(group.id, option.id, group.maxSelections)
                          }
                          className="hidden"
                        />
                        <span className="text-gray-200 font-medium text-sm">{option.name}</span>
                      </div>
                      {option.priceCents > 0 && (
                        <span className="text-gray-400 text-sm">+${(option.priceCents / 100).toFixed(2)}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-gray-800 bg-[#141414]">
          <div className="flex justify-between items-center mb-4 text-sm font-bold tracking-wide">
            <span className="text-gray-400 uppercase">Subtotal</span>
            <span className="text-white text-lg">${(currentPrice / 100).toFixed(2)}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!isValid()}
            className="w-full py-3.5 rounded-md bg-[#d4af37] hover:bg-[#e5c158] disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold uppercase tracking-widest text-sm transition-colors"
          >
            {cartItemId ? 'Guardar Cambios' : 'Añadir al Carrito'}
          </button>
        </div>
      </div>
    </div>
  );
}
