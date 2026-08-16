"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { projects } from "@/data/projects";
import TiltCard from "@/components/TiltCard";
import { explodeSound, assembleSound } from "@/lib/clicker";

// The projects section is a shelf of books seen edge-on: one full-height bar
// per project, its name set vertically down the spine. Hovering (or, on touch,
// tapping) a spine pulls it open and the project's data slides out beside the
// name. Clicking anywhere in the opened spine — links excepted — lifts that
// project's tilt card into the middle of a darkened screen, where it keeps
// tilting toward the cursor at several times its old size.

// Stable no-op store so useSyncExternalStore reports false on the server and
// true on the client — the portal touches document.body only after hydration,
// with no setState-in-effect.
const subscribe = () => () => {};

// The card's five sections, shared by the (hidden) shelf markup and the
// centered modal so a project reads identically wherever it's rendered.
function CardSections({ project }) {
  return (
    <>
      <div className='layer'>
        <div className='bar'>
          <span />
          <span />
          <span />
        </div>
        <div className='thumb'>
          <span className='status'>{project.status}</span>
          {project.slug}
        </div>
      </div>
      <div className='layer'>
        <h3>{project.name}</h3>
      </div>
      <div className='layer'>
        <p>{project.description}</p>
      </div>
      <div className='layer'>
        <div className='tags'>
          {project.tags.map((tag) => (
            <span className='tag' key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className='layer'>
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
            <Link href='/work-in-progress?message=Coming%20Soon!'>
              Case study →
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default function Projects() {
  // Which spine is pulled open (hover on a mouse, tap on touch), and which
  // project — if any — is currently blown up into the centered card.
  const [openIdx, setOpenIdx] = useState(null);
  const [modal, setModal] = useState(null);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const dialogRef = useRef(null);

  // While the card is up: focus it, Esc dismisses, the page underneath can't scroll.
  useEffect(() => {
    if (!modal) return;
    dialogRef.current?.focus();
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      assembleSound();
      setModal(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [modal]);

  const close = () => {
    assembleSound();
    setModal(null);
  };

  // A spine that's already open is a button for its card; a closed one just
  // opens (the path touch pointers take, since they never hover). Links always
  // win — they navigate, they don't summon the card.
  const onSpineClick = (e, project, i) => {
    if (e.target.closest("a")) return;
    if (openIdx !== i) {
      setOpenIdx(i);
      return;
    }
    explodeSound();
    setModal(project);
  };

  return (
    <section id='work' className='panel panel-bleed shelf-panel'>
      <h2 className='sr-only'>The projects</h2>
      {/* the card covering the shelf counts as leaving it — keep the spine
          open underneath so closing the card puts you back where you were */}
      <div
        className='shelf'
        onPointerLeave={() => {
          if (!modal) setOpenIdx(null);
        }}
      >
        {projects.map((project, i) => {
          const open = openIdx === i;
          return (
            <article
              key={project.slug}
              className={open ? "spine is-open" : "spine"}
              onPointerEnter={(e) => {
                if (e.pointerType !== "touch") setOpenIdx(i);
              }}
              onClick={(e) => onSpineClick(e, project, i)}
            >
              <button
                type='button'
                className='spine-label'
                aria-expanded={open}
                onFocus={() => setOpenIdx(i)}
              >
                <span className='spine-idx'>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className='spine-name'>{project.name}</span>
              </button>

              <div className='spine-body' inert={!open || undefined}>
                <div className='spine-content'>
                  {/* Optional `image` on the project; until one exists the
                      frame stands in for it rather than collapsing. */}
                  <div className='spine-shot'>
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt=''
                        fill
                        sizes='(max-width: 720px) 62vw, 32vw'
                      />
                    ) : (
                      <span className='spine-shot-note'>{project.slug}</span>
                    )}
                  </div>
                  <span className='status'>{project.status}</span>
                  <p>{project.description}</p>
                  <div className='tags'>
                    {project.tags.map((tag) => (
                      <span className='tag' key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className='links'>
                    {project.live && (
                      <a
                        href={project.live}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Live ↗
                      </a>
                    )}
                    <a
                      href={project.code}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      Code ↗
                    </a>
                  </div>
                  <span className='spine-cue'>click anywhere for the card</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {hydrated &&
        createPortal(
          <AnimatePresence>
            {modal && (
              <motion.div
                className='pcard-veil'
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <motion.div
                  ref={dialogRef}
                  className='pcard-slot'
                  role='dialog'
                  aria-modal='true'
                  aria-label={`${modal.name} — project card`}
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.9, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 10 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                >
                  <TiltCard className='card pcard'>
                    <div className='stack'>
                      <CardSections project={modal} />
                    </div>
                  </TiltCard>
                  <button
                    type='button'
                    className='pcard-close'
                    onClick={close}
                    aria-label='Close project card'
                  >
                    ×
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
