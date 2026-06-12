"use client";

import { themeList } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";
import { switchThemeWithWipe } from "@/lib/themeWipe";

export default function ThemeSwitcher() {
  const { themeId, setTheme } = useTheme();

  const onSwitch = (id, e) => {
    if (id === themeId) return;
    // The wipe grows out of the clicked button.
    const r = e.currentTarget.getBoundingClientRect();
    switchThemeWithWipe(setTheme, id, {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    });
  };

  return (
    <nav className='switcher' aria-label='Color theme'>
      {themeList.map((t) => (
        <button
          key={t.id}
          type='button'
          onClick={(e) => onSwitch(t.id, e)}
          aria-pressed={themeId === t.id}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
