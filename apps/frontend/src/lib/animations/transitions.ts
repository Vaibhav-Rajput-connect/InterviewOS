/**
 * Framer Motion — Reusable Transition Presets
 */

import type { Transition } from "framer-motion";

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export const smoothTransition: Transition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1],
};

export const snappyTransition: Transition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1],
};

export const slowTransition: Transition = {
  duration: 1,
  ease: [0.16, 1, 0.3, 1],
};

export const bounceTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};
