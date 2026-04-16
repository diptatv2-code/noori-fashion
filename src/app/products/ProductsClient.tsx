'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import type { Category, Product } from '@/types';

export default function ProductsClient({ products, categories, title }: { products: Product[]; categories: Category[]; title: string }) {
  const router = useRouter();
  const [sort, setSort] = useState('newest');

  const handleSort = (val: string) => {
    setSort(val);
    const params = new URLSearchParams(window.location.search);
    params.set('sort', val);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <>
      <QuickViewModal />
      <div className="bg-dark-50 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 text-sm text-dark-400">
          <Link href="/" className="hover:text-brand">Home</Link>
          <span>/</span>
          <span className="text-dark-600">{title}</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-semibold">{title}</h1>
            <p className="text-dark-400 text-sm mt-1">{products.length} products</p>
          </div>
          <select value={sort} onChange={(e) => handleSort(e.target.value)} className="input-field w-auto text-sm">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="text-xs px-3 py-1.5 border border-dark-200 hover:border-brand hover:text-brand transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-center text-dark-400 py-16">No products found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
