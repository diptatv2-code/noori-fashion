"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, useAuthStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

type PaymentMethod = "cod" | "bkash" | "bkash_50_advance" | "bkash_100_advance";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: user?.email || "", address: "", city: "Dhaka", area: "", payment: "cod" as PaymentMethod, txnId: "", notes: "",
  });

  const isDhaka = form.city === "Dhaka";
  const subtotal = getTotal();
  const shipping = subtotal >= 5000 ? 0 : isDhaka ? 80 : 150;
  const total = subtotal + shipping;
  const advanceAmount = Math.ceil(total / 2);

  const effectivePayment = useMemo(() => {
    if (!isDhaka && form.payment === "cod") return "bkash_50_advance" as PaymentMethod;
    if (!isDhaka && form.payment === "bkash") return "bkash_50_advance" as PaymentMethod;
    return form.payment;
  }, [isDhaka, form.payment]);

  const needsTxn = effectivePayment === "bkash" || effectivePayment === "bkash_50_advance" || effectivePayment === "bkash_100_advance";

  const bkashPayAmount = useMemo(() => {
    if (effectivePayment === "bkash") return total;
    if (effectivePayment === "bkash_100_advance") return total;
    if (effectivePayment === "bkash_50_advance") return advanceAmount;
    return 0;
  }, [effectivePayment, total, advanceAmount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "city") {
      const newIsDhaka = value === "Dhaka";
      setForm((prev) => ({
        ...prev,
        city: value,
        payment: newIsDhaka ? "cod" : "bkash_50_advance",
      }));
    } else if (name === "payment") {
      setForm({ ...form, payment: value as PaymentMethod });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!form.name || !form.phone || !form.address) { setError("Please fill in all required fields"); return; }
    if (needsTxn && !form.txnId) { setError("Please enter the bKash transaction ID"); return; }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name, customer_phone: form.phone, customer_email: form.email,
          shipping_address: form.address, shipping_city: form.city, shipping_area: form.area,
          subtotal, shipping_cost: shipping, total,
          payment_method: effectivePayment, transaction_id: form.txnId || null,
          notes: form.notes || null, user_id: user?.id || null,
          items: items.map((i) => ({
            product_id: i.product.id, product_name: i.product.name,
            product_image: i.product.nf_product_images?.[0]?.url || null,
            variant_size: i.selectedSize || null, variant_color: i.selectedColor || null,
            quantity: i.quantity, unit_price: i.product.price,
            total_price: i.product.price * i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not place order");
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
        <h1 className="font-display text-2xl font-semibold mb-4">Your cart is empty</h1>
        <p className="text-dark-400 mb-6">Add products to your cart to place an order</p>
        <Link href="/" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link><span>/</span>
        <Link href="/cart" className="hover:text-brand">Cart</Link><span>/</span>
        <span className="text-dark-600">Checkout</span>
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Info */}
            <div className="border border-dark-100 p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Delivery Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-medium text-dark-500 mb-1">Your Name *</label><input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Full name" required /></div>
                <div><label className="block text-xs font-medium text-dark-500 mb-1">Mobile Number *</label><input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="01XXXXXXXXX" required /></div>
                <div><label className="block text-xs font-medium text-dark-500 mb-1">Email (Optional)</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="email@example.com" /></div>
                <div><label className="block text-xs font-medium text-dark-500 mb-1">City *</label>
                  <select name="city" value={form.city} onChange={handleChange} className="input-field">
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barishal">Barishal</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-dark-500 mb-1">Full Address *</label><input name="address" value={form.address} onChange={handleChange} className="input-field" placeholder="House no, street, area" required /></div>
                <div className="md:col-span-2"><label className="block text-xs font-medium text-dark-500 mb-1">Notes (Optional)</label><textarea name="notes" value={form.notes} onChange={handleChange} className="input-field" rows={2} placeholder="Any special instructions..." /></div>
              </div>
            </div>

            {/* Payment */}
            <div className="border border-dark-100 p-5">
              <h2 className="font-display text-lg font-semibold mb-4">Payment Method</h2>

              {!isDhaka && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium">Advance bKash payment required for outside Dhaka delivery</p>
                  <p className="text-xs text-yellow-700 mt-1">Choose 50% or 100% advance via bKash Make Payment.</p>
                </div>
              )}

              <div className="space-y-3">
                {/* COD — Dhaka only */}
                {isDhaka && (
                  <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${effectivePayment === "cod" ? "border-brand bg-brand-50" : "border-dark-100 hover:border-dark-200"}`}>
                    <input type="radio" name="payment" value="cod" checked={effectivePayment === "cod"} onChange={handleChange} className="mt-1 accent-brand" />
                    <div>
                      <span className="text-sm font-medium">Cash on Delivery</span>
                      <p className="text-xs text-dark-400 mt-0.5">Pay when you receive the product</p>
                    </div>
                  </label>
                )}

                {/* bKash full — Dhaka only */}
                {isDhaka && (
                  <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${effectivePayment === "bkash" ? "border-brand bg-brand-50" : "border-dark-100 hover:border-dark-200"}`}>
                    <input type="radio" name="payment" value="bkash" checked={effectivePayment === "bkash"} onChange={handleChange} className="mt-1 accent-brand" />
                    <div>
                      <span className="text-sm font-medium">bKash Make Payment</span>
                      <p className="text-xs text-dark-400 mt-0.5">Make Payment {formatPrice(total)} to bKash Merchant: 01955945219</p>
                    </div>
                  </label>
                )}

                {/* bKash 50% advance — outside Dhaka */}
                {!isDhaka && (
                  <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${effectivePayment === "bkash_50_advance" ? "border-brand bg-brand-50" : "border-dark-100 hover:border-dark-200"}`}>
                    <input type="radio" name="payment" value="bkash_50_advance" checked={effectivePayment === "bkash_50_advance"} onChange={handleChange} className="mt-1 accent-brand" />
                    <div>
                      <span className="text-sm font-medium">bKash 50% Advance</span>
                      <p className="text-xs text-dark-400 mt-0.5">Make Payment {formatPrice(advanceAmount)} now, pay {formatPrice(total - advanceAmount)} on delivery</p>
                    </div>
                  </label>
                )}

                {/* bKash 100% advance — outside Dhaka */}
                {!isDhaka && (
                  <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${effectivePayment === "bkash_100_advance" ? "border-brand bg-brand-50" : "border-dark-100 hover:border-dark-200"}`}>
                    <input type="radio" name="payment" value="bkash_100_advance" checked={effectivePayment === "bkash_100_advance"} onChange={handleChange} className="mt-1 accent-brand" />
                    <div>
                      <span className="text-sm font-medium">bKash 100% Advance</span>
                      <p className="text-xs text-dark-400 mt-0.5">Make Payment {formatPrice(total)} now — no payment on delivery</p>
                    </div>
                  </label>
                )}
              </div>

              {needsTxn && (
                <div className="mt-4 p-3 bg-pink-50 border border-pink-200">
                  <p className="text-xs text-pink-800 mb-2 font-medium">
                    Make Payment {formatPrice(bkashPayAmount)} to bKash Merchant: 01955945219
                    {effectivePayment === "bkash_50_advance" && ` — remaining ${formatPrice(total - advanceAmount)} on delivery`}
                  </p>
                  <input name="txnId" value={form.txnId} onChange={handleChange} className="input-field text-sm" placeholder="bKash Transaction ID" required />
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark-50 p-5 sticky top-24">
              <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="truncate pr-2">{item.product.name} {item.selectedSize ? `(${item.selectedSize})` : ""} x {item.quantity}</span>
                    <span className="shrink-0 font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping ({isDhaka ? "Dhaka" : "Outside Dhaka"})</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
                <div className="border-t border-dark-200 pt-2 flex justify-between text-base font-bold"><span>Total</span><span className="text-brand">{formatPrice(total)}</span></div>
                {effectivePayment === "bkash_50_advance" && (
                  <div className="pt-1 space-y-1 text-xs text-dark-400">
                    <div className="flex justify-between"><span>Pay now (50%)</span><span className="font-medium text-brand">{formatPrice(advanceAmount)}</span></div>
                    <div className="flex justify-between"><span>Pay on delivery</span><span>{formatPrice(total - advanceAmount)}</span></div>
                  </div>
                )}
                {effectivePayment === "bkash_100_advance" && (
                  <div className="pt-1 text-xs text-dark-400">
                    <div className="flex justify-between"><span>Pay now (100%)</span><span className="font-medium text-brand">{formatPrice(total)}</span></div>
                  </div>
                )}
              </div>
              {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full mt-5 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? "Processing..." : `Place Order — ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
