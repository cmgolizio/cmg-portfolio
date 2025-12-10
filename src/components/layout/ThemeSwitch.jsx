"use client";

import useTheme from "@/hooks/useTheme";
import { motion } from "framer-motion";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const isLight = theme === "light";

  const buildButtonStyles = (isActive, variant) => {
    const gradients = {
      light: {
        active:
          "radial-gradient(circle at 30% 30%, #e6ffec, #6af48a 55%, #2e8f43 90%)",
        inactive:
          "radial-gradient(circle at 30% 30%, #a8c4ad, #4f8b5c 55%, #2c5a38 90%)",
        glow: "0 0 18px rgba(104, 252, 140, 0.7)",
      },
      dark: {
        active:
          "radial-gradient(circle at 30% 30%, #ffd7d7, #ff7070 50%, #b11f1f 90%)",
        inactive:
          "radial-gradient(circle at 30% 30%, #c5a2a2, #8f4d4d 55%, #5b2a2a 90%)",
        glow: "0 0 18px rgba(255, 112, 112, 0.7)",
      },
    };

    const palette = gradients[variant];

    return {
      className: `
        relative h-14 w-14 rounded-full border-[3px] border-slate-300 transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-300
        ${
          isActive
            ? "translate-y-1 shadow-inner shadow-black/50"
            : "-translate-y-[4px] shadow-[0_12px_0_0_rgba(0,0,0,0.35),0_22px_30px_rgba(0,0,0,0.35)]"
        }
      `,
      style: {
        background: isActive ? palette.active : palette.inactive,
        boxShadow: `${
          isActive
            ? "inset 0 3px 8px rgba(0,0,0,0.45)"
            : "0 12px 0 0 rgba(0,0,0,0.35), 0 22px 30px rgba(0,0,0,0.35)"
        }${isActive ? `, ${palette.glow}` : ""}`,
      },
    };
  };

  return (
    <motion.div
      initial={{ y: -260, rotate: -4, opacity: 0 }}
      animate={{
        y: 0,
        rotate: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 220, damping: 18 },
      }}
      className='relative flex items-start'
      aria-live='polite'
    >
      <div className='pointer-events-none absolute -top-20 left-1/2 flex h-20 w-8 -translate-x-1/2 items-start justify-center'>
        <div
          className='h-full w-[6px] rounded-full shadow-inner shadow-black/40'
          style={{
            background:
              "linear-gradient(to bottom, #2f2f2f 0%, #545454 35%, #6a6a6a 55%, #4a4a4a 100%)",
          }}
        />
        <div className='absolute bottom-[-6px] left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-slate-500 shadow-[0_2px_6px_rgba(0,0,0,0.35)]' />
      </div>

      <div
        className='
          relative flex items-center gap-3 rounded-xl border border-slate-300
          bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 p-3
          shadow-[0_14px_30px_rgba(0,0,0,0.28)]
        '
        role='presentation'
      >
        {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => (
          <span
            key={pos}
            className='absolute h-2 w-2 rounded-full bg-gradient-to-b from-slate-200 to-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.35)]'
            style={{
              left: pos.includes("left") ? "6px" : undefined,
              right: pos.includes("right") ? "6px" : undefined,
              top: pos.includes("top") ? "6px" : undefined,
              bottom: pos.includes("bottom") ? "6px" : undefined,
            }}
            aria-hidden
          />
        ))}

        <div className='flex flex-col gap-3'>
          <button
            type='button'
            aria-label='Switch to light mode'
            aria-pressed={isLight}
            onClick={() => setTheme("light")}
            {...buildButtonStyles(isLight, "light")}
          />
          <button
            type='button'
            aria-label='Switch to dark mode'
            aria-pressed={!isLight}
            onClick={() => setTheme("dark")}
            {...buildButtonStyles(!isLight, "dark")}
          />
        </div>

        <div className='flex flex-col items-center gap-6 pr-1 pl-1 text-lg font-semibold text-slate-700'>
          <span className='tracking-widest'>I</span>
          <span className='text-base tracking-widest'>O</span>
        </div>
      </div>
    </motion.div>
  );
}
