"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatPrice, getStatusColor, getStatusLabel } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    let q = supabase.from("nf_orders").select("*, nf_order_items(*)").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("order_status", filter);
    const { data, error: err } = await q;
    if (err) setError(err.message || "Failed to load orders");
    setOrders(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, field: string, value: string) => {
    await supabase.from("nf_orders").update({ [field]: value }).eq("id", orderId);
    fetchOrders();
    if (selected?.id === orderId) setSelected({ ...selected, [field]: value });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-2xl font-semibold">Order Management</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto text-sm py-2">
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-dark-400 text-sm mb-4">Loading orders...</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-50"><tr>
            <th className="text-left p-3 font-medium">Order</th>
            <th className="text-left p-3 font-medium hidden md:table-cell">Customer</th>
            <th className="text-left p-3 font-medium">Total</th>
            <th className="text-left p-3 font-medium">Payment</th>
            <th className="text-left p-3 font-medium">Status</th>
            <th className="text-left p-3 font-medium">Action</th>
          </tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-dark-50 hover:bg-dark-50/50">
                <td className="p-3"><span className="font-medium">{o.order_number}</span><br/><span className="text-xs text-dark-400">{new Date(o.created_at).toLocaleDateString("en-US")}</span></td>
                <td className="p-3 hidden md:table-cell">{o.customer_name}<br/><span className="text-xs text-dark-400">{o.customer_phone}</span></td>
                <td className="p-3 font-semibold">{formatPrice(o.total)}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 ${getStatusColor(o.payment_status)}`}>{getStatusLabel(o.payment_status)}</span><br/><span className="text-xs text-dark-400">{getStatusLabel(o.payment_method)}</span></td>
                <td className="p-3">
                  <select value={o.order_status} onChange={(e) => updateStatus(o.id, "order_status", e.target.value)} className="text-xs border border-dark-200 px-2 py-1 bg-white">
                    {["pending","confirmed","processing","shipped","delivered","cancelled"].map((s) => (<option key={s} value={s}>{getStatusLabel(s)}</option>))}
                  </select>
                </td>
                <td className="p-3"><button onClick={() => setSelected(o)} className="text-brand text-xs hover:underline">Details</button></td>
              </tr>
            ))}
            {!loading && orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-dark-400">No orders</td></tr>}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 shadow-2xl animate-slide-up">
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-1 hover:text-brand"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            <h2 className="font-display text-lg font-semibold mb-4">{selected.order_number}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-dark-400">Name:</span> {selected.customer_name}</div>
              <div><span className="text-dark-400">Phone:</span> {selected.customer_phone}</div>
              <div className="col-span-2"><span className="text-dark-400">Address:</span> {selected.shipping_address}, {selected.shipping_city}</div>
              {selected.notes && <div className="col-span-2"><span className="text-dark-400">Notes:</span> {selected.notes}</div>}
              {selected.transaction_id && <div className="col-span-2"><span className="text-dark-400">TxnID:</span> {selected.transaction_id}</div>}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              {selected.nf_order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.product_name} {item.variant_size ? `(${item.variant_size})` : ""} x {item.quantity}</span>
                  <span>{formatPrice(item.total_price)}</span>
                </div>
              ))}
              <div className="border-t pt-2 font-bold flex justify-between"><span>Total</span><span className="text-brand">{formatPrice(selected.total)}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div><label className="text-xs font-medium block mb-1">Order Status</label>
                <select value={selected.order_status} onChange={(e) => updateStatus(selected.id, "order_status", e.target.value)} className="input-field text-sm py-2">
                  {["pending","confirmed","processing","shipped","delivered","cancelled"].map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium block mb-1">Payment Status</label>
                <select value={selected.payment_status} onChange={(e) => updateStatus(selected.id, "payment_status", e.target.value)} className="input-field text-sm py-2">
                  {["pending","paid","failed","refunded"].map((s) => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
