'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useWishlistStore } from '@/lib/store';

export default function WishlistButton({ productId, className = '' }: { productId: string; className?: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const inWishlist = useWishlistStore((s) => s.ids.has(productId));
  const addIds = useWishlistStore((s) => s.add);
  const removeIds = useWishlistStore((s) => s.remove);
  const [busy, setBusy] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    if (busy) return;
    setBusy(true);
    if (inWishlist) {
      removeIds(productId);
      await supabase.from('nf_wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
    } else {
      addIds(productId);
      await supabase.from('nf_wishlist').insert({ user_id: user.id, product_id: productId });
    }
    setBusy(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inWishlist}
      className={`w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 ${className}`}
    >
      <svg
        className={`w-4 h-4 transition-colors ${inWishlist ? 'text-red-500 fill-current' : 'text-dark-500'}`}
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
