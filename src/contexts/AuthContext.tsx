import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getProfile } from '../services/profiles';
import type { Profile, UserRole } from '../types/database';

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  /** True until the initial session lookup settles - guards need this. */
  initialising: boolean;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isWorker: boolean;
  isCustomer: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: Exclude<UserRole, 'admin'>,
    fullName: string,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [initialising, setInitialising] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // One subscription drives everything: the initial session, sign-in, sign-out
  // and token refresh all arrive through the same callback.
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
      try {
        const row = await getProfile(nextSession.user.id);
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
      logout,
      refreshProfile,
      clearError: () => setError(null),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, profile, initialising, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
};
