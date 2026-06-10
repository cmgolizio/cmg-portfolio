"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { defaultThemeId, themeIds } from "@/lib/themes";

const STORAGE_KEY = "pf-theme";
// Exported so ThemeIntro can cancel the first-load intro the moment the
// visitor switches themes themselves.
export const THEME_CHANGE_EVENT = "pf-theme-change";

/* ---- external store: the persisted theme in localStorage ---- */

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && themeIds.includes(saved)) return saved;
  } catch {}
  return defaultThemeId;
}

function getServerSnapshot() {
  return defaultThemeId;
}

function writeTheme(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/* ---- provider ---- */

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // The persisted theme (the visitor's real choice / default).
  const storedTheme = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // A transient override used by the first-load auto-cycle. Never persisted.
  const [preview, setPreview] = useState(null);
  const activeTheme = preview ?? storedTheme;

  // Reflect the active theme onto <html> (DOM side effect, no setState).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeTheme);
  }, [activeTheme]);

  // Replay entrance animations only on a real user switch (not during preview).
  const prevStored = useRef(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prevStored.current = storedTheme;
      return;
    }
    if (preview === null && storedTheme !== prevStored.current) {
      document.querySelectorAll(".reveal").forEach((el) => {
        el.style.animation = "none";
        void el.offsetWidth; // force reflow
        el.style.animation = "";
      });
    }
    prevStored.current = storedTheme;
  }, [storedTheme, preview]);

  const setTheme = useCallback((id) => {
    if (themeIds.includes(id)) writeTheme(id);
  }, []);

  const value = useMemo(
    () => ({ themeId: activeTheme, setTheme, setPreview }),
    [activeTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
