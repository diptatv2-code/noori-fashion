'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const getImg = (product: any): string => {
    const imgs = product.nf_product_images;
    if (imgs && imgs.length > 0) return getImageUrl(imgs[0].url);
    return '/products/placeholder.jpg';
  };

  if (!mounted) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-dark-400">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <svg className="w-20 h-20 mx-auto text-dark-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        <h1 className="font-display text-2xl font-semibold mb-2">Your Cart is Empty</h1>
        <p className="text-dark-400 mb-6">Add products to start shopping</p>
        <Link href="/" className="btn-primary inline-block">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, idx) => (
            <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="flex gap-4 p-4 border border-dark-100">
              <div className="w-24 h-32 md:w-28 md:h-36 bg-dark-50 relative shrink-0 overflow-hidden">
                <Image src={getImg(item.product)} alt={item.product.name} fill className="object-cover" sizes="120px" />
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.product.slug}`} className="font-medium text-sm md:text-base hover:text-brand transition-colors line-clamp-2">{item.product.name}</Link>
                {item.selectedSize && <p className="text-xs text-dark-400 mt-1">Size: {item.selectedSize}</p>}
                <p className="text-brand font-semibold mt-2">{formatPrice((item.variant?.price_override != null && item.variant.price_override > 0) ? item.variant.price_override : item.product.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-dark-200">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)} className="w-8 h-8 flex items-center justify-center hover:bg-dark-50">−</button>
                    <span className="w-10 h-8 flex items-center justify-center text-sm border-x border-dark-200">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)} className="w-8 h-8 flex items-center justify-center hover:bg-dark-50">+</button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-sm">{formatPrice(((item.variant?.price_override != null && item.variant.price_override > 0) ? item.variant.price_override : item.product.price) * item.quantity)}</span>
                    <button onClick={() => removeItem(item.product.id, item.selectedSize)} className="text-dark-300 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear Cart</button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-dark-50 p-6 sticky top-24">
            <h2 className="font-display text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span className="font-medium">{formatPrice(getTotal())}</span></div>
              <div className="flex justify-between text-dark-400"><span>Shipping</span><span>Calculated at checkout</span></div>
              <div className="border-t border-dark-200 pt-3 flex justify-between text-base font-bold"><span>Total</span><span className="text-brand">{formatPrice(getTotal())}</span></div>
            </div>
            <Link href="/checkout" className="btn-primary w-full text-center block mt-5">Proceed to Checkout</Link>
            <Link href="/" className="block text-center text-sm text-brand mt-3 hover:underline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
