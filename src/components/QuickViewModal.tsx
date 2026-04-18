'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useUIStore, useCartStore } from '@/lib/store';
import { formatPrice, getDiscount } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';
import WishlistButton from '@/components/WishlistButton';

export default function QuickViewModal() {
  const product = useUIStore((s) => s.quickViewProduct);
  const setQuickView = useUIStore((s) => s.setQuickView);
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const variants = product.nf_product_variants || [];
  const sizes = [...new Set(variants.filter((v) => v.size).map((v) => v.size!))];
  const discount = getDiscount(product.price, product.compare_price);

  const getImg = () => {
    const imgs = product.nf_product_images;
    if (imgs && imgs.length > 0) return getImageUrl(imgs[0].url);
    return '/products/placeholder.jpg';
  };

  const handleAdd = () => {
    if (sizes.length > 0 && !selectedSize) return;
    const variant = variants.find((v) => v.size === selectedSize);
    addItem(product, qty, selectedSize, undefined, variant);
    setQuickView(null);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={() => setQuickView(null)} />
      <div className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl">
        <button onClick={() => setQuickView(null)} className="absolute top-3 right-3 z-10 p-1.5 bg-white/80 hover:bg-white shadow">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="grid md:grid-cols-2">
          <div className="aspect-[3/4] relative bg-dark-50">
            <Image src={getImg()} alt={product.name} fill className="object-cover" sizes="400px" />
            {discount > 0 && <span className="badge-sale">-{discount}%</span>}
            <WishlistButton productId={product.id} className="absolute top-3 left-3" />
          </div>
          <div className="p-6">
            {product.nf_categories && (
              <p className="text-[10px] uppercase tracking-wider text-dark-400 mb-1">{product.nf_categories.name}</p>
            )}
            <h2 className="font-display text-xl font-semibold mb-2">{product.name}</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-brand">{formatPrice(product.price)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-sm text-dark-300 line-through">{formatPrice(product.compare_price)}</span>
              )}
            </div>
            {product.description && <p className="text-sm text-dark-400 mb-4 line-clamp-2">{product.description}</p>}
            {product.fabric_type && <p className="text-xs text-dark-400 mb-4">Fabric: {product.fabric_type}</p>}

            {sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[40px] h-9 px-3 border text-sm transition-colors ${selectedSize === s ? 'border-brand bg-brand text-white' : 'border-dark-200 hover:border-brand'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="flex border border-dark-200">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-dark-50">−</button>
                <span className="w-10 h-9 flex items-center justify-center text-sm border-x border-dark-200">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-dark-50">+</button>
              </div>
              <button onClick={handleAdd} className="flex-1 btn-primary text-sm py-2.5">
                Add to Bag
              </button>
            </div>
            <Link href={`/product/${product.slug}`} onClick={() => setQuickView(null)} className="block text-center text-sm text-brand hover:underline">
              View Full Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
