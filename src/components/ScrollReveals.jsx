"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Marks .reveal elements "seen" as they enter the viewport, so below-fold
// sections animate when reached instead of invisibly on load. Pairs with
// `html.js .reveal { animation-play-state: paused }` in globals.css.
// Runs after hydration on purpose: mutating className earlier would make the
// server HTML mismatch the client render.
// Re-scans on every route change — client navigation (e.g. to /work/[slug])
// swaps in fresh .reveal elements the initial observer never saw, which would
// otherwise leave the new page stuck at opacity:0.
export default function ScrollReveals() {
  const pathname = usePathname();

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("seen"));
      return;
    }
    // No bottom margin: fire the instant a pixel enters, so sections never
    // feel like they're arriving late.
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("seen");
          io.unobserve(entry.target);
        }
      }
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
