import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CreditCard, FileText, Globe, MapPin, MessageCircle, Search, Shield, ThumbsUp, Users, Video } from 'lucide-react';

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Users className="w-10 h-10 text-blue-600" />,
    title: 'Smart Job Matching',
    description: 'AI-powered matching connects workers with the perfect opportunities'
  },
  {
    icon: <Globe className="w-10 h-10 text-blue-600" />,
    title: 'Multilingual Interface',
    description: 'Use the platform in English, Hindi or Kannada for easy accessibility'
  },
  {
    icon: <Users className="w-10 h-10 text-blue-600" />,
    title: 'Inclusivity',
    description: 'A platform designed for everyone, regardless of background or skill level.'
  },
  {
    icon: <ThumbsUp className="w-10 h-10 text-blue-600" />,
    title: 'Freedom for Workers',
    description: 'Workers have the freedom to choose jobs, set their rates, and control their schedules.'
  },
  {
    icon: <Users className="w-10 h-10 text-blue-600" />,
    title: 'Mass Recruitment',
    description: 'Employers can easily recruit and manage large teams for big projects.'
  },
  {
    icon: <MapPin className="w-10 h-10 text-blue-600" />,
    title: 'Map-Based Job Discovery',
    description: 'Find work opportunities near your location'
  },
  {
    icon: <MessageCircle className="w-10 h-10 text-blue-600" />,
    title: 'In-App Chat',
    description: 'Direct communication between workers and employers'
  },
  {
    icon: <Video className="w-10 h-10 text-blue-600" />,
    title: 'Skill Video Portfolio',
    description: 'Showcase your abilities through video demonstrations'
  },
  {
    icon: <Search className="w-10 h-10 text-blue-600" />,
    title: 'Smart Filtering/Search',
    description: 'Find workers by skill, location, and experience'
  },
  {
    icon: <FileText className="w-10 h-10 text-blue-600" />,
    title: 'Detailed Job Posting',
    description: 'Create comprehensive job listings with all requirements'
  },
  {
    icon: <Shield className="w-10 h-10 text-blue-600" />,
    title: 'Verified Workers',
    description: 'Trust in workers who have been verified by our team'
  },
  {
    icon: <Shield className="w-10 h-10 text-blue-600" />,
    title: 'Micro Insurance',
    description: 'Affordable micro insurance options for workers and their families.'
  },
  {
    icon: <Clock className="w-10 h-10 text-blue-600" />,
    title: 'Real-time Availability',
    description: 'See when workers are available for immediate hiring'
  },
  {
    icon: <ThumbsUp className="w-10 h-10 text-blue-600" />,
    title: 'Rating & Reviews',
    description: 'Make informed decisions based on past performances'
  },
  {
    icon: <CreditCard className="w-10 h-10 text-blue-600" />,
    title: 'Secure Payments',
    description: 'Safe and transparent payment processing'
  }
];

const FeatureScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll functionality. The track holds two copies of the list, so the
  // scroll position can wrap at the halfway mark and the row reads as endless.
  // (The previous version drove scrollLeft past its maximum, which parked the
  // row against the right edge for seconds before snapping back to the start.)
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

    // Pause on hover, and resume from where it stopped rather than the start.
    const handleMouseEnter = () => {
      paused = true;
    };

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
        <h2 className="text-3xl font-bold text-gray-900">Exclusive Features</h2>
        <p className="text-lg text-gray-600 mt-2">Discover what makes BlueForce the leading platform for blue-collar workers</p>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto hide-scrollbar py-4 px-2 pb-6"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-8 min-w-max px-4">
          {[...features, ...features].map((feature, index) => (
            <motion.div
              key={index}
              aria-hidden={index >= features.length}
              className="bg-white rounded-xl shadow-md p-6 w-64 flex-shrink-0"
              whileHover={{ y: -8, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default FeatureScroll;
