'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useToastStore, useCartStore } from '@/lib/store';
import { getImageUrl } from '@/lib/supabase';

const DISMISS_MS = 3000;

function ToastCard({
  id,
  productName,
  productImage,
  quantity,
  size,
  onDismiss,
}: {
  id: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  size?: string;
  onDismiss: () => void;
}) {
  const setCartOpen = useCartStore((s) => s.setCartOpen);

  useEffect(() => {
    const t = setTimeout(onDismiss, DISMISS_MS);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  const imgSrc = productImage ? getImageUrl(productImage) : '/products/placeholder.jpg';

  return (
    <div className="bg-white border border-dark-100 shadow-lg flex items-stretch gap-3 p-3 pointer-events-auto animate-slide-in-right">
      <div className="w-14 h-16 relative shrink-0 bg-dark-50 overflow-hidden">
        <Image src={imgSrc} alt="" fill className="object-cover" sizes="56px" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-green-600">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Added to bag
          </p>
          <p className="text-sm font-medium text-dark-700 truncate mt-0.5">{productName}</p>
          <p className="text-[11px] text-dark-400">
            Qty {quantity}{size ? ` · Size ${size}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => { setCartOpen(true); onDismiss(); }}
            className="text-xs font-medium text-brand hover:underline"
          >
            View bag
          </button>
          <span className="text-dark-200">·</span>
          <Link
            href="/checkout"
            onClick={onDismiss}
            className="text-xs font-medium text-dark-500 hover:text-brand"
          >
            Checkout
          </Link>
        </div>
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="self-start text-dark-300 hover:text-dark-600 p-0.5 -m-0.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function Toaster() {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);

  if (items.length === 0) return null;

  return (
    <div className="fixed z-[85] top-20 md:top-24 right-3 left-3 md:left-auto md:right-4 flex flex-col gap-2 max-w-sm md:w-[22rem] pointer-events-none ml-auto">
      {items.map((t) => (
        <ToastCard
          key={t.id}
          id={t.id}
          productName={t.productName}
          productImage={t.productImage}
          quantity={t.quantity}
          size={t.size}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </div>
  );
}
