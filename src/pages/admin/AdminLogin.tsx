import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Button, Field, Input } from '../../components/ui';
import { EASE } from '../../lib/motion';

/**
 * Admins sign in with a normal Supabase account; the panel then checks that the
 * account's profile carries the 'admin' role. There is no shared password, and
 * the role lives in the database where RLS can enforce it - a browser-side flag
 * would not stop anyone from calling the API directly.
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, logout, profile, session, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Derived, not stored: any signed-in non-admin is denied.
  const denied = Boolean(session && profile && profile.role !== 'admin');

  useEffect(() => {
    if (session && profile?.role === 'admin') {
      navigate('/admin/verification', { replace: true });
    }
  }, [session, profile, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    try {
      await login(email, password);
    } catch {
      // Surfaced through `error`.
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
          <ShieldCheck className="w-7 h-7 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin sign in</h1>
        <p className="text-gray-600 mb-8">Restricted to BlueForce staff accounts.</p>

        {denied ? (
          <div className="space-y-4">
            <Alert>
              This account does not have admin access.
            </Alert>
            <Button variant="secondary" className="w-full" onClick={logout}>
              Sign in with another account
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert>{error}</Alert>}

            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Field>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
