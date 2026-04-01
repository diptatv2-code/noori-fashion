"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import type { Category, Product, Banner } from "@/types";

const heroSlides = [
  {
    image: "/banner-1.jpg",
    title: "Exclusive Collection",
    subtitle: "Premium Indian boutique dresses — unique designs for festivals and special moments",
    cta: "/category/exclusive",
    ctaText: "View Collection",
  },
  {
    image: "/banner-2.jpg",
    title: "Stitch Collection",
    subtitle: "Ready-made three-piece, plazo sets, co-ord sets — wear right away",
    cta: "/category/stitch",
    ctaText: "Shop Now",
  },
  {
    image: "/banner-3.jpg",
    title: "New Arrivals",
    subtitle: "Latest trending designs and color combinations — limited stock available",
    cta: "/category/plazo-set",
    ctaText: "Order Now",
  },
];

const categoryIcons: Record<string, JSX.Element> = {
  exclusive: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  stitch: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m-7.071-2.929l.707-.707m12.728-12.728l.707-.707M3 12h1m16 0h1m-2.929 7.071l-.707-.707M6.343 6.343l-.707-.707" /><circle cx="12" cy="12" r="4" strokeWidth={1.5} /></svg>,
  unstitch: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l4.879-4.879M7 7l2 2m0 0l-2 2m2-2l2-2m-2 2l2 2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 5.636a1 1 0 010 1.414L4.222 8.464a1 1 0 01-1.414-1.414l1.414-1.414a1 1 0 011.414 0z" /></svg>,
  "plazo-set": <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3h6l1 7-2 8H10L8 10l1-7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10l-3 11m11-11l3 11" /></svg>,
  "co-ord-set": <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1" strokeWidth={1.5} /><rect x="14" y="12" width="7" height="9" rx="1" strokeWidth={1.5} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 7h4m-4 10h4" /></svg>,
};

interface Props {
  categories: Category[];
  featured: Product[];
  newArrivals: Product[];
  banners: Banner[];
  categoryCounts: Record<string, number>;
}

export default function HomeClient({ categories, featured, newArrivals, banners, categoryCounts }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <>
      <QuickViewModal />

      {/* Hero Slider */}
      <section className="relative h-[55vh] md:h-[80vh] overflow-hidden bg-dark-800">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority={idx === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-lg">
                  <p className="text-brand font-medium tracking-widest uppercase text-xs md:text-sm mb-3">Noori Fashion</p>
                  <h1
                    className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4"
                    style={{ animation: idx === currentSlide ? "slideInUp 0.6s ease-out forwards" : "none" }}
                  >
                    {slide.title}
                  </h1>
                  <p
                    className="text-white/80 text-sm md:text-base leading-relaxed mb-6 md:mb-8 max-w-md"
                    style={{ animation: idx === currentSlide ? "slideInUp 0.6s ease-out 0.15s forwards" : "none", opacity: idx === currentSlide ? undefined : 0 }}
                  >
                    {slide.subtitle}
                  </p>
                  <div
                    className="flex flex-wrap gap-3"
                    style={{ animation: idx === currentSlide ? "slideInUp 0.6s ease-out 0.3s forwards" : "none", opacity: idx === currentSlide ? undefined : 0 }}
                  >
                    <Link href={slide.cta} className="btn-primary">{slide.ctaText}</Link>
                    <Link href="/category/stitch" className="btn-outline border-white text-white hover:bg-white hover:text-dark-600">View All</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {heroSlides.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? "w-8 bg-brand" : "w-4 bg-white/40 hover:bg-white/60"}`} aria-label={`Slide ${idx + 1}`} />
          ))}
        </div>
        <button onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-brand text-white flex items-center justify-center transition-colors backdrop-blur-sm rounded-full" aria-label="Previous">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-brand text-white flex items-center justify-center transition-colors backdrop-blur-sm rounded-full" aria-label="Next">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-5 md:py-10">
        <p className="text-xs uppercase tracking-widest text-dark-400 text-center mb-4 md:mb-6">Categories</p>
        <div className="flex justify-center gap-5 md:gap-8 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            const icon = categoryIcons[cat.slug] || categoryIcons["exclusive"];
            return (
              <Link key={cat.id} href={`/category/${cat.slug}`} className="flex flex-col items-center shrink-0 group">
                <div className="w-[60px] h-[60px] md:w-[70px] md:h-[70px] bg-brand rounded-full flex items-center justify-center mb-1.5 group-hover:bg-brand-dark transition-colors shadow-sm text-white">
                  {icon}
                </div>
                <span className="text-[11px] md:text-xs font-medium text-dark-600 text-center leading-tight">{cat.name}</span>
                <span className="text-[10px] text-dark-400">{count === 1 ? "1 Product" : `${count} Products`}</span>
              </Link>
            );
          })}
        </div>
        <div className="text-center mt-4">
          <Link href="/category/stitch" className="text-xs text-brand font-medium hover:underline">See All Collection &rarr;</Link>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4 md:py-10">
          <div className="flex items-center justify-between mb-5 md:mb-8">
            <h2 className="font-display text-lg md:text-2xl font-semibold">Featured Collection</h2>
            <Link href="/category/exclusive" className="text-xs md:text-sm text-brand font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Special Offer Banner */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden my-2 md:my-6">
        <Image src="/banner-2.jpg" alt="Noori Fashion Collection" fill className="object-cover object-top" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-md">
              <p className="text-brand text-[10px] md:text-sm uppercase tracking-widest mb-1.5 font-medium">Special Offer</p>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-2 md:mb-3">
                Free Delivery on <span className="text-brand">&#2547;5,000+</span> Orders
              </h2>
              <p className="text-white/70 text-xs md:text-base mb-4 md:mb-6">Nationwide delivery. Cash on Delivery or bKash.</p>
              <Link href="/category/exclusive" className="btn-primary text-xs md:text-sm py-2.5 px-5">Start Shopping</Link>
              <div className="flex gap-5 mt-5 md:mt-8">
                <div className="text-center">
                  <div className="w-9 h-9 md:w-11 md:h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                  </div>
                  <p className="text-white text-[9px] md:text-xs">Free Delivery</p>
                </div>
                <div className="text-center">
                  <div className="w-9 h-9 md:w-11 md:h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <p className="text-white text-[9px] md:text-xs">100% Original</p>
                </div>
                <div className="text-center">
                  <div className="w-9 h-9 md:w-11 md:h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  </div>
                  <p className="text-white text-[9px] md:text-xs">Easy Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Our Store */}
      <section className="bg-dark-50 py-5 md:py-8">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-base md:text-xl font-semibold text-center mb-4">Visit Our Store</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 text-center md:text-left">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <div>
                <p className="text-sm font-medium text-dark-600">Police Plaza Concord, Gulshan-1</p>
                <p className="text-[11px] text-dark-400">Level 2, Shop 369-370, Dhaka</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-dark-200" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm text-dark-600">Sat &mdash; Thu, 10AM &mdash; 9PM</p>
            </div>
            <div className="hidden md:block w-px h-8 bg-dark-200" />
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <a href="tel:+8801718389159" className="text-sm text-brand hover:underline">+880 1718-389159</a>
            </div>
            <a href="https://maps.google.com/?q=Police+Plaza+Concord+Gulshan+Dhaka" target="_blank" rel="noopener noreferrer" className="btn-outline text-xs px-4 py-2 mt-1 md:mt-0">Get Directions</a>
          </div>
        </div>
      </section>
    </>
  );
}
