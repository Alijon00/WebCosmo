/** The one and only page-transition signature: fade + 12px rise, 250ms ease-out. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const RISE = 12;
export const DURATION = 0.25;

export const pageVariants = {
  initial: { opacity: 0, y: RISE },
  enter: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE_OUT } },
  exit: { opacity: 0, y: RISE, transition: { duration: DURATION, ease: EASE_OUT } },
};
