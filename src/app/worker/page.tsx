'use client';

import { useEffect, useState, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';
import { LucideIcon, Loader2, CheckCircle2, Truck, Clock, Package, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: LucideIcon; color: string; nextStatus?: OrderStatus }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-yellow-500', nextStatus: 'ACCEPTED' },
  ACCEPTED: { label: 'Accepted', icon: CheckCircle2, color: 'text-blue-500', nextStatus: 'IN_PROGRESS' },
  IN_PROGRESS: { label: 'Preparing', icon: Package, color: 'text-orange-500', nextStatus: 'BEING_DELIVERED' },
  BEING_DELIVERED: { label: 'Delivering', icon: Truck, color: 'text-purple-500', nextStatus: 'COMPLETED' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
};

export default function WorkerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setError(null);
    try {
      const resWorker = await fetch('/api/worker/orders');
      if (!resWorker.ok) throw new Error('Database server is not responding');
      const data = await resWorker.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, workerId: 'worker-admin' }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (error) {
      console.error('Update failed', error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-[#6b141a]/20 border-t-[#6b141a] rounded-full animate-spin" />
          <div className="text-[#d4af37] font-black uppercase tracking-[0.4em] text-xs animate-pulse text-center">
            Synchronizing with Kitchen...
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-black/40 border border-[#6b141a]/50 p-10 rounded-2xl text-center backdrop-blur-md">
          <AlertCircle className="w-20 h-20 text-[#6b141a] mx-auto mb-8" />
          <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Command Center Offline</h2>
          <p className="text-gray-500 text-sm mb-10 leading-relaxed uppercase tracking-widest">
            Critical database connection failure. Order stream interrupted.
          </p>
          <button 
            onClick={fetchOrders}
            className="w-full py-5 bg-[#6b141a] hover:bg-[#8b1a22] text-white font-black uppercase tracking-[0.3em] text-xs rounded transition-all flex items-center justify-center gap-4 active:scale-[0.98]"
          >
            <RefreshCw className="w-5 h-5" />
            Re-establish Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-widest text-[#d4af37]">Worker Dashboard</h1>
            <p className="text-gray-500 mt-2 uppercase text-xs tracking-[0.3em]">Dark Dragon Order Management</p>
          </div>
          <Link href="/" className="text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors border-b border-gray-800 pb-1">Back to Site</Link>
        </header>

        <div className="grid gap-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-black/40 rounded-xl border border-gray-900">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-500 uppercase tracking-widest">No active orders</div>
            </div>
          ) : (
            orders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const Icon = config.icon;

              return (
                <div key={order.id} className="bg-black/40 rounded-xl border border-gray-900 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-[#6b141a]/50 transition-all">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-[#d4af37] bg-[#d4af37]/10 px-3 py-1 rounded-full uppercase tracking-tighter">
                        {order.id.slice(0, 8)}
                      </span>
                      <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${config.color}`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </div>
                    <div className="text-white font-bold">
                      {order.items.length} items • ${(order.totalCents / 100).toFixed(2)}
                    </div>
                    <p className="text-gray-500 text-xs italic truncate max-w-md">
                      {order.items.map(i => `${i.quantity}x ${i.productId}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {config.nextStatus && (
                      <button
                        onClick={() => updateStatus(order.id, config.nextStatus!)}
                        disabled={updatingId === order.id}
                        className="bg-white text-black px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-[#d4af37] transition-all disabled:opacity-50"
                      >
                        {updatingId === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : `Move to ${STATUS_CONFIG[config.nextStatus].label}`}
                      </button>
                    )}
                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateStatus(order.id, 'CANCELLED')}
                        disabled={updatingId === order.id}
                        className="bg-[#6b141a]/20 text-[#6b141a] px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-[#6b141a] hover:text-white transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <Link
                      href={`/orders/${order.id}`}
                      className="bg-gray-800 text-gray-400 px-6 py-2 rounded font-black text-[10px] uppercase tracking-widest hover:bg-gray-700 hover:text-white transition-all"
                    >
                      View Timeline
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
