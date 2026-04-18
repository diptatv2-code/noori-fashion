import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabase";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const revalidate = 60;

export async function generateStaticParams() {
  const { data } = await supabase.from("nf_products").select("slug").eq("is_active", true);
  return (data || []).map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase.from("nf_products").select("name, description").eq("slug", params.slug).single();
  return {
    title: product ? `${product.name} | Noori Fashion` : "Product | Noori Fashion",
    description: product?.description || "Premium women's fashion at Noori Fashion.",
  };
}

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
