import { Bell, User, Grid, ShoppingBag, History } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

export default function Header({ onOpenCart }: { onOpenCart?: () => void }) {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#1a1a1a] border-b border-[#d4af37]/20 shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-full border border-[#d4af37] flex items-center justify-center text-[#d4af37] bg-black/50 hover:scale-110 transition-transform">
            <span className="text-sm">🍣</span>
          </Link>
        </div>

        <Link href="/" className="text-lg font-black tracking-widest text-[#d4af37] uppercase hidden sm:block hover:opacity-80 transition-opacity">
          MOMO SUSHIA <span className="text-gray-400 text-sm font-medium tracking-wide">- RESTAURANTE JAPONÉS</span>
        </Link>
        <Link href="/" className="text-lg font-black tracking-widest text-[#d4af37] uppercase sm:hidden hover:opacity-80 transition-opacity">
          MOMO SUSHIA
        </Link>

        <div className="flex items-center gap-5 text-gray-400">
          <Link href="/orders" title="Historial" className="hover:text-[#d4af37] transition-colors">
            <History className="w-5 h-5" />
          </Link>
          <button className="hover:text-[#d4af37] transition-colors"><Bell className="w-5 h-5" /></button>
          <button className="hover:text-[#d4af37] transition-colors bg-black/50 p-1.5 rounded-full border border-gray-800"><User className="w-4 h-4" /></button>
          {onOpenCart && (
            <button onClick={onOpenCart} className="relative hover:text-[#d4af37] transition-colors">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#d4af37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
