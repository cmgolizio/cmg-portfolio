"use client";

import { motion, useReducedMotion } from "framer-motion";

// First hero line "I build things." as a word-level assembly animation.
// Three words converge from small offset positions and lock into place —
// the same "parts mating" language as the exploded cards and workshop model.
// Per-theme personality mirrors HeroWord so the two lines feel like one system:
//   minimal   — calm blur-to-sharp convergence, gentle spring (matches Rise)
//   technical — stiff, near-zero-overshoot snap (matches Scramble's precision)
//   creative  — tumbling overshoot with rotation (matches Bounce's bounce)
// Keyed by themeId in Hero.jsx so it remounts and replays on every switch.

const WORDS = ["I ", "build ", "things."];

// Words converge from slightly different directions — staging positions that
// suggest they were held apart and released toward each other.
const FROM = [
  { x: -18, y: 20, rotate: -4 }, // "I"      — lower-left
  { x: 0, y: 30, rotate: 0 }, // "build"  — straight below
  { x: 18, y: 20, rotate: 4 }, // "things."— lower-right
];

const STAGGER = 0.08; // seconds between words

const THEME_CFG = {
  minimal: {
    spring: { type: "spring", stiffness: 150, damping: 22 },
    blur: true, // blur→sharp, echoes Rise
    rotate: false,
  },
  technical: {
    spring: { type: "spring", stiffness: 320, damping: 28 },
    blur: false,
    rotate: false,
  },
  creative: {
    spring: { type: "spring", stiffness: 360, damping: 13 },
    blur: false,
    rotate: true, // slight tumble per word, echoes Bounce
  },
};

export default function HeroAssemble({ themeId }) {
  const reduceMotion = useReducedMotion();

  // Reduced-motion: full text immediately visible, no animation.
  if (reduceMotion) return <span>I build things.</span>;

  const cfg = THEME_CFG[themeId] ?? THEME_CFG.minimal;

  return (
    <>
      {/* Real text always in the DOM for SEO, crawlers, and screen readers. */}
      <span className='sr-only'>I build things.</span>

      {/* Animated copy — hidden from a11y tree since sr-only sibling covers it. */}
      <span aria-hidden='true'>
        {WORDS.map((word, i) => {
          const delay = i * STAGGER;
          return (
            <motion.span
              key={i}
              style={{ display: "inline-block", whiteSpace: "pre" }}
              initial={{
                opacity: 0,
                x: FROM[i].x,
                y: FROM[i].y,
                rotate: cfg.rotate ? FROM[i].rotate : 0,
                ...(cfg.blur ? { filter: "blur(7px)" } : {}),
              }}
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                rotate: 0,
                ...(cfg.blur ? { filter: "blur(0px)" } : {}),
              }}
              transition={{
                ...cfg.spring,
                delay,
                // Opacity fades in quickly so the letter is visible early
                // even while the spring is still travelling.
                opacity: { duration: 0.18, ease: "easeOut", delay },
                // Blur dissolves over a longer window, matching Rise's feel.
                ...(cfg.blur
                  ? {
                      filter: {
                        duration: 0.42,
                        ease: [0.22, 0.61, 0.36, 1],
                        delay,
                      },
                    }
                  : {}),
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </span>
    </>
  );
}
