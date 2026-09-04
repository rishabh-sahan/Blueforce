import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, MapPin, Search, Star } from 'lucide-react';
import { listApprovedWorkers, listCategories } from '../services/profiles';
import {
  ButtonLink,
  Card,
  EmptyState,
  Input,
  PageHero,
  Section,
  Select,
  Spinner,
} from '../components/ui';
import { stagger } from '../lib/motion';
import type { Profile, WorkerCategory } from '../types/database';

const BrowseWorkers = () => {
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [categories, setCategories] = useState<WorkerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let active = true;
    // Only approved workers are readable - enforced by RLS, not by this filter.
    // Results are replaced in place on refilter rather than flashing a spinner.
    (async () => {
      try {
        const rows = await listApprovedWorkers({ category, location, search });
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
  }, [category, location, search]);

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.slug, c.name])),
    [categories],
  );

  return (
    <>
      <PageHero
        title="Find a verified worker"
        subtitle="Every worker listed here has been checked and approved by our team."
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <Input
              className="pl-11"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All trades</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
          <Input
            placeholder="City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-center text-red-600 mb-8">Could not load workers: {error}</p>
        )}

        {loading ? (
          <Spinner label="Finding workers" />
        ) : workers.length === 0 ? (
          <EmptyState
            title="No workers match your search"
            message="Try a different trade or city. New workers appear here as soon as our team verifies them."
          />
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {workers.map((worker) => (
              <Card key={worker.id} hover>
                <div className="flex items-center gap-4 mb-4">
                  {worker.profile_photo ? (
                    <img
                      src={worker.profile_photo}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-lg">
                      {worker.full_name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate flex items-center gap-1">
                      {worker.full_name}
                      <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    </h3>
                    <p className="text-blue-600 text-sm font-medium">
                      {worker.category ? categoryName[worker.category] ?? worker.category : 'Worker'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-5">
                  {worker.location && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {worker.location}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {worker.rating > 0 ? worker.rating.toFixed(1) : 'Newly verified'}
                    {worker.experience_years != null && (
                      <span className="text-gray-400">
                        · {worker.experience_years} yrs experience
                      </span>
                    )}
                  </p>
                  {worker.hourly_rate != null && (
                    <p className="font-semibold text-gray-900">₹{worker.hourly_rate}/hour</p>
                  )}
                </div>

                <ButtonLink to={`/workers/${worker.id}`} className="w-full">
                  View &amp; book
                </ButtonLink>
              </Card>
            ))}
          </motion.div>
        )}

        <p className="text-center text-gray-500 mt-12">
          Are you a skilled worker?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Join BlueForce
          </Link>
        </p>
      </Section>
    </>
  );
};

export default BrowseWorkers;
