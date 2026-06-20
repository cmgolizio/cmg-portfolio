"use no memo";
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

// The workshop's 3D viewport. Loads a glTF assembly (a Fusion 360 export),
// normalizes it to a fixed size, and explodes it like an assembly drawing:
// every top-level component drifts outward onto an invisible sphere centered
// on the assembly, in an evenly-distributed direction, by `explode` (0..1).
// The viewport is too small for floating 3D labels, so parts carry no label
// here: hovering a part flags it (pointer cursor + a hint in the bench bar)
// and clicking it reports the part up so the manifest list on the right can
// highlight (and scroll to) that part's name.
// React Compiler is opted out above — parts are mutated per-frame in useFrame.

const FIT_RADIUS = 1.7; // assembled model is scaled so its bounding radius is this
const MAX_FIT_RADIUS = 2.0; // exploded extent is scaled to fit within this
const SPIN_SPEED = 0.3; // rad/s turntable
const CAMERA_POS = [3.8, 2.6, 4.9]; // default (reset) camera position
const TARGET = [0, 0.1, 0]; // orbit pivot
const MIN_DISTANCE = 2.4; // closest dolly-in
const MAX_DISTANCE = 9; // farthest dolly-out
const ZOOM_STEP = 1.25; // per-click dolly factor for the +/- buttons

// Evenly-spaced points on the unit sphere (Fibonacci lattice). Used as the
// blast directions so parts fan out symmetrically instead of clumping along
// whatever off-center vectors the raw geometry happened to have.
function fibonacciSphere(n) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts = [];
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2; // 1 .. -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
  }
  return pts;
}

// "Rocker_Arm:1" (glTF-sanitized Fusion names) -> "Rocker Arm"
const cleanName = (name, i) =>
  name.replace(/[_.]/g, " ").replace(/:\d+$/, "").trim() || `Part ${i + 1}`;

function Assembly({ file, explode, spinning, onParts, onHover, onSelect }) {
  const { scene } = useGLTF(file);
  const spinRef = useRef(null);
  const current = useRef(0); // damped explode value chasing the prop
  const invalidate = useThree((s) => s.invalidate);

  // Measure once per model: fit transform + an explode direction per part.
  const layout = useMemo(() => {
    // useGLTF caches scenes across mounts, so a remount can receive parts
    // frozen mid-explode — restore (or record) the rest pose before measuring.
    // (three.js scene graphs are mutable by design — hence the lint opt-outs;
    // the whole file already opts out of the React Compiler.)
    for (const child of scene.children) {
      if (child.userData.home) child.position.copy(child.userData.home);
      // eslint-disable-next-line react-hooks/immutability
      else child.userData.home = child.position.clone();
    }
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const radius = box.getSize(new THREE.Vector3()).length() / 2 || 1;
    // Real exports can carry cameras/empties at the root — only children with
    // actual geometry are explodable parts (an empty Box3 centers on NaN).
    const solids = scene.children.filter((child) => {
      let has = false;
      child.traverse((o) => {
        if (o.isMesh) has = true;
      });
      return has;
    });
    const parts = solids.map((child, i) => {
      const cbox = new THREE.Box3().setFromObject(child);
      const anchor = cbox.getCenter(new THREE.Vector3());
      const partRadius = cbox.getSize(new THREE.Vector3()).length() / 2 || 1e-3;
      const natural = anchor.clone().sub(center);
      if (natural.length() < 1e-4) natural.set(0, 1, 0);
      natural.normalize();
      return {
        child,
        name: cleanName(child.name, i),
        home: child.userData.home,
        anchor,
        partRadius,
        natural,
      };
    });

    // Hand each part the evenly-spaced direction that best matches where it
    // naturally sits, so the blast stays symmetric yet still reads like every
    // part drifted straight out of its own slot (greedy nearest assignment).
    const dirs = fibonacciSphere(parts.length);
    const taken = new Array(dirs.length).fill(false);
    for (const part of parts) {
      let best = 0;
      let bestDot = -Infinity;
      for (let j = 0; j < dirs.length; j++) {
        if (taken[j]) continue;
        const d = part.natural.dot(dirs[j]);
        if (d > bestDot) {
          bestDot = d;
          best = j;
        }
      }
      taken[best] = true;
      part.dir = dirs[best];
    }

    // Push the parts out far enough that no two bounding spheres touch. At full
    // explode each part center lands on a sphere of radius `spread`, so a pair
    // sits `spread * |dir_i - dir_j|` apart — solve for the tightest pair.
    let maxPartRadius = 0;
    for (const p of parts)
      maxPartRadius = Math.max(maxPartRadius, p.partRadius);
    let spread = maxPartRadius * 2.2; // floor for 1–2 part assemblies
    for (let i = 0; i < parts.length; i++)
      for (let j = i + 1; j < parts.length; j++) {
        const chord = parts[i].dir.distanceTo(parts[j].dir);
        if (chord < 1e-4) continue;
        const need = (parts[i].partRadius + parts[j].partRadius) / chord;
        if (need > spread) spread = need;
      }
    spread *= 1.18; // a little daylight between neighbours

    // Full-explode displacement per part: lands its geometric center exactly on
    // the sphere (the `center - anchor` term cancels the part's own offset so
    // every part orbits the same invisible sphere, not its local position).
    for (const p of parts) {
      p.move = p.dir.clone().multiplyScalar(spread).add(center).sub(p.anchor);
    }

    // Scale so the *exploded* extent fits the stage (not just the assembled
    // body) — the blast never grows past the viewport, at the cost of the
    // assembled model reading a touch smaller.
    const explodedRadius = spread + maxPartRadius || radius;
    const scale = Math.min(
      FIT_RADIUS / radius,
      MAX_FIT_RADIUS / explodedRadius,
    );

    return {
      parts,
      center,
      scale,
      floorY: (box.min.y - center.y) * scale - 0.05,
    };
  }, [scene]);

  useEffect(() => {
    onParts?.(layout.parts.map((p) => p.name));
  }, [layout, onParts]);

  useFrame((_, delta) => {
    if (spinning && spinRef.current) {
      spinRef.current.rotation.y += SPIN_SPEED * Math.min(delta, 0.1);
    }
    // Ease the parts toward the lever's value; keep requesting frames
    // (frameloop is "demand" when the turntable is off) until settled.
    // lambda 7 keeps the settle time close to the card's spring (~0.4s)
    // so the two explode interactions feel like siblings, not just similar
    const target = explode;
    const next = THREE.MathUtils.damp(current.current, target, 7, delta);
    if (Math.abs(next - target) > 0.001) invalidate();
    current.current = Math.abs(next - target) <= 0.001 ? target : next;
    for (const p of layout.parts) {
      p.child.position.copy(p.home).addScaledVector(p.move, current.current);
    }
  });

  // Hit-test against the part meshes directly (rather than turning each
  // part into its own JSX node) so the glTF's own scene graph — and any
  // transform baked into its root — stays exactly as exported.
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    const canvas = gl.domElement;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let lastHover = null;
    let downPos = null;

    const hitIndex = (e) => {
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(
        layout.parts.map((p) => p.child),
        true,
      );
      if (!hits.length) return null;
      let obj = hits[0].object;
      while (obj && !layout.parts.some((p) => p.child === obj))
        obj = obj.parent;
      return obj ? layout.parts.findIndex((p) => p.child === obj) : null;
    };

    const onMove = (e) => {
      const idx = hitIndex(e);
      if (idx === lastHover) return;
      lastHover = idx;
      canvas.style.cursor = idx !== null ? "pointer" : "";
      onHover(idx);
    };
    // OrbitControls still fires a native "click" after a drag-to-orbit
    // release; only treat it as a selection if the pointer barely moved.
    const onDown = (e) => {
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onClickCanvas = (e) => {
      if (downPos) {
        const dx = e.clientX - downPos.x;
        const dy = e.clientY - downPos.y;
        if (dx * dx + dy * dy > 36) return;
      }
      const idx = hitIndex(e);
      onSelect(idx !== null ? (cur) => (cur === idx ? null : idx) : null);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("click", onClickCanvas);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("click", onClickCanvas);
      canvas.style.cursor = "";
    };
  }, [gl, camera, layout, onHover, onSelect]);

  return (
    <>
      <group ref={spinRef}>
        <group scale={layout.scale}>
          <group position={layout.center.clone().negate()}>
            <primitive object={scene} />
          </group>
        </group>
      </group>
      {/* re-renders only when a frame renders, so it tracks the explode
          lerp and costs nothing while the demand loop is idle */}
      <ContactShadows
        position={[0, layout.floorY, 0]}
        opacity={0.4}
        scale={8}
        blur={2.6}
        far={3.4}
        resolution={512}
        frames={Infinity}
      />
    </>
  );
}

function LoadingHint() {
  return (
    <Html center>
      <span className='callout'>loading model…</span>
    </Html>
  );
}

// OrbitControls sets touch-action:none on the canvas, which would trap page
// scrolling on touch screens. pan-y hands vertical swipes back to the
// browser; horizontal drags still orbit. Mounted after the controls so this
// effect runs last and wins.
function TouchPolicy() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    // deliberate DOM sync: undo OrbitControls' touch-action:none
    // eslint-disable-next-line react-hooks/immutability
    gl.domElement.style.touchAction = "pan-y";
  }, [gl]);
  return null;
}

// Bridges the out-of-canvas +/reset/- buttons to the perspective camera by
// dollying along the view vector (clamped to the same range as scroll zoom).
// Populates the `zoomApi` ref the parent passes down once the default
// OrbitControls exists; the wheel/touchpad path is OrbitControls' own.
function ZoomBridge({ zoomApiRef }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!controls || !zoomApiRef) return;
    const dolly = (factor) => {
      const offset = camera.position.clone().sub(controls.target);
      const dist = THREE.MathUtils.clamp(
        offset.length() * factor,
        MIN_DISTANCE,
        MAX_DISTANCE,
      );
      camera.position.copy(controls.target).add(offset.setLength(dist));
      controls.update();
      invalidate();
    };
    zoomApiRef.current = {
      zoomIn: () => dolly(1 / ZOOM_STEP),
      zoomOut: () => dolly(ZOOM_STEP),
      reset: () => {
        camera.position.set(...CAMERA_POS);
        controls.target.set(...TARGET);
        controls.update();
        invalidate();
      },
    };
    return () => {
      zoomApiRef.current = null;
    };
  }, [camera, controls, invalidate, zoomApiRef]);
  return null;
}

export default function ModelViewer({
  file,
  explode,
  spinning,
  onParts,
  onGrab,
  onHoverChange,
  onSelect,
  zoomApiRef,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    onHoverChange?.(hoveredIdx !== null);
  }, [hoveredIdx, onHoverChange]);

  return (
    <Canvas
      frameloop={spinning ? "always" : "demand"}
      dpr={[1, 2]}
      camera={{ fov: 35, position: CAMERA_POS }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      // One-finger vertical drag keeps scrolling the page on touch; orbit
      // works with horizontal drags (and any mouse drag).
      style={{ touchAction: "pan-y" }}
      onPointerDown={onGrab}
      aria-label='Interactive 3D model — drag to orbit'
    >
      <hemisphereLight intensity={0.9} groundColor='#3a3530' color='#ffffff' />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <directionalLight
        position={[-5, 2, -4]}
        intensity={0.5}
        color='#bcd4ff'
      />
      <Suspense fallback={<LoadingHint />}>
        <Assembly
          file={file}
          explode={explode}
          spinning={spinning}
          onParts={onParts}
          onHover={setHoveredIdx}
          onSelect={onSelect}
        />
      </Suspense>
      {/* No polar clamp: the model tumbles a full 360° on every axis so any
          face can be brought into view (azimuth is unbounded by default).
          Zoom is on — wheel and two-finger touchpad/pinch dolly the camera,
          clamped between MIN_DISTANCE and MAX_DISTANCE. */}
      <OrbitControls
        makeDefault
        enableZoom
        enablePan={false}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        target={TARGET}
      />
      <ZoomBridge zoomApiRef={zoomApiRef} />
      {/* after OrbitControls: it forces touch-action:none on connect */}
      <TouchPolicy />
    </Canvas>
  );
}
