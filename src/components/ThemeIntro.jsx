"use client";

import { useEffect, useRef } from "react";
import { useTheme, THEME_CHANGE_EVENT } from "@/components/ThemeProvider";

const INTRO_KEY = "pf-intro-seen";

// Timing knobs (ms). Tweak freely.
const START_DELAY = 1200; // wait after load before anything happens
const STEP = 900; // how long each theme is held during the cycle
const COACH_GAP = 500; // pause between cycle ending and coachmark appearing
const COACH_DURATION = 4500; // how long the coachmark stays up

export default function ThemeIntro() {
  const { setPreview } = useTheme();
  const coachRef = useRef(null);
  const captionRef = useRef(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = localStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    if (seen) return;

    const timers = [];
    const at = (fn, ms) => timers.push(setTimeout(fn, ms));
    const toggle = (ref, on) =>
      ref.current && ref.current.classList.toggle("show", on);

    // Written only when the intro finishes (or the visitor interacts) — so an
    // interrupted intro replays on the next visit instead of being burned.
    const markSeen = () => {
      try {
        localStorage.setItem(INTRO_KEY, "1");
      } catch {}
    };

    // The visitor switching themes (this tab or another) outranks the show:
    // stop everything, clear the preview, and count the intro as seen.
    const cancel = () => {
      timers.forEach(clearTimeout);
      toggle(coachRef, false);
      toggle(captionRef, false);
      setPreview(null);
      markSeen();
      window.removeEventListener(THEME_CHANGE_EVENT, cancel);
      window.removeEventListener("storage", cancel);
    };
    window.addEventListener(THEME_CHANGE_EVENT, cancel);
    window.addEventListener("storage", cancel);

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      // No theme cycling for reduced-motion users — just the coachmark nudge.
      at(() => toggle(coachRef, true), START_DELAY);
      at(() => {
        toggle(coachRef, false);
        markSeen();
      }, START_DELAY + COACH_DURATION);
    } else {
      // Slow reveal + caption: minimal -> technical -> creative -> settle back.
      at(() => {
        toggle(captionRef, true);
        setPreview("technical");
      }, START_DELAY);
      at(() => setPreview("creative"), START_DELAY + STEP);
      at(
        () => {
          setPreview(null); // settle back to the real (stored) theme
          toggle(captionRef, false);
        },
        START_DELAY + 2 * STEP,
      );

      // Then the coachmark invites them to actually try it.
      const coachAt = START_DELAY + 2 * STEP + COACH_GAP;
      at(() => toggle(coachRef, true), coachAt);
      at(() => {
        toggle(coachRef, false);
        markSeen();
      }, coachAt + COACH_DURATION);
    }

    // Cleanup handles React 18 strict mode's mount→cleanup→remount on its own:
    // the first run's timers are cleared and the second run reschedules them.
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener(THEME_CHANGE_EVENT, cancel);
      window.removeEventListener("storage", cancel);
    };
  }, [setPreview]);

  // Both cues are decorative; the switcher itself is the accessible control.
  return (
    <>
      <div ref={coachRef} className='intro-coach' aria-hidden='true'>
        3 looks — try one
      </div>
      <div ref={captionRef} className='intro-caption' aria-hidden='true'>
        one site · three identities
      </div>
    </>
  );
}
