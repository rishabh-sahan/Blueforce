import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  CalendarCheck,
  Clock,
  IndianRupee,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { listCategories } from '../services/profiles';
import {
  ButtonLink,
  Card,
  PageHero,
  Section,
  SectionHeading,
  Spinner,
} from '../components/ui';
import { fadeUp, stagger, VIEWPORT } from '../lib/motion';
import type { WorkerCategory } from '../types/database';

/** Emoji per trade - purely decorative, so a missing entry is harmless. */
const CATEGORY_ICONS: Record<string, string> = {
  electrician: '⚡',
  plumber: '🚿',
  carpenter: '🪚',
  welder: '🔥',
  painter: '🎨',
  mason: '🧱',
  construction: '🏗️',
  mechanic: '🔧',
  driver: '🚚',
  gardener: '🌿',
  cook: '🍳',
  delivery: '📦',
  'office-boy': '🗂️',
  'lift-technician': '🛗',
};

const PROMISES = [
  {
    icon: ShieldCheck,
    title: 'Admin verified',
    body: 'Every worker is reviewed and approved by our team before they can be booked.',
  },
  {
    icon: CalendarCheck,
    title: 'Appointment based',
    body: 'Pick a date and time that suits you. The worker confirms before anything is fixed.',
  },
  {
    icon: IndianRupee,
    title: 'Transparent rates',
    body: 'Hourly rates are shown up front on every profile. No hidden charges.',
  },
  {
    icon: MapPin,
    title: 'Local to you',
    body: 'Filter by city so you only see workers who can actually reach you.',
  },
  {
    icon: BadgeCheck,
    title: 'Real experience',
    body: 'Profiles list years of experience and specific skills, not vague claims.',
  },
  {
    icon: Clock,
    title: 'Quick turnaround',
    body: 'Requests reach the worker immediately and most are answered the same day.',
  },
];

const Services = () => {
  const [categories, setCategories] = useState<WorkerCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHero
        title="Services on BlueForce"
        subtitle="Skilled trades you can book, backed by a verification process."
      >
        <ButtonLink to="/workers" variant="secondary">
          Browse verified workers
        </ButtonLink>
      </PageHero>

      <Section>
        <SectionHeading
          title="Trades we cover"
          subtitle="Book a verified professional in any of these categories."
        />

        {loading ? (
          <Spinner label="Loading trades" />
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
          >
            {categories.map((category) => (
              <motion.div key={category.slug} variants={fadeUp}>
                <Link
                  to={`/workers?category=${category.slug}`}
                  className="block bg-white rounded-2xl border-2 border-blue-100 shadow-lg p-6 text-center hover:border-blue-300 hover:-translate-y-1 transition-all"
                >
                  <span className="text-4xl block mb-3" aria-hidden="true">
                    {CATEGORY_ICONS[category.slug] ?? '🔧'}
                  </span>
                  <h3 className="font-bold text-gray-900">{category.name}</h3>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Section>

      <Section className="bg-gradient-to-b from-white to-blue-50">
        <SectionHeading
          title="What you get every time"
          subtitle="The same standards apply to every trade on the platform."
        />
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          {PROMISES.map((promise) => (
            <Card key={promise.title} hover>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
                <promise.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{promise.title}</h3>
              <p className="text-gray-600">{promise.body}</p>
            </Card>
          ))}
        </motion.div>
      </Section>

      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Need one of these today?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Browse verified workers in your city and request an appointment in minutes.
          </p>
          <ButtonLink to="/workers" variant="secondary">
            Find a worker
          </ButtonLink>
        </div>
      </Section>
    </>
  );
};

export default Services;
