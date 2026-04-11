"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import type { Category, Product } from "@/types";

interface Props {
  products: Product[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  sort: string;
  categories: Category[];
}

export default function ProductsClient({ products, totalCount, currentPage, perPage, sort, categories }: Props) {
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <>
      <QuickViewModal />
      <div className="bg-dark-50 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Link href="/" className="hover:text-brand">Home</Link><span>/</span>
            <span className="text-dark-600 font-medium">All Products</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-60 shrink-0">
            <h3 className="font-display text-lg font-semibold mb-4">Categories</h3>
            <nav className="space-y-1">
              <Link href="/products" className="block px-3 py-2 text-sm bg-brand text-white font-medium">All Products</Link>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="block px-3 py-2 text-sm text-dark-500 hover:bg-dark-50 hover:text-brand">{cat.name}</Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="font-display text-2xl font-semibold">All Products</h1>
                <p className="text-sm text-dark-400 mt-1">{totalCount} products</p>
              </div>
              <select value={sort} onChange={(e) => router.push(`/products?sort=${e.target.value}&page=1`)} className="input-field w-auto text-sm py-2">
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
            {products.length === 0 ? (
              <p className="text-center text-dark-400 py-20">No products found</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {currentPage > 1 && <Link href={`/products?sort=${sort}&page=${currentPage - 1}`} className="px-4 py-2 border border-dark-200 text-sm hover:border-brand hover:text-brand">Previous</Link>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/products?sort=${sort}&page=${p}`} className={`w-10 h-10 flex items-center justify-center text-sm border ${p === currentPage ? "bg-brand text-white border-brand" : "border-dark-200 hover:border-brand hover:text-brand"}`}>{p}</Link>
                ))}
                {currentPage < totalPages && <Link href={`/products?sort=${sort}&page=${currentPage + 1}`} className="px-4 py-2 border border-dark-200 text-sm hover:border-brand hover:text-brand">Next</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
