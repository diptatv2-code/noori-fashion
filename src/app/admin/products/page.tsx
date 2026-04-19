'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase, getImageUrl } from '@/lib/supabase';
import { formatPrice } from '@/lib/utils';
import { compressImage, formatBytes } from '@/lib/compress';
import type { Category, Product, ProductVariant } from '@/types';

const SIZES = ['38', '40', '42', '44', '46', 'Free Size'];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Variant state
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantLoading, setVariantLoading] = useState(false);
  const [newVariant, setNewVariant] = useState({ size: '', stock: 0, price_override: '' as string | number, customSize: '' });
  const [showCustomSize, setShowCustomSize] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');

  const emptyProduct = {
    name: '', slug: '', description: '', price: 0, compare_price: null,
    category_id: '', fabric_type: '', is_featured: false, is_new: true,
    is_active: true, total_stock: 0,
  };

  const fetchAll = async () => {
    const [p, c] = await Promise.all([
      supabase.from('nf_products').select('*, nf_categories(*), nf_product_images(*), nf_product_variants(*)').order('created_at', { ascending: false }),
      supabase.from('nf_categories').select('*').eq('is_active', true).order('sort_order'),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  // Fetch variants when editing a product
  const fetchVariants = async (productId: string) => {
    setVariantLoading(true);
    const { data } = await supabase
      .from('nf_product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('size');
    setVariants(data || []);
    setVariantLoading(false);
  };

  // When editing changes to a product with an ID, load its variants
  useEffect(() => {
    if (editing?.id) {
      fetchVariants(editing.id);
    } else {
      setVariants([]);
    }
    // Reset new variant form
    setNewVariant({ size: '', stock: 0, price_override: '', customSize: '' });
    setShowCustomSize(false);
  }, [editing?.id]);

  // Clear per-modal feedback when the modal opens/closes or switches to a different product
  useEffect(() => {
    setSaveError('');
    setUploadMsg('');
    if (fileRef.current) fileRef.current.value = '';
  }, [editing?.id, editing === null]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name || !editing.name.trim()) {
      setSaveError('প্রোডাক্টের নাম দিন');
      return;
    }
    setSaving(true);
    setSaveError('');
    const { nf_categories, nf_product_images, nf_product_variants, id, created_at, updated_at, sold_count, view_count, tags, ...data } = editing;

    if (!data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');

    let targetId = id as string | undefined;

    if (id) {
      const { error } = await supabase.from('nf_products').update(data).eq('id', id);
      if (error) {
        setSaving(false);
        setSaveError(error.message || 'আপডেট ব্যর্থ হয়েছে');
        return;
      }
    } else {
      const { data: inserted, error } = await supabase.from('nf_products').insert(data).select().single();
      if (error || !inserted) {
        setSaving(false);
        setSaveError((error && (error.message.includes('duplicate') || error.message.includes('nf_products_slug_key'))
          ? 'এই স্লাগ আগে থেকেই ব্যবহৃত হয়েছে — অন্য একটি দিন'
          : error?.message) || 'প্রোডাক্ট তৈরি করা যায়নি');
        return;
      }
      targetId = inserted.id;
    }

    // Upload any files the admin queued in this modal (works for both new + existing products)
    const files = fileRef.current?.files;
    if (targetId && files && files.length > 0) {
      await uploadFiles(targetId);
    }

    // Refresh the edit state from the DB so newly-inserted images and the ID are visible
    if (targetId) {
      const { data: refreshed } = await supabase
        .from('nf_products')
        .select('*, nf_categories(*), nf_product_images(*), nf_product_variants(*)')
        .eq('id', targetId)
        .single();
      if (refreshed) setEditing({ ...refreshed });
    }

    setSaving(false);
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('এই প্রোডাক্ট ডিলিট করতে চান?')) return;
    await supabase.from('nf_products').delete().eq('id', id);
    fetchAll();
  };

  // Shared upload routine: reads files from fileRef, compresses, uploads, inserts DB rows.
  // Returns when done. Called from handleSave (post-insert) and from the "Upload" button.
  const uploadFiles = async (productId: string) => {
    const files = fileRef.current?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadMsg('');
    let totalOriginal = 0;
    let totalCompressed = 0;
    let uploaded = 0;

    for (const original of Array.from(files)) {
      setUploadMsg(`Compressing ${original.name}...`);
      const { file, originalSize, compressedSize } = await compressImage(original);
      totalOriginal += originalSize;
      totalCompressed += compressedSize;

      const ext = file.name.split('.').pop() || 'webp';
      const path = `products/${productId}/${Date.now()}-${uploaded}.${ext}`;
      setUploadMsg(`Uploading ${file.name} (${formatBytes(originalSize)} → ${formatBytes(compressedSize)})...`);
      const { error } = await supabase.storage.from('noori-fashion').upload(path, file, {
        contentType: file.type,
      });
      if (!error) {
        await supabase.from('nf_product_images').insert({ product_id: productId, url: path, is_primary: false });
        uploaded++;
      }
    }

    if (fileRef.current) fileRef.current.value = '';
    setUploading(false);
    if (uploaded > 0) {
      setUploadMsg(`Uploaded ${uploaded} image${uploaded > 1 ? 's' : ''}: ${formatBytes(totalOriginal)} → ${formatBytes(totalCompressed)} (${Math.round((1 - totalCompressed / totalOriginal) * 100)}% smaller)`);
    } else {
      setUploadMsg('Upload failed');
    }
  };

  const handleImageUpload = async (productId: string) => {
    await uploadFiles(productId);
    const { data: refreshed } = await supabase
      .from('nf_products')
      .select('*, nf_categories(*), nf_product_images(*), nf_product_variants(*)')
      .eq('id', productId)
      .single();
    if (refreshed) setEditing({ ...refreshed });
    fetchAll();
  };

  const deleteImage = async (imageId: string, url: string) => {
    await supabase.from('nf_product_images').delete().eq('id', imageId);
    if (!url.startsWith('http')) await supabase.storage.from('noori-fashion').remove([url]);
    // Refresh editing state
    if (editing?.id) {
      const { data: refreshed } = await supabase
        .from('nf_products')
        .select('*, nf_categories(*), nf_product_images(*), nf_product_variants(*)')
        .eq('id', editing.id)
        .single();
      if (refreshed) {
        setEditing({ ...refreshed });
      }
    }
    fetchAll();
  };

  // --- Variant CRUD ---
  const updateProductStock = async (productId: string) => {
    const { data: allVariants } = await supabase
      .from('nf_product_variants')
      .select('stock')
      .eq('product_id', productId);
    const totalStock = (allVariants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
    await supabase.from('nf_products').update({ total_stock: totalStock }).eq('id', productId);
    // Update editing state locally
    if (editing) {
      setEditing((prev: any) => ({ ...prev, total_stock: totalStock }));
    }
  };

  const addVariant = async () => {
    if (!editing?.id) return;
    const size = showCustomSize ? newVariant.customSize.trim() : newVariant.size;
    if (!size) return;

    const priceOverride = newVariant.price_override !== '' ? Number(newVariant.price_override) : null;

    await supabase.from('nf_product_variants').insert({
      product_id: editing.id,
      size,
      stock: newVariant.stock,
      price_override: priceOverride,
      is_active: true,
    });

    await fetchVariants(editing.id);
    await updateProductStock(editing.id);
    setNewVariant({ size: '', stock: 0, price_override: '', customSize: '' });
    setShowCustomSize(false);
    fetchAll();
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm('এই ভেরিয়েন্ট ডিলিট করতে চান?')) return;
    await supabase.from('nf_product_variants').delete().eq('id', variantId);
    if (editing?.id) {
      await fetchVariants(editing.id);
      await updateProductStock(editing.id);
    }
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">প্রোডাক্ট ম্যানেজমেন্ট</h1>
        <button onClick={() => setEditing({ ...emptyProduct })} className="btn-primary text-sm py-2 px-4">+ নতুন প্রোডাক্ট</button>
      </div>

      {/* Product List */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50"><tr>
            <th className="text-left p-3 font-medium">ছবি</th>
            <th className="text-left p-3 font-medium">নাম</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">ক্যাটাগরি</th>
            <th className="text-left p-3 font-medium">দাম</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">স্টক</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">ভিউ</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">বিক্রি</th>
            <th className="text-left p-3 font-medium">অ্যাকশন</th>
          </tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-dark-50 hover:bg-dark-50/50">
                <td className="p-3">
                  <div className="w-12 h-14 bg-dark-100 relative overflow-hidden">
                    <Image
                      src={p.nf_product_images?.[0] ? getImageUrl(p.nf_product_images[0].url) : '/products/placeholder.jpg'}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                </td>
                <td className="p-3 font-medium max-w-[200px] truncate">{p.name}</td>
                <td className="p-3 text-dark-400 hidden md:table-cell">{p.nf_categories?.name || '-'}</td>
                <td className="p-3 font-semibold text-brand">{formatPrice(p.price)}</td>
                <td className="p-3 hidden md:table-cell">{p.total_stock}</td>
                <td className="p-3 hidden md:table-cell text-dark-400">{p.view_count || 0}</td>
                <td className="p-3 hidden md:table-cell text-dark-400">{p.sold_count || 0}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <a href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-brand text-xs hover:underline">দেখুন</a>
                    <button onClick={() => setEditing({ ...p })} className="text-blue-600 text-xs hover:underline">সম্পাদনা</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 text-xs hover:underline">ডিলিট</button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && products.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-dark-400">কোনো প্রোডাক্ট নেই</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditing(null)} />
          <div className="relative bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl animate-slide-up">
            <button onClick={() => setEditing(null)} className="absolute top-3 right-3 p-1 hover:text-brand">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="font-display text-lg font-semibold mb-4">{editing.id ? 'প্রোডাক্ট সম্পাদনা' : 'নতুন প্রোডাক্ট'}</h2>

            {/* When creating a new product, note that variants still need a save-first step */}
            {!editing.id && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded">
                ছবি এই মডালে সিলেক্ট করে সেভ করলে একসাথে আপলোড হবে। ভেরিয়েন্ট/সাইজ প্রোডাক্ট সেভ হওয়ার পরে যোগ করতে পারবেন।
              </div>
            )}

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {saveError}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium block mb-1">নাম *</label>
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">স্লাগ</label>
                <input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input-field" placeholder="auto-generate" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">ক্যাটাগরি</label>
                <select value={editing.category_id || ''} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })} className="input-field">
                  <option value="">সিলেক্ট করুন</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name_bn || c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">দাম (৳) *</label>
                <input type="number" value={editing.price} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">আগের দাম (৳)</label>
                <input type="number" value={editing.compare_price || ''} onChange={(e) => setEditing({ ...editing, compare_price: parseFloat(e.target.value) || null })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">কাপড়ের ধরন</label>
                <input value={editing.fabric_type || ''} onChange={(e) => setEditing({ ...editing, fabric_type: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">মোট স্টক</label>
                <input
                  type="number"
                  value={editing.total_stock}
                  onChange={(e) => setEditing({ ...editing, total_stock: parseInt(e.target.value) || 0 })}
                  className="input-field"
                  disabled={variants.length > 0}
                  title={variants.length > 0 ? 'ভেরিয়েন্ট থেকে অটো হিসাব হবে' : ''}
                />
                {variants.length > 0 && (
                  <span className="text-[10px] text-dark-400 mt-0.5 block">ভেরিয়েন্ট স্টক থেকে অটো আপডেট হয়</span>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium block mb-1">বর্ণনা</label>
                <textarea value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input-field" rows={3} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="accent-brand" /> ফিচার্ড
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_new} onChange={(e) => setEditing({ ...editing, is_new: e.target.checked })} className="accent-brand" /> নতুন
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="accent-brand" /> সক্রিয়
                </label>
              </div>
            </div>

            {/* Images — file input is always visible; existing images grid appears once the product is saved */}
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold mb-2">ছবি</h3>
              {editing.id && (editing.nf_product_images || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editing.nf_product_images || []).map((img: any) => (
                    <div key={img.id} className="relative w-20 h-24 bg-dark-50 overflow-hidden group">
                      <Image src={getImageUrl(img.url)} alt="" fill className="object-cover" sizes="80px" />
                      <button onClick={() => deleteImage(img.id, img.url)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        &#10005;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-center flex-wrap">
                <input ref={fileRef} type="file" accept="image/*" multiple className="text-xs" disabled={uploading || saving} />
                {editing.id && (
                  <button onClick={() => handleImageUpload(editing.id)} disabled={uploading || saving} className="text-xs bg-brand text-white px-3 py-1.5 disabled:opacity-50">
                    {uploading ? 'আপলোড হচ্ছে...' : 'এখন আপলোড'}
                  </button>
                )}
              </div>
              {uploadMsg && <p className="text-[10px] text-dark-400 mt-1">{uploadMsg}</p>}
              <p className="text-[10px] text-dark-300 mt-1">
                {editing.id
                  ? 'ছবি স্বয়ংক্রিয়ভাবে WebP-তে কম্প্রেস হবে (~১.৫ MB, সর্বোচ্চ ২৪০০px)।'
                  : 'ছবি সিলেক্ট করুন — প্রোডাক্ট সেভ করলে একসাথে কম্প্রেস ও আপলোড হবে।'}
              </p>
            </div>

            {/* Variants - only when product has been saved (has ID) */}
            {editing.id && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">ভেরিয়েন্ট / সাইজ</h3>

                {/* Existing variants table */}
                {variantLoading ? (
                  <p className="text-xs text-dark-400 mb-3">লোড হচ্ছে...</p>
                ) : variants.length > 0 ? (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-xs border border-dark-100">
                      <thead className="bg-dark-50">
                        <tr>
                          <th className="text-left p-2 font-medium">সাইজ</th>
                          <th className="text-left p-2 font-medium">স্টক</th>
                          <th className="text-left p-2 font-medium">আলাদা দাম</th>
                          <th className="text-left p-2 font-medium w-16"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((v) => (
                          <tr key={v.id} className="border-t border-dark-100">
                            <td className="p-2 font-medium">{v.size || '-'}</td>
                            <td className="p-2">{v.stock}</td>
                            <td className="p-2">{v.price_override ? formatPrice(v.price_override) : '-'}</td>
                            <td className="p-2">
                              <button onClick={() => deleteVariant(v.id)} className="text-red-500 hover:underline">ডিলিট</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-dark-400 mb-3">কোনো ভেরিয়েন্ট নেই</p>
                )}

                {/* Add variant form */}
                <div className="bg-dark-50/50 p-3 border border-dark-100">
                  <p className="text-xs font-medium mb-2">নতুন ভেরিয়েন্ট যোগ করুন</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="text-[10px] text-dark-400 block mb-0.5">সাইজ *</label>
                      {showCustomSize ? (
                        <div className="flex gap-1">
                          <input
                            value={newVariant.customSize}
                            onChange={(e) => setNewVariant({ ...newVariant, customSize: e.target.value })}
                            className="input-field text-xs flex-1"
                            placeholder="কাস্টম সাইজ"
                          />
                          <button
                            onClick={() => { setShowCustomSize(false); setNewVariant({ ...newVariant, customSize: '' }); }}
                            className="text-[10px] text-dark-400 hover:text-dark-600 px-1"
                            title="প্রিসেট সাইজ"
                          >
                            &#8592;
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <select
                            value={newVariant.size}
                            onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                            className="input-field text-xs flex-1"
                          >
                            <option value="">সিলেক্ট</option>
                            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button
                            onClick={() => setShowCustomSize(true)}
                            className="text-[10px] text-brand hover:underline px-1 whitespace-nowrap"
                            title="কাস্টম সাইজ লিখুন"
                          >
                            কাস্টম
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] text-dark-400 block mb-0.5">স্টক *</label>
                      <input
                        type="number"
                        min={0}
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                        className="input-field text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-dark-400 block mb-0.5">আলাদা দাম (ঐচ্ছিক)</label>
                      <input
                        type="number"
                        value={newVariant.price_override}
                        onChange={(e) => setNewVariant({ ...newVariant, price_override: e.target.value })}
                        className="input-field text-xs"
                        placeholder="খালি রাখুন"
                      />
                    </div>
                    <div>
                      <button
                        onClick={addVariant}
                        className="bg-brand text-white text-xs px-3 py-[9px] w-full hover:bg-brand/90 transition-colors"
                      >
                        + যোগ করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6 flex-wrap">
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 flex-1 disabled:opacity-50">
                {saving ? 'সেভ হচ্ছে...' : editing.id ? 'আপডেট করুন' : 'সেভ করুন'}
              </button>
              {editing.id && editing.slug && (
                <a
                  href={`/product/${editing.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm py-2.5 flex-1 text-center"
                >
                  সাইটে দেখুন
                </a>
              )}
              <button onClick={() => setEditing(null)} className="btn-outline text-sm py-2.5 flex-1">বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
