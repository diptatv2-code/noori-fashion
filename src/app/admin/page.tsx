"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  todayOrders: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[] | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    // Kick off counts and recent-orders in parallel so the dashboard isn't
    // waiting on a serial waterfall. Counts use `head: true` so PostgREST
    // skips the data payload — only the Content-Range header comes back.
    Promise.all([
      supabase.from("nf_orders").select("total", { count: "exact" }),
      supabase.from("nf_products").select("*", { count: "exact", head: true }),
      supabase.from("nf_profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
      supabase.from("nf_orders").select("*", { count: "exact", head: true }).eq("order_status", "pending"),
      supabase.from("nf_orders").select("*", { count: "exact", head: true }).gte("created_at", today),
    ]).then(([orders, products, profiles, pending, todayO]) => {
      const revenue = (orders.data || []).reduce(
        (t: number, o: any) => t + (parseFloat(o.total) || 0),
        0
      );
      setStats({
        totalOrders: orders.count || 0,
        totalRevenue: revenue,
        totalProducts: products.count || 0,
        totalCustomers: profiles.count || 0,
        pendingOrders: pending.count || 0,
        todayOrders: todayO.count || 0,
      });
    });

    supabase
      .from("nf_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setRecentOrders(data || []));
  }, []);

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders, color: "bg-blue-500" },
    { label: "Total Revenue", value: stats ? formatPrice(stats.totalRevenue) : undefined, color: "bg-brand" },
    { label: "Total Products", value: stats?.totalProducts, color: "bg-green-500" },
    { label: "Customers", value: stats?.totalCustomers, color: "bg-purple-500" },
    { label: "Pending Orders", value: stats?.pendingOrders, color: "bg-yellow-500" },
    { label: "Today's Orders", value: stats?.todayOrders, color: "bg-teal-500" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-dark-100 p-4">
            <p className="text-xs text-dark-400 uppercase tracking-wider mb-1">{c.label}</p>
            {c.value === undefined ? (
              <div className="skeleton h-7 w-20" />
            ) : (
              <p className="text-xl md:text-2xl font-bold">{c.value}</p>
            )}
            <div className={`h-1 w-12 mt-2 ${c.color}`} />
          </div>
        ))}
      </div>
      <h2 className="font-display text-lg font-semibold mb-4">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50">
            <tr>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders === null &&
              [1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-dark-50">
                  <td className="p-3" colSpan={5}>
                    <div className="skeleton h-4 w-full" />
                  </td>
                </tr>
              ))}
            {recentOrders !== null &&
              recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-dark-50 hover:bg-dark-50/50">
                  <td className="p-3 font-medium">{o.order_number}</td>
                  <td className="p-3">
                    {o.customer_name}
                    <br />
                    <span className="text-xs text-dark-400">{o.customer_phone}</span>
                  </td>
                  <td className="p-3 font-semibold text-brand">{formatPrice(o.total)}</td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800">{o.order_status}</span>
                  </td>
                  <td className="p-3 text-dark-400 text-xs">
                    {new Date(o.created_at).toLocaleDateString("en-US")}
                  </td>
                </tr>
              ))}
            {recentOrders !== null && recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-dark-400">No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
