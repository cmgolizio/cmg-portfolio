"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { heroWords } from "@/lib/themes";

// The second hero line, animated with each theme's personality:
// minimal = per-letter rise out of a blur, technical = terminal decode,
// creative = bouncy letters. Keyed remounts replay it on every theme change
// (including the first-load auto-cycle).

const GLYPHS = "!<>-_\\/[]{}—=+*^?#";

function Scramble({ text }) {
  const [shown, setShown] = useState(text);
  useEffect(() => {
    const frames = 26; // ~0.43s at 60fps
    let frame = 0;
    let raf;
    const tick = () => {
      frame++;
      const resolved = Math.floor((frame / frames) * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (i < resolved || text[i] === " ") s += text[i];
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setShown(frame < frames ? s : text);
      if (frame < frames) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return <span>{shown}</span>;
}

function Bounce({ text }) {
  return (
    <span style={{ display: "inline-block" }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ y: -38, opacity: 0, rotate: -10 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{
            delay: i * 0.045,
            type: "spring",
            stiffness: 430,
            damping: 13,
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

function Rise({ text }) {
  return (
    <span style={{ display: "inline-block" }}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: "0.45em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            delay: i * 0.035,
            duration: 0.5,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function HeroWord({ themeId }) {
  const reduceMotion = useReducedMotion();
  const word = heroWords[themeId];

  if (reduceMotion) return <span className='swap'>{word}</span>;

  const Anim =
    themeId === "technical" ? Scramble : themeId === "creative" ? Bounce : Rise;

  return (
    // The animated copy can be mid-scramble, so screen readers get the
    // real word and the animation is hidden from them.
    <span className='swap' key={themeId}>
      <span className='sr-only'>{word}</span>
      <span aria-hidden='true'>
        <Anim text={word} />
      </span>
    </span>
  );
}
