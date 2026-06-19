"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

const SKILLS = [
  "React / Next.js",
  "JavaScript (ES6+)",
  "Node & APIs",
  "Real-time / WebSockets",
  "Supabase · Firebase",
  "CAD / Fusion 360",
  "Woodworking",
  "Mechanical design",
  "AI integration",
];

// Drag is pointer-fine only: on touch it would fight page scrolling.
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function subscribeFinePointer(callback) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

export default function Skills() {
  const { themeId } = useTheme();
  const reduceMotion = useReducedMotion();
  const finePointer = useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );

  const draggable = finePointer && !reduceMotion;
  const creative = themeId === "creative";

  return (
    <section id='skills' className='section-pad'>
      <div className='sec-head reveal d1'>
        <span className='idx'>01</span>
        <h2>The toolbox</h2>
        {draggable && <span className='sec-note'>pssst, try pulling them</span>}
      </div>
      <div className='skills'>
        {SKILLS.map((skill, i) => (
          <motion.span
            key={skill}
            className={`chip reveal d${Math.min(6, 2 + Math.floor(i / 2))}`}
            drag={draggable}
            dragSnapToOrigin
            dragElastic={0.32}
            dragTransition={{ bounceStiffness: 420, bounceDamping: 13 }}
            whileDrag={{ scale: 1.07, rotate: 0, zIndex: 5 }}
            whileHover={reduceMotion ? undefined : { y: -3 }}
            // The creative theme's jaunty tilt lives here (not CSS) because
            // drag owns the inline transform.
            animate={{ rotate: creative && i % 2 === 1 ? 2.5 : 0 }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
