// Theme metadata used by the UI (switcher + hero word).
// NOTE: the actual design tokens (colors, fonts, shape, motion) live in
// globals.css keyed by [data-theme="..."]. Keeping them in CSS means the
// correct theme renders on the very first paint (no flash) and works even
// before JS hydrates. This file is just what the React UI needs to know.

export const defaultThemeId = "minimal";

export const themeList = [
  { id: "minimal", label: "Minimal" },
  { id: "technical", label: "Technical" },
  { id: "creative", label: "Creative" },
];

export const themeIds = themeList.map((t) => t.id);

// Second hero line, per theme.
export const heroWords = {
  minimal: "in code.",
  technical: "in systems.",
  creative: "in anything.",
};
