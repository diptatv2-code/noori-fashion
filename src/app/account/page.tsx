"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/lib/store";
import { formatPrice, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Order } from "@/types";

export default function AccountPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    const fetchOrders = async () => {
      const { data } = await supabase.from("nf_orders").select("*, nf_order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push("/");
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 text-sm text-dark-400 mb-6">
        <Link href="/" className="hover:text-brand">Home</Link><span>/</span><span className="text-dark-600">My Account</span>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold">My Account</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Sign Out</button>
      </div>
      <div className="bg-dark-50 p-5 mb-8">
        <p className="text-sm text-dark-400">Email: <span className="font-medium text-dark-600">{user.email}</span></p>
        {user.role === "admin" && <p className="text-sm text-brand font-medium mt-1">Admin Account — <a href="/admin" className="underline">Admin Panel</a></p>}
      </div>
      <h2 className="font-display text-xl font-semibold mb-4">My Orders</h2>
      {loading ? (
        <div className="py-8 space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-24 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <p className="text-dark-400 text-sm py-8 text-center">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-dark-100 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <span className="font-medium text-sm">{order.order_number}</span>
                  <span className="text-xs text-dark-400 ml-2">{new Date(order.created_at).toLocaleDateString("en-US")}</span>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-0.5 ${getStatusColor(order.order_status)}`}>{getStatusLabel(order.order_status)}</span>
                  <span className={`text-xs px-2 py-0.5 ${getStatusColor(order.payment_status)}`}>{getStatusLabel(order.payment_status)}</span>
                </div>
              </div>
              <div className="text-sm space-y-1">
                {order.nf_order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-dark-500">
                    <span>{item.product_name} {item.variant_size ? `(${item.variant_size})` : ""} x {item.quantity}</span>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-dark-100 flex justify-between font-semibold text-sm">
                <span>Total</span><span className="text-brand">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
