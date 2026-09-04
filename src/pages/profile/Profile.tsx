import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { listCategories, updateProfile } from '../../services/profiles';
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  PageHero,
  Section,
  Select,
  Spinner,
  StatusBadge,
  Textarea,
} from '../../components/ui';
import type { WorkerCategory } from '../../types/database';

/**
 * One profile editor for both roles - worker-only fields simply do not render.
 * The form is a child seeded from props and remounted by key, so there is no
 * effect syncing server state into form state.
 */
const Profile = () => {
  const { profile, session } = useAuth();
  if (!profile || !session) return <Spinner />;
  return <ProfileForm key={profile.id} />;
};

const ProfileForm = () => {
  const { t } = useTranslation();
  const { profile, session, refreshProfile, isWorker } = useAuth();
  const [categories, setCategories] = useState<WorkerCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
    if (isWorker) listCategories().then(setCategories).catch(() => setCategories([]));
  }, [isWorker]);

  if (!profile || !session) return <Spinner />;

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateProfile(session.user.id, {
        full_name: form.full_name,
        mobile: form.mobile || null,
        location: form.location || null,
        ...(isWorker
          ? {
              category: form.category || null,
              experience_years: form.experience_years
                ? Number(form.experience_years)
                : null,
              hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
              skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
              bio: form.bio || null,
            }
          : {}),
      });
      await refreshProfile();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHero title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <Section>
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">{t('profile.signedInAs')}</p>
                <p className="font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">{t(`profile.roles.${profile.role}`)}</p>
                {isWorker && (
                  <StatusBadge kind="profile" status={profile.status} />
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && <Alert>{error}</Alert>}
              {saved && <Alert tone="success">{t('profile.saved')}</Alert>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label={t('profile.fullName')}>
                  <Input value={form.full_name} onChange={set('full_name')} required />
                </Field>
                <Field label={t('profile.mobile')}>
                  <Input type="tel" value={form.mobile} onChange={set('mobile')} />
                </Field>
              </div>

              <Field label={t('profile.city')}>
                <Input value={form.location} onChange={set('location')} />
              </Field>

              {isWorker && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label={t('profile.category')}>
                      <Select value={form.category} onChange={set('category')}>
                        <option value="">{t('profile.selectTrade')}</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {t(`categories.${c.slug}`, { defaultValue: c.name })}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label={t('profile.rate')}>
                      <Input
                        type="number"
                        min={0}
                        value={form.hourly_rate}
                        onChange={set('hourly_rate')}
                      />
                    </Field>
                  </div>

                  <Field label={t('profile.experience')}>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={form.experience_years}
                      onChange={set('experience_years')}
                    />
                  </Field>

                  <Field label={t('profile.skills')} hint={t('profile.skillsHint')}>
                    <Input value={form.skills} onChange={set('skills')} />
                  </Field>

                  <Field label={t('profile.bio')}>
                    <Textarea rows={4} value={form.bio} onChange={set('bio')} />
                  </Field>

                  <p className="text-sm text-gray-500">
                    {t('profile.statusNote')}
                  </p>
                </>
              )}

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </form>
          </Card>
        </div>
      </Section>
    </>
  );
};

export default Profile;
