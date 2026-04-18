import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } from '@/lib/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: NextRequest) {
  try {
    const { product_id } = await req.json();
    if (!product_id) return NextResponse.json({ ok: false }, { status: 400 });
    await supabase.rpc('nf_increment_product_view', { p_product_id: product_id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
