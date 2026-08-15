"use client";

import { useEffect } from "react";

// Magnetic full-viewport paging.
//
// Every `.panel` is one screen tall. Scrolling itself is left completely
// alone — the page moves with the wheel or the finger exactly as it always
// would. What this adds is what happens when you stop: nudge the page and it
// slides back to the panel you were on; push past the threshold and it carries
// you the rest of the way onto the next one, and only ever onto the next one.
//
// The rule this file obeys: never call preventDefault on a scroll. A handler
// that has to swallow the wheel to work can also swallow it when it misreads a
// gesture — trackpad jitter and momentum tails make that easy — and then the
// page is simply stuck. Nothing here can produce that outcome; the worst case
// if the logic below is wrong is that the page doesn't line up.
//
// CSS scroll-snap isn't used for the same reason: `mandatory` refuses small
// scrolls outright (a single wheel notch moves nothing at all), and
// `proximity` won't reliably land on a panel.

const REST_MS = 160; // quiet this long and a wheel gesture is over
// Everything else that scrolls the page — a nav link, a paging key, the
// scrollbar — is given a much longer quiet window. Those are animations we
// don't own, and a single slow frame in the middle of one looks exactly like
// a finished gesture; settling into that gap would drag the visitor back to
// whichever panel they happened to be passing. Nothing waits on this delay,
// so there's no cost to being sure.
const REST_SLOW_MS = 450;
const TRAVEL_MAX = 430; // longest a settle may take
const TRAVEL_RATE = 0.36; // ms per px, so a short spring-back stays quick
// How far the page must actually move to be taken forward. It has to sit under
// one detent of any browser's mouse wheel — otherwise a wheel user nudges the
// page and watches it slide back, over and over, which reads as a site that
// won't scroll.
const COMMIT_PX = 46;
const COMMIT_SHARE = 0.06;

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export default function SectionSnap() {
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll(".panel"));
    if (panels.length < 2) return;
    // Leave reduced-motion visitors with plain, unassisted scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    // The panel you were resting on when the current gesture began — drift is
    // measured from here, which is what makes a half-hearted scroll reversible.
    let anchor = 0;
    // Set by the wheel, cleared by the settle that follows it, so the "one
    // panel at a time" rule applies to exactly the gestures it should and
    // never depends on how long a momentum tail happened to run.
    let fromWheel = false;
    let restTimer = 0;
    let raf = 0;
    let settling = false;

    const topOf = (i) =>
      Math.round(panels[i].getBoundingClientRect().top + window.scrollY);

    const nearest = () => {
      let best = 0;
      let bestDist = Infinity;
      panels.forEach((_, i) => {
        const dist = Math.abs(topOf(i) - window.scrollY);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    };

    const endSettle = () => {
      cancelAnimationFrame(raf);
      root.style.scrollBehavior = "";
      settling = false;
    };

    // The settle is tweened here rather than handed to
    // scrollTo({ behavior: "smooth" }), which takes the better part of a
    // second to cross a panel and lands whenever it likes. `scroll-behavior:
    // auto` is set inline for the duration so the stylesheet's `smooth`
    // doesn't try to re-animate every frame of it.
    const travel = (to) => {
      const from = window.scrollY;
      const dist = to - from;
      const ms = Math.min(TRAVEL_MAX, 150 + Math.abs(dist) * TRAVEL_RATE);
      settling = true;
      root.style.scrollBehavior = "auto";
      const startedAt = performance.now();
      cancelAnimationFrame(raf);
      const frame = (now) => {
        if (!settling) return; // the visitor took over
        const t = Math.min((now - startedAt) / ms, 1);
        window.scrollTo(0, from + dist * easeOut(t));
        if (t < 1) {
          raf = requestAnimationFrame(frame);
          return;
        }
        endSettle();
        anchor = nearest();
      };
      raf = requestAnimationFrame(frame);
    };

    const onRest = () => {
      if (settling) return;
      let target = nearest();

      // An ordinary wheel gesture gets the threshold: past it you go on by one,
      // short of it you come back to where you started.
      //
      // Only while the page is still within a panel of where the gesture began,
      // though. A trackpad fling keeps firing wheel events through a second or
      // more of momentum, and the page really does travel those three screens
      // before this ever runs — dragging it back two would be a lurch the
      // visitor didn't ask for and can't predict. Once they've genuinely gone
      // that far, the nearest panel is the honest answer.
      if (fromWheel) {
        fromWheel = false;
        const drift = window.scrollY - topOf(anchor);
        if (Math.abs(drift) <= window.innerHeight * 1.1) {
          const commit = Math.max(COMMIT_PX, window.innerHeight * COMMIT_SHARE);
          const step = drift > commit ? 1 : drift < -commit ? -1 : 0;
          target = Math.min(Math.max(anchor + step, 0), panels.length - 1);
        }
      }

      const to = topOf(target);
      if (Math.abs(window.scrollY - to) < 2) {
        anchor = target;
        return;
      }
      travel(to);
    };

    // "The scroll is over" has to mean the page actually stopped, not merely
    // that no scroll event arrived for a moment — so the position is checked
    // again when the timer fires, and a page still on the move re-arms.
    const onScroll = () => {
      clearTimeout(restTimer);
      const seen = window.scrollY;
      restTimer = setTimeout(
        () => {
          if (Math.abs(window.scrollY - seen) > 1) return onScroll();
          onRest();
        },
        fromWheel ? REST_MS : REST_SLOW_MS,
      );
    };

    // Fresh input during a settle means the visitor overruled it.
    const interrupt = () => {
      if (!settling) return;
      endSettle();
      anchor = nearest();
    };
    const onWheel = () => {
      fromWheel = true;
      interrupt();
    };
    // Any other input starts a scroll that isn't a wheel gesture, so it must
    // also clear the flag — a wheel that only scrolled a panel's own overflow
    // never reaches a settle, and the stale flag would otherwise be spent on
    // whatever moved the page next.
    const onOtherInput = () => {
      fromWheel = false;
      interrupt();
    };

    anchor = nearest();
    const passive = { passive: true };
    window.addEventListener("scroll", onScroll, passive);
    window.addEventListener("wheel", onWheel, passive);
    window.addEventListener("touchstart", onOtherInput, passive);
    window.addEventListener("keydown", onOtherInput);
    // a click mid-settle is usually a nav link or the scrollbar, and both want
    // to take the page somewhere this tween would otherwise talk over
    window.addEventListener("pointerdown", onOtherInput, passive);
    window.addEventListener("resize", onScroll);

    return () => {
      clearTimeout(restTimer);
      endSettle();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onOtherInput);
      window.removeEventListener("keydown", onOtherInput);
      window.removeEventListener("pointerdown", onOtherInput);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
