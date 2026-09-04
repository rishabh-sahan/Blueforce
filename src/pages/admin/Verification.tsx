import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { listCategories, listProfilesByStatus, setWorkerStatus } from '../../services/profiles';
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Input,
  Spinner,
  StatusBadge,
} from '../../components/ui';
import { stagger } from '../../lib/motion';
import {
  PROFILE_STATUS_LABELS,
  type Profile,
  type ProfileStatus,
  type WorkerCategory,
} from '../../types/database';

const TABS: { value: ProfileStatus; label: string }[] = [
  { value: 'pending', label: 'Awaiting review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

/** The gate in the flow: no worker reaches customers without passing through here. */
const Verification = () => {
  const { session } = useAuth();
  const [tab, setTab] = useState<ProfileStatus>('pending');
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<WorkerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Bumped after an approve/reject so the list reloads from one place.
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await listProfilesByStatus(tab);
        if (active) {
          setWorkers(rows);
          setError(null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tab, refreshKey]);

  const decide = async (
    profileId: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ) => {
    if (!session) return;
    try {
      await setWorkerStatus(profileId, status, session.user.id, rejectionReason);
      setRejecting(null);
      setReason('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const categoryName = (slug: string | null) =>
    categories.find((c) => c.slug === slug)?.name ?? slug ?? '—';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Worker verification</h1>
      <p className="text-gray-600 mb-8">
        Approve a worker to make them visible and bookable. Rejected workers can fix
        their details and be reviewed again.
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`px-5 py-2.5 rounded-full font-semibold transition-colors ${
              tab === value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6">
          <Alert>{error}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner label="Loading workers" />
      ) : workers.length === 0 ? (
        <EmptyState
          title={tab === 'pending' ? 'Nothing to review' : `No ${tab} workers`}
          message={
            tab === 'pending'
              ? 'New worker registrations will appear here for approval.'
              : 'Workers you have actioned will be listed here.'
          }
        />
      ) : (
        <motion.div className="space-y-4" variants={stagger} initial="hidden" animate="show">
          {workers.map((worker) => (
            <Card key={worker.id}>
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{worker.full_name}</h3>
                    <StatusBadge
                      kind="profile"
                      status={worker.status}
                      label={PROFILE_STATUS_LABELS[worker.status]}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Trade</p>
                      <p className="font-semibold text-gray-900">
                        {categoryName(worker.category)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Experience</p>
                      <p className="font-semibold text-gray-900">
                        {worker.experience_years ?? '—'} yrs
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Rate</p>
                      <p className="font-semibold text-gray-900">
                        {worker.hourly_rate != null ? `₹${worker.hourly_rate}/hr` : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Registered</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(worker.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {worker.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {worker.location}
                      </span>
                    )}
                    {worker.mobile && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {worker.mobile}
                      </span>
                    )}
                    <span className="text-gray-400">{worker.email}</span>
                  </div>

                  {worker.bio && <p className="text-gray-600 mb-3">{worker.bio}</p>}

                  {worker.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {worker.skills.map((s) => (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {worker.status === 'rejected' && worker.rejection_reason && (
                    <p className="mt-3 text-sm text-red-600">
                      Reason: {worker.rejection_reason}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-64 shrink-0">
                  {rejecting === worker.id ? (
                    <div className="space-y-3">
                      <Input
                        autoFocus
                        placeholder="Reason for rejection"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          className="flex-1"
                          onClick={() => decide(worker.id, 'rejected', reason)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1"
                          onClick={() => {
                            setRejecting(null);
                            setReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {worker.status !== 'approved' && (
                        <Button
                          variant="success"
                          onClick={() => decide(worker.id, 'approved')}
                        >
                          Approve worker
                        </Button>
                      )}
                      {worker.status !== 'rejected' && (
                        <Button variant="secondary" onClick={() => setRejecting(worker.id)}>
                          Reject
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Verification;
