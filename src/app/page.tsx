'use client';

import { useEffect, useState } from 'react';
import MenuGrid from '@/components/MenuGrid';
import CartWrapper from '@/components/CartWrapper';
import { Product } from '@/types';
import Image from 'next/image';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/menu');
      if (!res.ok) throw new Error('Failed to fetch menu');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch menu', err);
      setError('Database is currently offline. Please try again in a few moments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#d4af37]/20 border-t-[#d4af37] rounded-full animate-spin" />
          <div className="text-[#d4af37] uppercase tracking-[0.3em] font-black text-xs">Summoning Dragon...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/40 border border-[#6b141a]/50 p-8 rounded-xl text-center backdrop-blur-sm">
          <AlertTriangle className="w-16 h-16 text-[#6b141a] mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Connection Lost</h2>
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            {error}
          </p>
          <button 
            onClick={fetchMenu}
            className="w-full py-4 bg-[#6b141a] hover:bg-[#8b1a22] text-white font-black uppercase tracking-[0.2em] text-xs rounded transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white selection:bg-[#d4af37]/30 font-sans pb-12">
      <CartWrapper products={products} />
      
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full overflow-hidden flex items-center justify-center border-b border-[#d4af37]/20">
        <div className="absolute inset-0 z-10 bg-linear-to-b from-[#121212]/80 via-[#121212]/40 to-[#121212]" />
        <Image
          src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1920&h=1080&fit=crop"
          alt="Sushi Background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-widest text-[#d4af37] drop-shadow-lg uppercase">
            DARK <span className="text-[#6b141a]">DRAGON</span>
          </h1>
          <p className="text-gray-300 max-w-md mx-auto text-xl font-medium tracking-widest uppercase">
            Premium Sushi Dojo
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <MenuGrid products={products} />
      </div>
    </main>
  );
}
