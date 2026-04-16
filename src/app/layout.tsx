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
  title: 'নূরী ফ্যাশন | Noori Fashion - Premium Women\'s Fashion',
  description: 'নূরী ফ্যাশন — বাংলাদেশের প্রিমিয়াম মহিলা ফ্যাশন ব্র্যান্ড। এক্সক্লুসিভ, স্টিচ, আনস্টিচ, প্লাজো সেট ও কো-অর্ড সেট কালেকশন।',
  icons: { icon: '/favicon.ico' },
  openGraph: {
    title: 'নূরী ফ্যাশন | Noori Fashion',
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
