import { animate, motion, useMotionValue } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  imageSrc?: string;
  text: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Rahul Sharma',
    role: 'Electrician',
    initials: 'RS',
    imageSrc: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    text: 'BlueForce helped me find regular work in my area. My income has increased by 35% and I now have consistent clients.',
    rating: 5
  },
  {
    name: 'Priya Patel',
    role: 'HR Manager',
    initials: 'PP',
    imageSrc: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    text: 'Finding reliable skilled workers was always challenging for our company until we discovered BlueForce. The verification process gives us confidence.',
    rating: 5
  },
  {
    name: 'Vikram Singh',
    role: 'Plumber',
    initials: 'VS',
    imageSrc: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    text: 'The skill video feature lets me showcase my work quality. Clients hire me with confidence after seeing my previous installations.',
    rating: 4
  },
  {
    name: 'Meera Reddy',
    role: 'Restaurant Owner',
    initials: 'MR',
    imageSrc: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    text: 'Our restaurant needed urgent help when our cook left suddenly. BlueForce connected us with a verified chef within hours!',
    rating: 5
  },
  {
    name: 'Arjun Kapoor',
    role: 'Carpenter',
    initials: 'AK',
    imageSrc: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    text: 'The in-app chat makes communication with clients clear and easy. I can discuss project details before accepting the work.',
    rating: 5
  },
  {
    name: 'Ananya Gupta',
    role: 'Property Manager',
    initials: 'AG',
    imageSrc: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    text: 'Managing a residential complex requires quick maintenance solutions. BlueForce has become our go-to platform for all skilled worker needs.',
    rating: 4
  }
];

const SCROLL_SPEED = 60; // pixels per second

const TestimonialScroll = () => {
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
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Users Say
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
            {duplicatedTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                aria-hidden={index >= testimonials.length}
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
                    <p className="text-gray-500">{testimonial.role}</p>
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
                <p className="text-gray-600">{testimonial.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialScroll;
