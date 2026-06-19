"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { themeList } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";
import { switchThemeWithWipe } from "@/lib/themeWipe";
import { RESUME_OPEN_EVENT, RESUME_PDF, RESUME_FILENAME } from "@/data/resume";

// ⌘K / Ctrl+K command palette: jump to sections, switch themes (with the
// wipe), or reach out. A small fixed hint chip doubles as the opener for
// anyone who doesn't try the shortcut.

const SECTIONS = [
  { id: "work", label: "Jump to: Selected work", hint: "01" },
  { id: "workshop", label: "Jump to: The workshop", hint: "02" },
  { id: "skills", label: "Jump to: The toolkit", hint: "03" },
  { id: "contact", label: "Jump to: Contact", hint: "04" },
];

// Pull the file down without leaving the page (a plain <a download>, clicked).
function downloadResume() {
  const a = document.createElement("a");
  a.href = RESUME_PDF;
  a.download = RESUME_FILENAME;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const RESUME = [
  {
    id: "resume-view",
    label: "View résumé",
    hint: "↘",
    run: () => window.dispatchEvent(new Event(RESUME_OPEN_EVENT)),
  },
  {
    id: "resume-download",
    label: "Download résumé (PDF)",
    hint: "↓",
    run: downloadResume,
  },
];

const LINKS = [
  {
    id: "email",
    label: "Email Christopher",
    hint: "↗",
    href: "mailto:cmgolizio@gmail.com",
  },
  {
    id: "github",
    label: "Open GitHub",
    hint: "↗",
    href: "https://github.com/cmgolizio",
  },
  {
    id: "linkedin",
    label: "Open LinkedIn",
    hint: "↗",
    href: "https://linkedin.com/in/cmgolizio",
  },
];

// The shortcut label is client-only (depends on the platform); the server
// snapshot just shows the Mac default.
const noopSubscribe = () => () => {};
const getModKey = () =>
  /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";

export default function CommandPalette() {
  const { themeId, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const modKey = useSyncExternalStore(noopSubscribe, getModKey, () => "⌘");
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the input and park page scroll while the palette is up.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const actions = useMemo(
    () => [
      ...SECTIONS.map((s) => ({
        ...s,
        run: () => document.getElementById(s.id)?.scrollIntoView(),
      })),
      ...RESUME,
      ...themeList.map((t) => ({
        id: `theme-${t.id}`,
        label: `Theme: ${t.label}`,
        hint: t.id === themeId ? "current" : "switch",
        // Wait for the palette to exit so the wipe snapshot doesn't catch it.
        delay: true,
        run: () =>
          switchThemeWithWipe(setTheme, t.id, {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.3,
          }),
      })),
      ...LINKS.map((l) => ({
        ...l,
        run: () => {
          if (l.href.startsWith("mailto:")) window.location.href = l.href;
          else window.open(l.href, "_blank", "noopener,noreferrer");
        },
      })),
    ],
    [themeId, setTheme],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [actions, query]);

  const runAction = (a) => {
    setOpen(false);
    setQuery("");
    if (a.delay) setTimeout(a.run, 150);
    else a.run();
  };

  const onInputKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[active]) {
      runAction(filtered[active]);
    }
  };

  const pop = reduceMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { opacity: 0, scale: 0.96, y: -12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: {
          opacity: 0,
          scale: 0.97,
          y: -8,
          transition: { duration: 0.12 },
        },
        transition: { type: "spring", stiffness: 500, damping: 32 },
      };

  return (
    <>
      <button
        type='button'
        className='palette-hint'
        onClick={() => setOpen(true)}
      >
        <kbd>{modKey}</kbd>
        <kbd>K</kbd>
        <span>commands</span>
      </button>

      {/* both layers are direct AnimatePresence children — a fragment would
          silently drop their exit animations */}
      <AnimatePresence>
        {open && (
          <motion.div
            key='backdrop'
            className='palette-backdrop'
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
          />
        )}
        {open && (
          <motion.div
            key='palette'
            className='palette'
            role='dialog'
            aria-modal='true'
            aria-label='Command palette'
            style={{ x: "-50%" }}
            {...pop}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKey}
              placeholder='Type a command…'
              aria-controls='palette-list'
              aria-activedescendant={
                filtered[active] ? `pal-${filtered[active].id}` : undefined
              }
            />
            <ul id='palette-list' role='listbox' aria-label='Commands'>
              {filtered.map((a, i) => (
                <li
                  key={a.id}
                  id={`pal-${a.id}`}
                  role='option'
                  aria-selected={i === active}
                  className={i === active ? "active" : ""}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => runAction(a)}
                >
                  {a.label}
                  <span className='hint'>{a.hint}</span>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className='empty'>No matches — try “theme” or “work”</li>
              )}
            </ul>
            <div className='palette-foot'>
              <span>↑↓ navigate</span>
              <span>↵ run</span>
              <span>esc close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
