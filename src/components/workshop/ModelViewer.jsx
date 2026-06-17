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
// every top-level component slides outward from the assembly's center by
// `explode` (0..1). The viewport is too small for floating 3D labels, so
// parts carry no label here: hovering a part flags it (pointer cursor + a
// hint in the bench bar) and clicking it reports the part up so the manifest
// list on the right can highlight (and scroll to) that part's name.
// React Compiler is opted out above — parts are mutated per-frame in useFrame.

const FIT_RADIUS = 1.7; // model is scaled so its bounding radius is this
const SPREAD = 1.15; // explode distance at 1, as a fraction of the raw radius
const SPIN_SPEED = 0.3; // rad/s turntable

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
      const childCenter = new THREE.Box3()
        .setFromObject(child)
        .getCenter(new THREE.Vector3());
      const dir = childCenter.clone().sub(center);
      if (dir.length() < 1e-4) dir.set(0, 1, 0);
      dir.normalize();
      return {
        child,
        name: cleanName(child.name, i),
        home: child.userData.home,
        dir,
        anchor: childCenter,
      };
    });
    return {
      parts,
      center,
      scale: FIT_RADIUS / radius,
      spread: radius * SPREAD,
      floorY: (box.min.y - center.y) * (FIT_RADIUS / radius) - 0.05,
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
      p.child.position
        .copy(p.home)
        .addScaledVector(p.dir, current.current * layout.spread);
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

export default function ModelViewer({
  file,
  explode,
  spinning,
  onParts,
  onGrab,
  onHoverChange,
  onSelect,
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    onHoverChange?.(hoveredIdx !== null);
  }, [hoveredIdx, onHoverChange]);

  return (
    <Canvas
      frameloop={spinning ? "always" : "demand"}
      dpr={[1, 2]}
      camera={{ fov: 35, position: [3.4, 2.3, 4.4] }}
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
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.25}
        maxPolarAngle={1.5}
        target={[0, 0.1, 0]}
      />
      {/* after OrbitControls: it forces touch-action:none on connect */}
      <TouchPolicy />
    </Canvas>
  );
}
