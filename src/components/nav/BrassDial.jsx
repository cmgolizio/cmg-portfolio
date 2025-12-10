"use client";

import useTheme from "@/hooks/useTheme";
import { motion } from "framer-motion";

export default function BrassDial() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label='Toggle Dark Mode'
      className='
        relative h-10 w-10 rounded-full
        bg-linear-to-br from-[#D1A954] to-[#A7823E]
        shadow-md transition active:scale-95
        border border-[#8C6A2D]
      '
    >
      <motion.div
        className='
          absolute left-1/2 top-1/2
          h-2 w-2 rounded-full bg-[#5A3E2B]
        '
        animate={{ rotate: theme === "dark" ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
        style={{
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </button>
  );
}
