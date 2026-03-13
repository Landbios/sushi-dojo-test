'use client';

import { useEffect, useState } from 'react';
import MenuGrid from '@/components/MenuGrid';
import CartWrapper from '@/components/CartWrapper';
import { Product } from '@/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch menu', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-[#d4af37] animate-pulse uppercase tracking-widest font-bold">Cargando Menú...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white selection:bg-[#d4af37]/30 font-sans pb-12">
      <CartWrapper products={products} />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden flex items-center justify-center border-b border-[#d4af37]/20">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#121212]/80 via-[#121212]/40 to-[#121212]" />
        <img
          src="https://picsum.photos/seed/sushibg/1920/1080"
          alt="Sushi Background"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-widest text-[#d4af37] drop-shadow-lg uppercase">
            Momo Sushia
          </h1>
          <p className="text-gray-300 max-w-md mx-auto text-xl font-medium tracking-widest uppercase">
            Restaurante Japonés
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <MenuGrid products={products} />
      </div>
    </main>
  );
}
