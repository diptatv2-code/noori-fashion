import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export interface SiteSettings {
  site_name: string;
  site_name_en: string;
  site_tagline: string;
  shipping_dhaka: number;
  shipping_outside: number;
  free_shipping_min: number;
  whatsapp: string;
  facebook: string;
  instagram: string;
  email: string;
  phone: string;
  address: string;
  bkash_number: string;
  nagad_number: string;
  currency: string;
  making_charge: number;
}

const defaults: SiteSettings = {
  site_name: 'NOORI FASHION',
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

export async function getSettings(): Promise<SiteSettings> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await supabase.from('nf_settings').select('key, value');
    if (!data) return defaults;

    const map: Record<string, string> = {};
    data.forEach((row: { key: string; value: string | null }) => {
      if (row.value) map[row.key] = row.value;
    });

    return {
      site_name: map.site_name || defaults.site_name,
      site_name_en: map.site_name_en || defaults.site_name_en,
      site_tagline: map.site_tagline || defaults.site_tagline,
      shipping_dhaka: parseInt(map.shipping_dhaka) || defaults.shipping_dhaka,
      shipping_outside: parseInt(map.shipping_outside) || defaults.shipping_outside,
      free_shipping_min: parseInt(map.free_shipping_min) || defaults.free_shipping_min,
      whatsapp: map.whatsapp || defaults.whatsapp,
      facebook: map.facebook || defaults.facebook,
      instagram: map.instagram || defaults.instagram,
      email: map.email || defaults.email,
      phone: map.phone || defaults.phone,
      address: map.address || defaults.address,
      bkash_number: map.bkash_number || defaults.bkash_number,
      nagad_number: map.nagad_number || defaults.nagad_number,
      currency: map.currency || defaults.currency,
      making_charge: parseInt(map.making_charge) || defaults.making_charge,
    };
  } catch {
    return defaults;
  }
}
