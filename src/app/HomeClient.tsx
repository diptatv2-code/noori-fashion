"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import QuickViewModal from "@/components/QuickViewModal";
import { getImageUrl } from "@/lib/utils";
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
                  <p className="text-brand font-medium tracking-widest uppercase text-xs md:text-sm mb-3">
                    Noori Fashion
                  </p>
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
                    <Link href="/category/stitch" className="btn-outline border-white text-white hover:bg-white hover:text-dark-600">
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentSlide ? "w-8 bg-brand" : "w-4 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-brand text-white flex items-center justify-center transition-colors backdrop-blur-sm rounded-full"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/30 hover:bg-brand text-white flex items-center justify-center transition-colors backdrop-blur-sm rounded-full"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* New Arrival Banner */}
      <section className="bg-brand py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-white text-sm md:text-base">
            <svg className="w-5 h-5 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="font-medium tracking-wide">NEW ARRIVALS JUST DROPPED — CHECK OUT THE LATEST COLLECTION</span>
            <Link href="/category/exclusive" className="underline font-semibold hover:text-dark-600 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-14">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-semibold text-center mb-2">Shop by Category</h2>
        <p className="text-center text-dark-400 text-sm mb-6 md:mb-10">Find your perfect style from our curated collections</p>
        <div className="flex gap-4 md:gap-6 justify-center overflow-x-auto pb-2 px-2 -mx-2 scrollbar-hide">
          {categories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center shrink-0 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-brand rounded-full flex items-center justify-center mb-2 group-hover:bg-brand-dark transition-colors shadow-md">
                  <span className="text-white font-display font-bold text-lg md:text-xl">{cat.name.charAt(0)}</span>
                </div>
                <span className="text-xs md:text-sm font-medium text-dark-600 text-center leading-tight">{cat.name}</span>
                <span className="text-[10px] md:text-xs text-dark-400 mt-0.5">{count === 1 ? "1 Product" : `${count} Products`}</span>
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
              <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold">Featured Collection</h2>
              <p className="text-dark-400 text-sm mt-1">Handpicked favorites just for you</p>
            </div>
            <Link href="/category/exclusive" className="text-sm text-brand font-medium hover:underline hidden md:block">
              View All
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
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden my-4 md:my-8">
        <Image src="/banner-2.jpg" alt="Noori Fashion Collection" fill className="object-cover object-top" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-md">
              <p className="text-brand text-xs md:text-sm uppercase tracking-widest mb-2 font-medium">Special Offer</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                Free Delivery on <span className="text-brand">৳5,000+</span> Orders
              </h2>
              <p className="text-white/70 text-sm md:text-base mb-6">
                Nationwide delivery across Bangladesh. Pay via Cash on Delivery, bKash, or Nagad.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/category/exclusive" className="btn-primary text-sm">Start Shopping</Link>
              </div>
              <div className="flex gap-6 mt-8">
                <div className="text-center">
                  <div className="w-11 h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <p className="text-white text-[10px] md:text-xs">Free Delivery</p>
                </div>
                <div className="text-center">
                  <div className="w-11 h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-white text-[10px] md:text-xs">100% Original</p>
                </div>
                <div className="text-center">
                  <div className="w-11 h-11 border border-brand/50 rounded-full flex items-center justify-center mb-1.5">
                    <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <p className="text-white text-[10px] md:text-xs">Easy Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Visit Our Store */}
      <section className="bg-dark-50 py-6 md:py-12">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-lg md:text-2xl font-semibold text-center mb-1">Visit Our Store</h2>
          <p className="text-dark-400 text-xs md:text-sm text-center mb-5">Experience our premium collection in person</p>
          <div className="space-y-3 text-sm text-dark-500">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-brand shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Police Plaza Concord Shopping Mall, Gulshan-1, Level 2, Shop 369-370, Dhaka</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Sat &mdash; Thu, 10:00 AM &mdash; 9:00 PM</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span>+880 1718-389159</span>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>Noori330332@gmail.com</span>
            </div>
          </div>
          <div className="text-center mt-5">
            <a href="https://maps.google.com/?q=Police+Plaza+Concord+Gulshan+Dhaka" target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Get Directions
            </a>
          </div>
        </div>
      </section>
      {/* Why Choose Us */}
      <section className="relative py-8 md:py-14 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/banner-3.jpg" alt="" fill className="object-cover object-top" sizes="100vw" />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="font-display text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-4">
            Why Choose Noori Fashion?
          </h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-8">
            Noori Fashion is one of Bangladesh&apos;s most trusted premium women&apos;s fashion brands.
            We offer exclusive Indian boutique collections, premium stitch &amp; unstitch dresses,
            trendy plazo sets, and elegant co-ord sets. Every product is carefully curated
            with the highest quality assurance.
          </p>
          <Link href="/category/exclusive" className="btn-primary inline-block">
            Browse Collection
          </Link>
        </div>
      </section>
    </>
  );
}
