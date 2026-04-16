import type { Metadata } from 'next';
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

export const revalidate = 60;

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
  const settings = await getSettings();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: categories } = await supabase
    .from('nf_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col">
        <SettingsProvider settings={settings}>
          <AuthProvider />
          <Header categories={categories || []} />
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
