'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Timeline from '@/components/Timeline';
import { OrderEvent } from '@/types';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function OrderPage() {
  const { orderId } = useParams();
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/timeline`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Order not found');
        throw new Error('Database server is not responding');
      }
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch timeline', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTimeline();
    const interval = setInterval(fetchTimeline, 10000);
    return () => clearInterval(interval);
  }, [fetchTimeline]);

  return (
    <main className="min-h-screen bg-[#121212] text-white selection:bg-[#d4af37]/30 font-sans pb-24">
      <Header />

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#d4af37] transition-colors mb-8 text-sm uppercase tracking-widest font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Menú
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3 tracking-widest text-[#d4af37] uppercase drop-shadow-lg">
            Estado del Pedido
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-500 uppercase text-xs tracking-widest font-medium">Order ID:</span>
            <span className="text-gray-300 font-mono text-sm">{orderId}</span>
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-t-[#d4af37] border-gray-800 rounded-full animate-spin" />
            <div className="text-gray-500 uppercase tracking-widest text-xs animate-pulse">Consulting Scrolls...</div>
          </div>
        ) : error && events.length === 0 ? (
          <div className="bg-black/40 border border-[#6b141a]/50 p-12 rounded-xl text-center backdrop-blur-sm">
            <AlertCircle className="w-16 h-16 text-[#6b141a] mx-auto mb-6" />
            <h2 className="text-white font-black text-xl mb-4 tracking-widest uppercase">Ancient Scrolls Restricted</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
              {error === 'Order not found' 
                ? "This order does not exist in our historical archives. Please check your credentials."
                : "The historical database is temporarily sealed. Please check your connection."}
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={fetchTimeline}
                className="w-full py-4 bg-[#6b141a] hover:bg-[#8b1a22] text-white font-black uppercase tracking-[0.2em] text-xs rounded transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Connection
              </button>
              <Link 
                href="/"
                className="text-xs uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
              >
                Back to Market
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[#d4af37] text-lg font-bold uppercase tracking-widest">
                Línea de Tiempo
              </h2>
              <span className="text-gray-600 text-[10px] uppercase tracking-widest font-bold">
                Actualizado en tiempo real
              </span>
            </div>
            <Timeline events={events} />
            
            {events.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
                <p className="text-gray-600 uppercase text-sm tracking-widest">No se encontraron eventos para este pedido.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
