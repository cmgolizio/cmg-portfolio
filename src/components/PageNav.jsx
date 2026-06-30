"use client";

import { useEffect, useRef, useState } from "react";

// Bare text links pinned to the upper-left that mirror the page's section
// order. The site is effectively an SPA, so each link just auto-scrolls to
// its section. A scroll-spy tracks which section is in view and tints that
// link with the accent; whenever the active section changes (via a click or
// by scrolling into it) a light "unsheathe" gleam sweeps across the label
// once — see .pagenav-label.flash in globals.css.
//
// Order matches the visual order in app/page.jsx (Hero → Skills → Projects →
// Workshop → Contact), not the command-palette ordering.
const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "skills", label: "Toolbox" },
  { id: "work", label: "Projects" },
  { id: "workshop", label: "Workshop" },
  { id: "contact", label: "Contact" },
];

export default function PageNav() {
  const [active, setActive] = useState(SECTIONS[0].id);
  // The label currently playing the gleam (one section at a time).
  const [flashId, setFlashId] = useState(null);
  // Skip the gleam on first mount and when the visitor prefers reduced motion.
  const armed = useRef(false);
  const reduced = useRef(false);
  // While a clicked link smooth-scrolls to its section, mute the gleam for the
  // sections it passes through so only the target lights up.
  const suppress = useRef(false);
  const suppressTimer = useRef(null);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Scroll-spy: the active section is the last one whose top has scrolled
  // above a reference line a third of the way down the viewport. Reading
  // rects on each scroll (rAF-throttled) is deterministic — it always lands
  // on the section actually filling the viewport, unlike intersection ratios
  // which can leave gaps between sections unmatched.
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      // When the page is scrolled to the bottom, the final sections can't
      // reach the reference line (there isn't a full viewport left below
      // them). Snap to the last section so it still highlights.
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 2) {
        setActive(SECTIONS[SECTIONS.length - 1].id);
        return;
      }
      const line = window.innerHeight * 0.34;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Re-arm the gleam once per section change (not on first paint / reduced /
  // while a click is still smooth-scrolling past intermediate sections).
  useEffect(() => {
    if (!armed.current) {
      armed.current = true;
      return;
    }
    if (reduced.current) return;
    if (suppress.current) return;
    setFlashId(active);
  }, [active]);

  const onClick = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return; // let the bare hash anchor handle it
    e.preventDefault();
    // Light up the target now; mute the sections we'll scroll past en route.
    if (!reduced.current) {
      suppress.current = true;
      clearTimeout(suppressTimer.current);
      suppressTimer.current = setTimeout(() => {
        suppress.current = false;
      }, 1200);
      setFlashId(id);
    }
    setActive(id);
    el.scrollIntoView({
      behavior: reduced.current ? "auto" : "smooth",
      block: "start",
    });
    // Reflect the section in the URL without spamming history. For the top
    // anchor, drop the hash entirely rather than leave "#top" behind.
    const url = id === "top" ? location.pathname + location.search : `#${id}`;
    history.replaceState(null, "", url);
  };

  return (
    <nav className='pagenav' aria-label='Page sections'>
      <ul>
        {SECTIONS.map((s, i) => {
          const isActive = active === s.id;
          const flashing = flashId === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-label={s.label}
                className={isActive ? "is-active" : undefined}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => onClick(e, s.id)}
              >
                <span className='pagenav-num'>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={flashing ? "pagenav-label flash" : "pagenav-label"}
                  onAnimationEnd={flashing ? () => setFlashId(null) : undefined}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
