import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://noori.diptait.com.bd').trim();
  const now = new Date();

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from('nf_categories').select('slug, created_at').eq('is_active', true),
    supabase.from('nf_products').select('slug, updated_at').eq('is_active', true),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/track-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data || []).map((c: any) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: c.created_at ? new Date(c.created_at) : now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = (productsRes.data || []).map((p: any) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
