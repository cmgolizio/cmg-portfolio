"use client";

import { Component, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { models } from "@/data/models";
import { ratchetSound } from "@/lib/clicker";

// "The workshop": physical builds, shown as live exploded assembly drawings.
// three.js is heavy, so the viewer bundle loads only when the section is
// scrolled near (IntersectionObserver below + ssr:false dynamic import).

const ModelViewer = dynamic(() => import("@/components/workshop/ModelViewer"), {
  ssr: false,
  loading: () => <BenchSkeleton label='spooling up the shop…' />,
});

function BenchSkeleton({ label }) {
  return (
    <div className='bench-skeleton'>
      <span className='callout'>{label}</span>
    </div>
  );
}

// Suspense-thrown load failures (missing/corrupt .glb) land here instead of
// blanking the page — the file path hint matters once real exports replace
// the placeholder.
class ViewerBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <BenchSkeleton
          label={`couldn't read ${this.props.file} — re-export and refresh`}
        />
      );
    return this.props.children;
  }
}

export default function Workshop() {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [explode, setExplode] = useState(0);
  // null = no explicit choice: the turntable runs unless the visitor prefers
  // reduced motion. Latching it on is an explicit opt back in.
  const [userSpin, setUserSpin] = useState(null);
  const [parts, setParts] = useState([]);
  const [partHovered, setPartHovered] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const selectedRef = useRef(null);

  const spinning = userSpin ?? !reduceMotion;
  const model = models[activeIdx];

  // Mount the 3D bundle a bit before the bench scrolls in.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onParts = useCallback((names) => setParts(names), []);
  // Grabbing the model disengages the spin latch, like stopping a turntable
  // with your hand.
  const onGrab = useCallback(() => setUserSpin(false), []);

  // When a part is clicked in the viewer, bring its name into view in the
  // manifest list. block:"nearest" only scrolls when it's actually off-screen,
  // which is exactly the edge case to handle for parts-dense models.
  useEffect(() => {
    if (selectedIdx === null) return;
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  const pickModel = (i) => {
    setActiveIdx(i);
    setExplode(0);
    setParts([]);
    setPartHovered(false);
    setSelectedIdx(null);
  };

  return (
    <section id='workshop' className='section-pad'>
      <div className='sec-head reveal d1'>
        <span className='idx'>03</span>
        <h2>The workshop</h2>
        <span className='sec-note'>
          drag to orbit · slide the bar to explode model
        </span>
      </div>

      <div className='bench reveal d2'>
        <div className='bench-stage'>
          <div className='bench-bar'>
            <span className='bench-title-group'>
              <span className='bench-title'>{model.name}</span>
              {partHovered && (
                <span className='bench-hint'>click for part name</span>
              )}
            </span>
            <span className='bench-badge'>{model.material}</span>
          </div>
          <div className='bench-canvas' ref={stageRef}>
            {inView ? (
              <ViewerBoundary key={model.file} file={model.file}>
                <ModelViewer
                  file={model.file}
                  explode={explode}
                  spinning={spinning}
                  onParts={onParts}
                  onGrab={onGrab}
                  onHoverChange={setPartHovered}
                  onSelect={setSelectedIdx}
                />
              </ViewerBoundary>
            ) : (
              <BenchSkeleton label='workbench idle' />
            )}
          </div>
          <div className='bench-controls'>
            <label className='lever'>
              <span className='lever-label'>explode</span>
              <input
                type='range'
                min='0'
                max='100'
                value={Math.round(explode * 100)}
                onChange={(e) => {
                  const v = e.target.value / 100;
                  // The lever ratchets: a faint click at every tenth detent.
                  if (Math.floor(v * 10) !== Math.floor(explode * 10))
                    ratchetSound();
                  setExplode(v);
                }}
                aria-label='Exploded view amount'
              />
            </label>
            <button
              type='button'
              className='latch'
              aria-pressed={spinning}
              onClick={() => setUserSpin(!spinning)}
            >
              spin
            </button>
          </div>
        </div>

        <aside className='bench-manifest'>
          <h3>{model.name}</h3>
          <p>{model.blurb}</p>
          {parts.length > 0 && (
            <ol className='manifest-list' aria-label='Parts'>
              {parts.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  ref={i === selectedIdx ? selectedRef : null}
                  className={i === selectedIdx ? "is-selected" : undefined}
                  aria-current={i === selectedIdx ? "true" : undefined}
                >
                  <span className='idx'>{String(i + 1).padStart(2, "0")}</span>
                  {name}
                </li>
              ))}
            </ol>
          )}
          <p className='manifest-note'>
            modeled in Fusion 360 <span className='text-xl'>→</span> rendered
            live in your browser
          </p>
          <p className='manifest-note'>3D Models:</p>
          {models.length > 1 && (
            <div className='bench-rail' role='group' aria-label='Models'>
              {models.map((m, i) => (
                <button
                  key={m.slug}
                  type='button'
                  className='latch'
                  aria-pressed={i === activeIdx}
                  onClick={() => pickModel(i)}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
