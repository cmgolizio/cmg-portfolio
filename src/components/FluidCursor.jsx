"use client";

import { useEffect, useRef } from "react";
import { createFluidSimulation } from "@/lib/fluid";

// Full-screen WebGL ink that the cursor stirs through the background.
// Sits behind the content (.fluid-canvas, z-0) and never takes the
// pointer. The iridescent (oil-slick) colour is computed in the shader,
// so this just feeds it pointer motion. Mouse/pen only and inert for
// reduced-motion users — the same gate the rest of the site's motion uses.

export default function FluidCursor() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;

    const canvas = canvasRef.current;
    let sim;
    try {
      sim = createFluidSimulation(canvas);
    } catch {
      return; // no usable WebGL2 — leave the canvas blank
    }

    // Latest pointer position in 0..1 with the origin bottom-left (the
    // sim's convention). `prev` is last frame's, so the per-frame delta
    // becomes the injected fluid velocity.
    const p = {
      x: 0.5,
      y: 0.5,
      prevX: 0.5,
      prevY: 0.5,
      moved: false,
      seen: false,
    };
    const onMove = (e) => {
      if (e.pointerType === "touch") return;
      p.x = e.clientX / window.innerWidth;
      p.y = 1 - e.clientY / window.innerHeight;
      // Anchor prev to the first real position so the opening move isn't
      // one giant velocity burst in from wherever the cursor entered.
      if (!p.seen) {
        p.prevX = p.x;
        p.prevY = p.y;
        p.seen = true;
      }
      p.moved = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => sim.resize(), 150);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = performance.now();
    const onVisible = () => {
      if (!document.hidden) last = performance.now(); // skip the gap
    };
    document.addEventListener("visibilitychange", onVisible);

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = Math.min((now - last) / 1000, 1 / 60);
      last = now;

      if (p.moved) {
        const dx = (p.x - p.prevX) * sim.SPLAT_FORCE;
        const dy = (p.y - p.prevY) * sim.SPLAT_FORCE;
        sim.addSplat(p.x, p.y, dx, dy);
        p.prevX = p.x;
        p.prevY = p.y;
        p.moved = false;
      }

      sim.step(dt);
      sim.render();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisible);
      sim.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className='fluid-canvas' aria-hidden='true' />;
}
