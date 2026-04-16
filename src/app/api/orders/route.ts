import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sanitize(str: string, maxLen: number): string {
  return String(str || '').trim().slice(0, maxLen).replace(/[<>]/g, '');
}

function escapeHtml(str: string): string {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, ...orderData } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Input validation (Issue #27)
    const customerName = sanitize(orderData.customer_name, 100);
    const customerPhone = sanitize(orderData.customer_phone, 20);
    const customerEmail = sanitize(orderData.customer_email || '', 100);
    const shippingAddress = sanitize(orderData.shipping_address, 500);
    const shippingCity = sanitize(orderData.shipping_city, 50);
    const shippingArea = sanitize(orderData.shipping_area || '', 100);
    const notes = sanitize(orderData.notes || '', 1000);

    if (!customerName || !customerPhone || !shippingAddress || !shippingCity) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
    }

    if (!/^01[0-9]{9}$/.test(customerPhone.replace(/[^0-9]/g, '').replace(/^880/, '').replace(/^\+880/, ''))) {
      return NextResponse.json({ error: 'Please enter a valid mobile number' }, { status: 400 });
    }

    // Fetch settings for shipping calculation
    const { data: settingsRows } = await supabase.from('nf_settings').select('key, value');
    const settings: Record<string, string> = {};
    (settingsRows || []).forEach((r: any) => { if (r.value) settings[r.key] = r.value; });
    const shippingDhaka = parseInt(settings.shipping_dhaka) || 80;
    const shippingOutside = parseInt(settings.shipping_outside) || 150;
    const freeShippingMin = parseInt(settings.free_shipping_min) || 5000;
    const ownerEmail = settings.email || 'Noori330332@gmail.com';

    // Server-side price verification (Issue #17)
    const productIds = [...new Set(items.map((i: any) => i.product_id))];
    const { data: products } = await supabase
      .from('nf_products')
      .select('id, price, nf_product_variants(id, size, stock, price_override)')
      .in('id', productIds);

    const productMap = new Map((products || []).map((p: any) => [p.id, p]));

    // Validate stock and compute server-side totals
    let computedSubtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 400 });
      }

      const variant = item.variant_size
        ? (product.nf_product_variants || []).find((v: any) => v.size === item.variant_size)
        : null;

      // Stock validation (Issue #1)
      if (variant && variant.stock < item.quantity) {
        return NextResponse.json({
          error: `${item.product_name} (${item.variant_size}) is out of stock. Available: ${variant.stock}`,
        }, { status: 400 });
      }

      // Use price_override if exists (Issue #11)
      const unitPrice = (variant?.price_override != null && variant.price_override > 0)
        ? parseFloat(variant.price_override)
        : parseFloat(product.price);
      const itemTotal = unitPrice * item.quantity;
      computedSubtotal += itemTotal;

      verifiedItems.push({
        ...item,
        unit_price: unitPrice,
        total_price: itemTotal,
        variant_id: variant?.id || null,
      });
    }

    // Compute shipping server-side (match English city names from checkout)
    const isDhaka = shippingCity === 'Dhaka' || shippingCity === 'ঢাকা';
    const computedShipping = computedSubtotal >= freeShippingMin ? 0 : isDhaka ? shippingDhaka : shippingOutside;
    const computedTotal = computedSubtotal + computedShipping;

    // Insert order with server-computed totals
    const { data: order, error: orderError } = await supabase
      .from('nf_orders')
      .insert({
        user_id: orderData.user_id || null,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_area: shippingArea || null,
        subtotal: computedSubtotal,
        shipping_cost: computedShipping,
        discount: 0,
        total: computedTotal,
        payment_method: orderData.payment_method,
        transaction_id: sanitize(orderData.transaction_id || '', 100) || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = verifiedItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: sanitize(item.product_name, 200),
      product_image: item.product_image,
      variant_size: item.variant_size,
      variant_color: item.variant_color,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    await supabase.from('nf_order_items').insert(orderItems);

    // Stock decrement (Issue #1)
    for (const item of verifiedItems) {
      if (item.variant_id) {
        await supabase.rpc('nf_decrement_stock', {
          p_variant_id: item.variant_id,
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }
    }

    // Send Telegram notification
    sendTelegram(order, verifiedItems).catch(console.error);

    // Send email notification
    sendEmail(order, verifiedItems, ownerEmail).catch(console.error);

    return NextResponse.json({ order_number: order.order_number, order_id: order.id });
  } catch (err: any) {
    console.error('Order error:', err);
    return NextResponse.json({ error: err.message || 'Failed to place order' }, { status: 500 });
  }
}

async function sendTelegram(order: any, items: any[]) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const paymentLabels: Record<string, string> = {
    cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad',
    bkash_50_advance: 'bKash (50% Advance)', bkash_100_advance: 'bKash (100% Advance)',
  };

  const itemsList = items.map((i: any) => `  • ${i.product_name}${i.variant_size ? ` (${i.variant_size})` : ''} × ${i.quantity} = ৳${i.total_price}`).join('\n');

  const msg = `🛍️ *New Order — Noori Fashion*

📋 Order: \`${order.order_number}\`
👤 Name: ${order.customer_name}
📱 Phone: ${order.customer_phone}
📧 Email: ${order.customer_email || 'N/A'}
📍 Address: ${order.shipping_address}, ${order.shipping_city}

🛒 Products:
${itemsList}

💰 Subtotal: ৳${order.subtotal}
🚚 Shipping: ৳${order.shipping_cost}
💵 *Total: ৳${order.total}*

💳 Payment: ${paymentLabels[order.payment_method] || order.payment_method}
${order.transaction_id ? `🔑 TxnID: ${order.transaction_id}` : ''}
${order.notes ? `📝 Notes: ${order.notes}` : ''}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'Markdown' }),
  });
}

async function sendEmail(order: any, items: any[], ownerEmail: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const itemsHtml = items.map((i: any) =>
    `<tr><td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(i.product_name)}${i.variant_size ? ` (${escapeHtml(i.variant_size)})` : ''}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">৳${i.total_price}</td></tr>`
  ).join('');

  const html = `
    <div style="max-width:600px;margin:0 auto;font-family:sans-serif">
      <div style="background:#1A1A1A;padding:20px;text-align:center">
        <h1 style="color:#E85D24;margin:0;font-size:24px">Noori Fashion</h1>
      </div>
      <div style="padding:24px;background:#fff">
        <h2 style="color:#333;margin:0 0 16px">Order Confirmation</h2>
        <p>Dear ${escapeHtml(order.customer_name)},</p>
        <p>Your order has been placed successfully. Order number: <strong>${escapeHtml(order.order_number)}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Product</th><th style="padding:8px;text-align:center">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr><td colspan="2" style="padding:8px;text-align:right">Subtotal</td><td style="padding:8px;text-align:right">৳${order.subtotal}</td></tr>
            <tr><td colspan="2" style="padding:8px;text-align:right">Shipping</td><td style="padding:8px;text-align:right">৳${order.shipping_cost}</td></tr>
            <tr style="font-weight:bold"><td colspan="2" style="padding:8px;text-align:right;border-top:2px solid #E85D24">Total</td><td style="padding:8px;text-align:right;border-top:2px solid #E85D24;color:#E85D24">৳${order.total}</td></tr>
          </tfoot>
        </table>
        <p style="color:#666;font-size:14px">Thank you for shopping with Noori Fashion!</p>
      </div>
    </div>`;

  // Send to customer if email provided
  if (order.customer_email) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Noori Fashion <noreply@diptait.com.bd>',
        to: [order.customer_email],
        subject: `Order Confirmation — ${order.order_number} | Noori Fashion`,
        html,
      }),
    });
  }

  // Notify shop owner (Issue #24 — only client email)
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Noori Fashion <noreply@diptait.com.bd>',
      to: [ownerEmail],
      subject: `New Order — ${order.order_number} | ৳${order.total}`,
      html,
    }),
  });
}
