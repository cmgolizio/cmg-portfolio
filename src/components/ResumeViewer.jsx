"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  resume,
  RESUME_OPEN_EVENT,
  RESUME_PDF,
  RESUME_FILENAME,
} from "@/data/resume";

// Inline PDF preview is reliable on pointer/desktop browsers but routinely
// renders blank on touch devices, so we gate it like the rest of the site's
// pointer features and fall back to plain open/download there.
const FINE_POINTER = "(pointer: fine)";
function subscribeFinePointer(callback) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

// A themed overlay that embeds the canonical /resume.pdf. The frame — backdrop,
// header, tactile buttons — re-skins with the active style profile; the PDF is
// shown as-is and downloads from the same file. Opened from anywhere via
// RESUME_OPEN_EVENT (the hero button, the ⌘K palette).
export default function ResumeViewer() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const sheetRef = useRef(null);
  const canPreview = useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(RESUME_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(RESUME_OPEN_EVENT, onOpen);
  }, []);

  // While open: focus the sheet, Esc closes, the page underneath can't scroll.
  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const pop = reduceMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { opacity: 0, scale: 0.97, y: 14 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: {
          opacity: 0,
          scale: 0.98,
          y: 10,
          transition: { duration: 0.14 },
        },
        transition: { type: "spring", stiffness: 460, damping: 34 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key='resume-backdrop'
          className='resume-backdrop'
          onClick={() => setOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
        >
          <motion.div
            key='resume-sheet'
            ref={sheetRef}
            className='resume-sheet'
            role='dialog'
            aria-modal='true'
            aria-label={`Résumé — ${resume.name}`}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            {...pop}
          >
            <header className='resume-head'>
              <div className='resume-id'>
                <p className='resume-eyebrow'>Résumé</p>
                <p className='resume-name'>{resume.name}</p>
              </div>
              <div className='resume-actions'>
                <a
                  className='btn primary'
                  href={RESUME_PDF}
                  download={RESUME_FILENAME}
                >
                  Download ↓
                </a>
                <a
                  className='btn ghost'
                  href={RESUME_PDF}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Open ↗
                </a>
                <button
                  type='button'
                  className='resume-close'
                  onClick={() => setOpen(false)}
                  aria-label='Close résumé'
                >
                  ✕
                </button>
              </div>
            </header>

            {canPreview ? (
              <iframe
                className='resume-frame'
                src={`${RESUME_PDF}#view=FitH`}
                title={`Résumé — ${resume.name}`}
              />
            ) : (
              <div className='resume-fallback'>
                <p className='resume-fallback-note'>
                  Your browser opens the PDF best in its own tab.
                </p>
                <div className='resume-fallback-actions'>
                  <a
                    className='btn primary'
                    href={RESUME_PDF}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Open résumé ↗
                  </a>
                  <a
                    className='btn ghost'
                    href={RESUME_PDF}
                    download={RESUME_FILENAME}
                  >
                    Download PDF ↓
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
