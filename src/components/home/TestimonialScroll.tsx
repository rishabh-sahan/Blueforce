import { animate, motion, useMotionValue } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/** Names and photos are fixed; role and quote come from the translations. */
const TESTIMONIALS = [
  { key: 't1', initials: 'RS', name: 'Rahul Sharma', imageSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 5 },
  { key: 't2', initials: 'PP', name: 'Priya Patel', imageSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 5 },
  { key: 't3', initials: 'VS', name: 'Vikram Singh', imageSrc: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 4 },
  { key: 't4', initials: 'MR', name: 'Meera Reddy', imageSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 5 },
  { key: 't5', initials: 'AK', name: 'Arjun Kapoor', imageSrc: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 5 },
  { key: 't6', initials: 'AG', name: 'Ananya Gupta', imageSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 4 },
];

const SCROLL_SPEED = 60; // pixels per second

const TestimonialScroll = () => {
  const { t } = useTranslation();
  const x = useMotionValue(0);
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Width of a single copy of the list. Re-measured on resize, since the first
  // measurement happens before the avatars have loaded.
  useEffect(() => {
    const measure = () => {
      if (scrollRef.current) {
        setWidth(scrollRef.current.scrollWidth / 2);
      }
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Smooth infinite scroll. Each pass runs at a fixed speed over whatever
  // distance is left, so resuming after a hover carries on from where it
  // stopped instead of racing to catch up.
  useEffect(() => {
    if (width <= 0 || isPaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    let playback: AnimationPlaybackControls | undefined;

    const run = () => {
      if (x.get() <= -width) x.set(0);
      const remaining = width + x.get();

      playback = animate(x, -width, {
        duration: remaining / SCROLL_SPEED,
        ease: 'linear',
        onComplete: () => {
          if (cancelled) return;
          x.set(0);
          run();
        },
      });
    };

    run();

    return () => {
      cancelled = true;
      playback?.stop();
    };
  }, [width, isPaused, x]);

  // Create duplicated array for seamless loop
  const duplicated = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('home.testimonials.title')}
        </h2>
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            ref={scrollRef}
            className="flex gap-6"
            style={{ x }}
          >
            {duplicated.map((testimonial, index) => (
              <motion.div
                key={index}
                aria-hidden={index >= TESTIMONIALS.length}
                className="flex-shrink-0 w-[300px] bg-white p-6 rounded-lg shadow-md"
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <div className="flex items-center mb-4">
                  {testimonial.imageSrc ? (
                    <img 
                      src={testimonial.imageSrc} 
                      alt={testimonial.name} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                      {testimonial.initials}
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-500">{t(`home.testimonials.${testimonial.key}.role`)}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09L5.24 12.36 0 7.545l7.236-.635L10 0l2.764 6.91L20 7.545l-5.24 4.818 1.118 5.73z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600">{t(`home.testimonials.${testimonial.key}.text`)}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialScroll;
