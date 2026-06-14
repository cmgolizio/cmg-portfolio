"use client";

import { useEffect } from "react";
import { pressSound, releaseSound } from "@/lib/clicker";

// Makes every button *sound* and *feel* mechanical: a press click on
// pointerdown, a release click on pointerup, and a tap of haptic feedback on
// devices that support it. One pair of delegated listeners covers every
// current and future button — nothing needs wiring up individually.
// Keyboard activation stays silent on purpose (kinder to screen readers).

const TACTILE = "button, a.btn";

export default function Clicker() {
  useEffect(() => {
    let pressed = false;

    const down = (e) => {
      if (!e.target.closest?.(TACTILE)) return;
      pressed = true;
      pressSound();
      navigator.vibrate?.(8);
    };
    const up = () => {
      if (!pressed) return;
      pressed = false;
      releaseSound();
    };

    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return null;
}
