"use client";

import { useEffect } from "react";

// Lets each theme's fixed backdrop (body::before) drift a few pixels toward
// the cursor — globals.css turns --par-x/--par-y into a compositor-only
// transform. Skipped on touch devices and for reduced-motion users.
export default function Atmosphere() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    const root = document.documentElement;
    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const dx = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
        const dy = (e.clientY / window.innerHeight - 0.5) * 2;
        // Half-pixel steps, and skip the style write when nothing moved —
        // custom-property changes on :root aren't free.
        const x = Math.round(dx * 28) / 2;
        const y = Math.round(dy * 20) / 2;
        if (x === lastX && y === lastY) return;
        lastX = x;
        lastY = y;
        root.style.setProperty("--par-x", `${x}px`);
        root.style.setProperty("--par-y", `${y}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
