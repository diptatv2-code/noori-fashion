'use client';
import { useState, useEffect } from 'react';
import { formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function TrackOrderPage() {
  const [query, setQuery] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [autoOrderParam, setAutoOrderParam] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get('order');
    if (orderParam) {
      setAutoOrderParam(orderParam);
      setQuery(orderParam);
      handleSearch(orderParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/track-order?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setOrder(data.order || null);
    } catch {
      setOrder(null);
    }
    setLoading(false);
  };

  const steps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = order ? steps.indexOf(order.order_status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-2xl font-semibold text-center mb-8">Track Your Order</h1>
      <div className="flex flex-col sm:flex-row gap-2 mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="input-field sm:flex-1"
          placeholder="Order number or mobile number"
        />
        <button
          onClick={() => handleSearch()}
          disabled={loading}
          className="btn-primary px-6 text-sm w-full sm:w-auto"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {searched && !loading && !order && (
        <p className="text-center text-dark-400 py-8">
          Order not found. Please check your order number and contact info.
        </p>
      )}

      {order && (
        <div className="animate-fade-in">
          {autoOrderParam && (
            <div className="bg-green-50 border border-green-200 p-4 mb-6 text-center">
              <p className="text-green-800 font-medium">Your order has been placed successfully!</p>
            </div>
          )}

          <div className="border border-dark-100 p-5 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-semibold">{order.order_number}</h2>
                <p className="text-xs text-dark-400">{new Date(order.created_at).toLocaleString('en-BD')}</p>
              </div>
              <span className={`text-xs px-3 py-1 ${getStatusColor(order.order_status)}`}>{getStatusLabel(order.order_status)}</span>
            </div>

            {order.order_status !== 'cancelled' && (
              <div className="flex items-center justify-between mb-6 px-2">
                {steps.map((step, idx) => (
                  <div key={step} className="flex flex-col items-center relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx <= currentStep ? 'bg-brand text-white' : 'bg-dark-100 text-dark-400'}`}>
                      {idx <= currentStep ? '✓' : idx + 1}
                    </div>
                    <span className="text-[9px] mt-1 text-dark-400">{getStatusLabel(step)}</span>
                    {idx < steps.length - 1 && (
                      <div className={`absolute top-4 left-8 w-12 md:w-20 h-0.5 ${idx < currentStep ? 'bg-brand' : 'bg-dark-100'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-dark-400">Name:</span> <span className="font-medium">{order.customer_name}</span></div>
              <div><span className="text-dark-400">Payment:</span> <span className="font-medium">{getStatusLabel(order.payment_method)}</span> — <span className={getStatusColor(order.payment_status)}>{getStatusLabel(order.payment_status)}</span></div>
            </div>
          </div>

          <div className="border border-dark-100 p-5">
            <h3 className="font-semibold mb-3">Order Items</h3>
            {order.nf_order_items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between py-2 border-b border-dark-50 text-sm last:border-0">
                <span>{item.product_name} {item.variant_size ? `(${item.variant_size})` : ''} × {item.quantity}</span>
                <span className="font-medium">{formatPrice(item.total_price)}</span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t text-sm space-y-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shipping_cost === 0 ? 'Free' : formatPrice(order.shipping_cost)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span className="text-brand">{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
