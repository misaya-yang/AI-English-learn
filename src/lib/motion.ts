import type { Transition } from 'framer-motion';

/* ─── Shared curves & durations ─── */
const EASE_STANDARD = [0.2, 0, 0, 1] as const;
const EASE_DECELERATE = [0, 0, 0, 1] as const;

/* ─── Presets ─── */

export const motionPresets = {
  fadeIn: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.24, ease: EASE_STANDARD } satisfies Transition,
  },

  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.26, ease: EASE_STANDARD } satisfies Transition,
  },

  scaleIn: {
    initial: { opacity: 0, scale: 0.985 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.18, ease: EASE_DECELERATE } satisfies Transition,
  },

  cardFlip: {
    transition: {
      duration: 0.58,
      type: 'spring' as const,
      stiffness: 240,
      damping: 22,
    } satisfies Transition,
  },

  pageTransition: {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -8 },
    transition: { duration: 0.2, ease: EASE_STANDARD } satisfies Transition,
  },

  spring: {
    type: 'spring' as const,
    stiffness: 240,
    damping: 22,
  } satisfies Transition,

  springGentle: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
  } satisfies Transition,
} as const;

/** Staggered entrance for list items. Usage: `{...motionStagger(index)}` */
export const motionStagger = (i: number) => ({
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: {
    delay: Math.min(i, 6) * 0.045,
    duration: 0.24,
    ease: EASE_STANDARD,
  } satisfies Transition,
});

/** Stagger container variants for orchestrating children */
export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045 },
  },
};

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: EASE_STANDARD },
  },
};
