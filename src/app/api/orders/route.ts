import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, ...orderData } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from("nf_orders")
      .insert({
        user_id: orderData.user_id,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_area: orderData.shipping_area,
        subtotal: orderData.subtotal,
        shipping_cost: orderData.shipping_cost,
        discount: 0,
        total: orderData.total,
        payment_method: orderData.payment_method,
        transaction_id: orderData.transaction_id,
        notes: orderData.notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_image: item.product_image,
      variant_size: item.variant_size,
      variant_color: item.variant_color,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    await supabase.from("nf_order_items").insert(orderItems);

    sendTelegram(order, items).catch(console.error);
    sendEmail(order, items).catch(console.error);

    return NextResponse.json({ order_number: order.order_number, order_id: order.id });
  } catch (err: any) {
    console.error("Order error:", err);
    return NextResponse.json({ error: err.message || "Failed to place order" }, { status: 500 });
  }
}

async function sendTelegram(order: any, items: any[]) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines: string[] = [];
  items.forEach((i: any) => {
    const sz = i.variant_size ? ` (${i.variant_size})` : "";
    lines.push(`  - ${i.product_name}${sz} x ${i.quantity}`);
  });

  const parts = [
    `New Order - Noori Fashion`,
    `Order: ${order.order_number}`,
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.shipping_address}, ${order.shipping_city}`,
    ``,
    `Products:`,
    ...lines,
    ``,
    `Total: ${order.total}`,
    `Payment: ${order.payment_method}`,
  ];
  if (order.transaction_id) parts.push(`TxnID: ${order.transaction_id}`);

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: parts.join("\n") }),
  });
}

async function sendEmail(order: any, items: any[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !order.customer_email) return;

  const rows = items.map((i: any) => {
    const sz = i.variant_size ? ` (${i.variant_size})` : "";
    return `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.product_name}${sz}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.total_price}</td></tr>`;
  }).join("");

  const html = [
    '<div style="max-width:600px;margin:0 auto;font-family:sans-serif">',
    '<div style="background:#1A1A1A;padding:20px;text-align:center">',
    '<h1 style="color:#E85D24;margin:0;font-size:24px">Noori Fashion</h1></div>',
    '<div style="padding:24px;background:#fff">',
    '<h2 style="color:#333;margin:0 0 16px">Order Confirmation</h2>',
    `<p>Dear ${order.customer_name},</p>`,
    `<p>Your order has been placed successfully. Order number: <strong>${order.order_number}</strong></p>`,
    '<table style="width:100%;border-collapse:collapse;margin:16px 0">',
    '<thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Product</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>',
    `<tbody>${rows}</tbody>`,
    '<tfoot>',
    `<tr><td colspan="2" style="padding:8px;text-align:right">Subtotal</td><td style="padding:8px;text-align:right">${order.subtotal}</td></tr>`,
    `<tr><td colspan="2" style="padding:8px;text-align:right">Shipping</td><td style="padding:8px;text-align:right">${order.shipping_cost}</td></tr>`,
    `<tr style="font-weight:bold"><td colspan="2" style="padding:8px;text-align:right;border-top:2px solid #E85D24">Total</td><td style="padding:8px;text-align:right;border-top:2px solid #E85D24;color:#E85D24">${order.total}</td></tr>`,
    '</tfoot></table>',
    '<p style="color:#666;font-size:14px">Thank you for shopping with Noori Fashion!</p>',
    '</div></div>',
  ].join("");

  const emailPayload = {
    from: "Noori Fashion <noreply@diptait.com.bd>",
    to: [order.customer_email],
    subject: `Order Confirmation - ${order.order_number} | Noori Fashion`,
    html,
  };

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(emailPayload),
  });

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Noori Fashion <noreply@diptait.com.bd>",
      to: ["business@diptait.com.bd"],
      subject: `New Order - ${order.order_number} | ${order.total}`,
      html,
    }),
  });
}
