import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { CalendarClock, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import {
  listBookingsForCustomer,
  listBookingsForWorker,
  setBookingStatus,
} from '../../services/bookings';
import {
  Alert,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  PageHero,
  Section,
  Spinner,
  StatusBadge,
} from '../../components/ui';
import { stagger } from '../../lib/motion';
import type { BookingStatus, BookingWithParties } from '../../types/database';

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const Dashboard = () => {
  const { t } = useTranslation();
  const { profile, session, isWorker } = useAuth();
  const [bookings, setBookings] = useState<BookingWithParties[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumping this re-runs the fetch below; the effect owns all the state writes.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!session) return;
    let active = true;
    (async () => {
      try {
        const rows = isWorker
          ? await listBookingsForWorker(session.user.id)
          : await listBookingsForCustomer(session.user.id);
        if (active) setBookings(rows);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [session, isWorker, refreshKey]);

  const move = async (id: string, status: BookingStatus) => {
    await setBookingStatus(id, status);
    setRefreshKey((k) => k + 1);
  };

  if (!profile) return <Spinner />;

  const firstName = profile.full_name.split(' ')[0];
  const pendingVerification = isWorker && profile.status !== 'approved';

  return (
    <>
      <PageHero
        title={t('dashboard.welcome', { name: firstName })}
        subtitle={t(isWorker ? 'dashboard.workerSubtitle' : 'dashboard.customerSubtitle')}
      />

      <Section>
        {/* A worker who is not approved yet cannot be found or booked. */}
        {pendingVerification && (
          <div className="mb-10">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{t('dashboard.verification')}</h2>
                    <StatusBadge kind="profile" status={profile.status} />
                  </div>
                  <p className="text-gray-600 max-w-xl">
                    {profile.status === 'pending'
                      ? t('dashboard.pendingBody')
                      : profile.rejection_reason || t('dashboard.rejectedBody')}
                  </p>
                </div>
                <ButtonLink to="/onboarding" variant="secondary">
                  {t('dashboard.editProfile')}
                </ButtonLink>
              </div>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t(isWorker ? 'dashboard.requestsTitle' : 'dashboard.bookingsTitle')}
          </h2>
          {!isWorker && <ButtonLink to="/workers">{t('dashboard.bookWorker')}</ButtonLink>}
        </div>

        {error && <Alert>{error}</Alert>}

        {loading ? (
          <Spinner label={t('dashboard.loadingBookings')} />
        ) : bookings.length === 0 ? (
          <EmptyState
            title={t(isWorker ? 'dashboard.emptyWorkerTitle' : 'dashboard.emptyCustomerTitle')}
            message={
              isWorker
                ? t(
                    profile.status === 'approved'
                      ? 'dashboard.emptyWorkerApproved'
                      : 'dashboard.emptyWorkerPending',
                  )
                : t('dashboard.emptyCustomer')
            }
            action={!isWorker ? <ButtonLink to="/workers">{t('dashboard.findWorker')}</ButtonLink> : undefined}
          />
        ) : (
          <motion.div
            className="space-y-4"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {bookings.map((booking) => {
              const other = isWorker ? booking.customer : booking.worker;
              return (
                <Card key={booking.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {other?.full_name ?? t(isWorker ? 'dashboard.customer' : 'dashboard.worker')}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <CalendarClock className="w-4 h-4 text-gray-400" />
                          {formatWhen(booking.scheduled_for)}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {booking.address}
                        </p>
                        {/* Contact details only make sense once it is confirmed. */}
                        {booking.status === 'accepted' && other?.mobile && (
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {other.mobile}
                          </p>
                        )}
                        {booking.description && (
                          <p className="text-gray-500 pt-1">{booking.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {isWorker && booking.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            onClick={() => move(booking.id, 'accepted')}
                          >
                            {t('dashboard.accept')}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => move(booking.id, 'declined')}
                          >
                            {t('dashboard.decline')}
                          </Button>
                        </>
                      )}
                      {isWorker && booking.status === 'accepted' && (
                        <Button onClick={() => move(booking.id, 'completed')}>
                          {t('dashboard.markCompleted')}
                        </Button>
                      )}
                      {!isWorker && ['pending', 'accepted'].includes(booking.status) && (
                        <Button
                          variant="secondary"
                          onClick={() => move(booking.id, 'cancelled')}
                        >
                          {t('dashboard.cancel')}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}

        <p className="text-center text-gray-500 mt-12">
          {t('dashboard.editPrompt')}{' '}
          <Link to="/profile" className="text-blue-600 font-semibold hover:underline">
            {t('dashboard.editLink')}
          </Link>
        </p>
      </Section>
    </>
  );
};

export default Dashboard;
