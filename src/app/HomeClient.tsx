'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import QuickViewModal from '@/components/QuickViewModal';
import { useSettings } from '@/components/SettingsProvider';
import { getImageUrl } from '@/lib/supabase';
import type { Category, Product, Banner } from '@/types';

interface Props {
  categories: Category[];
  featured: Product[];
  newArrivals: Product[];
  banners: Banner[];
  categoryCounts?: Record<string, number>;
}

export default function HomeClient({ categories, featured, newArrivals, banners }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const settings = useSettings();

  const slides = banners.length > 0
    ? banners.map((b) => ({
        image: getImageUrl(b.image),
        title: b.title || '',
        subtitle: b.subtitle || '',
        cta: b.link || '/category/exclusive',
        ctaText: 'View Collection',
      }))
    : [
        { image: '/banner-1.jpg', title: 'Exclusive Collection', subtitle: 'Premium Indian Boutique Dresses', cta: '/category/exclusive', ctaText: 'View Collection' },
      ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  return (
    <>
      <QuickViewModal />

      {/* Hero Slider */}
      <section className="relative h-[60vh] md:h-[85vh] overflow-hidden bg-dark-800">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-lg">
                  <p className="text-brand font-medium tracking-widest uppercase text-xs md:text-sm mb-3 animate-fade-in">
                    Noori Fashion
                  </p>
                  <h1
                    className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
                    style={{ animation: idx === currentSlide ? 'slideInUp 0.6s ease-out forwards' : 'none' }}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className="text-white/80 text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-md"
                    style={{ animation: idx === currentSlide ? 'slideInUp 0.6s ease-out 0.15s forwards' : 'none', opacity: idx === currentSlide ? undefined : 0 }}
                  >
                    {slide.subtitle}
                  </p>
                  <div
                    className="flex flex-wrap gap-3"
                    style={{ animation: idx === currentSlide ? 'slideInUp 0.6s ease-out 0.3s forwards' : 'none', opacity: idx === currentSlide ? undefined : 0 }}
                  >
                    <Link href={slide.cta} className="btn-primary">{slide.ctaText}</Link>
                    <Link href="/products" className="btn-outline border-white text-white hover:bg-white hover:text-dark-600">See All</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1 transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-brand' : 'w-4 bg-white/40 hover:bg-white/60'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-brand text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-brand text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <h2 className="section-title">Our Collection</h2>
        <p className="text-center text-dark-400 text-sm mb-8">Browse our finest categories</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat, idx) => {
            const bgImages = ['/banner-1.jpg', '/banner-2.jpg', '/banner-3.jpg', '/banner-1.jpg', '/banner-2.jpg'];
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="group relative bg-dark-50 aspect-[4/5] overflow-hidden animate-fade-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <Image
                  src={cat.image ? getImageUrl(cat.image) : bgImages[idx % bgImages.length]}
                  alt={cat.name_bn || cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <h3 className="text-white font-display font-semibold text-lg">{cat.name_bn || cat.name}</h3>
                  <p className="text-white/70 text-xs mt-1 group-hover:text-brand transition-colors">View Collection →</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">Featured Collection</h2>
              <p className="text-dark-400 text-sm mt-1">Our top picks for you</p>
            </div>
            <Link href="/products?featured=true" className="text-sm text-brand font-medium hover:underline hidden md:block">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Mid-page Banner */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <Image src="/banner-2.jpg" alt="Noori Fashion Collection" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-md">
              <p className="text-brand text-xs md:text-sm uppercase tracking-widest mb-2 font-medium">Special Offer</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                <span className="text-brand">Free Delivery</span> on orders ৳{settings.free_shipping_min.toLocaleString('en-BD')}+
              </h2>
              <p className="text-white/70 text-sm md:text-base mb-6">Delivery across Bangladesh. Pay via Cash on Delivery, bKash, Nagad — any method you prefer.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/products" className="btn-primary text-sm">Start Shopping</Link>
              </div>
              <div className="flex gap-6 mt-8">
                <div className="text-center">
                  <div className="w-11 h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  </div>
                  <p className="text-white text-[10px] md:text-xs">Free Delivery</p>
                </div>
                <div className="text-center">
                  <div className="w-11 h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <p className="text-white text-[10px] md:text-xs">Original</p>
                </div>
                <div className="text-center">
                  <div className="w-11 h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <p className="text-white text-[10px] md:text-xs">Easy Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold">New Arrivals</h2>
              <p className="text-dark-400 text-sm mt-1">Latest additions to our store</p>
            </div>
            <Link href="/products?new=true" className="text-sm text-brand font-medium hover:underline hidden md:block">
              See All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* About / Trust Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/banner-3.jpg" alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mb-4">Why Choose Noori Fashion?</h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8">
            Noori Fashion is one of Bangladesh&apos;s leading premium women&apos;s fashion brands. We offer exclusive Indian boutique collections,
            premium stitched and unstitched dresses, trendy plazo sets, and elegant co-ord sets.
            Every product is carefully curated with the highest quality assurance.
          </p>
          <Link href="/products" className="btn-primary inline-block">Browse Collection</Link>
        </div>
      </section>
    </>
  );
}
