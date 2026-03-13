'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { Order } from '@/types';
import { Loader2, ShoppingBag, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch orders', err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-500 border-yellow-900/30 bg-yellow-900/10';
      case 'COMPLETED': return 'text-green-500 border-green-900/30 bg-green-900/10';
      case 'CANCELLED': return 'text-red-500 border-red-900/30 bg-red-900/10';
      default: return 'text-blue-500 border-blue-900/30 bg-blue-900/10';
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-white selection:bg-[#d4af37]/30 font-sans pb-24">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3 tracking-widest text-[#d4af37] uppercase drop-shadow-lg">
            Mis Pedidos
          </h1>
          <p className="text-gray-500 uppercase text-xs tracking-widest font-medium">Historial de compras recientes</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
            <div className="text-gray-500 uppercase tracking-widest text-xs animate-pulse">Cargando Historial...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl flex flex-col items-center gap-4">
            <ShoppingBag className="w-12 h-12 text-gray-700" />
            <div className="text-gray-600 uppercase text-sm tracking-widest">Aún no has realizado ningún pedido</div>
            <Link href="/" className="mt-4 bg-[#d4af37] text-black px-6 py-2 rounded font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">
              Ir al Menú
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="group block bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-[#d4af37]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#d4af37]/5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center border border-gray-800 group-hover:border-[#d4af37]/30 transition-colors">
                      <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <div>
                      <div className="text-white font-bold tracking-wide uppercase text-sm">
                        Pedido #{order.id.slice(0, 8)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-[10px] mt-1 font-mono uppercase">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[#d4af37] font-black text-lg">
                        €{(order.totalCents / 100).toFixed(2)}
                      </div>
                      <div className="text-gray-500 text-[10px] uppercase tracking-tighter">
                        {order.items.length} productos
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-[#d4af37] transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
