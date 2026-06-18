"use client";

import { useEffect } from "react";
import { useDeviceTilt } from "@/lib/useDeviceTilt";

// Lets each theme's fixed backdrop (body::before) drift a few pixels toward
// the cursor — globals.css turns --par-x/--par-y into a compositor-only
// transform. On desktop: follows the pointer. On touch devices with
// orientation enabled: follows physical phone tilt instead.
// Skipped entirely for reduced-motion users.
export default function Atmosphere() {
  const { x: tiltX, y: tiltY, enabled: tiltEnabled } = useDeviceTilt();

  // Desktop: pointer-driven parallax (unchanged).
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
        // Half-pixel steps; skip write when nothing changed.
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

  // Touch: gyroscope-driven parallax. tiltY fires after tiltX in each rAF
  // so tiltX is already current when this subscriber runs — one write per frame.
  useEffect(() => {
    if (!tiltEnabled) return;
    const root = document.documentElement;
    let lastX = 0;
    let lastY = 0;
    const unsub = tiltY.on("change", () => {
      const x = Math.round(tiltX.get() * 28) / 2;
      const y = Math.round(tiltY.get() * 20) / 2;
      if (x === lastX && y === lastY) return;
      lastX = x;
      lastY = y;
      root.style.setProperty("--par-x", `${x}px`);
      root.style.setProperty("--par-y", `${y}px`);
    });
    return () => {
      unsub();
      root.style.setProperty("--par-x", "0px");
      root.style.setProperty("--par-y", "0px");
    };
  }, [tiltEnabled, tiltX, tiltY]);

  return null;
}
