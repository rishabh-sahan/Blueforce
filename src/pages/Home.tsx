import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, Shield, Users, ChevronDown, ThumbsUp, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../components/home/ImageSlider';
import FeatureScroll from '../components/home/FeatureScroll';
import TestimonialScroll from '../components/home/TestimonialScroll';
import { useState, useEffect, useRef } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function AnimatedCounter({ value, duration = 1200, className = '' }: { value: number, duration?: number, className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  // The counters sit well below the fold, so counting on mount means the
  // animation is always over before anyone scrolls down to it. Wait until the
  // element is actually on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = value.toString();
      return;
    }

    let frame = 0;
    let startedAt = 0;

    const step = (timestamp: number) => {
      if (!startedAt) startedAt = timestamp;
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      el.textContent = Math.floor(progress * value).toString();
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return <span ref={ref} className={className}>0</span>;
}

const FAQ_IDS = ['1', '2', '3', '4', '5'];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const VIEWPORT = { once: true, amount: 0.25 } as const;

const Home = () => {
  const [showLearnMore, setShowLearnMore] = useState(false);
  const { t } = useTranslation();

  const faqs = FAQ_IDS.map((id) => ({
    question: t(`home.faq.q${id}`),
    answer: t(`home.faq.a${id}`)
  }));

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { y: 24, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.55, ease: EASE }
    }
  };

  // FAQ open/close state
  const [openFaqs, setOpenFaqs] = useState(Array(faqs.length).fill(false));
  const handleToggleFaq = (idx: number) => {
    setOpenFaqs((prev) => prev.map((open, i) => (i === idx ? !open : open)));
  };

  // Close the modal on Escape, and stop the page behind it from scrolling.
  useEffect(() => {
    if (!showLearnMore) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLearnMore(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showLearnMore]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Image Slider */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <ImageSlider
            title={t('home.hero.title')}
            subtitle={t('home.hero.subtitle')}
            images={[
              {
                src: "https://miro.medium.com/v2/resize:fit:1400/0*k6-msqB4P6Ik1G2B",
                alt: t('home.slider.alt1')
              },
              {
                src: "https://i.pinimg.com/736x/be/ba/6e/beba6e3905c7f21b71743861e8560b51.jpg",
                alt: t('home.slider.alt2')
              },
              {
                src: "https://i.pinimg.com/736x/e3/d7/2e/e3d72e9d7756d73afa3de65c8823db88.jpg",
                alt: t('home.slider.alt3')
              }
            ]}
          />
        </div>
      </section>

      {/* Primary paths into the product */}
      <div className="container mx-auto px-4 mb-16 flex flex-col sm:flex-row justify-center items-center gap-4">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Link
            to="/workers"
            className="inline-flex items-center gap-3 px-9 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition-colors shadow-xl"
          >
            {t('home.cta.book')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 px-9 py-4 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors shadow-xl"
          >
            {t('home.cta.join')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>

      {/* Trust & Professionalism Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl border-4 border-blue-100 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Left: Image */}
              <div className="flex-1 mb-8 md:mb-0">
                <div className="relative">
                  <img
                    src="https://media.istockphoto.com/id/1189913170/photo/engineer-and-businessman-handshake-at-construction-site.jpg?s=612x612&w=0&k=20&c=LAGNJv533KQKPrb71GiavOCaTKVI5IfR_QioV_t88hM="
                    alt={t('home.trust.imageAlt')}
                    className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-blue-600 bg-opacity-10 rounded-2xl"></div>
                </div>
              </div>
              {/* Right: Content */}
              <div className="flex-1 flex flex-col items-start justify-center">
                <motion.h2
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {t('home.trust.titleLead')} <span className="text-blue-600">{t('home.trust.titleAccent')}</span>
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  {t('home.trust.body')}
                </motion.p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6 w-full mb-8">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      <AnimatedCounter value={98} />%
                    </div>
                    <div className="text-gray-600">{t('home.trust.satisfaction')}</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      <AnimatedCounter value={5000} />+
                    </div>
                    <div className="text-gray-600">{t('home.trust.professionals')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <motion.div
                    className="inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Link
                      to="/about-us"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full shadow transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {t('home.trust.moreAbout')}
                    </Link>
                  </motion.div>
                  <motion.div
                    className="inline-block"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Link
                      to="/how-it-works"
                      className="inline-block bg-white hover:bg-gray-50 text-blue-600 font-semibold px-8 py-3 rounded-full shadow border-2 border-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {t('home.trust.howItWorks')}
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature Scroll */}
      <FeatureScroll />
      
      {/* What Makes BlueForce Stand Out */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl border-4 border-blue-100 relative flex flex-col md:flex-row items-start gap-8 p-6 md:p-8">
            {/* Left Side */}
            <div className="flex-1 flex flex-col z-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.standOut.titleLead')} <span className="text-blue-600">BlueForce</span> {t('home.standOut.titleTail')}</h2>
              <p className="text-lg text-gray-600 mb-6">{t('home.standOut.body')}</p>
              
              {/* Feature Highlights */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{t('home.standOut.verified')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{t('home.standOut.support')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{t('home.standOut.network')}</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowLearnMore(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  {t('home.standOut.learnMore')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Right Side: Vertical Scrollable Cards */}
            <div className="flex-1 max-h-[420px] overflow-hidden relative z-10">
              <div className="animate-scroll pr-2">
                {/* First set of cards */}
                <div className="space-y-6 pb-6">
                  {/* Mass Recruitment */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <Users className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Mass Recruitment</h3>
                      <p className="text-gray-600 text-base">Employers can easily recruit and manage large teams for big projects.</p>
                    </div>
                  </div>
                  {/* Micro Insurance */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <Shield className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Micro Insurance</h3>
                      <p className="text-gray-600 text-base">Affordable micro insurance options for workers and their families.</p>
                    </div>
                  </div>
                  {/* Inclusivity */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <Users className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Inclusivity</h3>
                      <p className="text-gray-600 text-base">A platform designed for everyone, regardless of background or skill level.</p>
                    </div>
                  </div>
                  {/* Freedom for Workers */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <ThumbsUp className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Freedom for Workers</h3>
                      <p className="text-gray-600 text-base">Workers have the freedom to choose jobs, set their rates, and control their schedules.</p>
                    </div>
                  </div>
                </div>
                {/* Duplicate set of cards for infinite scroll */}
                <div className="space-y-6 pb-6" aria-hidden="true">
                  {/* Mass Recruitment */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <Users className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Mass Recruitment</h3>
                      <p className="text-gray-600 text-base">Employers can easily recruit and manage large teams for big projects.</p>
                    </div>
                  </div>
                  {/* Micro Insurance */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <Shield className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Micro Insurance</h3>
                      <p className="text-gray-600 text-base">Affordable micro insurance options for workers and their families.</p>
                    </div>
                  </div>
                  {/* Inclusivity */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <Users className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Inclusivity</h3>
                      <p className="text-gray-600 text-base">A platform designed for everyone, regardless of background or skill level.</p>
                    </div>
                  </div>
                  {/* Freedom for Workers */}
                  <div className="bg-blue-50 rounded-2xl shadow p-6 flex items-center gap-4">
                    <ThumbsUp className="w-12 h-12 text-blue-500 bg-blue-100 rounded-xl p-2" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 mb-1">Freedom for Workers</h3>
                      <p className="text-gray-600 text-base">Workers have the freedom to choose jobs, set their rates, and control their schedules.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialScroll />

      {/* Why BlueForce */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {t('home.whyUs.title')}
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
          >
            <motion.div 
              className="text-center"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Shield className="w-8 h-8 text-blue-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{t('home.whyUs.value')}</h3>
              <p className="text-gray-600">{t('home.whyUs.valueBody')}</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Users className="w-8 h-8 text-blue-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{t('home.whyUs.accessibility')}</h3>
              <p className="text-gray-600">{t('home.whyUs.accessibilityBody')}</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Shield className="w-8 h-8 text-blue-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{t('home.whyUs.trust')}</h3>
              <p className="text-gray-600">{t('home.whyUs.trustBody')}</p>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={item}
              whileHover={{ y: -5 }}
            >
              <motion.div 
                className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Clock className="w-8 h-8 text-blue-600" />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{t('home.whyUs.empowerment')}</h3>
              <p className="text-gray-600">{t('home.whyUs.empowermentBody')}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">{t('home.faq.title')}</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl bg-gray-50">
                <button
                  className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
                  onClick={() => handleToggleFaq(idx)}
                  aria-expanded={openFaqs[idx]}
                >
                  <span className="font-semibold text-lg text-gray-900">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 text-blue-600 transition-transform ${openFaqs[idx] ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaqs[idx] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-gray-700">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {t('home.ctaSection.title')}
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          >
            {t('home.ctaSection.body')}
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/register"
              className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 rounded-full font-medium text-lg inline-block"
            >
              {t('home.ctaSection.button')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Learn More Modal */}
      <AnimatePresence>
        {showLearnMore && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLearnMore(false)}
          >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="learn-more-title"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(event) => event.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 id="learn-more-title" className="text-2xl font-bold text-gray-900">{t('home.modal.title')}</h3>
                <button
                  onClick={() => setShowLearnMore(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label={t('home.modal.close')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-blue-600 mb-2">{t('home.modal.missionTitle')}</h4>
                  <p className="text-gray-600">
                    {t('home.modal.missionBody')}
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-blue-600 mb-2">{t('home.modal.benefitsTitle')}</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">{t('home.modal.benefit1')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">{t('home.modal.benefit2')}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <Users className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">{t('home.modal.benefit3')}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-blue-600 mb-2">{t('home.modal.howTitle')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-blue-600 font-bold mb-2">{t('home.modal.step1Title')}</div>
                      <p className="text-gray-600 text-sm">{t('home.modal.step1Body')}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-blue-600 font-bold mb-2">{t('home.modal.step2Title')}</div>
                      <p className="text-gray-600 text-sm">{t('home.modal.step2Body')}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-blue-600 font-bold mb-2">{t('home.modal.step3Title')}</div>
                      <p className="text-gray-600 text-sm">{t('home.modal.step3Body')}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/register"
                    onClick={() => setShowLearnMore(false)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('home.modal.getStarted')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Home;
