import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  { key: 'trust', icon: ShieldCheck },
  { key: 'dignity', icon: HeartHandshake },
  { key: 'everyone', icon: Users },
  { key: 'simple', icon: Sparkles },
];

const ROLE_KEYS = ['workers', 'admins', 'customers'];

const AboutUs = () => {
  const { t } = useTranslation();
  return (
  <>
    <PageHero
      title={t('about.title')}
      subtitle={t('about.subtitle')}
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
          {t('about.missionTitle')}
        </motion.h2>
        <motion.p
          className="text-lg text-gray-600 mb-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          {t('about.missionBody1')}
        </motion.p>
        <motion.p
          className="text-lg text-gray-600"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
        >
          {t('about.missionBody2')}
        </motion.p>
      </div>
    </Section>

    <Section className="bg-gradient-to-b from-white to-blue-50">
      <SectionHeading title={t('about.valuesTitle')} />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        {VALUES.map((value) => (
          <Card key={value.key} hover>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <value.icon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`about.values.${value.key}.title`)}</h3>
            <p className="text-gray-600">{t(`about.values.${value.key}.body`)}</p>
          </Card>
        ))}
      </motion.div>
    </Section>

    <Section>
      <SectionHeading
        title={t('about.rolesTitle')}
        subtitle={t('about.rolesSubtitle')}
      />
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
      >
        {ROLE_KEYS.map((role, index) => (
          <motion.div key={role} variants={fadeUp}>
            <Card className="h-full">
              <span className="text-5xl font-bold text-blue-100 block mb-3">
                {index + 1}
              </span>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t(`about.roles.${role}.title`)}</h3>
              <p className="text-gray-600">{t(`about.roles.${role}.body`)}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>

    <Section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">{t('about.ctaTitle')}</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          {t('about.ctaBody')}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <ButtonLink to="/register" variant="secondary">
            {t('about.ctaCreate')}
          </ButtonLink>
          <ButtonLink
            to="/how-it-works"
            className="bg-white/15 hover:bg-white/25 text-white border-2 border-white/50"
          >
            {t('about.ctaHow')}
          </ButtonLink>
        </div>
      </div>
    </Section>
  </>
  );
};

export default AboutUs;
