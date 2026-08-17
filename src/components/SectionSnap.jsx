"use client";

import { useEffect } from "react";

// Magnetic full-viewport paging.
//
// Every `.panel` is one screen tall. The scroll itself is never intercepted —
// the page moves with the wheel or the finger exactly as it always would. Two
// things are layered on top of it:
//
//   The hold. As a gesture starts, the whole deck is translated *against* the
//   scroll, so the section barely moves at first and you feel it resisting.
//   The counter-translation is a bump: it swells over the first fraction of a
//   screen, then falls away, so the resistance eases off the further you push
//   and the section is running free by the time it hands over. Because the
//   bump is a function of distance, a fast scroll is past it almost
//   immediately — speed is never taxed, only the first moment of a slow,
//   deliberate push is.
//
//   The settle. When the scroll stops, the page is magnetized onto a panel:
//   short of the threshold back to the one you were on, past it onto the next.
//
// The rule this file obeys: never call preventDefault on a scroll. A handler
// that has to swallow the wheel to work can also swallow it when it misreads a
// gesture — trackpad jitter and momentum tails make that easy — and then the
// page is simply stuck. Nothing here can produce that outcome; the worst case
// if the logic below is wrong is that the page doesn't line up.

const REST_MS = 120; // quiet this long and a wheel gesture is over
// Everything else that scrolls the page — a nav link, a paging key, the
// scrollbar — is given a much longer quiet window. Those are animations we
// don't own, and a single slow frame in the middle of one looks exactly like
// a finished gesture; settling into that gap would drag the visitor back to
// whichever panel they happened to be passing.
const REST_SLOW_MS = 450;
// The settle is meant to read as a magnet taking the section, not as the page
// easing over: it leaves hard and arrives exactly, so the travel is short and
// the curve is steep — most of the distance is covered in the first third of
// the time, and the last few pixels are placed rather than drifted into.
const TRAVEL_MAX = 380; // longest a settle may take
const TRAVEL_RATE = 0.3; // ms per px, so a short spring-back stays quick
// How far the page must actually move to be taken forward. It has to sit under
// one detent of any browser's mouse wheel — otherwise a wheel user nudges the
// page and watches it slide back, over and over, which reads as a site that
// won't scroll.
const COMMIT_PX = 46;
const COMMIT_SHARE = 0.06;
// The hold. RANGE is the share of a screen the resistance plays out over;
// DEPTH scales it. DEPTH must stay below 1/e — at exactly 1/e the section is
// pinned dead still for the first instant, and any higher it would creep
// *backwards* as you scroll forward, which reads as a bug rather than weight.
const HOLD_RANGE = 0.13;
const HOLD_DEPTH = 0.33;

const easeOut = (t) => 1 - Math.pow(1 - t, 4.2);

export default function SectionSnap() {
  useEffect(() => {
    const panels = Array.from(document.querySelectorAll(".panel"));
    if (panels.length < 2) return;
    // Leave reduced-motion visitors with plain, unassisted scrolling.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const deck = panels[0].parentElement;
    // Touch scrolling runs off the main thread; a transform chasing it from on
    // the main thread judders instead of resisting. Fingers get the settle only.
    const canHold = window.matchMedia("(hover: hover) and (pointer: fine)")
      .matches;

    // Panel positions come from layout (`offsetTop`), never from a bounding
    // rect — the deck carries a transform, and measuring through it would feed
    // the hold back into its own input.
    let tops = [];
    const measure = () => {
      const base = deck.offsetTop;
      tops = panels.map((p) => base + p.offsetTop);
    };

    // The panel you were resting on when the current gesture began — both the
    // hold and the threshold are measured from here.
    let anchor = 0;
    // Set by the wheel, cleared by the settle that follows it, so the "one
    // panel at a time" rule applies to exactly the gestures it should and
    // never depends on how long a momentum tail happened to run.
    let fromWheel = false;
    let restTimer = 0;
    let raf = 0;
    let settling = false;
    let hold = 0;
    // Counts wheel events so the settle can tell "the page paused for a frame"
    // from "the gesture is actually over".
    let wheelTicks = 0;

    const nearest = () => {
      let best = 0;
      let bestDist = Infinity;
      tops.forEach((top, i) => {
        const dist = Math.abs(top - window.scrollY);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    };

    const setHold = (px) => {
      const v = Math.abs(px) < 0.05 ? 0 : px;
      if (v === hold) return;
      hold = v;
      deck.style.transform = v ? `translate3d(0, ${v.toFixed(2)}px, 0)` : "";
    };

    const applyHold = () => {
      // A fullscreen element and a transformed ancestor don't mix — drop the
      // hold entirely while the workshop is filling the screen.
      if (!canHold || document.fullscreenElement) return setHold(0);
      const drift = window.scrollY - tops[anchor];
      const range = window.innerHeight * HOLD_RANGE;
      const t = Math.abs(drift) / range;
      // t·e^(1−t): zero at rest, peaking one `range` in, and vanishing well
      // before a full panel — so it is spent by the time the settle lands.
      const lag = HOLD_DEPTH * range * t * Math.exp(1 - t);
      setHold(drift < 0 ? -lag : lag);
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
      const ms = Math.min(TRAVEL_MAX, 120 + Math.abs(dist) * TRAVEL_RATE);
      settling = true;
      root.style.scrollBehavior = "auto";
      const startedAt = performance.now();
      cancelAnimationFrame(raf);
      const frame = (now) => {
        if (!settling) return; // the visitor took over
        const t = Math.min((now - startedAt) / ms, 1);
        window.scrollTo(0, from + dist * easeOut(t));
        // The hold keeps easing off across the travel, so the section is
        // released into place rather than dropped there.
        applyHold();
        if (t < 1) {
          raf = requestAnimationFrame(frame);
          return;
        }
        endSettle();
        anchor = nearest();
        applyHold();
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
        const drift = window.scrollY - tops[anchor];
        if (Math.abs(drift) <= window.innerHeight * 1.1) {
          const commit = Math.max(COMMIT_PX, window.innerHeight * COMMIT_SHARE);
          const step = drift > commit ? 1 : drift < -commit ? -1 : 0;
          target = Math.min(Math.max(anchor + step, 0), panels.length - 1);
        }
      }

      const to = tops[target];
      if (Math.abs(window.scrollY - to) < 2) {
        anchor = target;
        applyHold();
        return;
      }
      travel(to);
    };

    // "The scroll is over" has to mean the gesture is genuinely finished. Two
    // things can lie about that: a busy frame, which pauses the position
    // mid-flight, and a momentum tail, which keeps delivering wheel events
    // while the page appears to coast. Settling on either one hands back a
    // stale anchor, and the rest of the gesture then reads as a scroll in the
    // opposite direction — the page lurches backwards. So the timer re-arms
    // unless both the position and the wheel have gone quiet.
    const onScroll = () => {
      if (!settling) applyHold();
      clearTimeout(restTimer);
      const seen = window.scrollY;
      const ticks = wheelTicks;
      restTimer = setTimeout(
        () => {
          if (Math.abs(window.scrollY - seen) > 1 || wheelTicks !== ticks)
            return onScroll();
          onRest();
        },
        fromWheel ? REST_MS : REST_SLOW_MS,
      );
    };

    // Fresh input during a settle means the visitor overruled it — their
    // gesture is still running, so the settle is abandoned and nothing else
    // changes. In particular the anchor stays where the gesture began: moving
    // it to the panel the abandoned settle was heading for would make the rest
    // of that same gesture measure as travel in the opposite direction, and
    // the page would lurch backwards the moment they stopped.
    const interrupt = () => {
      if (!settling) return;
      endSettle();
    };
    const onWheel = () => {
      wheelTicks++;
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
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    anchor = nearest();
    const passive = { passive: true };
    window.addEventListener("scroll", onScroll, passive);
    window.addEventListener("wheel", onWheel, passive);
    window.addEventListener("touchstart", onOtherInput, passive);
    window.addEventListener("keydown", onOtherInput);
    // a click mid-settle is usually a nav link or the scrollbar, and both want
    // to take the page somewhere this tween would otherwise talk over
    window.addEventListener("pointerdown", onOtherInput, passive);
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(restTimer);
      endSettle();
      deck.style.transform = "";
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onOtherInput);
      window.removeEventListener("keydown", onOtherInput);
      window.removeEventListener("pointerdown", onOtherInput);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
