import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageProps {
  src: string;
  alt: string;
}

interface ImageSliderProps {
  images: ImageProps[];
  title?: string;
  subtitle?: string;
  autoplayInterval?: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ImageSlider = ({ images, title, subtitle, autoplayInterval = 5000 }: ImageSliderProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Depending on currentIndex restarts the timer whenever the slide changes, so
  // a manual click gets a full interval instead of an abrupt hand-off.
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, autoplayInterval);

    return () => clearTimeout(timer);
  }, [currentIndex, images.length, autoplayInterval]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg shadow-lg">
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.7, ease: EASE }, scale: { duration: 6, ease: 'linear' } }}
        />
      </AnimatePresence>
      
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Caption */}
      {(title || subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 px-6 pt-6 pb-14 text-white">
          {title && <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>}
          {subtitle && <p className="text-lg md:text-xl">{subtitle}</p>}
        </div>
      )}
      
      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrevious}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
            aria-label={t('home.slider.previous')}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={handleNext}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
            aria-label={t('home.slider.next')}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      
      {/* Dots indicator */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={t('home.slider.goToSlide', { number: index + 1 })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSlider;
