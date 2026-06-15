// "use client";

// import { useEffect, useRef } from "react";

// // A glossy ribbon that slightly trails the cursor. Drawn on a Canvas2D
// // layer above the page (.cursor-canvas, z-9999, pointer-events:none).
// // The native cursor and all its variants (pointer, grab, text, …) are
// // left exactly as the browser draws them — this only adds the trailing
// // streak behind them. Mouse/pen only, and never for reduced-motion users.

// const TRAIL = 12; // ribbon segments — short, so it stays near the cursor
// const HEAD_WIDTH = 7; // px near the cursor, tapering to 0 at the tail

// // Full-spectrum cosine palette (IQ) — the oil-slick rainbow, ridden
// // along the ribbon's length.
// const iridescence = (t) => {
//   const ch = (p) => Math.round(255 * (0.5 + 0.5 * Math.cos(6.28318 * (t + p))));
//   return [ch(0.0), ch(0.33), ch(0.67)];
// };
// const lerp = (a, b, t) => a + (b - a) * t;

// export default function CursorTrail() {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
//     if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
//       return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     let dpr = 1;
//     const resize = () => {
//       dpr = Math.min(window.devicePixelRatio || 1, 2);
//       canvas.width = Math.floor(window.innerWidth * dpr);
//       canvas.height = Math.floor(window.innerHeight * dpr);
//       ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     const pointer = { x: innerWidth / 2, y: innerHeight / 2 };
//     const trail = Array.from({ length: TRAIL }, () => ({ ...pointer }));
//     let seen = false;

//     const onMove = (e) => {
//       if (e.pointerType === "touch") return;
//       pointer.x = e.clientX;
//       pointer.y = e.clientY;
//       if (!seen) {
//         // Snap the chain to the first real position so nothing streaks in
//         // from the corner on load.
//         for (const p of trail) ((p.x = pointer.x), (p.y = pointer.y));
//         seen = true;
//       }
//     };
//     window.addEventListener("pointermove", onMove, { passive: true });

//     let raf = 0;
//     const frame = () => {
//       raf = requestAnimationFrame(frame);
//       ctx.clearRect(0, 0, innerWidth, innerHeight);
//       if (!seen) return;

//       // The head lags the real cursor a touch (so the streak trails just
//       // behind it), and each segment chases the one ahead — a short
//       // spring chain that tapers away.
//       trail[0].x = lerp(trail[0].x, pointer.x, 0.5);
//       trail[0].y = lerp(trail[0].y, pointer.y, 0.5);
//       for (let i = 1; i < TRAIL; i++) {
//         trail[i].x = lerp(trail[i].x, trail[i - 1].x, 0.5);
//         trail[i].y = lerp(trail[i].y, trail[i - 1].y, 0.5);
//       }

//       const now = performance.now() / 1000;
//       ctx.lineCap = "round";
//       ctx.lineJoin = "round";
//       for (let i = 1; i < trail.length; i++) {
//         const t = i / (trail.length - 1);
//         const w = (1 - t) * HEAD_WIDTH;
//         if (w < 0.4) continue;
//         // hue rides along the ribbon (and slowly drifts) through the spectrum
//         const c = iridescence(t * 0.55 + now * 0.05);
//         ctx.beginPath();
//         ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
//         ctx.lineTo(trail[i].x, trail[i].y);
//         // soft outer glow + crisp core, kept faint so it's easy to ignore
//         ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(1 - t) * 0.08})`;
//         ctx.lineWidth = w + 6;
//         ctx.stroke();
//         ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${(1 - t) * 0.38})`;
//         ctx.lineWidth = w;
//         ctx.stroke();
//       }
//     };
//     raf = requestAnimationFrame(frame);

//     return () => {
//       cancelAnimationFrame(raf);
//       window.removeEventListener("resize", resize);
//       window.removeEventListener("pointermove", onMove);
//     };
//   }, []);

//   return (
//     <canvas ref={canvasRef} className='cursor-canvas' aria-hidden='true' />
//   );
// }
