import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/useAuth';
import { listCategories, updateProfile } from '../services/profiles';
import { Alert, Button, Field, Input, Select, Spinner, Textarea } from '../components/ui';
import { EASE } from '../lib/motion';
import type { WorkerCategory } from '../types/database';

/**
 * Collects the worker details an admin needs in order to verify them. The
 * profile row itself already exists - a trigger on auth.users creates it at
 * sign-up with the role the person chose.
 */
const Onboarding = () => {
  const { t } = useTranslation();
  const { session, profile, initialising } = useAuth();

  if (initialising) return <Spinner label={t('common.loadingAccount')} />;
  if (!session) return <Navigate to="/login" replace />;
  // A customer has nothing to complete here.
  if (profile?.role === 'customer') return <Navigate to="/dashboard" replace />;

  // Remount when the profile arrives so the form seeds from it without an
  // effect copying server state into form state.
  return <OnboardingForm key={profile?.id ?? 'new'} />;
};

const OnboardingForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session, profile, refreshProfile } = useAuth();
  const [categories, setCategories] = useState<WorkerCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState(() => ({
    full_name: profile?.full_name || '',
    mobile: profile?.mobile || '',
    location: profile?.location || '',
    category: profile?.category || '',
    experience_years: profile?.experience_years?.toString() || '',
    hourly_rate: profile?.hourly_rate?.toString() || '',
    skills: profile?.skills.join(', ') || '',
    bio: profile?.bio || '',
  }));

  useEffect(() => {
    listCategories().then(setCategories).catch((err) => setError(String(err)));
  }, []);

  if (!session) return <Spinner />;

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(session.user.id, {
        full_name: form.full_name,
        mobile: form.mobile || null,
        location: form.location || null,
        category: form.category || null,
        experience_years: form.experience_years ? Number(form.experience_years) : null,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        bio: form.bio || null,
      });
      await refreshProfile();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <motion.div
        className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border-2 border-blue-100 p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('onboarding.title')}</h1>
        <p className="text-gray-600 mb-8">
          {t('onboarding.body')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert>{error}</Alert>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label={t('onboarding.fullName')}>
              <Input value={form.full_name} onChange={set('full_name')} required />
            </Field>
            <Field label={t('onboarding.mobile')}>
              <Input
                value={form.mobile}
                onChange={set('mobile')}
                required
                type="tel"
                placeholder="+91 98765 43210"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label={t('onboarding.category')}>
              <Select value={form.category} onChange={set('category')} required>
                <option value="">{t('onboarding.selectTrade')}</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {t(`categories.${c.slug}`, { defaultValue: c.name })}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t('onboarding.city')}>
              <Input
                value={form.location}
                onChange={set('location')}
                required
                placeholder={t('onboarding.cityPlaceholder')}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label={t('onboarding.experience')}>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={form.experience_years}
                onChange={set('experience_years')}
                required
              />
            </Field>
            <Field label={t('onboarding.rate')}>
              <Input
                type="number"
                min={0}
                value={form.hourly_rate}
                onChange={set('hourly_rate')}
                required
              />
            </Field>
          </div>

          <Field label={t('onboarding.skills')} hint={t('onboarding.skillsHint')}>
            <Input value={form.skills} onChange={set('skills')} />
          </Field>

          <Field label={t('onboarding.bio')} hint={t('onboarding.bioHint')}>
            <Textarea rows={4} value={form.bio} onChange={set('bio')} />
          </Field>

          <Button type="submit" disabled={saving} className="w-full">
            {saving ? t('onboarding.submitting') : t('onboarding.submit')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
