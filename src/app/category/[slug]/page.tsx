import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const revalidate = 60;

export async function generateStaticParams() {
  const { data } = await supabase.from("nf_categories").select("slug").eq("is_active", true);
  return (data || []).map((c: { slug: string }) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: category } = await supabase.from("nf_categories").select("name").eq("slug", params.slug).single();
  return {
    title: category ? `${category.name} Collection | Noori Fashion` : "Collection | Noori Fashion",
    description: category ? `Shop ${category.name} collection at Noori Fashion — premium women's fashion in Bangladesh.` : undefined,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { data: category } = await supabase.from("nf_categories").select("*").eq("slug", params.slug).single();
  if (!category) notFound();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("nf_products")
      .select("*, nf_categories(*), nf_product_images(*), nf_product_variants(*)")
      .eq("is_active", true)
      .eq("category_id", category.id)
      .order("created_at", { ascending: false }),
    supabase.from("nf_categories").select("*").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <CategoryClient
      category={category}
      products={productsRes.data || []}
      categories={categoriesRes.data || []}
    />
  );
}
