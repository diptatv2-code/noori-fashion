"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("Invalid email or password"); setLoading(false); return; }
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-semibold text-center mb-8">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-xs font-medium text-dark-500 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" required /></div>
        <div><label className="block text-xs font-medium text-dark-500 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required /></div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? "Signing in..." : "Sign In"}</button>
      </form>
      <p className="text-center text-sm text-dark-400 mt-6">Don&apos;t have an account? <Link href="/register" className="text-brand hover:underline">Register</Link></p>
    </div>
  );
}
