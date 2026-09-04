import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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

const WORKER_STEPS = [UserPlus, ClipboardList, ShieldCheck, CalendarCheck];
const CUSTOMER_STEPS = [Search, HardHat, CalendarCheck, BadgeCheck];
const VERIFY_STEPS = [
  { key: 'submitted', icon: ClipboardList },
  { key: 'review', icon: ShieldCheck },
  { key: 'live', icon: Wrench },
];

const HowItWorks = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'worker' | 'customer'>('customer');
  const icons = tab === 'worker' ? WORKER_STEPS : CUSTOMER_STEPS;

  return (
    <>
      <PageHero
        title={t('howItWorks.title')}
        subtitle={t('howItWorks.subtitle')}
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
                {t(value === 'customer' ? 'howItWorks.tabCustomer' : 'howItWorks.tabWorker')}
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
          {icons.map((Icon, index) => (
            <Card key={index} hover>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-4xl font-bold text-blue-100">{index + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t(`howItWorks.${tab}.step${index + 1}.title`)}
              </h3>
              <p className="text-gray-600">{t(`howItWorks.${tab}.step${index + 1}.body`)}</p>
            </Card>
          ))}
        </motion.div>
      </Section>

      {/* The verification step is the part people ask about most. */}
      <Section className="bg-gradient-to-b from-white to-blue-50">
        <SectionHeading
          title={t('howItWorks.verifyTitle')}
          subtitle={t('howItWorks.verifySubtitle')}
        />
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          {VERIFY_STEPS.map((item) => (
            <motion.div key={item.key} variants={fadeUp} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t(`howItWorks.verify.${item.key}.title`)}</h3>
              <p className="text-gray-600">{t(`howItWorks.verify.${item.key}.body`)}</p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{t('howItWorks.ctaTitle')}</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('howItWorks.ctaBody')}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ButtonLink to="/workers" variant="secondary">
              {t('howItWorks.ctaFind')}
            </ButtonLink>
            <ButtonLink
              to="/register"
              className="bg-white/15 hover:bg-white/25 text-white border-2 border-white/50"
            >
              {t('howItWorks.ctaJoin')}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
};

export default HowItWorks;
