'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Timeline from '@/components/Timeline';
import { OrderEvent } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderPage() {
  const { orderId } = useParams();
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/timeline`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } catch (error) {
        console.error('Failed to fetch timeline', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTimeline, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
            <div className="text-gray-500 uppercase tracking-widest text-xs animate-pulse">Cargando Línea de Tiempo...</div>
          </div>
        ) : (
          <div className="space-y-8">
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
