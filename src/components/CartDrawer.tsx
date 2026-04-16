'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';

function getImg(product: any): string {
  const imgs = product.nf_product_images;
  if (imgs && imgs.length > 0) return getImageUrl(imgs[0].url);
  return '/products/placeholder.jpg';
}

export default function CartDrawer() {
  const { items, isCartOpen, setCartOpen, removeItem, updateQuantity, getTotal } = useCartStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-display text-lg font-semibold">Shopping Bag ({items.length})</h2>
          <button onClick={() => setCartOpen(false)} className="p-1 hover:text-brand">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto text-dark-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <p className="text-dark-400">Your bag is empty</p>
              <button onClick={() => setCartOpen(false)} className="mt-4 btn-primary text-sm">Start Shopping</button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedSize}-${idx}`} className="flex gap-3 pb-4 border-b border-dark-100">
                  <div className="w-20 h-24 bg-dark-50 relative shrink-0 overflow-hidden">
                    <Image src={getImg(item.product)} alt={item.product.name} fill className="object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                    {item.selectedSize && <p className="text-xs text-dark-400 mt-0.5">Size: {item.selectedSize}</p>}
                    <p className="text-sm font-semibold text-brand mt-1">{formatPrice((item.variant?.price_override != null && item.variant.price_override > 0) ? item.variant.price_override : item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)} className="w-7 h-7 border border-dark-200 flex items-center justify-center text-sm hover:border-brand">−</button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)} className="w-7 h-7 border border-dark-200 flex items-center justify-center text-sm hover:border-brand">+</button>
                      <button onClick={() => removeItem(item.product.id, item.selectedSize)} className="ml-auto text-dark-300 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold text-lg">{formatPrice(getTotal())}</span>
            </div>
            <p className="text-xs text-dark-400">Shipping calculated at checkout</p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart" onClick={() => setCartOpen(false)} className="btn-outline text-center text-sm py-2.5">
                View Cart
              </Link>
              <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-primary text-center text-sm py-2.5">
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
