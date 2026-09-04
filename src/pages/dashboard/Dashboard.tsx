import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClock, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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
import {
  BOOKING_STATUS_LABELS,
  PROFILE_STATUS_LABELS,
  type BookingStatus,
  type BookingWithParties,
} from '../../types/database';

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const Dashboard = () => {
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

  const firstName = profile.full_name.split(' ')[0] || 'there';
  const pendingVerification = isWorker && profile.status !== 'approved';

  return (
    <>
      <PageHero
        title={`Welcome back, ${firstName}`}
        subtitle={
          isWorker
            ? 'Appointment requests from customers appear here.'
            : 'Track the appointments you have booked.'
        }
      />

      <Section>
        {/* A worker who is not approved yet cannot be found or booked. */}
        {pendingVerification && (
          <div className="mb-10">
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">Verification</h2>
                    <StatusBadge
                      kind="profile"
                      status={profile.status}
                      label={PROFILE_STATUS_LABELS[profile.status]}
                    />
                  </div>
                  <p className="text-gray-600 max-w-xl">
                    {profile.status === 'pending'
                      ? 'Our team is reviewing your profile. Once approved you will appear in search results and can receive bookings.'
                      : profile.rejection_reason ||
                        'Your profile was not approved. Update your details and it will be reviewed again.'}
                  </p>
                </div>
                <ButtonLink to="/onboarding" variant="secondary">
                  Edit profile
                </ButtonLink>
              </div>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isWorker ? 'Appointment requests' : 'My bookings'}
          </h2>
          {!isWorker && <ButtonLink to="/workers">Book a worker</ButtonLink>}
        </div>

        {error && <Alert>{error}</Alert>}

        {loading ? (
          <Spinner label="Loading bookings" />
        ) : bookings.length === 0 ? (
          <EmptyState
            title={isWorker ? 'No requests yet' : 'No bookings yet'}
            message={
              isWorker
                ? profile.status === 'approved'
                  ? 'Customers can find you in search. New requests will show up here.'
                  : 'Once your profile is verified, customers can find and book you.'
                : 'Browse verified workers and request an appointment.'
            }
            action={!isWorker ? <ButtonLink to="/workers">Find a worker</ButtonLink> : undefined}
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
                          {other?.full_name ?? (isWorker ? 'Customer' : 'Worker')}
                        </h3>
                        <StatusBadge
                          status={booking.status}
                          label={BOOKING_STATUS_LABELS[booking.status]}
                        />
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
                            Accept
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => move(booking.id, 'declined')}
                          >
                            Decline
                          </Button>
                        </>
                      )}
                      {isWorker && booking.status === 'accepted' && (
                        <Button onClick={() => move(booking.id, 'completed')}>
                          Mark completed
                        </Button>
                      )}
                      {!isWorker && ['pending', 'accepted'].includes(booking.status) && (
                        <Button
                          variant="secondary"
                          onClick={() => move(booking.id, 'cancelled')}
                        >
                          Cancel
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
          Need to change your details?{' '}
          <Link to="/profile" className="text-blue-600 font-semibold hover:underline">
            Edit your profile
          </Link>
        </p>
      </Section>
    </>
  );
};

export default Dashboard;
