import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim()
);
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: category } = await supabase.from("nf_categories").select("name").eq("slug", params.slug).single();
  return {
    title: category ? `${category.name} Collection | Noori Fashion` : "Collection | Noori Fashion",
    description: category ? `Shop ${category.name} collection at Noori Fashion — premium women's fashion in Bangladesh.` : undefined,
  };
}



export default async function CategoryPage({ params, searchParams }: { params: { slug: string }; searchParams: { sort?: string; page?: string } }) {
  const { data: category } = await supabase.from("nf_categories").select("*").eq("slug", params.slug).single();
  if (!category) notFound();

  const page = parseInt(searchParams.page || "1");
  const perPage = 12;
  const sort = searchParams.sort || "newest";

  let query = supabase
    .from("nf_products")
    .select("*, nf_categories(*), nf_product_images(*), nf_product_variants(*)", { count: "exact" })
    .eq("is_active", true)
    .eq("category_id", category.id);

  if (sort === "price_low") query = query.order("price", { ascending: true });
  else if (sort === "price_high") query = query.order("price", { ascending: false });
  else if (sort === "popular") query = query.order("sold_count", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: products, count } = await query.range((page - 1) * perPage, page * perPage - 1);
  const { data: categories } = await supabase.from("nf_categories").select("*").eq("is_active", true).order("sort_order");

  return (
    <CategoryClient
      category={category}
      products={products || []}
      totalCount={count || 0}
      currentPage={page}
      perPage={perPage}
      sort={sort}
      categories={categories || []}
    />
  );
}
