"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { projects } from "@/data/projects";
import TiltCard from "@/components/TiltCard";
import { explodeSound, assembleSound } from "@/lib/clicker";

const DELAYS = ["d2", "d3", "d4"];

// Stable no-op store so useSyncExternalStore reports false on the server and
// true on the client — the portal touches document.body only after hydration,
// with no setState-in-effect.
const subscribe = () => () => {};

// The exploded sections don't just fade in — each one flies in from its own
// side and springs into place, top row first, so the grid visibly assembles.
// Indexed by render order: preview, title, summary, stack, links.
const FROM = [
  { x: 64, y: 8 }, // preview — from the right
  { x: 0, y: -54 }, // title — from above
  { x: -64, y: 8 }, // summary — from the left
  { x: -50, y: 46 }, // stack — from the lower-left
  { x: 50, y: 46 }, // links — from the lower-right
];
const REVEAL = [0.14, 0.06, 0.14, 0.22, 0.22]; // top row first, then each row

const tileVariants = {
  hidden: (i) => ({
    opacity: 0,
    x: FROM[i].x,
    y: FROM[i].y,
    scale: 0.82,
    filter: "blur(7px)",
    transition: { duration: 0.26, ease: [0.4, 0, 1, 1] },
  }),
  visible: (i) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 230,
      damping: 21,
      delay: REVEAL[i],
    },
  }),
};

// The grid just orchestrates: it carries the hidden/visible labels its
// children inherit; the per-tile springs above do the actual motion.
const gridVariants = { hidden: {}, visible: {} };

// Clicking a card lifts its five sections off the card and into a large,
// illuminated grid in the center of a darkened screen — title across the top,
// then description + image, then stack + links. The grid is rendered in a
// body-level portal so it floats above everything (sidestepping the card's
// tilt transform and the page's stacking contexts). Clicking anywhere — or
// pressing Esc — sends the sections back onto the card. Links keep working and
// don't dismiss the view.

// The five sections, shared between the card and the centered overlay so each
// renders identically in both. On the card they're plain blocks; in the
// overlay (animate) each becomes a motion tile that springs into the grid.
function CardSections({ project, animate = false }) {
  const Tile = animate ? motion.div : "div";
  const tileProps = (i) =>
    animate
      ? {
          variants: tileVariants,
          custom: i,
          whileHover: {
            y: -5,
            transition: { type: "spring", stiffness: 300, damping: 20 },
          },
        }
      : {};

  return (
    <>
      <Tile className='layer' data-part='01 · preview' {...tileProps(0)}>
        <div className='bar'>
          <span />
          <span />
          <span />
        </div>
        <div className='thumb'>
          <span className='status'>{project.status}</span>
          {project.slug}
        </div>
      </Tile>
      <Tile className='layer' data-part='02 · title' {...tileProps(1)}>
        <h3>{project.name}</h3>
      </Tile>
      <Tile className='layer' data-part='03 · summary' {...tileProps(2)}>
        <p>{project.description}</p>
      </Tile>
      <Tile className='layer' data-part='04 · stack' {...tileProps(3)}>
        <div className='tags'>
          {project.tags.map((tag) => (
            <span className='tag' key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </Tile>
      <Tile className='layer' data-part='05 · links' {...tileProps(4)}>
        <div className='links'>
          {project.live && (
            <a href={project.live} target='_blank' rel='noopener noreferrer'>
              Live ↗
            </a>
          )}
          <a href={project.code} target='_blank' rel='noopener noreferrer'>
            Code ↗
          </a>
          {project.caseStudy && (
            <Link href={`/work/${project.slug}`}>Case study →</Link>
          )}
        </div>
      </Tile>
    </>
  );
}

function ProjectCard({ project, delay }) {
  const [exploded, setExploded] = useState(false);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const reduceMotion = useReducedMotion();
  const overlayRef = useRef(null);

  // While exploded: focus the overlay, Esc dismisses, the page underneath can't scroll.
  useEffect(() => {
    if (!exploded) return;
    overlayRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        assembleSound();
        setExploded(false);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [exploded]);

  // Clicks on a link never toggle the view.
  const onCardClick = (e) => {
    if (e.target.closest("a")) return;
    explodeSound();
    setExploded(true);
  };
  const onBackdropClick = (e) => {
    if (e.target.closest("a")) return;
    assembleSound();
    setExploded(false);
  };

  return (
    <>
      <TiltCard
        className={`card reveal ${delay}`}
        frozen={exploded}
        inert={exploded || undefined}
        onClick={onCardClick}
      >
        <div className='stack'>
          <CardSections project={project} />
        </div>
      </TiltCard>

      {hydrated &&
        createPortal(
          <AnimatePresence>
            {exploded && (
              <motion.div
                key={project.slug}
                className='xv-backdrop'
                onClick={onBackdropClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  ref={overlayRef}
                  className='card xv-grid'
                  role='dialog'
                  aria-modal='true'
                  aria-label={`${project.name} — exploded view`}
                  tabIndex={-1}
                  variants={gridVariants}
                  initial={reduceMotion ? false : "hidden"}
                  animate={reduceMotion ? false : "visible"}
                  exit={reduceMotion ? { opacity: 0 } : "hidden"}
                >
                  <CardSections project={project} animate />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

export default function Projects() {
  return (
    <section id='work' className='section-pad'>
      <div className='sec-head reveal d1'>
        <span className='idx'>01</span>
        <h2>Selected work</h2>
        <span className='sec-note'>click a card to explode it</span>
      </div>
      <div className='grid'>
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            delay={DELAYS[i] || "d4"}
          />
        ))}
      </div>
    </section>
  );
}
