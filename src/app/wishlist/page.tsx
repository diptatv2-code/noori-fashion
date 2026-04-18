'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import type { Product } from '@/types';

export default function WishlistPage() {
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from('nf_wishlist')
        .select('nf_products(*, nf_categories(*), nf_product_images(*), nf_product_variants(*))')
        .eq('user_id', user.id);
      if (!cancelled) {
        const items = (data || [])
          .map((row: any) => row.nf_products)
          .filter(Boolean);
        setProducts(items);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <svg className="w-16 h-16 mx-auto text-dark-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h1 className="font-display text-2xl font-semibold mb-2">My Wishlist</h1>
        <p className="text-dark-400 text-sm mb-6">Sign in to save products you love</p>
        <Link href="/login" className="btn-primary inline-block">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <QuickViewModal />
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link><span>/</span><span className="text-dark-600">Wishlist</span>
      </div>
      <h1 className="font-display text-2xl md:text-3xl font-semibold mb-6">My Wishlist</h1>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-72" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-dark-400 mb-4">No saved items yet.</p>
          <Link href="/products" className="btn-primary inline-block">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
