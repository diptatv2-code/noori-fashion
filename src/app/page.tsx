import { createClient } from "@supabase/supabase-js";
import HomeClient from "./HomeClient";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const revalidate = 60;

export default async function HomePage() {
  const [categoriesRes, featuredRes, newRes, bannersRes, productCountsRes] =
    await Promise.all([
      supabase
        .from("nf_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("nf_products")
        .select("*, nf_categories(*), nf_product_images(*), nf_product_variants(*)")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("nf_products")
        .select("*, nf_categories(*), nf_product_images(*), nf_product_variants(*)")
        .eq("is_active", true)
        .eq("is_new", true)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("nf_banners")
        .select("*")
        .eq("is_active", true)
        .order("sort_order"),
      supabase
        .from("nf_products")
        .select("category_id")
        .eq("is_active", true),
    ]);

  const categoryCounts: Record<string, number> = {};
  (productCountsRes.data || []).forEach((p: any) => {
    if (p.category_id) {
      categoryCounts[p.category_id] = (categoryCounts[p.category_id] || 0) + 1;
    }
  });

  return (
    <HomeClient
      categories={categoriesRes.data || []}
      featured={featuredRes.data || []}
      newArrivals={newRes.data || []}
      banners={bannersRes.data || []}
      categoryCounts={categoryCounts}
    />
  );
}
