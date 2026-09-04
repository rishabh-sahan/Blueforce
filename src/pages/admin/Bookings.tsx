import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listAllBookings } from '../../services/bookings';
import { Alert, Card, Spinner, StatusBadge } from '../../components/ui';
import type { BookingStatus, BookingWithParties } from '../../types/database';

const STATUSES: BookingStatus[] = [
  'pending',
  'accepted',
  'completed',
  'declined',
  'cancelled',
];

const Bookings = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingWithParties[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  useEffect(() => {
    listAllBookings()
      .then(setBookings)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? bookings : bookings.filter((b) => b.status === filter)),
    [bookings, filter],
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.bookings.title')}</h1>
      <p className="text-gray-600 mb-8">{t('admin.bookings.subtitle')}</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-5 py-2.5 rounded-full font-semibold capitalize transition-colors ${
              filter === s
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            {s === 'all' ? t('admin.bookings.all') : t(`status.booking.${s}`)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner label={t('admin.bookings.loading')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-blue-50 text-gray-700 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('admin.bookings.customer')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.bookings.worker')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.bookings.scheduled')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.bookings.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {b.customer?.full_name ?? t('common.none')}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {b.worker?.full_name ?? t('common.none')}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {new Date(b.scheduled_for).toLocaleString()}
                      <div className="text-gray-400">{b.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      {t('admin.bookings.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Bookings;
