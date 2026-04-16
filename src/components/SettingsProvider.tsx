'use client';
import { createContext, useContext } from 'react';
import type { SiteSettings } from '@/lib/settings';

const SettingsContext = createContext<SiteSettings | null>(null);

export function SettingsProvider({ settings, children }: { settings: SiteSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SiteSettings {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    // Fallback defaults if context missing
    return {
      site_name: 'নূরী ফ্যাশন',
      site_name_en: 'Noori Fashion',
      site_tagline: 'Premium Women\'s Fashion',
      shipping_dhaka: 80,
      shipping_outside: 150,
      free_shipping_min: 5000,
      whatsapp: '+8801718389159',
      facebook: 'https://www.facebook.com/p/Noori-Fashion-100069602142684/',
      instagram: '',
      email: 'Noori330332@gmail.com',
      phone: '+8801718389159',
      address: 'Police Plaza Concord, Gulshan-1, Level 2, Shop 369-370, Dhaka',
      bkash_number: '01701019541',
      nagad_number: '01515653291',
      currency: '৳',
      making_charge: 500,
    };
  }
  return ctx;
}
