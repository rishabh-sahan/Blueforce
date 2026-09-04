import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Calendar, Clock, CreditCard, FileText, Globe, MapPin, Search, Shield, ThumbsUp, Users,
} from 'lucide-react';

/** Feature copy lives in the translation files; only the icon is fixed here. */
const FEATURES: { key: string; Icon: typeof Users }[] = [
  { key: 'matching', Icon: Search },
  { key: 'multilingual', Icon: Globe },
  { key: 'inclusivity', Icon: Users },
  { key: 'freedom', Icon: ThumbsUp },
  { key: 'verification', Icon: Shield },
  { key: 'location', Icon: MapPin },
  { key: 'appointments', Icon: Calendar },
  { key: 'profiles', Icon: FileText },
  { key: 'transparent', Icon: CreditCard },
  { key: 'insurance', Icon: Shield },
  { key: 'availability', Icon: Clock },
  { key: 'reviews', Icon: ThumbsUp },
];

const FeatureScroll = () => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll. The track holds two copies of the list, so the scroll position
  // can wrap at the halfway mark and the row reads as endless.
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pixelsPerSecond = 40;
    let animationId: number;
    let lastTimestamp = 0;
    let position = 0;
    let paused = false;

    const scroll = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!paused) {
        const loopWidth = scrollContainer.scrollWidth / 2;
        if (loopWidth > 0) {
          position = (position + (delta / 1000) * pixelsPerSecond) % loopWidth;
          scrollContainer.scrollLeft = position;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };
    animationId = requestAnimationFrame(scroll);

    const handleMouseEnter = () => { paused = true; };
    const handleMouseLeave = () => {
      paused = false;
      position = scrollContainer.scrollLeft;
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="mt-12 mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('home.features.title')}</h2>
        <p className="text-lg text-gray-600 mt-2">{t('home.features.subtitle')}</p>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar py-4 px-2 pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-8 min-w-max px-4">
          {[...FEATURES, ...FEATURES].map(({ key, Icon }, index) => (
            <motion.div
              key={index}
              aria-hidden={index >= FEATURES.length}
              className="bg-white rounded-xl shadow-md p-6 w-64 flex-shrink-0"
              whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="mb-4"><Icon className="w-10 h-10 text-blue-600" /></div>
              <h3 className="text-xl font-bold mb-2">{t(`home.features.${key}.title`)}</h3>
              <p className="text-gray-600">{t(`home.features.${key}.body`)}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default FeatureScroll;
