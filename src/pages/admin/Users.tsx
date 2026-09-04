import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { listAllProfiles } from '../../services/profiles';
import { Alert, Card, Input, Spinner, StatusBadge } from '../../components/ui';
import type { Profile } from '../../types/database';

const Users = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    listAllProfiles()
      .then(setProfiles)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        p.role.includes(q),
    );
  }, [profiles, query]);

  const counts = useMemo(
    () => ({
      workers: profiles.filter((p) => p.role === 'worker').length,
      customers: profiles.filter((p) => p.role === 'customer').length,
      pending: profiles.filter((p) => p.role === 'worker' && p.status === 'pending').length,
    }),
    [profiles],
  );

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
                  <th className="px-6 py-4 font-semibold">{t('admin.users.status')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.users.location')}</th>
                  <th className="px-6 py-4 font-semibold">{t('admin.users.joined')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{p.full_name || t('common.none')}</div>
                      <div className="text-sm text-gray-500">{p.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{t(`profile.roles.${p.role}`)}</td>
                    <td className="px-6 py-4">
                      {p.role === 'worker' ? (
                        <StatusBadge kind="profile" status={p.status} />
                      ) : (
                        <span className="text-gray-400 text-sm">{t('common.none')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{p.location || t('common.none')}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {t('admin.users.noMatch')}
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
