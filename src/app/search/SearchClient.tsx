"use client";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import type { Product } from "@/types";

export default function SearchClient({ query, products }: { query: string; products: Product[] }) {
  return (
    <>
      <QuickViewModal />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
          <Link href="/" className="hover:text-brand">Home</Link><span>/</span><span className="text-dark-600">Search</span>
        </div>
        <h1 className="font-display text-2xl font-semibold mb-2">Search Results</h1>
        {query && <p className="text-dark-400 text-sm mb-6">{products.length} products found for &quot;{query}&quot;</p>}
        {products.length === 0 ? (
          <p className="text-center text-dark-400 py-16">No products found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
