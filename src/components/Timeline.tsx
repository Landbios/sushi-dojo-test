'use client';

import { OrderEvent } from '@/types';
import { LucideIcon, CheckCircle, ShoppingCart, CreditCard, Loader2, Package, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface EventConfig {
  icon: LucideIcon;
  color: string;
}

const EVENT_ICONS: Record<string, EventConfig> = {
  CART_ITEM_ADDED: { icon: ShoppingCart, color: 'text-blue-400' },
  CART_ITEM_UPDATED: { icon: ShoppingCart, color: 'text-blue-400' },
  CART_ITEM_REMOVED: { icon: ShoppingCart, color: 'text-red-400' },
  PRICING_CALCULATED: { icon: CreditCard, color: 'text-yellow-400' },
  ORDER_PLACED: { icon: Package, color: 'text-[#d4af37]' },
  ORDER_STATUS_CHANGED: { icon: Loader2, color: 'text-blue-400' },
  READY: { icon: CheckCircle, color: 'text-green-400' },
  COMPLETED: { icon: Truck, color: 'text-green-500' },
  CANCELLED: { icon: XCircle, color: 'text-red-500' },
  VALIDATION_FAILED: { icon: XCircle, color: 'text-red-400' },
};

export default function Timeline({ events }: { events: OrderEvent[] }) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expandedEvents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedEvents(next);
  };

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const config = EVENT_ICONS[event.type] || { icon: Loader2, color: 'text-gray-400' };
        const Icon = config.icon;
        const isExpanded = expandedEvents.has(event.eventId);

        return (
          <div key={event.eventId} className="relative pl-8">
            {/* Connector line */}
            {index !== events.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gray-800" />
            )}
            
            {/* Icon circle */}
            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-black border border-gray-800 flex items-center justify-center z-10 ${config.color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-700">
              <button 
                onClick={() => toggleExpand(event.eventId)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div>
                  <div className="text-sm font-bold text-white uppercase tracking-wider mb-0.5">
                    {event.type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-800/50 pt-3">
                  <div className="bg-black/40 rounded p-3 font-mono text-[10px] text-gray-400 overflow-x-auto">
                    <pre>{JSON.stringify(event.payload, null, 2)}</pre>
                  </div>
                  <div className="mt-2 flex gap-3 text-[9px] text-gray-600 uppercase tracking-tighter">
                    <span>Source: {event.source}</span>
                    <span>Correlation: {event.correlationId}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
