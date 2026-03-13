'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Order } from '@/types';
import { X, Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function NotificationManager() {
  const { notifications, removeNotification, addNotification } = useNotificationStore();
  const lastStatuses = useRef<Record<string, string>>({});

  useEffect(() => {
    const checkStatusChanges = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const orders: Order[] = await res.json();
          orders.forEach((order) => {
            const lastStatus = lastStatuses.current[order.id];
            if (lastStatus && lastStatus !== order.status) {
              addNotification(
                `Pedido #${order.id.slice(0, 8)} ha cambiado a ${order.status}`,
                'SUCCESS',
                order.id
              );
            }
            lastStatuses.current[order.id] = order.status;
          });
        }
      } catch (error) {
        console.error('Failed to poll notifications', error);
      }
    };

    // Initial check to populate statuses without notifying
    checkStatusChanges();

    const interval = setInterval(checkStatusChanges, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [addNotification]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-100 flex flex-col gap-3 w-full max-w-sm">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-[#1a1a1a] border border-[#d4af37]/30 shadow-2xl rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-right duration-500 overflow-hidden relative group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-[#d4af37]" />
          <div className="p-2 bg-[#d4af37]/10 rounded-lg">
            <Bell className="w-5 h-5 text-[#d4af37]" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium leading-relaxed pr-6">{n.message}</p>
            {n.orderId && (
              <Link
                href={`/orders/${n.orderId}`}
                className="inline-flex items-center gap-1 text-[#d4af37] text-[10px] font-bold uppercase mt-2 hover:underline"
              >
                Ver Detalles <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
