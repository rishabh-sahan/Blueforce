import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Button, Field, Input } from '../../components/ui';
import { EASE } from '../../lib/motion';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as { from?: string } | null)?.from;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    try {
      await login(email, password);
      // AuthContext resolves the profile from the session; the dashboard then
      // routes to the right place for the role.
      navigate(from ?? '/dashboard', { replace: true });
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-600 mb-8">Sign in to manage your bookings.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}

          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          New here?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
