'use client';
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import { formatPrice, getDiscount } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';
import { useSettings } from '@/components/SettingsProvider';
import ProductCard from '@/components/ProductCard';
import WishlistButton from '@/components/WishlistButton';
import type { Product } from '@/types';

export default function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const images = product.nf_product_images || [];
  const variants = product.nf_product_variants || [];
  const sizes = [...new Set(variants.filter((v) => v.size).map((v) => v.size!))];
  const discount = getDiscount(product.price, product.compare_price);
  const settings = useSettings();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  useEffect(() => {
    fetch('/api/product-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: product.id }),
      keepalive: true,
    }).catch(() => {});
  }, [product.id]);

  const activePrice = useMemo(() => {
    if (selectedSize) {
      const variant = variants.find((v) => v.size === selectedSize);
      if (variant && variant.price_override && variant.price_override > 0) {
        return variant.price_override;
      }
    }
    return product.price;
  }, [selectedSize, variants, product.price]);

  const handleAdd = () => {
    if (sizes.length > 0 && !selectedSize) return;
    const variant = variants.find((v) => v.size === selectedSize);
    addItem(product, qty, selectedSize, undefined, variant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAdd();
    setTimeout(() => setCartOpen(true), 100);
  };

  const mainImg = images.length > 0 ? getImageUrl(images[selectedImage]?.url || images[0].url) : '/products/placeholder.jpg';

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-dark-50 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-sm text-dark-400">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span>/</span>
          {product.nf_categories && (
            <>
              <Link href={`/category/${product.nf_categories.slug}`} className="hover:text-brand">{product.nf_categories.name}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-dark-600 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="aspect-[3/4] relative bg-dark-50 overflow-hidden mb-3">
              <Image src={mainImg} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
              {discount > 0 && <span className="badge-sale">-{discount}%</span>}
              {product.is_new && <span className="badge-new">New</span>}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square relative bg-dark-50 overflow-hidden border-2 transition-colors ${idx === selectedImage ? 'border-brand' : 'border-transparent hover:border-dark-200'}`}
                  >
                    <Image src={getImageUrl(img.url)} alt="" fill className="object-cover" sizes="100px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.nf_categories && (
              <p className="text-xs uppercase tracking-wider text-dark-400 mb-2">{product.nf_categories.name}</p>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-brand">{formatPrice(activePrice)}</span>
              {product.compare_price && product.compare_price > activePrice && (
                <>
                  <span className="text-base text-dark-300 line-through">{formatPrice(product.compare_price)}</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 font-medium">-{getDiscount(activePrice, product.compare_price)}% OFF</span>
                </>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-dark-500 leading-relaxed mb-5 pb-5 border-b border-dark-100">{product.description}</p>
            )}

            {product.fabric_type && (
              <div className="mb-4 text-sm">
                <span className="text-dark-400">Fabric Type:</span>
                <span className="ml-2 font-medium">{product.fabric_type}</span>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="mb-5">
                <p className="text-sm font-semibold mb-2">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const v = variants.find((v) => v.size === s);
                    const inStock = v ? v.stock > 0 : true;
                    return (
                      <button
                        key={s}
                        onClick={() => inStock && setSelectedSize(s)}
                        disabled={!inStock}
                        className={`min-w-[48px] h-10 px-4 border text-sm transition-all ${
                          !inStock ? 'border-dark-100 text-dark-200 cursor-not-allowed line-through' :
                          selectedSize === s ? 'border-brand bg-brand text-white' : 'border-dark-200 hover:border-brand'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {sizes.length > 0 && !selectedSize && (
                  <p className="text-xs text-red-500 mt-1">Please select a size</p>
                )}
              </div>
            )}

            {/* Quantity + Actions */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex border border-dark-200">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-dark-50 text-lg">−</button>
                <span className="w-12 h-10 flex items-center justify-center text-sm border-x border-dark-200">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-dark-50 text-lg">+</button>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr_auto] gap-3 mb-6 items-stretch">
              <button onClick={handleAdd} className={`btn-outline text-sm py-3 ${added ? 'bg-green-600 text-white border-green-600' : ''}`}>
                {added ? '✓ Added' : 'Add to Bag'}
              </button>
              <button onClick={handleBuyNow} className="btn-primary text-sm py-3">
                Buy Now
              </button>
              <WishlistButton productId={product.id} className="!w-12 !h-auto !rounded-none border border-dark-200" />
            </div>

            {/* Info */}
            <div className="space-y-3 text-sm border-t border-dark-100 pt-5">
              <div className="flex items-center gap-2 text-dark-500">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                Dhaka: {formatPrice(settings.shipping_dhaka)} | Outside Dhaka: {formatPrice(settings.shipping_outside)} | Free on {formatPrice(settings.free_shipping_min)}+ orders
              </div>
              <div className="flex items-center gap-2 text-dark-500">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                Cash on Delivery | bKash | Nagad
              </div>
              <div className="flex items-center gap-2 text-dark-500">
                <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                100% Original Product Guarantee
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
