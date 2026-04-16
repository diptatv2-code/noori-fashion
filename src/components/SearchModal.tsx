'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUIStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { getImageUrl } from '@/lib/supabase';
import type { Product } from '@/types';

export default function SearchModal() {
  const { isSearchOpen, toggleSearch } = useUIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('nf_products')
        .select('*, nf_product_images(*)')
        .eq('is_active', true)
        .or(`name.ilike.%${query.replace(/[,.()]/g, '')}%,description.ilike.%${query.replace(/[,.()]/g, '')}%`)
        .limit(8);
      setResults(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const getImg = (p: Product) => {
    const imgs = p.nf_product_images;
    if (imgs && imgs.length > 0) return getImageUrl(imgs[0].url);
    return '/products/placeholder.jpg';
  };

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleSearch} />
      <div className="relative max-w-2xl mx-auto mt-20 mx-4 md:mx-auto">
        <div className="bg-white shadow-2xl animate-slide-up">
          <div className="flex items-center border-b px-4">
            <svg className="w-5 h-5 text-dark-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="প্রোডাক্ট খুঁজুন..."
              className="flex-1 px-3 py-4 text-sm outline-none"
            />
            <button onClick={toggleSearch} className="p-1 text-dark-400 hover:text-dark-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {(results.length > 0 || loading) && (
            <div className="max-h-96 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center py-8 text-dark-400 text-sm">খুঁজছি...</div>
              ) : (
                <div className="space-y-3">
                  {results.map((p) => (
                    <Link key={p.id} href={`/product/${p.slug}`} onClick={toggleSearch} className="flex gap-3 hover:bg-dark-50 p-2 transition-colors">
                      <div className="w-14 h-14 bg-dark-50 relative shrink-0 overflow-hidden">
                        <Image src={getImg(p)} alt={p.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{p.name}</h4>
                        <p className="text-sm text-brand font-semibold">{formatPrice(p.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="text-center py-8 text-dark-400 text-sm">কোনো প্রোডাক্ট পাওয়া যায়নি</div>
          )}
        </div>
      </div>
    </div>
  );
}
