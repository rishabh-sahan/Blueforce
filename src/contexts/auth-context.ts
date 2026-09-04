import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '../types/database';

export interface AuthContextValue {
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
  signInWithGoogle: (role: 'worker' | 'customer') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

// The context and the hook live apart from the provider so that AuthContext.tsx
// exports nothing but a component. Fast Refresh gives up on any module that
// mixes components with other exports, and a bailout there reloads every screen.
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
