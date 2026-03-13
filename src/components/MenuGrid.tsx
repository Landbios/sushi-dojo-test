'use client';

import { Product } from '@/types';
import { useState } from 'react';
import Image from 'next/image';
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
    <div className="py-12">
      <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
        <button className="text-white border-b-2 border-white pb-1">All Products</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 mt-8">
        {products.map((product) => {
          return (
            <div 
              key={product.id} 
              className="flex flex-col items-center text-center group cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="relative mb-4 w-full aspect-square flex items-center justify-center p-4 bg-transparent transition-transform duration-500 group-hover:scale-110">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-4"
                />
              </div>
              
              <div className="flex flex-col items-center gap-1 w-full px-2">
                <h3 className="text-white font-medium text-base tracking-tight mb-1 group-hover:text-[#d4af37] transition-colors">{product.name}</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-gray-500 text-[10px] items-center gap-1.5 hidden sm:flex">
                    380 g
                  </span>
                  <span className="text-white font-bold text-sm">
                    ${(product.priceCents / 100).toFixed(2)} $
                  </span>
                </div>

                <button 
                  className="bg-[#6b141a] hover:bg-[#8b1a22] text-white text-[10px] font-black uppercase tracking-widest px-8 py-2.5 rounded-sm transition-all shadow-lg active:scale-95"
                >
                  Add To Cart
                </button>
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
