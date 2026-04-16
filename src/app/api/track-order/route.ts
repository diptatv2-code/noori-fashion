import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json({ error: 'অর্ডার নম্বর বা মোবাইল নম্বর দিন' }, { status: 400 });
  }

  const { data } = await supabase
    .from('nf_orders')
    .select('order_number, order_status, payment_method, payment_status, subtotal, shipping_cost, total, created_at, customer_name, nf_order_items(product_name, variant_size, quantity, unit_price, total_price)')
    .or(`order_number.eq.${query},customer_phone.eq.${query}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return NextResponse.json({ order: null });
  }

  return NextResponse.json({ order: data });
}
