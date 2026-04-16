import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getServiceClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/products/placeholder.jpg';
  if (path.startsWith('http')) return path;
  return `${supabaseUrl}/storage/v1/object/public/noori-fashion/${path}`;
}
