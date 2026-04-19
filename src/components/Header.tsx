'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, useAuthStore, useUIStore } from '@/lib/store';
import { useSettings } from '@/components/SettingsProvider';
import type { Category } from '@/types';

export default function Header({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const toggleCart = useCartStore((s) => s.toggleCart);
  const user = useAuthStore((s) => s.user);
  const { toggleSearch, isMenuOpen, toggleMenu } = useUIStore();
  const settings = useSettings();

  const whatsappNumber = settings.whatsapp.replace(/[^0-9]/g, '');
  const shippingText = `Delivery in Dhaka: ৳${settings.shipping_dhaka} | Outside Dhaka: ৳${settings.shipping_outside} | Free Shipping on ৳${settings.free_shipping_min.toLocaleString('en-US')}+ Orders`;

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-black text-white text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <p>{shippingText}</p>
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.phone}`} className="hover:text-brand transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {settings.phone}
            </a>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="hover:text-brand transition-colors">WhatsApp</a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 bg-black text-white transition-shadow duration-300 ${scrolled ? 'shadow-md shadow-black/40' : 'shadow-sm shadow-black/20'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile Menu */}
            <button onClick={toggleMenu} className="md:hidden p-2 -ml-2 text-white" aria-label="Menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.jpg"
                alt="Noori Fashion"
                width={80}
                height={80}
                className="h-14 w-14 md:h-20 md:w-20 rounded-full object-cover border border-white/20"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 text-sm font-medium text-white hover:text-brand transition-colors">Home</Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-3 py-2 text-sm font-medium text-white hover:text-brand transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3 text-white">
              <button onClick={toggleSearch} className="p-2 hover:text-brand transition-colors" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>

              {user ? (
                <Link href={user.role === 'admin' ? '/admin' : '/account'} className="p-2 hover:text-brand transition-colors" aria-label="Account">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </Link>
              ) : (
                <Link href="/login" className="p-2 hover:text-brand transition-colors" aria-label="Login">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </Link>
              )}

              <button onClick={toggleCart} className="p-2 hover:text-brand transition-colors relative" aria-label="Cart">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={toggleMenu} />
          <div className="absolute left-0 top-0 h-full w-72 bg-black text-white animate-slide-in-right shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-white">Noori <span className="text-brand">Fashion</span></span>
              <button onClick={toggleMenu} className="p-1 text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <nav className="py-2">
              <Link href="/" onClick={toggleMenu} className="block px-4 py-3 text-sm font-medium text-white hover:text-brand transition-colors border-b border-white/10">Home</Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={toggleMenu}
                  className="block px-4 py-3 text-sm font-medium text-white hover:text-brand transition-colors border-b border-white/10"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/track-order" onClick={toggleMenu} className="block px-4 py-3 text-sm font-medium text-white hover:text-brand transition-colors border-b border-white/10">
                Track Order
              </Link>
              {user ? (
                <Link href="/account" onClick={toggleMenu} className="block px-4 py-3 text-sm font-medium text-white hover:text-brand transition-colors">
                  My Account
                </Link>
              ) : (
                <Link href="/login" onClick={toggleMenu} className="block px-4 py-3 text-sm font-medium text-white hover:text-brand transition-colors">
                  Login / Register
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
