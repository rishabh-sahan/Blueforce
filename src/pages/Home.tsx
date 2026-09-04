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
                alt: "Group of blue-collar workers in hard hats"
              },
              {
                src: "https://i.pinimg.com/736x/be/ba/6e/beba6e3905c7f21b71743861e8560b51.jpg",
                alt: "Skilled blue-collar professionals standing together with their tools"
              },
              {
                src: "https://i.pinimg.com/736x/e3/d7/2e/e3d72e9d7756d73afa3de65c8823db88.jpg",
                alt: "Electrician working on wiring"
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
            Book a verified worker
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 px-9 py-4 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition-colors shadow-xl"
          >
            Register as a worker
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
                    alt="Professional handshake between engineer and businessman"
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
                  Trusted by Thousands for <span className="text-blue-600">Professional Service</span>
                </motion.h2>
                <motion.p
                  className="text-lg text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  Our certified technicians deliver reliable, high-quality service with a focus on customer satisfaction and safety. Experience the difference with BlueForce.
                </motion.p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6 w-full mb-8">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      <AnimatedCounter value={98} />%
                    </div>
                    <div className="text-gray-600">Satisfaction Rate</div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      <AnimatedCounter value={5000} />+
                    </div>
                    <div className="text-gray-600">Active Professionals</div>
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
                      More About Us
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
                      How It Works
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Makes <span className="text-blue-600">BlueForce</span> Stand Out</h2>
              <p className="text-lg text-gray-600 mb-6">We go beyond just connecting workers and employers. BlueForce empowers, protects, and includes everyone in the workforce ecosystem.</p>
              
              {/* Feature Highlights */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Verified Professionals</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">24/7 Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">Global Network</span>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-6">
                <button
                  onClick={() => setShowLearnMore(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  Learn More
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
              <p className="text-gray-600">Fair pricing and transparent fee structure for all users.</p>
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
              <p className="text-gray-600">Multiple languages and intuitive design for all users.</p>
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
              <p className="text-gray-600">Verified workers and secure payment system built on trust.</p>
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
              <p className="text-gray-600">Empowering workers with better opportunities and growth.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
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
            Ready to get started?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
          >
            Join thousands of workers and employers already using BlueForce to connect, work, and grow.
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
              Sign Up Now
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
                <h3 id="learn-more-title" className="text-2xl font-bold text-gray-900">Discover BlueForce</h3>
                <button
                  onClick={() => setShowLearnMore(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-blue-600 mb-2">Our Mission</h4>
                  <p className="text-gray-600">
                    BlueForce is dedicated to revolutionizing the blue-collar workforce by creating a platform that connects skilled professionals with opportunities that match their expertise.
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-blue-600 mb-2">Key Benefits</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">Secure and verified worker profiles with skill assessments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">Flexible scheduling and real-time availability tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                        <Users className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-600">Access to a diverse network of skilled professionals</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-semibold text-blue-600 mb-2">How It Works</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-blue-600 font-bold mb-2">1. Create Profile</div>
                      <p className="text-gray-600 text-sm">Sign up and create your professional profile with skills and experience</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-blue-600 font-bold mb-2">2. Find Opportunities</div>
                      <p className="text-gray-600 text-sm">Browse and apply for jobs that match your expertise</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <div className="text-blue-600 font-bold mb-2">3. Get Hired</div>
                      <p className="text-gray-600 text-sm">Connect with employers and start your journey</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/register"
                    onClick={() => setShowLearnMore(false)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started Now
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
