"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/lib/supabase";
import { compressImage, formatBytes } from "@/lib/compress";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCats = async () => { const { data } = await supabase.from("nf_categories").select("*").order("sort_order"); setCategories(data || []); };
  useEffect(() => { fetchCats(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    const { id, created_at, ...data } = editing;
    if (!data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    setUploading(true);
    setUploadMsg("");
    if (fileRef.current?.files?.[0]) {
      const original = fileRef.current.files[0];
      setUploadMsg(`Compressing ${original.name}...`);
      const { file, originalSize, compressedSize } = await compressImage(original);
      const ext = file.name.split(".").pop() || "webp";
      const path = `categories/${Date.now()}.${ext}`;
      setUploadMsg(`Uploading (${formatBytes(originalSize)} → ${formatBytes(compressedSize)})...`);
      const { error } = await supabase.storage.from("noori-fashion").upload(path, file, { contentType: file.type });
      if (!error) data.image = path;
      setUploadMsg(`Compressed: ${formatBytes(originalSize)} → ${formatBytes(compressedSize)}`);
    }
    if (id) { await supabase.from("nf_categories").update(data).eq("id", id); }
    else { await supabase.from("nf_categories").insert(data); }
    setEditing(null);
    setUploading(false);
    setUploadMsg("");
    if (fileRef.current) fileRef.current.value = "";
    fetchCats();
  };

  const handleDelete = async (id: string) => { if (!confirm("Delete this category?")) return; await supabase.from("nf_categories").delete().eq("id", id); fetchCats(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Category Management</h1>
        <button onClick={() => setEditing({ name: "", name_bn: "", slug: "", description: "", image: null, sort_order: 0, is_active: true })} className="btn-primary text-sm py-2 px-4">+ New Category</button>
      </div>
      <div className="grid gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4 p-4 border border-dark-100 bg-white">
            {cat.image && <div className="w-16 h-16 bg-dark-50 relative overflow-hidden shrink-0"><Image src={getImageUrl(cat.image)} alt="" fill className="object-cover" sizes="64px" /></div>}
            <div className="flex-1 min-w-0"><h3 className="font-medium">{cat.name}</h3><p className="text-xs text-dark-400">/{cat.slug} · Sort: {cat.sort_order} · {cat.is_active ? "Active" : "Inactive"}</p></div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing({ ...cat })} className="text-blue-600 text-xs hover:underline">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="text-red-500 text-xs hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl animate-slide-up">
            <h2 className="font-display text-lg font-semibold mb-4">{editing.id ? "Edit Category" : "New Category"}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-medium block mb-1">Name (English)</label><input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Name (Bangla)</label><input value={editing.name_bn || ""} onChange={(e) => setEditing({ ...editing, name_bn: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Slug</label><input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Sort Order</label><input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="input-field" /></div>
              <div>
                <label className="text-xs font-medium block mb-1">Image</label>
                <input ref={fileRef} type="file" accept="image/*" className="text-xs" disabled={uploading} />
                <p className="text-[10px] text-dark-300 mt-1">Auto-compressed to WebP (~1.5 MB, max 2400px).</p>
                {uploadMsg && <p className="text-[10px] text-dark-400 mt-1">{uploadMsg}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="accent-brand" /> Active</label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={uploading} className="btn-primary text-sm py-2.5 flex-1 disabled:opacity-50">{uploading ? "Saving..." : "Save"}</button>
              <button onClick={() => setEditing(null)} disabled={uploading} className="btn-outline text-sm py-2.5 flex-1 disabled:opacity-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
