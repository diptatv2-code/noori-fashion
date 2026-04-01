"use client";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, useUIStore } from "@/lib/store";
import { formatPrice, getDiscount, getImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

function getImg(product: Product): string {
  const imgs = product.nf_product_images;
  if (imgs && imgs.length > 0) return getImageUrl(imgs[0].url);
  return "/products/placeholder.jpg";
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

  return (
    <div className="group relative animate-fade-in">
      {/* Badges */}
      {product.is_new && <span className="badge-new">New</span>}
      {discount > 0 && <span className="badge-sale">-{discount}%</span>}

      {/* Wishlist Heart */}
      <button
        className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-brand hover:text-white text-dark-400 shadow-sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        aria-label="Add to wishlist"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Image */}
      <Link
        href={`/product/${product.slug}`}
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
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickView(product);
              }}
              className="flex-1 bg-white text-dark-600 text-xs font-medium py-2.5 hover:bg-dark-600 hover:text-white transition-colors text-center backdrop-blur-sm"
            >
              Quick View
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem(product, 1);
              }}
              className="flex-1 bg-brand text-white text-xs font-medium py-2.5 hover:bg-brand-dark transition-colors text-center"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="px-0.5">
        {product.nf_categories && (
          <p className="text-[10px] uppercase tracking-wider text-dark-400 mb-1">
            {product.nf_categories.name}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-dark-600 line-clamp-2 hover:text-brand transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-bold text-brand">
            {formatPrice(product.price)}
          </span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-xs text-dark-300 line-through">
              {formatPrice(product.compare_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
