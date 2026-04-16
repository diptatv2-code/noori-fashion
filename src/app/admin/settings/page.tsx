'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Setting {
  id: string;
  key: string;
  value: string;
}

const LABELS: Record<string, string> = {
  phone: 'ফোন নম্বর',
  email: 'ইমেইল',
  whatsapp: 'হোয়াটসঅ্যাপ',
  facebook: 'ফেসবুক লিংক',
  instagram: 'ইনস্টাগ্রাম লিংক',
  address: 'ঠিকানা',
  shipping_dhaka: 'ঢাকায় শিপিং চার্জ (৳)',
  shipping_outside: 'ঢাকার বাইরে শিপিং চার্জ (৳)',
  free_shipping_min: 'ফ্রি শিপিং মিনিমাম (৳)',
  bkash_number: 'বিকাশ নম্বর',
  nagad_number: 'নগদ নম্বর',
  site_name: 'সাইটের নাম (বাংলা)',
  site_name_en: 'সাইটের নাম (English)',
  site_tagline: 'ট্যাগলাইন',
  currency: 'কারেন্সি',
  making_charge: 'মেকিং চার্জ (৳)',
};

const CATEGORIES = [
  {
    title: 'যোগাযোগ',
    subtitle: 'Contact',
    keys: ['phone', 'email', 'whatsapp', 'facebook', 'instagram', 'address'],
  },
  {
    title: 'শিপিং',
    subtitle: 'Shipping',
    keys: ['shipping_dhaka', 'shipping_outside', 'free_shipping_min'],
  },
  {
    title: 'পেমেন্ট',
    subtitle: 'Payment',
    keys: ['bkash_number', 'nagad_number'],
  },
  {
    title: 'সাইট',
    subtitle: 'Site',
    keys: ['site_name', 'site_name_en', 'site_tagline', 'currency', 'making_charge'],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchSettings = async () => {
    const { data } = await supabase.from('nf_settings').select('*');
    const map: Record<string, string> = {};
    (data || []).forEach((row: Setting) => {
      map[row.key] = row.value || '';
    });
    setSettings({ ...map });
    setOriginal({ ...map });
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  };

  const hasChanges = () => {
    return Object.keys(settings).some((k) => settings[k] !== original[k]) ||
      CATEGORIES.flatMap((c) => c.keys).some((k) => !(k in original) && settings[k]);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const allKeys = CATEGORIES.flatMap((c) => c.keys);
    const changedKeys = allKeys.filter(
      (k) => settings[k] !== original[k] || (!(k in original) && settings[k])
    );

    if (changedKeys.length > 0) {
      const upsertData = changedKeys.map((key) => ({
        key,
        value: settings[key] || '',
      }));

      await supabase
        .from('nf_settings')
        .upsert(upsertData, { onConflict: 'key' });
    }

    setOriginal({ ...settings });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-dark-400">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold">সেটিংস</h1>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          className="btn-primary text-sm py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
      </div>

      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-sm">
          সেটিংস সফলভাবে সেভ হয়েছে!
        </div>
      )}

      <div className="space-y-6">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="border border-dark-100 bg-white">
            <div className="px-5 py-3 border-b border-dark-100 bg-dark-50/50">
              <h2 className="font-display font-semibold text-sm">
                {cat.title} <span className="text-dark-400 font-normal">({cat.subtitle})</span>
              </h2>
            </div>
            <div className="p-5 grid md:grid-cols-2 gap-4">
              {cat.keys.map((key) => (
                <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                  <label className="text-xs font-medium block mb-1">
                    {LABELS[key] || key}
                  </label>
                  {key === 'address' ? (
                    <textarea
                      value={settings[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="input-field"
                      rows={2}
                    />
                  ) : (
                    <input
                      type={
                        ['shipping_dhaka', 'shipping_outside', 'free_shipping_min', 'making_charge'].includes(key)
                          ? 'number'
                          : 'text'
                      }
                      value={settings[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom save button for convenience */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          className="btn-primary text-sm py-2.5 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
        </button>
      </div>
    </div>
  );
}
