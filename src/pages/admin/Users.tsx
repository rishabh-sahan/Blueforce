import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listAllProfiles } from '../../services/profiles';
import { Alert, Card, Input, Spinner, StatusBadge } from '../../components/ui';
import type { Profile, UserRole } from '../../types/database';

/** Admins are staff, so the tabs split the two kinds of end user. */
type Tab = 'all' | 'worker' | 'customer';

const TABS: { value: Tab; labelKey: string }[] = [
  { value: 'all', labelKey: 'admin.users.tabAll' },
  { value: 'worker', labelKey: 'admin.users.tabWorkers' },
  { value: 'customer', labelKey: 'admin.users.tabCustomers' },
];

const Users = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    listAllProfiles()
      .then(setProfiles)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => ({
      workers: profiles.filter((p) => p.role === 'worker').length,
      customers: profiles.filter((p) => p.role === 'customer').length,
      pending: profiles.filter((p) => p.role === 'worker' && p.status === 'pending').length,
    }),
    [profiles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (tab !== 'all' && p.role !== (tab as UserRole)) return false;
      if (!q) return true;
      return (
        p.full_name.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        p.role.includes(q)
      );
    });
  }, [profiles, query, tab]);

  const tabCount = (value: Tab) =>
    value === 'all'
      ? profiles.length
      : profiles.filter((p) => p.role === (value as UserRole)).length;

  // The status column only means something for workers.
  const showStatus = tab !== 'customer';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('admin.users.title')}</h1>
      <p className="text-gray-600 mb-8">{t('admin.users.subtitle')}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: t('admin.users.workers'), value: counts.workers },
          { label: t('admin.users.customers'), value: counts.customers },
          { label: t('admin.users.awaiting'), value: counts.pending },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
            <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map(({ value, labelKey }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            aria-pressed={tab === value}
            className={`px-5 py-2.5 rounded-full font-semibold transition-colors ${
              tab === value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            {t(labelKey)}
            <span className={tab === value ? 'text-blue-100' : 'text-gray-400'}>
              {' '}
              ({tabCount(value)})
            </span>
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Input
          placeholder={t('admin.users.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner label={t('admin.users.loading')} />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-blue-50 text-gray-700 text-sm">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t('admin.users.name')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.users.role')}</th>
                  {showStatus && (
                    <th className="px-6 py-4 font-semibold">{t('admin.users.status')}</th>
                  )}
                  <th className="px-6 py-4 font-semibold">{t('admin.users.location')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.users.joined')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {p.full_name || t('common.none')}
                      </div>
                      <div className="text-sm text-gray-500">{p.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {t(`profile.roles.${p.role}`)}
                    </td>
                    {showStatus && (
                      <td className="px-6 py-4">
                        {p.role === 'worker' ? (
                          <StatusBadge kind="profile" status={p.status} />
                        ) : (
                          <span className="text-gray-400 text-sm">{t('common.none')}</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-gray-700">
                      {p.location || t('common.none')}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={showStatus ? 5 : 4}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {query ? t('admin.users.noMatch') : t('admin.users.noneInTab')}
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

export default Users;
