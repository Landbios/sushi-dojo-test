import { History, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

export default function Header({ onOpenCart }: { onOpenCart?: () => void }) {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121212]/90 backdrop-blur-md border-b border-gray-900 shadow-2xl">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-6">
        </div>

        <Link href="/" className="flex flex-col items-center group">
          <span className="text-[22px] font-black tracking-[0.2em] text-white uppercase drop-shadow-lg group-hover:text-[#d4af37] transition-colors">
            DARK <span className="text-[#6b141a]">DRAGON</span>
          </span>
          <span className="text-[10px] text-gray-500 tracking-[0.4em] uppercase font-bold -mt-1">Premium Sushi</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/orders" title="Historial" className="text-gray-400 hover:text-white transition-colors">
            <History className="w-5 h-5" />
          </Link>
          <button className="text-gray-400 hover:text-white transition-colors relative" onClick={onOpenCart}>
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#6b141a] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
