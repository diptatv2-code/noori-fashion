"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore, useAuthStore, useUIStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";

const FALLBACK_CATEGORIES = [
  { id: "f1", name: "Exclusive", slug: "exclusive" },
  { id: "f2", name: "Stitch", slug: "stitch" },
  { id: "f3", name: "Unstitch", slug: "unstitch" },
  { id: "f4", name: "Plazo Set", slug: "plazo-set" },
  { id: "f5", name: "Co-ord Set", slug: "co-ord-set" },
];

export default function Header() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const user = useAuthStore((s) => s.user);
  const { toggleSearch, isMenuOpen, toggleMenu } = useUIStore();
  const displayCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  useEffect(() => {
    const fetchCats = async () => {
      const { data } = await supabase
        .from("nf_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (data) setCategories(data);
    };
    fetchCats();
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-dark-800 text-white/70 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p>Visit Us: Police Plaza Concord, Gulshan-1 | Call: +880 1718-389159</p>
          <div className="flex items-center gap-4">
            <a href="tel:+8801718389159" className="hover:text-brand transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              +880 1718-389159
            </a>
            <a href="https://wa.me/8801718389159" target="_blank" className="hover:text-brand transition-colors">WhatsApp</a>
          </div>
        </div>
      </div>

      {/* Main Header — BLACK */}
      <header className={`sticky top-0 z-50 bg-black transition-shadow duration-300 ${scrolled ? "shadow-lg shadow-black/30" : ""}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-[88px] md:h-28">
            {/* Mobile Menu */}
            <button onClick={toggleMenu} className="md:hidden p-2 -ml-2 text-white" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>

            {/* Logo */}
            <div className="flex-1 flex justify-center md:justify-start md:flex-none">
              <Link href="/" className="shrink-0">
                <Image src="/logo.jpg" alt="Noori Fashion" width={200} height={80} className="h-16 md:h-20 w-auto object-contain rounded" priority />
              </Link>
            </div>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for products..." className="w-full bg-white/10 border border-white/20 rounded-full pl-5 pr-12 py-2.5 text-sm text-white placeholder-white/40 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-colors" />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 bg-brand text-white rounded-full p-2 hover:bg-brand-dark transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>

            {/* Action Icons */}
            <div className="flex items-center gap-1 md:gap-3 text-white">
              <button onClick={toggleSearch} className="md:hidden p-2 hover:text-brand transition-colors" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
              <Link href={user?.role === "admin" ? "/admin" : "/account"} className="p-2 hover:text-brand transition-colors" aria-label="Account">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </Link>
              <Link href="/wishlist" className="p-2 hover:text-brand transition-colors" aria-label="Wishlist">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </Link>
              <button onClick={toggleCart} className="p-2 hover:text-brand transition-colors relative" aria-label="Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{itemCount > 9 ? "9+" : itemCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Nav — BLACK */}
        <nav className="hidden md:block border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-1">
              <Link href="/" className="px-4 py-3 text-sm font-medium text-white/70 hover:text-brand transition-colors">Home</Link>
              {displayCategories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="px-4 py-3 text-sm font-medium text-white/70 hover:text-brand transition-colors">{cat.name}</Link>
              ))}
              <Link href="/products" className="px-4 py-3 text-sm font-medium text-white/70 hover:text-brand transition-colors">All Products</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer — BLACK */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={toggleMenu} />
          <div className="absolute left-0 top-0 h-full w-72 bg-dark-800 animate-slide-in-right shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <Image src="/logo.jpg" alt="Noori Fashion" width={140} height={48} className="h-12 w-auto object-contain rounded" />
              <button onClick={toggleMenu} className="p-1 text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <nav className="py-2">
              <Link href="/" onClick={toggleMenu} className="block px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-brand transition-colors border-b border-white/5">Home</Link>
              {displayCategories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`} onClick={toggleMenu} className="block px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-brand transition-colors border-b border-white/5">{cat.name}</Link>
              ))}
              <Link href="/products" onClick={toggleMenu} className="block px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-brand transition-colors border-b border-white/5">All Products</Link>
              <div className="border-t border-white/10 mt-2 pt-2">
                <Link href="/wishlist" onClick={toggleMenu} className="block px-4 py-3 text-sm text-white/60 hover:text-brand transition-colors">Wishlist</Link>
                <Link href="/cart" onClick={toggleMenu} className="block px-4 py-3 text-sm text-white/60 hover:text-brand transition-colors">Cart</Link>
                <Link href="/track-order" onClick={toggleMenu} className="block px-4 py-3 text-sm text-white/60 hover:text-brand transition-colors">Track Order</Link>
                <Link href={user ? "/account" : "/login"} onClick={toggleMenu} className="block px-4 py-3 text-sm text-white/60 hover:text-brand transition-colors">{user ? "My Account" : "Sign In"}</Link>
              </div>
              <div className="border-t border-white/10 mt-2 pt-3 px-4">
                <a href="tel:+8801718389159" className="text-xs text-white/40">+880 1718-389159</a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
