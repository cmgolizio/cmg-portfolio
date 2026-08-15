"use client";

import { useEffect } from "react";

// Magnetic full-viewport paging.
//
// Every `.panel` on the home page is exactly one screen tall. Instead of
// letting the wheel scroll freely between them, a panel *holds on*: scrolling
// drags it a few pixels against a spring (the resistance), and only once the
// accumulated intent passes THRESHOLD does it let go and the next panel snaps
// into place. Stop short and the panel springs back — nothing moved.
//
// Deliberately narrow scope:
//   • fine pointers only. Touch gets native CSS scroll-snap (globals.css), which
//     already has the right physics for a finger and doesn't fight momentum.
//   • reduced-motion visitors are left with plain scrolling.
//   • anything genuinely scrollable under the cursor (an overflowing panel, the
//     workshop's parts manifest) scrolls itself first; `[data-no-snap]` opts an
//     element out entirely (the 3D canvas, where the wheel means zoom).
//   • while a modal has locked the body, the wheel is none of our business.

const THRESHOLD = 140; // normalized px of intent before a panel lets go
const MAX_PULL = 30; // px a panel gives while it resists
const PULL_SOFTNESS = 210; // higher = the give arrives more gradually
const IDLE_MS = 380; // quiet for this long → the pull springs back
// (long enough that two deliberate mouse-wheel notches still add up)
const SETTLE_MS = 260; // spring-back duration
const TRAVEL_MS = 620; // how long the snap to the next panel takes
const COOLDOWN_MS = 300; // ignore trackpad momentum arriving after a snap

const easeOut = (t) => 1 - Math.pow(1 - t, 4);

export default function SectionSnap() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const panels = Array.from(document.querySelectorAll(".panel"));
    if (panels.length < 2) return;

    let index = 0;
    let accum = 0; // scroll intent since the last settle
    let pull = 0; // px the current panel is currently held back by
    let animating = false;
    let cooldownUntil = 0;
    let idleTimer = 0;
    let travelRaf = 0;
    let settleRaf = 0;
    let syncRaf = 0;

    // A modal owns the page whenever it has locked the body.
    const locked = () => document.body.style.overflow === "hidden";

    const nearest = () => {
      let best = 0;
      let bestDist = Infinity;
      panels.forEach((el, i) => {
        const dist = Math.abs(el.getBoundingClientRect().top);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    };

    const setPull = (el, px) => {
      pull = px;
      el.style.transform = px ? `translate3d(0, ${px.toFixed(2)}px, 0)` : "";
    };

    // Does something under the cursor want this wheel event for itself?
    const wantsWheel = (node, dir) => {
      for (let el = node; el && el !== document.body; el = el.parentElement) {
        if (el.dataset?.noSnap !== undefined) return true;
        const overflowY = getComputedStyle(el).overflowY;
        if (overflowY !== "auto" && overflowY !== "scroll") continue;
        const room = el.scrollHeight - el.clientHeight;
        if (room <= 1) continue;
        if (dir > 0 ? el.scrollTop < room - 1 : el.scrollTop > 1) return true;
      }
      return false;
    };

    // Nothing crossed the threshold — hand the panel back.
    const settle = () => {
      const el = panels[index];
      const from = pull;
      if (!from) {
        accum = 0;
        return;
      }
      const start = performance.now();
      cancelAnimationFrame(settleRaf);
      const step = (now) => {
        const t = Math.min((now - start) / SETTLE_MS, 1);
        setPull(el, from * (1 - easeOut(t)));
        if (t < 1) settleRaf = requestAnimationFrame(step);
      };
      settleRaf = requestAnimationFrame(step);
      accum = 0;
    };

    // Let go: release the held panel and carry the page to `next`.
    const travel = (next) => {
      if (next < 0 || next >= panels.length) return settle();
      const el = panels[index];
      const held = pull;
      const from = window.scrollY;
      const to = from + panels[next].getBoundingClientRect().top;
      accum = 0;
      animating = true;
      clearTimeout(idleTimer);
      cancelAnimationFrame(settleRaf);
      cancelAnimationFrame(travelRaf);
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / TRAVEL_MS, 1);
        const e = easeOut(t);
        // `instant` opts out of html { scroll-behavior: smooth }, which would
        // otherwise smooth every frame of this tween against itself.
        window.scrollTo({ top: from + (to - from) * e, behavior: "instant" });
        setPull(el, held * (1 - e));
        if (t < 1) {
          travelRaf = requestAnimationFrame(step);
          return;
        }
        setPull(el, 0);
        index = next;
        animating = false;
        cooldownUntil = performance.now() + COOLDOWN_MS;
      };
      travelRaf = requestAnimationFrame(step);
    };

    const onWheel = (e) => {
      if (locked() || e.ctrlKey) return;
      const delta =
        e.deltaMode === 1
          ? e.deltaY * 16
          : e.deltaMode === 2
            ? e.deltaY * window.innerHeight
            : e.deltaY;
      if (!delta) return;
      const dir = delta > 0 ? 1 : -1;
      if (wantsWheel(e.target, dir)) return;
      if (index + dir < 0 || index + dir >= panels.length) return;

      e.preventDefault();
      // Trailing momentum from the flick that caused the last snap isn't a
      // request for another one.
      if (animating || performance.now() < cooldownUntil) return;

      if (Math.sign(accum) !== dir) accum = 0;
      accum += delta;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(settle, IDLE_MS);

      if (Math.abs(accum) >= THRESHOLD) {
        travel(index + dir);
        return;
      }
      cancelAnimationFrame(settleRaf);
      setPull(
        panels[index],
        -dir * MAX_PULL * (1 - Math.exp(-Math.abs(accum) / PULL_SOFTNESS)),
      );
    };

    // Paging keys move a whole panel; a panel that scrolls internally keeps
    // its own key handling until it runs out of room.
    const STEPS = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
    const onKey = (e) => {
      if (locked() || e.metaKey || e.ctrlKey || e.altKey || animating) return;
      const el = e.target;
      if (
        el?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(el?.tagName)
      )
        return;
      if (e.key === "Home" || e.key === "End") {
        e.preventDefault();
        travel(e.key === "Home" ? 0 : panels.length - 1);
        return;
      }
      const dir = STEPS[e.key];
      if (!dir) return;
      if (wantsWheel(el, dir)) return;
      if (index + dir < 0 || index + dir >= panels.length) return;
      e.preventDefault();
      travel(index + dir);
    };

    // Anchor links (the page nav, the hero CTAs, the command palette) scroll
    // the page out from under us — re-read which panel we ended up on.
    const onScroll = () => {
      if (animating || syncRaf) return;
      syncRaf = requestAnimationFrame(() => {
        syncRaf = 0;
        if (!animating) index = nearest();
      });
    };

    index = nearest();
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(idleTimer);
      cancelAnimationFrame(travelRaf);
      cancelAnimationFrame(settleRaf);
      cancelAnimationFrame(syncRaf);
      panels.forEach((el) => {
        el.style.transform = "";
      });
    };
  }, []);

  return null;
}
