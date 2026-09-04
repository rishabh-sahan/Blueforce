import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createProfile, getProfile } from '../services/profiles';
import type { Profile, UserRole } from '../types/database';
import { AuthContext, type AuthContextValue } from './auth-context';

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

// Google never tells us whether someone is a worker or a customer, and the
// OAuth round trip leaves the app entirely. The choice made before the redirect
// is parked here and read when the browser comes back.
const PENDING_ROLE_KEY = 'blueforce_pending_role';

const stashPendingRole = (role: 'worker' | 'customer') => {
  try {
    localStorage.setItem(PENDING_ROLE_KEY, role);
  } catch {
    // Private browsing: the person is treated as a customer, which is the
    // safer default - a worker can still be switched over by an admin.
  }
};

const takePendingRole = (): 'worker' | 'customer' => {
  try {
    const stored = localStorage.getItem(PENDING_ROLE_KEY);
    localStorage.removeItem(PENDING_ROLE_KEY);
    return stored === 'worker' ? 'worker' : 'customer';
  } catch {
    return 'customer';
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialising, setInitialising] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One subscription drives everything: the initial session, sign-in, sign-out
  // and token refresh all arrive through the same callback.
  //
  // `initialising` stays true for the whole session+profile round trip, not just
  // the first one. Without that, the moment after sign-in has a session but no
  // profile yet, and route guards read that as "this account has no profile"
  // and bounce the user to onboarding.
  useEffect(() => {
    let active = true;

    const loadProfile = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession?.user) {
        setProfile(null);
        setInitialising(false);
        return;
      }
      setInitialising(true);
      try {
        let row = await getProfile(nextSession.user.id);

        // OAuth accounts arrive without a profile (see handle_new_user), so the
        // row is created here on first return from the provider, using the role
        // chosen beforehand and whatever Google gave us.
        if (!row) {
          const meta = nextSession.user.user_metadata ?? {};
          row = await createProfile(nextSession.user.id, {
            role: takePendingRole(),
            full_name: meta.full_name ?? meta.name ?? '',
            email: nextSession.user.email ?? null,
            profile_photo: meta.avatar_url ?? meta.picture ?? null,
          });
        }
        if (active) setProfile(row);
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setInitialising(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => loadProfile(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void loadProfile(nextSession);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!session?.user) return;
    setProfile(await getProfile(session.user.id));
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    role: Exclude<UserRole, 'admin'>,
    fullName: string,
  ) => {
    setError(null);
    setLoading(true);
    try {
      // The role travels in user metadata, and a trigger on auth.users creates
      // the matching profile row. That way the choice survives email
      // confirmation, where no session exists to insert the row from here.
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, full_name: fullName } },
      });
      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Sign up did not return a user.');

      if (!data.session) return { needsEmailConfirmation: true };

      setProfile(await getProfile(data.user.id));
      return { needsEmailConfirmation: false };
    } catch (err) {
      setError(errorMessage(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (role: 'worker' | 'customer') => {
    setError(null);
    stashPendingRole(role);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) {
      setError(errorMessage(oauthError));
      throw oauthError;
    }
  };

  const logout = async () => {
    setError(null);
    await supabase.auth.signOut();
    setProfile(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      initialising,
      loading,
      error,
      isAdmin: profile?.role === 'admin',
      isWorker: profile?.role === 'worker',
      isCustomer: profile?.role === 'customer',
      login,
      register,
      signInWithGoogle,
      logout,
      refreshProfile,
      clearError: () => setError(null),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, profile, initialising, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
