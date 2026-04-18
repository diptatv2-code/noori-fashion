'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import type { Category, Product } from '@/types';

type Sort = 'newest' | 'price_asc' | 'price_desc' | 'popular';

export default function ProductsClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFeatured = searchParams.get('featured') === 'true';
  const isNew = searchParams.get('new') === 'true';
  const initialSort = (searchParams.get('sort') as Sort) || 'newest';

  const [sort, setSort] = useState<Sort>(initialSort);

  const title = isFeatured ? 'Featured Collection' : isNew ? 'New Arrivals' : 'All Products';

  const visible = useMemo(() => {
    let list = products.slice();
    if (isFeatured) list = list.filter((p) => p.is_featured);
    if (isNew) list = list.filter((p) => p.is_new);

    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        list.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
        break;
      default:
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [products, isFeatured, isNew, sort]);

  const handleSort = (val: Sort) => {
    setSort(val);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', val);
    router.replace(`/products?${params.toString()}`, { scroll: false });
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
            <p className="text-dark-400 text-sm mt-1">{visible.length} products</p>
          </div>
          <select value={sort} onChange={(e) => handleSort(e.target.value as Sort)} className="input-field w-auto text-sm">
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="text-xs px-3 py-1.5 border border-dark-200 hover:border-brand hover:text-brand transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-center text-dark-400 py-16">No products found</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
