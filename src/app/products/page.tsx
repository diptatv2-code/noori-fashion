import { createClient } from '@supabase/supabase-js';
import ProductsClient from './ProductsClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const revalidate = 60;

export default async function ProductsPage({ searchParams }: { searchParams: { featured?: string; new?: string; sort?: string } }) {
  let query = supabase
    .from('nf_products')
    .select('*, nf_categories(*), nf_product_images(*), nf_product_variants(*)')
    .eq('is_active', true);

  if (searchParams.featured === 'true') {
    query = query.eq('is_featured', true);
  }
  if (searchParams.new === 'true') {
    query = query.eq('is_new', true);
  }

  const sort = searchParams.sort || 'newest';
  if (sort === 'price_asc') query = query.order('price', { ascending: true });
  else if (sort === 'price_desc') query = query.order('price', { ascending: false });
  else if (sort === 'popular') query = query.order('sold_count', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: products } = await query.limit(48);

  const { data: categories } = await supabase
    .from('nf_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  const title = searchParams.featured === 'true' ? 'Featured Collection' : searchParams.new === 'true' ? 'New Arrivals' : 'All Products';

  return <ProductsClient products={products || []} categories={categories || []} title={title} />;
}
