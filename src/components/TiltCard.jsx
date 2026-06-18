"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { useDeviceTilt } from "@/lib/useDeviceTilt";

// 3D-tilts toward the cursor with a theme-tinted glare that tracks it.
// Falls back to a plain <article> for reduced-motion users; touch pointers
// are ignored so mobile cards stay still — UNLESS the visitor has enabled
// device-orientation tilt (gyroscope), in which case physically tilting the
// phone drives the same px/py motion values that the mouse normally feeds.
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
  const glareX = useTransform(sx, [0, 1], ["-22%", "22%"]);
  const glareY = useTransform(sy, [0, 1], ["-22%", "22%"]);

  const { x: tiltX, y: tiltY, enabled: tiltEnabled } = useDeviceTilt();

  // Settle flat if frozen mid-hover.
  useEffect(() => {
    if (frozen) {
      px.set(0.5);
      py.set(0.5);
    }
  }, [frozen, px, py]);

  // When device-orientation is active, feed tilt values into the same
  // px/py motion values the mouse uses — the spring/transform pipeline
  // downstream is completely unchanged.
  useEffect(() => {
    if (!tiltEnabled) return;
    // Center first so there's no jump from a stale pointer position.
    px.set(0.5);
    py.set(0.5);
    // tiltY fires after tiltX in each rAF, so tiltX is already current.
    const unsub = tiltY.on("change", () => {
      if (frozen) return;
      px.set(tiltX.get() * 0.5 + 0.5);
      py.set(tiltY.get() * 0.5 + 0.5);
    });
    return () => {
      unsub();
      px.set(0.5);
      py.set(0.5);
    };
  }, [tiltEnabled, tiltX, tiltY, px, py, frozen]);

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
    // Don't clobber orientation-driven tilt when a stray touch event leaves.
    if (tiltEnabled) return;
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
