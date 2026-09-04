import { motion } from 'framer-motion';
import { HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react';
import {
  ButtonLink,
  Card,
  PageHero,
  Section,
  SectionHeading,
} from '../components/ui';
import { fadeUp, stagger, VIEWPORT } from '../lib/motion';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust first',
    body: 'Every worker passes an admin review before a customer can book them. Verification is not optional.',
  },
  {
    icon: HeartHandshake,
    title: 'Dignity of work',
    body: 'Skilled trades deserve proper profiles, clear rates and direct bookings - not middlemen taking a cut.',
  },
  {
    icon: Users,
    title: 'Built for everyone',
    body: 'Available in English, Hindi and Kannada, and designed to be usable on a basic phone.',
  },
  {
    icon: Sparkles,
    title: 'Straightforward',
    body: 'Search, request, confirm. No job auctions, no bidding wars, no hidden charges.',
  },
];

const AboutUs = () => (
  <>
    <PageHero
      title="About BlueForce"
      subtitle="Connecting India's skilled blue-collar workers with the people who need them."
    />

    <Section>
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          Our mission
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          Skilled workers across India rely on word of mouth to find their next job,
          while people needing an electrician or a plumber rely on the same. BlueForce
          replaces that guesswork with verified profiles and direct appointments.
        </motion.p>
        <motion.p
          className="text-lg text-gray-600"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          Workers keep control of their own rates and schedule. Customers get someone
          whose credentials have actually been checked. That&apos;s the whole idea.
        </motion.p>
      </div>
    </Section>

    <Section className="bg-gradient-to-b from-white to-blue-50">
      <SectionHeading title="What we stand for" />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        {VALUES.map((value) => (
          <Card key={value.title} hover>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <value.icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
            <p className="text-gray-600">{value.body}</p>
          </Card>
        ))}
      </motion.div>
    </Section>

    <Section>
      <SectionHeading
        title="How the platform is run"
        subtitle="Three roles, one straightforward flow."
      />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        {[
          {
            step: 'Workers',
            body: 'Register under a trade, complete a profile, and receive appointment requests once verified.',
          },
          {
            step: 'Admins',
            body: 'Review each worker registration and approve or reject it. Nothing goes live without this step.',
          },
          {
            step: 'Customers',
            body: 'Browse approved workers, compare rates and experience, then request an appointment.',
          },
        ].map((role, index) => (
          <motion.div key={role.step} variants={fadeUp}>
            <Card className="h-full">
              <span className="text-5xl font-bold text-blue-100 block mb-3">
                {index + 1}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{role.step}</h3>
              <p className="text-gray-600">{role.body}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Join BlueForce</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Whether you are looking for work or looking to hire, it starts with an account.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <ButtonLink to="/register" variant="secondary">
            Create an account
          </ButtonLink>
          <ButtonLink
            to="/how-it-works"
            className="bg-white/15 hover:bg-white/25 text-white border-2 border-white/50"
          >
            See how it works
          </ButtonLink>
        </div>
      </div>
    </Section>
  </>
);

export default AboutUs;
