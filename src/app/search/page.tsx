import { createClient } from '@supabase/supabase-js';
import SearchClient from './SearchClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q || '';
  let products: any[] = [];

  if (q.length >= 2) {
    const { data } = await supabase
      .from('nf_products')
      .select('*, nf_categories(*), nf_product_images(*), nf_product_variants(*)')
      .eq('is_active', true)
      .or(`name.ilike.%${q.replace(/[,.()]/g, '')}%,description.ilike.%${q.replace(/[,.()]/g, '')}%`)
      .order('created_at', { ascending: false })
      .limit(24);
    products = data || [];
  }

  return <SearchClient query={q} products={products} />;
}
