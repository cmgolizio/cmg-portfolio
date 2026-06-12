"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EMAIL = "cmgolizio@gmail.com";

// One click copies the address; the pill flips to "copied ✓" and springs
// back. If the clipboard is blocked, falls through to a mailto.
export default function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  const flip = reduceMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { y: 10, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -10, opacity: 0 },
        transition: { duration: 0.16 },
      };

  return (
    <button
      type='button'
      className='copy-email'
      onClick={copy}
      title='Copy email address'
    >
      <span>{EMAIL}</span>
      <span className='copy-state' aria-live='polite'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.span
            key={copied ? "ok" : "copy"}
            style={{ display: "inline-block" }}
            {...flip}
          >
            {copied ? "copied ✓" : "copy"}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
