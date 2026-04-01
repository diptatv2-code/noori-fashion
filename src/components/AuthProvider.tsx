'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('nf_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile?.role || 'customer',
        });
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('nf_profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: profile?.role || 'customer',
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return null;
}
