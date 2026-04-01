'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export default function AuthProvider() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const loadProfile = async (userId: string, email: string) => {
      let { data: profile } = await supabase
        .from('nf_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      // Auto-create profile if missing (trigger may have failed)
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
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return null;
}
