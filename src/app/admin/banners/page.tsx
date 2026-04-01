"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getImageUrl } from "@/lib/utils";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch_ = async () => { const { data } = await supabase.from("nf_banners").select("*").order("sort_order"); setBanners(data || []); };
  useEffect(() => { fetch_(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    const { id, created_at, ...data } = editing;
    if (fileRef.current?.files?.[0]) {
      const file = fileRef.current.files[0];
      const path = `banners/${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("noori-fashion").upload(path, file);
      if (!error) data.image = path;
    }
    if (!data.image) { alert("Banner image is required"); return; }
    if (id) { await supabase.from("nf_banners").update(data).eq("id", id); }
    else { await supabase.from("nf_banners").insert(data); }
    setEditing(null);
    if (fileRef.current) fileRef.current.value = "";
    fetch_();
  };

  const handleDelete = async (id: string) => { if (!confirm("Delete this banner?")) return; await supabase.from("nf_banners").delete().eq("id", id); fetch_(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">Banner Management</h1>
        <button onClick={() => setEditing({ title: "", subtitle: "", image: "", link: "", sort_order: 0, is_active: true })} className="btn-primary text-sm py-2 px-4">+ New Banner</button>
      </div>
      <div className="grid gap-4">
        {banners.map((b) => (
          <div key={b.id} className="flex items-center gap-4 p-4 border border-dark-100 bg-white">
            <div className="w-32 h-16 bg-dark-50 relative overflow-hidden shrink-0"><Image src={getImageUrl(b.image)} alt="" fill className="object-cover" sizes="128px" /></div>
            <div className="flex-1"><h3 className="font-medium text-sm">{b.title || "Banner"}</h3><p className="text-xs text-dark-400">{b.is_active ? "Active" : "Inactive"}</p></div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing({ ...b })} className="text-blue-600 text-xs hover:underline">Edit</button>
              <button onClick={() => handleDelete(b.id)} className="text-red-500 text-xs hover:underline">Delete</button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-center text-dark-400 py-8">No banners</p>}
      </div>
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative bg-white max-w-md w-full p-6 shadow-2xl animate-slide-up">
            <h2 className="font-display text-lg font-semibold mb-4">{editing.id ? "Edit Banner" : "New Banner"}</h2>
            <div className="space-y-3">
              <div><label className="text-xs font-medium block mb-1">Title</label><input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Subtitle</label><input value={editing.subtitle || ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Link</label><input value={editing.link || ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} className="input-field" placeholder="/category/exclusive" /></div>
              <div><label className="text-xs font-medium block mb-1">Sort Order</label><input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} className="input-field" /></div>
              <div><label className="text-xs font-medium block mb-1">Image {!editing.id && "*"}</label><input ref={fileRef} type="file" accept="image/*" className="text-xs" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="accent-brand" /> Active</label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="btn-primary text-sm py-2.5 flex-1">Save</button>
              <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2.5 flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
