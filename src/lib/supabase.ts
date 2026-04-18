import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
export const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getServiceClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/products/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/noori-fashion/${path}`;
}
