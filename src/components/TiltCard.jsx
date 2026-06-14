"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

// 3D-tilts toward the cursor with a theme-tinted glare that tracks it.
// Falls back to a plain <article> for reduced-motion users; touch pointers
// are ignored so mobile cards stay still.
// `frozen` springs the card flat and parks the tilt/lift — used while a
// project card is in its exploded view, which owns the 3D pose instead.

// Tuning knobs.
const TILT_RANGE = 10.5; // deg each way
const LIFT = -8; // px hover rise
const SPRING = { stiffness: 300, damping: 26 };

export default function TiltCard({
  className = "",
  children,
  frozen = false,
  ...rest
}) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const px = useMotionValue(0.5); // pointer position inside the card, 0..1
  const py = useMotionValue(0.5);
  const sx = useSpring(px, SPRING);
  const sy = useSpring(py, SPRING);
  const rotateX = useTransform(sy, [0, 1], [TILT_RANGE, -TILT_RANGE]);
  const rotateY = useTransform(sx, [0, 1], [-TILT_RANGE, TILT_RANGE]);
  // The glare element is 150% of the card, so ±22% of itself sweeps it
  // roughly edge to edge.
  const glareX = useTransform(sx, [0, 1], ["-22%", "22%"]);
  const glareY = useTransform(sy, [0, 1], ["-22%", "22%"]);

  // Settle flat if frozen mid-hover.
  useEffect(() => {
    if (frozen) {
      px.set(0.5);
      py.set(0.5);
    }
  }, [frozen, px, py]);

  if (reduceMotion)
    return (
      <article className={className} {...rest}>
        {children}
      </article>
    );

  const onMove = (e) => {
    if (frozen || e.pointerType === "touch") return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.article
      ref={ref}
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 850 }}
      whileHover={frozen ? undefined : { y: LIFT, scale: 1.015 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      {...rest}
    >
      {children}
      <motion.span
        className='glare'
        aria-hidden='true'
        style={{ x: glareX, y: glareY }}
      />
    </motion.article>
  );
}
