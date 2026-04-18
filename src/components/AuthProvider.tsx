'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useWishlistStore } from '@/lib/store';

export default function AuthProvider() {
  const setUser = useAuthStore((s) => s.setUser);
  const setWishlistIds = useWishlistStore((s) => s.setIds);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    const loadWishlist = async (userId: string) => {
      const { data } = await supabase
        .from('nf_wishlist')
        .select('product_id')
        .eq('user_id', userId);
      setWishlistIds((data || []).map((r: { product_id: string }) => r.product_id));
    };

    const loadProfile = async (userId: string, email: string) => {
      let { data: profile } = await supabase
        .from('nf_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile) {
        await supabase.from('nf_profiles').upsert(
          { id: userId, email, role: 'customer' },
          { onConflict: 'id' }
        );
        profile = { role: 'customer' };
      }

      setUser({
        id: userId,
        email,
        role: profile.role || 'customer',
      });

      loadWishlist(userId).catch(() => {});
    };

    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email || '');
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        clearWishlist();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setWishlistIds, clearWishlist]);

  return null;
}
