import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim()
);
export const revalidate = 60;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase
    .from("nf_products")
    .select("*, nf_categories(*), nf_product_images(*), nf_product_variants(*)")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from("nf_products")
    .select("*, nf_categories(*), nf_product_images(*), nf_product_variants(*)")
    .eq("is_active", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);

  return <ProductDetailClient product={product} related={related || []} />;
}
