"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatPrice, getImageUrl } from "@/lib/utils";
import type { Category, Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const emptyProduct = { name: "", slug: "", description: "", price: 0, compare_price: null, category_id: "", fabric_type: "", is_featured: false, is_new: true, is_active: true, total_stock: 0 };

  const fetchAll = async () => {
    const [p, c] = await Promise.all([
      supabase.from("nf_products").select("*, nf_categories(*), nf_product_images(*)").order("created_at", { ascending: false }),
      supabase.from("nf_categories").select("*").eq("is_active", true).order("sort_order"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    const { nf_categories, nf_product_images, nf_product_variants, id, created_at, updated_at, sold_count, view_count, tags, ...data } = editing;
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
    if (id) { await supabase.from("nf_products").update(data).eq("id", id); }
    else { await supabase.from("nf_products").insert(data); }
    setEditing(null);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("nf_products").delete().eq("id", id);
    fetchAll();
  };

  const handleImageUpload = async (productId: string) => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `products/${productId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("noori-fashion").upload(path, file);
      if (!error) { await supabase.from("nf_product_images").insert({ product_id: productId, url: path, is_primary: false }); }
    }
    fetchAll();
    if (fileRef.current) fileRef.current.value = "";
  };

  const deleteImage = async (imageId: string, url: string) => {
    await supabase.from("nf_product_images").delete().eq("id", imageId);
    if (!url.startsWith("http")) await supabase.storage.from("noori-fashion").remove([url]);
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Product Management</h1>
        <button onClick={() => setEditing({ ...emptyProduct })} className="btn-primary text-sm py-2 px-4">+ New Product</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50"><tr>
            <th className="text-left p-3 font-medium">Image</th>
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
            <th className="text-left p-3 font-medium">Price</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Stock</th>
            <th className="text-left p-3 font-medium">Action</th>
          </tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-dark-50 hover:bg-dark-50/50">
                <td className="p-3"><div className="w-12 h-14 bg-dark-100 relative overflow-hidden"><Image src={p.nf_product_images?.[0] ? getImageUrl(p.nf_product_images[0].url) : "/products/placeholder.jpg"} alt="" fill className="object-cover" sizes="48px" /></div></td>
                <td className="p-3 font-medium max-w-[200px] truncate">{p.name}</td>
                <td className="p-3 text-dark-400 hidden md:table-cell">{p.nf_categories?.name || "-"}</td>
                <td className="p-3 font-semibold text-brand">{formatPrice(p.price)}</td>
                <td className="p-3 hidden md:table-cell">{p.total_stock}</td>
                <td className="p-3"><div className="flex gap-2">
                  <button onClick={() => setEditing({ ...p })} className="text-blue-600 text-xs hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 text-xs hover:underline">Delete</button>
                </div></td>
              </tr>
            ))}
            {!loading && products.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-dark-400">No products</td></tr>}
          </tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-slide-up">
            <button onClick={() => setEditing(null)} className="absolute top-3 right-3 p-1 hover:text-brand"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h2 className="font-display text-lg font-semibold mb-4">{editing.id ? "Edit Product" : "New Product"}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><label className="text-xs font-medium block mb-1">Name *</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Slug</label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input-field" placeholder="auto-generate" /></div>
              <div><label className="text-xs font-medium block mb-1">Category</label>
                <select value={editing.category_id || ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="input-field">
                  <option value="">Select</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium block mb-1">Price (৳) *</label><input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Compare Price (৳)</label><input type="number" value={editing.compare_price || ""} onChange={(e) => setEditing({ ...editing, compare_price: parseFloat(e.target.value) || null })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Fabric Type</label><input value={editing.fabric_type || ""} onChange={(e) => setEditing({ ...editing, fabric_type: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Total Stock</label><input type="number" value={editing.total_stock} onChange={(e) => setEditing({ ...editing, total_stock: parseInt(e.target.value) || 0 })} className="input-field" /></div>
              <div className="md:col-span-2"><label className="text-xs font-medium block mb-1">Description</label><textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input-field" rows={3} /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="accent-brand" /> Featured</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_new} onChange={(e) => setEditing({ ...editing, is_new: e.target.checked })} className="accent-brand" /> New</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="accent-brand" /> Active</label>
              </div>
            </div>
            {editing.id && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-semibold mb-2">Images</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editing.nf_product_images || []).map((img: any) => (
                    <div key={img.id} className="relative w-20 h-24 bg-dark-50 overflow-hidden group">
                      <Image src={getImageUrl(img.url)} alt="" fill className="object-cover" sizes="80px" />
                      <button onClick={() => deleteImage(img.id, img.url)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input ref={fileRef} type="file" accept="image/*" multiple className="text-xs" />
                  <button onClick={() => handleImageUpload(editing.id)} className="text-xs bg-brand text-white px-3 py-1.5">Upload</button>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="btn-primary text-sm py-2.5 flex-1">Save</button>
              <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2.5 flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
