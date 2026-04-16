'use client';
import Link from 'next/link';
import { useSettings } from '@/components/SettingsProvider';

export default function Footer() {
  const settings = useSettings();
  const whatsappNumber = settings.whatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-dark-600 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold mb-4">Noori <span className="text-brand">Fashion</span></h3>
            <p className="text-dark-200 text-sm leading-relaxed mb-4">
              Premium women&apos;s fashion brand from Bangladesh. Exclusive collections, superior fabrics, and top-tier designs.
            </p>
            <div className="flex gap-3">
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-brand transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-brand transition-colors" aria-label="WhatsApp">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-dark-200">
              <li><Link href="/category/exclusive" className="hover:text-brand transition-colors">Exclusive</Link></li>
              <li><Link href="/category/stitch" className="hover:text-brand transition-colors">Stitch</Link></li>
              <li><Link href="/category/unstitch" className="hover:text-brand transition-colors">Unstitch</Link></li>
              <li><Link href="/category/plazo-set" className="hover:text-brand transition-colors">Plazo Set</Link></li>
              <li><Link href="/category/co-ord-set" className="hover:text-brand transition-colors">Co-ord Set</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-dark-200">
              <li><Link href="/track-order" className="hover:text-brand transition-colors">Track Order</Link></li>
              <li><Link href="/account" className="hover:text-brand transition-colors">My Account</Link></li>
              <li><Link href="/products" className="hover:text-brand transition-colors">All Products</Link></li>
              <li><Link href="/cart" className="hover:text-brand transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* Contact & Payment */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-dark-200">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {settings.phone}
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {settings.email}
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider mb-2 text-dark-300">Payment Methods</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-white/10 px-3 py-1.5">bKash</span>
                <span className="bg-white/10 px-3 py-1.5">Nagad</span>
                <span className="bg-white/10 px-3 py-1.5">COD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-dark-300">
          <p>&copy; {new Date().getFullYear()} Noori Fashion. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
