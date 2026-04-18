import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SAFE_QUERY = /^[A-Za-z0-9_+\-.]{3,64}$/;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json({ error: 'Please enter an order number or mobile number' }, { status: 400 });
  }

  if (!SAFE_QUERY.test(query)) {
    return NextResponse.json({ order: null });
  }

  const select = 'order_number, order_status, payment_method, payment_status, subtotal, shipping_cost, total, created_at, customer_name, nf_order_items(product_name, variant_size, quantity, unit_price, total_price)';

  let { data } = await supabase
    .from('nf_orders')
    .select(select)
    .eq('order_number', query)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    const phone = query.replace(/[^0-9+]/g, '');
    if (phone.length >= 10) {
      const res = await supabase
        .from('nf_orders')
        .select(select)
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      data = res.data;
    }
  }

  return NextResponse.json({ order: data || null });
}
