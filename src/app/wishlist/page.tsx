"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import type { Product } from "@/types";

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch_ = async () => {
      const { data } = await supabase
        .from("nf_wishlist")
        .select("product_id, nf_products(*, nf_categories(*), nf_product_images(*), nf_product_variants(*))")
        .eq("user_id", user.id);
      if (data) setProducts(data.map((w: any) => w.nf_products).filter(Boolean));
      setLoading(false);
    };
    fetch_();
  }, [user]);

  return (
    <>
      <QuickViewModal />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
          <Link href="/" className="hover:text-brand">Home</Link><span>/</span><span className="text-dark-600">Wishlist</span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-8">Wishlist</h1>
        {!user ? (
          <div className="text-center py-16">
            <p className="text-dark-400 mb-4">Please sign in to use your wishlist</p>
            <button onClick={() => router.push("/login")} className="btn-primary">Sign In</button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[1,2,3,4].map(i => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-dark-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <p className="text-dark-400 mb-4">Your wishlist is empty</p>
            <button onClick={() => router.push("/")} className="btn-primary">Browse Products</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
