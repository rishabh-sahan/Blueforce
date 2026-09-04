import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getWorkerById, listCategories } from '../services/profiles';
import { createBooking } from '../services/bookings';
import { useAuth } from '../contexts/AuthContext';
import {
  Alert,
  Button,
  Card,
  Field,
  Input,
  Section,
  Spinner,
  Textarea,
  useCategoryName,
} from '../components/ui';
import type { Profile, WorkerCategory } from '../types/database';

const WorkerDetail = () => {
  const { t } = useTranslation();
  const categoryName = useCategoryName();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, profile } = useAuth();

  const [worker, setWorker] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<WorkerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({ scheduled_for: '', address: '', description: '' });

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getWorkerById(id)
      .then((row) => active && setWorker(row))
      .catch((err) => active && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Spinner label={t('workers.detail.loading')} />;
  if (!worker) {
    return (
      <Section>
        <p className="text-center text-gray-600">
          {t('workers.detail.unavailable')}{' '}
          <Link to="/workers" className="text-blue-600 font-semibold hover:underline">
            {t('common.backToWorkers')}
          </Link>
        </p>
      </Section>
    );
  }

  const tradeName = categoryName(
    worker.category,
    categories.find((c) => c.slug === worker.category)?.name,
  );

  const handleBook = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) {
      navigate('/login', { state: { from: `/workers/${id}` } });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createBooking(session.user.id, {
        worker_id: worker.user_id,
        scheduled_for: new Date(form.scheduled_for).toISOString(),
        address: form.address,
        description: form.description || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section className="bg-gradient-to-b from-blue-50 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
        {/* Worker */}
        <div className="lg:col-span-3">
          <Card>
            <div className="flex items-center gap-5 mb-6">
              {worker.profile_photo ? (
                <img
                  src={worker.profile_photo}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-2xl">
                  {worker.full_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {worker.full_name}
                  <BadgeCheck className="w-5 h-5 text-blue-600" />
                </h1>
                <p className="text-blue-600 font-medium">{tradeName}</p>
                {worker.location && (
                  <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {worker.location}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  {worker.rating > 0 ? worker.rating.toFixed(1) : '—'}
                </div>
                <div className="text-gray-600 text-sm mt-1">{t('common.rating')}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {worker.experience_years ?? '—'}
                </div>
                <div className="text-gray-600 text-sm mt-1">{t('workers.detail.yearsExp')}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {worker.hourly_rate != null ? `₹${worker.hourly_rate}` : '—'}
                </div>
                <div className="text-gray-600 text-sm mt-1">{t('workers.detail.perHour')}</div>
              </div>
            </div>

            {worker.bio && <p className="text-gray-600 mb-6">{worker.bio}</p>}

            {worker.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Booking */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('workers.detail.bookTitle')}</h2>

            {done ? (
              <div className="space-y-4">
                <Alert tone="success">
                  {t('workers.detail.successTitle')}{' '}
                  {t('workers.detail.successBody', { name: worker.full_name.split(' ')[0] })}
                </Alert>
                <Button className="w-full" onClick={() => navigate('/dashboard')}>
                  {t('workers.detail.viewBookings')}
                </Button>
              </div>
            ) : profile?.role === 'worker' ? (
              <Alert tone="info">
                {t('workers.detail.workerNotice')}
              </Alert>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                {error && <Alert>{error}</Alert>}

                <Field label={t('workers.detail.when')}>
                  <Input
                    type="datetime-local"
                    required
                    value={form.scheduled_for}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, scheduled_for: e.target.value }))
                    }
                  />
                </Field>

                <Field label={t('workers.detail.address')}>
                  <Input
                    required
                    placeholder={t('workers.detail.addressPlaceholder')}
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </Field>

                <Field label={t('workers.detail.description')} hint={t('workers.detail.descriptionHint')}>
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </Field>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? t('workers.detail.sending') : t('workers.detail.requestButton')}
                </Button>

                {!session && (
                  <p className="text-sm text-gray-500 text-center">
                    {t('workers.detail.signInNote')}
                  </p>
                )}
              </form>
            )}
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default WorkerDetail;
