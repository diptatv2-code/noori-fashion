import { createClient } from '@supabase/supabase-js';
import ProductsClient from './ProductsClient';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const revalidate = 60;

export default async function ProductsPage() {
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('nf_products')
      .select('*, nf_categories(*), nf_product_images(*), nf_product_variants(*)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(120),
    supabase
      .from('nf_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  return <ProductsClient products={productsRes.data || []} categories={categoriesRes.data || []} />;
}
