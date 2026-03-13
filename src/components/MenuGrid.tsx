'use client';

import { Product } from '@/types';
import { useState } from 'react';
import ProductModal from './ProductModal';
import { useCartStore } from '@/store/useCartStore';

export default function MenuGrid({ products }: { products: Product[] }) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const handleProductClick = (product: Product) => {
    if (product.modifierGroups && product.modifierGroups.length > 0) {
      setSelectedProduct(product);
    } else {
      addItem(product, {});
    }
  };

  return (
    <div>
      <h2 className="text-[#d4af37] text-lg font-bold mb-6 uppercase tracking-widest flex items-center gap-2">
        Menú <span className="text-gray-500 text-sm font-medium tracking-wide">({products.length} PRODUCTOS)</span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {products.map((product) => {
          const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0;
          return (
            <div 
              key={product.id} 
              className="flex flex-col bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden hover:border-[#d4af37]/50 transition-all duration-300 cursor-pointer group shadow-lg"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative h-48 bg-black/80 overflow-hidden flex items-center justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-80" />
                {hasModifiers && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black text-xs font-bold px-4 py-1.5 rounded-sm shadow-lg uppercase tracking-wider">
                    + Personalizar
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-bold text-lg mb-1.5 tracking-wide">{product.name}</h3>
                <p className="text-gray-400 text-xs line-clamp-2 mb-4 flex-1 leading-relaxed">{product.description}</p>
                <div className="text-[#d4af37] font-bold text-lg">
                  ${(product.priceCents / 100).toFixed(2)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
}
