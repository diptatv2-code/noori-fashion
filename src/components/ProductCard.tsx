'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, useUIStore } from '@/lib/store';
import { formatPrice, getDiscount } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';
import WishlistButton from '@/components/WishlistButton';
import type { Product } from '@/types';

// Warm the Vercel image optimizer cache for the sizes the product detail
// page will request so that click → navigation → first paint is not gated
// on a cold optimizer miss (~350ms per image).
const MAIN_IMAGE_WIDTHS = [640, 1080] as const;
function preloadMainImage(url: string) {
  if (typeof window === 'undefined') return;
  const base = getImageUrl(url);
  for (const w of MAIN_IMAGE_WIDTHS) {
    const img = new window.Image();
    img.src = `/_next/image?url=${encodeURIComponent(base)}&w=${w}&q=75`;
  }
}

function getImg(product: Product): string {
  const imgs = product.nf_product_images;
  if (imgs && imgs.length > 0) return getImageUrl(imgs[0].url);
  return '/products/placeholder.jpg';
}

function getSecondImg(product: Product): string | null {
  const imgs = product.nf_product_images;
  if (imgs && imgs.length > 1) return getImageUrl(imgs[1].url);
  return null;
}

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const setQuickView = useUIStore((s) => s.setQuickView);
  const discount = getDiscount(product.price, product.compare_price);
  const secondImg = getSecondImg(product);

  const warmImages = useCallback(() => {
    const imgs = product.nf_product_images;
    if (!imgs || imgs.length === 0) return;
    preloadMainImage(imgs[0].url);
  }, [product]);

  return (
    <div
      className="group relative animate-fade-in"
      onMouseEnter={warmImages}
      onTouchStart={warmImages}
    >
      {/* Badges */}
      {product.is_new && <span className="badge-new">New</span>}
      {discount > 0 && <span className="badge-sale">-{discount}%</span>}

      {/* Wishlist toggle */}
      <WishlistButton productId={product.id} className="absolute top-2 right-2 z-10" />

      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
        onFocus={warmImages}
        className="block relative aspect-[3/4] bg-dark-50 overflow-hidden mb-3"
      >
        <Image
          src={getImg(product)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {secondImg && (
          <Image
            src={secondImg}
            alt={product.name}
            fill
            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 absolute inset-0"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Hover Actions */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setQuickView(product); }}
              className="flex-1 bg-white text-dark-600 text-xs font-medium py-2 hover:bg-brand hover:text-white transition-colors text-center"
            >
              Quick View
            </button>
            <button
              onClick={(e) => { e.preventDefault(); addItem(product, 1); }}
              className="flex-1 bg-brand text-white text-xs font-medium py-2 hover:bg-brand-dark transition-colors text-center"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="px-0.5">
        {product.nf_categories && (
          <p className="text-[10px] uppercase tracking-wider text-dark-400 mb-1">{product.nf_categories.name}</p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-dark-600 line-clamp-2 hover:text-brand transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-brand">{formatPrice(product.price)}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-xs text-dark-300 line-through">{formatPrice(product.compare_price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
