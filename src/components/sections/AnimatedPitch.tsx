import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// ViewBox: 700 x 480. Pitch sits at x=25 y=20 w=650 h=440.
// All measurements are proportional to a standard football pitch (105m x 68m).

const STROKE = 'rgba(0, 255, 135, 0.2)';
const SW_BOUNDARY = 2;   // outer boundary — slightly heavier
const SW_INTERIOR = 1;   // all interior lines

// Variant factory: animate pathLength 0→1 with per-element delay stagger.
// Opacity runs for the full pathLength duration so it lights up as it draws.
const lineVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay, duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
      opacity:    { delay, duration: 0.6 },
    },
  }),
};

// Spots fade in then pulse once (scale 1 → 1.3 → 1) over 600ms.
const dotVariants: Variants = {
  hidden: { opacity: 0, scale: 1 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: [1, 1.3, 1],
    transition: {
      opacity: { delay, duration: 0.3 },
      scale:   { delay: delay + 0.3, duration: 0.6, ease: 'easeInOut' as const, times: [0, 0.5, 1] },
    },
  }),
};

// Delay groups (seconds)
const D = {
  boundary:    0,
  centerCircle: 0.15,
  centerLine:   0.30,
  boxes:        0.45,
  spots:        0.60,
  corners:      0.75,
};

const boundaryProps = {
  stroke: STROKE,
  strokeWidth: SW_BOUNDARY,
  fill: 'none' as const,
  variants: lineVariants,
  initial: 'hidden' as const,
  animate: 'visible' as const,
};

const interiorProps = {
  stroke: STROKE,
  strokeWidth: SW_INTERIOR,
  fill: 'none' as const,
  variants: lineVariants,
  initial: 'hidden' as const,
  animate: 'visible' as const,
};

const sharedDotProps = {
  fill: STROKE,
  variants: dotVariants,
  initial: 'hidden' as const,
  animate: 'visible' as const,
};

export function AnimatedPitch() {
  return (
    <svg
      viewBox="0 0 700 480"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {/* 1 — Outer boundary (heavier stroke) */}
      <motion.path
        d="M 25,20 H 675 V 460 H 25 Z"
        {...boundaryProps}
        custom={D.boundary}
      />

      {/* 2 — Center circle (drawn as two semicircular arcs for pathLength support) */}
      <motion.path
        d="M 350,180 A 60,60 0 0,1 350,300 A 60,60 0 0,1 350,180"
        {...interiorProps}
        custom={D.centerCircle}
      />

      {/* 3 — Center line */}
      <motion.path
        d="M 350,20 V 460"
        {...interiorProps}
        custom={D.centerLine}
      />

      {/* 4 — Penalty boxes (3-sided — fourth side is the goal line) */}
      {/* Left penalty box: 16.5m × 40.3m scaled */}
      <motion.path
        d="M 25,130 H 140 V 350 H 25"
        {...interiorProps}
        custom={D.boxes}
      />
      {/* Right penalty box */}
      <motion.path
        d="M 675,130 H 560 V 350 H 675"
        {...interiorProps}
        custom={D.boxes}
      />
      {/* Left 6-yard box */}
      <motion.path
        d="M 25,195 H 70 V 285 H 25"
        {...interiorProps}
        custom={D.boxes}
      />
      {/* Right 6-yard box */}
      <motion.path
        d="M 675,195 H 630 V 285 H 675"
        {...interiorProps}
        custom={D.boxes}
      />

      {/* 5 — Penalty spots + center mark */}
      <motion.circle cx={105} cy={240} r={3} {...sharedDotProps} custom={D.spots} />
      <motion.circle cx={595} cy={240} r={3} {...sharedDotProps} custom={D.spots} />
      <motion.circle cx={350} cy={240} r={3} {...sharedDotProps} custom={D.spots} />

      {/* 6 — Corner arcs (quarter-circle, r=15) */}
      {/* Top-left */}
      <motion.path
        d="M 25,35 A 15,15 0 0,0 40,20"
        {...interiorProps}
        custom={D.corners}
      />
      {/* Top-right */}
      <motion.path
        d="M 660,20 A 15,15 0 0,1 675,35"
        {...interiorProps}
        custom={D.corners}
      />
      {/* Bottom-left */}
      <motion.path
        d="M 25,445 A 15,15 0 0,1 40,460"
        {...interiorProps}
        custom={D.corners}
      />
      {/* Bottom-right */}
      <motion.path
        d="M 660,460 A 15,15 0 0,0 675,445"
        {...interiorProps}
        custom={D.corners}
      />
    </svg>
  );
}
