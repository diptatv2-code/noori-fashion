import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import SearchModal from '@/components/SearchModal';
import AuthProvider from '@/components/AuthProvider';
import { SettingsProvider } from '@/components/SettingsProvider';
import { getSettings } from '@/lib/settings';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

export const revalidate = 60;

// Settings + nav categories rarely change but block every render, including
// admin pages that don't even display them. Cache both at the data layer for
// 5 minutes so each request reuses the last result instead of round-tripping
// to the self-hosted Supabase.
const getCachedSettings = unstable_cache(
  async () => getSettings(),
  ['root_settings_v1'],
  { revalidate: 300 }
);

const getCachedNavCategories = unstable_cache(
  async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data } = await supabase
      .from('nf_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    return data || [];
  },
  ['root_nav_categories_v1'],
  { revalidate: 300 }
);

export const metadata: Metadata = {
  title: 'Noori Fashion - Premium Women\'s Fashion',
  description: 'Noori Fashion — Bangladesh\'s premium women\'s fashion brand. Exclusive, stitched, unstitched, plazo set and co-ord set collections.',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'Noori Fashion',
    description: 'Premium Women\'s Fashion Collection',
    url: 'https://noori.diptait.com.bd',
    siteName: 'Noori Fashion',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([
    getCachedSettings(),
    getCachedNavCategories(),
  ]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <SettingsProvider settings={settings}>
          <AuthProvider />
          <Header categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchModal />
          <WhatsAppButton />
        </SettingsProvider>
      </body>
    </html>
  );
}
