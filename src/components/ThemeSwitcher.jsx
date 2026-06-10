"use client";

import { themeList } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();

  return (
    <nav className='switcher' aria-label='Color theme'>
      {themeList.map((t) => (
        <button
          key={t.id}
          type='button'
          onClick={() => setTheme(t.id)}
          aria-pressed={themeId === t.id}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
