"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import type { Category, Product } from "@/types";

interface Props {
  category: Category;
  products: Product[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  sort: string;
  categories: Category[];
}

export default function CategoryClient({ category, products, totalCount, currentPage, perPage, sort, categories }: Props) {
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / perPage);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const allSizes = useMemo(() => {
    const sizes = new Set<string>();
    products.forEach((p) => {
      p.nf_product_variants?.forEach((v) => { if (v.size) sizes.add(v.size); });
    });
    return Array.from(sizes).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedSizes.length > 0) {
        const productSizes = p.nf_product_variants?.map((v) => v.size).filter(Boolean) || [];
        if (!selectedSizes.some((s) => productSizes.includes(s))) return false;
      }
      return true;
    });
  }, [products, priceRange, selectedSizes]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleSort = (newSort: string) => {
    router.push(`/category/${category.slug}?sort=${newSort}&page=1`);
  };

  return (
    <>
      <QuickViewModal />
      <div className="bg-dark-50 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Link href="/" className="hover:text-brand">Home</Link>
            <span>/</span>
            <span className="text-dark-600 font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <div className="mb-6">
              <h3 className="font-display text-lg font-semibold mb-4">Categories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`}
                    className={`block px-3 py-2 text-sm transition-colors ${cat.id === category.id ? "bg-brand text-white font-medium" : "text-dark-500 hover:bg-dark-50 hover:text-brand"}`}>
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Price Filter */}
            <div className="mb-6 border-t border-dark-100 pt-4">
              <h4 className="text-sm font-semibold mb-3">Price Range</h4>
              <div className="flex items-center gap-2 text-sm">
                <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full border border-dark-200 px-2 py-1.5 text-xs" placeholder="Min" />
                <span className="text-dark-400">-</span>
                <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full border border-dark-200 px-2 py-1.5 text-xs" placeholder="Max" />
              </div>
            </div>

            {/* Size Filter */}
            {allSizes.length > 0 && (
              <div className="border-t border-dark-100 pt-4">
                <h4 className="text-sm font-semibold mb-3">Size</h4>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)}
                      className={`min-w-[36px] h-8 px-2 border text-xs transition-colors ${
                        selectedSizes.includes(size) ? "border-brand bg-brand text-white" : "border-dark-200 hover:border-brand"
                      }`}>
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <button onClick={() => setSelectedSizes([])} className="text-xs text-brand mt-2 hover:underline">Clear filters</button>
                )}
              </div>
            )}
          </aside>

          {/* Products */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="font-display text-2xl font-semibold">{category.name}</h1>
                <p className="text-sm text-dark-400 mt-1">{filteredProducts.length} of {totalCount} products</p>
              </div>
              <select value={sort} onChange={(e) => handleSort(e.target.value)} className="input-field w-auto text-sm py-2">
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-20"><p className="text-dark-400">No products found matching your filters</p></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {currentPage > 1 && (
                  <Link href={`/category/${category.slug}?sort=${sort}&page=${currentPage - 1}`} className="px-4 py-2 border border-dark-200 text-sm hover:border-brand hover:text-brand transition-colors">
                    Previous
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/category/${category.slug}?sort=${sort}&page=${p}`}
                    className={`w-10 h-10 flex items-center justify-center text-sm border transition-colors ${p === currentPage ? "bg-brand text-white border-brand" : "border-dark-200 hover:border-brand hover:text-brand"}`}>
                    {p}
                  </Link>
                ))}
                {currentPage < totalPages && (
                  <Link href={`/category/${category.slug}?sort=${sort}&page=${currentPage + 1}`} className="px-4 py-2 border border-dark-200 text-sm hover:border-brand hover:text-brand transition-colors">
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
