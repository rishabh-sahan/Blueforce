import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { HardHat, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, Button, Field, Input } from '../../components/ui';
import { EASE } from '../../lib/motion';

type SignupRole = 'worker' | 'customer';

const ROLES: { value: SignupRole; icon: typeof HardHat }[] = [
  { value: 'worker', icon: HardHat },
  { value: 'customer', icon: UserRound },
];

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuth();
  const [role, setRole] = useState<SignupRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();
    try {
      const { needsEmailConfirmation } = await register(email, password, role, fullName);
      if (needsEmailConfirmation) {
        setNotice(t('auth.register.confirmNotice'));
        return;
      }
      // Workers must complete their profile before an admin can verify them.
      navigate(role === 'worker' ? '/onboarding' : '/dashboard', { replace: true });
    } catch {
      // Surfaced through `error`.
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        className="w-full max-w-lg bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.register.title')}</h1>
        <p className="text-gray-600 mb-8">{t('auth.register.subtitle')}</p>

        {notice ? (
          <div className="space-y-6">
            <Alert tone="success">{notice}</Alert>
            <Link to="/login" className="block">
              <Button className="w-full">{t('auth.register.goToSignIn')}</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert>{error}</Alert>}

            <fieldset>
              <legend className="block text-sm font-semibold text-gray-700 mb-3">
                {t('auth.register.roleQuestion')}
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map(({ value, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    aria-pressed={role === value}
                    className={`text-left p-4 rounded-2xl border-2 transition-colors ${
                      role === value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${
                        role === value ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <span className="block font-semibold text-gray-900">{t(`auth.register.${value}Title`)}</span>
                    <span className="block text-sm text-gray-600 mt-1">{t(`auth.register.${value}Blurb`)}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <Field label={t('auth.register.fullName')}>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder={t('auth.register.namePlaceholder')}
              />
            </Field>

            <Field label={t('auth.register.email')}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>

            <Field label={t('auth.register.password')} hint={t('auth.register.passwordHint')}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </Field>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
          </form>
        )}

        <p className="text-center text-gray-600 mt-6">
          {t('auth.register.already')}{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
