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
    name: '', phone: '', email: user?.email || '', address: '', city: 'ঢাকা', area: '', payment: 'cod' as PaymentMethod, txnId: '', notes: '',
  });

  const subtotal = getTotal();
  const shipping = subtotal >= settings.free_shipping_min ? 0 : form.city === 'ঢাকা' ? settings.shipping_dhaka : settings.shipping_outside;
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
    if (!form.name || !form.phone || !form.address) { setError('সব তথ্য পূরণ করুন'); return; }
    if (needsTxn && !form.txnId) { setError('ট্রানজেকশন আইডি দিন'); return; }

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
      if (!res.ok) throw new Error(data.error || 'অর্ডার প্লেস করা যায়নি');

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
        <h1 className="font-display text-2xl font-semibold mb-4">কার্ট খালি</h1>
        <p className="text-dark-400 mb-6">অর্ডার করতে প্রোডাক্ট কার্টে যোগ করুন</p>
      </div>
    );
  }

  const paymentOptions: { value: PaymentMethod; label: string; desc: string }[] = [
    { value: 'cod', label: 'ক্যাশ অন ডেলিভারি', desc: 'প্রোডাক্ট হাতে পেয়ে পেমেন্ট করুন' },
    { value: 'bkash', label: 'বিকাশ', desc: `বিকাশ নম্বর: ${settings.bkash_number}` },
    { value: 'nagad', label: 'নগদ', desc: `নগদ নম্বর: ${settings.nagad_number}` },
    { value: 'bkash_50_advance', label: 'বিকাশ (৫০% অ্যাডভান্স)', desc: `অর্ডার কনফার্ম করতে ৫০% আগে পাঠান — বিকাশ: ${settings.bkash_number}` },
    { value: 'bkash_100_advance', label: 'বিকাশ (১০০% অ্যাডভান্স)', desc: `সম্পূর্ণ মূল্য আগে পাঠান — বিকাশ: ${settings.bkash_number}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-8">চেকআউট</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="border border-dark-100 p-5">
              <h2 className="font-display text-lg font-semibold mb-4">ডেলিভারি তথ্য</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">আপনার নাম *</label>
                  <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="পূর্ণ নাম" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">মোবাইল নম্বর *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="01XXXXXXXXX" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">ইমেইল (ঐচ্ছিক)</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dark-500 mb-1">শহর *</label>
                  <select name="city" value={form.city} onChange={handleChange} className="input-field">
                    <option value="ঢাকা">ঢাকা</option>
                    <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                    <option value="সিলেট">সিলেট</option>
                    <option value="রাজশাহী">রাজশাহী</option>
                    <option value="খুলনা">খুলনা</option>
                    <option value="বরিশাল">বরিশাল</option>
                    <option value="রংপুর">রংপুর</option>
                    <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-dark-500 mb-1">পূর্ণ ঠিকানা *</label>
                  <input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="বাড়ি নং, রাস্তা, এলাকা" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-dark-500 mb-1">নোট (ঐচ্ছিক)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field" rows={2} placeholder="বিশেষ কোনো নির্দেশনা..." />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="border border-dark-100 p-5">
              <h2 className="font-display text-lg font-semibold mb-4">পেমেন্ট মেথড</h2>
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
                    {paymentNumber} নম্বরে {advanceAmount > 0 ? formatPrice(advanceAmount) : formatPrice(total)} সেন্ড মানি করুন এবং ট্রানজেকশন আইডি দিন।
                  </p>
                  <input name="txnId" value={form.txnId} onChange={handleChange} className="input-field text-sm" placeholder="ট্রানজেকশন আইডি" required />
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark-50 p-5 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">অর্ডার সামারি</h2>
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
                <div className="flex justify-between"><span>সাবটোটাল</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>শিপিং ({form.city === 'ঢাকা' ? 'ঢাকা' : 'ঢাকার বাইরে'})</span><span>{shipping === 0 ? 'ফ্রি' : formatPrice(shipping)}</span></div>
                <div className="border-t border-dark-200 pt-2 flex justify-between text-base font-bold"><span>মোট</span><span className="text-brand">{formatPrice(total)}</span></div>
              </div>

              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'প্রসেসিং...' : `অর্ডার প্লেস করুন — ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
