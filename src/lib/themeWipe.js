import { flushSync } from "react-dom";

// How many wipes are in flight — transitions stay snapped until the last one
// finishes, so rapid switches don't re-enable CSS transitions mid-wipe.
let activeWipes = 0;

// Switches the theme inside a View Transition: a circular wipe of the new
// identity grows out of `origin` ({x, y} in viewport px). Browsers without
// the API — and reduced-motion users — get the plain switch.
export function switchThemeWithWipe(setTheme, id, origin) {
  const root = document.documentElement;
  const apply = () => {
    // flushSync commits the React update inside the transition callback; the
    // attribute is also set directly because the provider mirrors it from a
    // passive effect, which can run after the new snapshot is captured.
    flushSync(() => setTheme(id));
    root.setAttribute("data-theme", id);
  };

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion || typeof document.startViewTransition !== "function") {
    apply();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 3;
  // Distance to the farthest viewport corner, so the circle always covers it.
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  root.style.setProperty("--vt-x", `${x}px`);
  root.style.setProperty("--vt-y", `${y}px`);
  root.style.setProperty("--vt-r", `${r}px`);

  // .vt-snap kills CSS transitions so the new snapshot is already fully
  // switched — the wipe itself is the only visible transition.
  root.classList.add("vt-snap");
  activeWipes++;
  const done = () => {
    if (--activeWipes === 0) root.classList.remove("vt-snap");
  };
  document.startViewTransition(apply).finished.then(done, done);
}
