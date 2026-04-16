'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { useSettings } from '@/components/SettingsProvider';

type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'bkash_50_advance' | 'bkash_100_advance';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const settings = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', phone: '', email: user?.email || '', address: '', city: 'Dhaka', area: '', payment: 'cod' as PaymentMethod, txnId: '', notes: '',
  });

  const subtotal = getTotal();
  const shipping = subtotal >= settings.free_shipping_min ? 0 : form.city === 'Dhaka' ? settings.shipping_dhaka : settings.shipping_outside;
  const total = subtotal + shipping;

  const needsTxn = ['bkash', 'nagad', 'bkash_50_advance', 'bkash_100_advance'].includes(form.payment);
  const advanceAmount = form.payment === 'bkash_50_advance' ? Math.ceil(total * 0.5) : form.payment === 'bkash_100_advance' ? total : 0;
  const paymentNumber = form.payment.startsWith('bkash') ? settings.bkash_number : settings.nagad_number;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.name || !form.phone || !form.address) { setError('Please fill in all required fields'); return; }
    if (needsTxn && !form.txnId) { setError('Please enter the transaction ID'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_area: form.area,
          subtotal, shipping_cost: shipping, total,
          payment_method: form.payment,
          transaction_id: form.txnId || null,
          notes: form.notes || null,
          user_id: user?.id || null,
          items: items.map((i) => {
            const price = (i.variant?.price_override != null && i.variant.price_override > 0)
              ? i.variant.price_override
              : i.product.price;
            return {
              product_id: i.product.id,
              product_name: i.product.name,
              product_image: i.product.nf_product_images?.[0]?.url || null,
              variant_size: i.selectedSize || null,
              variant_color: i.selectedColor || null,
              quantity: i.quantity,
              unit_price: price,
              total_price: price * i.quantity,
            };
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');

      clearCart();
      router.push(`/track-order?order=${data.order_number}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold mb-4">Your Cart is Empty</h1>
        <p className="text-dark-400 mb-6">Add products to your cart to place an order</p>
      </div>
    );
  }

  const paymentOptions: { value: PaymentMethod; label: string; desc: string }[] = [
    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive the product' },
    { value: 'bkash', label: 'bKash', desc: `bKash number: ${settings.bkash_number}` },
    { value: 'nagad', label: 'Nagad', desc: `Nagad number: ${settings.nagad_number}` },
    { value: 'bkash_50_advance', label: 'bKash (50% Advance)', desc: `Send 50% in advance to confirm order — bKash: ${settings.bkash_number}` },
    { value: 'bkash_100_advance', label: 'bKash (100% Advance)', desc: `Send full amount in advance — bKash: ${settings.bkash_number}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="border border-dark-100 p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Delivery Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Full name" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">Mobile Number *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="01XXXXXXXXX" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">Email (Optional)</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">City *</label>
                  <select name="city" value={form.city} onChange={handleChange} className="input-field">
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-dark-500 mb-1">Full Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="House no, road, area" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-dark-500 mb-1">Notes (Optional)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field" rows={2} placeholder="Any special instructions..." />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="border border-dark-100 p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                {paymentOptions.map((pm) => (
                  <label key={pm.value} className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${form.payment === pm.value ? 'border-brand bg-brand-50' : 'border-dark-100 hover:border-dark-200'}`}>
                    <input type="radio" name="payment" value={pm.value} checked={form.payment === pm.value} onChange={handleChange} className="mt-1 accent-brand" />
                    <div>
                      <span className="text-sm font-medium">{pm.label}</span>
                      <p className="text-xs text-dark-400 mt-0.5">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {needsTxn && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200">
                  <p className="text-xs text-yellow-800 mb-2">
                    Send {advanceAmount > 0 ? formatPrice(advanceAmount) : formatPrice(total)} to {paymentNumber} and enter the transaction ID below.
                  </p>
                  <input name="txnId" value={form.txnId} onChange={handleChange} className="input-field text-sm" placeholder="Transaction ID" required />
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark-50 p-5 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item, idx) => {
                  const price = (item.variant?.price_override != null && item.variant.price_override > 0)
                    ? item.variant.price_override
                    : item.product.price;
                  return (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="truncate pr-2">{item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ''} × {item.quantity}</span>
                      <span className="shrink-0 font-medium">{formatPrice(price * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-dark-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping ({form.city === 'Dhaka' ? 'Dhaka' : 'Outside Dhaka'})</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span></div>
                <div className="border-t border-dark-200 pt-2 flex justify-between text-base font-bold"><span>Total</span><span className="text-brand">{formatPrice(total)}</span></div>
              </div>

              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Processing...' : `Place Order — ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
