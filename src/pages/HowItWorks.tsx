import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  CalendarCheck,
  ClipboardList,
  HardHat,
  Search,
  ShieldCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';
import {
  ButtonLink,
  Card,
  PageHero,
  Section,
  SectionHeading,
} from '../components/ui';
import { fadeUp, stagger, VIEWPORT } from '../lib/motion';

const WORKER_STEPS = [
  {
    icon: UserPlus,
    title: 'Register as a worker',
    body: 'Sign up and pick the trade you work in - electrician, plumber, carpenter and more.',
  },
  {
    icon: ClipboardList,
    title: 'Complete your profile',
    body: 'Add your experience, hourly rate, skills and city so customers know what you offer.',
  },
  {
    icon: ShieldCheck,
    title: 'Get verified',
    body: 'Our admin team reviews every worker. You appear in search only once approved.',
  },
  {
    icon: CalendarCheck,
    title: 'Accept bookings',
    body: 'Customers send appointment requests. Accept the ones that suit you and get to work.',
  },
];

const CUSTOMER_STEPS = [
  {
    icon: Search,
    title: 'Search verified workers',
    body: 'Filter by trade and city. Everyone you see has already passed our verification.',
  },
  {
    icon: HardHat,
    title: 'Compare profiles',
    body: 'Check experience, hourly rate, skills and ratings before you decide.',
  },
  {
    icon: CalendarCheck,
    title: 'Request an appointment',
    body: 'Choose a date and time, add your address and describe the job.',
  },
  {
    icon: BadgeCheck,
    title: 'Get confirmed',
    body: 'The worker accepts and their contact details unlock. Track it from your dashboard.',
  },
];

const HowItWorks = () => {
  const [tab, setTab] = useState<'worker' | 'customer'>('customer');
  const steps = tab === 'worker' ? WORKER_STEPS : CUSTOMER_STEPS;

  return (
    <>
      <PageHero
        title="How BlueForce works"
        subtitle="Verified blue-collar workers, booked in a few taps."
      />

      <Section>
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-blue-50 rounded-full p-1.5 border-2 border-blue-100">
            {(['customer', 'worker'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                aria-pressed={tab === value}
                className={`px-7 py-2.5 rounded-full font-semibold transition-colors ${
                  tab === value
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {value === 'customer' ? 'I need a worker' : "I'm a worker"}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={tab}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {steps.map((step, index) => (
            <Card key={step.title} hover>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-4xl font-bold text-blue-100">{index + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.body}</p>
            </Card>
          ))}
        </motion.div>
      </Section>

      {/* The verification step is the part people ask about most. */}
      <Section className="bg-gradient-to-b from-white to-blue-50">
        <SectionHeading
          title="Why every worker is verified"
          subtitle="No worker reaches a customer without passing an admin review first."
        />
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          {[
            {
              icon: ClipboardList,
              title: 'Details submitted',
              body: 'The worker provides their trade, experience, rate and contact details.',
            },
            {
              icon: ShieldCheck,
              title: 'Admin review',
              body: 'Our team checks the submission and approves or sends it back with a reason.',
            },
            {
              icon: Wrench,
              title: 'Live and bookable',
              body: 'Approved workers appear in search results and can receive appointments.',
            },
          ].map((item) => (
            <motion.div key={item.title} variants={fadeUp} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book a verified worker today, or join BlueForce and start receiving work.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ButtonLink to="/workers" variant="secondary">
              Find a worker
            </ButtonLink>
            <ButtonLink
              to="/register"
              className="bg-white/15 hover:bg-white/25 text-white border-2 border-white/50"
            >
              Register as a worker
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
};

export default HowItWorks;
