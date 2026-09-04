import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Button, Field, Input } from '../../components/ui';
import { EASE } from '../../lib/motion';

const Login = () => {
  const { t } = useTranslation();
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.login.title')}</h1>
        <p className="text-gray-600 mb-8">{t('auth.login.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}

          <Field label={t('auth.login.email')}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>

          <Field label={t('auth.login.password')}>
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
            {loading ? t('common.signingIn') : t('common.signIn')}
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          {t('auth.login.newHere')}{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            {t('auth.login.createAccount')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
