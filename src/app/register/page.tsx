"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.name, phone: form.phone } },
    });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-semibold text-center mb-8">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-xs font-medium text-dark-500 mb-1">Full Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
        <div><label className="block text-xs font-medium text-dark-500 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
        <div><label className="block text-xs font-medium text-dark-500 mb-1">Mobile</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
        <div><label className="block text-xs font-medium text-dark-500 mb-1">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" minLength={6} required /></div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? "Creating account..." : "Register"}</button>
      </form>
      <p className="text-center text-sm text-dark-400 mt-6">Already have an account? <Link href="/login" className="text-brand hover:underline">Sign In</Link></p>
    </div>
  );
}
