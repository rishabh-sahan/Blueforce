/**
 * One easing curve and one viewport rule for the whole site, so sections across
 * different pages animate as a single system rather than each to its own taste.
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const VIEWPORT = { once: true, amount: 0.2 } as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};
