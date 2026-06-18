"use client";
import { useEffect, useState } from "react";
import { motionValue } from "framer-motion";

// Shared motion values — created once at module level so all consumers
// (TiltCard instances, Atmosphere) read the same values and we register
// exactly one deviceorientation listener for the whole app.
export const tiltX = motionValue(0); // gamma → left/right, -1..1
export const tiltY = motionValue(0); // beta  → pitch,      -1..1

const filtered = { x: 0, y: 0 };
let baseline = null;
let rafId = 0;
let listenerAttached = false;

const ALPHA = 0.1; // low-pass weight — lower = smoother, higher = snappier
const RANGE = 22; // ±° of comfortable hold angle maps to ±1

// Notify all hook consumers when the listener goes live.
const enabledCallbacks = new Set();
function notifyEnabled() {
  for (const cb of enabledCallbacks) cb(true);
}

function onOrientation(e) {
  if (e.gamma === null || e.beta === null) return;
  // Capture first reading as neutral baseline — phones aren't held flat.
  if (!baseline) baseline = { g: e.gamma, b: e.beta };

  const nx = Math.max(-1, Math.min(1, (e.gamma - baseline.g) / RANGE));
  const ny = Math.max(-1, Math.min(1, (e.beta - baseline.b) / RANGE));

  filtered.x += ALPHA * (nx - filtered.x);
  filtered.y += ALPHA * (ny - filtered.y);

  // rAF throttle — coalesce sensor bursts to one write per paint.
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    tiltX.set(filtered.x);
    tiltY.set(filtered.y); // tiltX is already set, so tiltY subscribers see correct tiltX
  });
}

function attachListener() {
  if (listenerAttached) return;
  listenerAttached = true;
  window.addEventListener("deviceorientation", onOrientation, {
    passive: true,
  });
}

// Must be called directly from a user-gesture handler (iOS 13+ requirement).
// Returns "granted" | "denied" | "unsupported".
export async function requestTiltPermission() {
  if (typeof DeviceOrientationEvent === "undefined") return "unsupported";
  if (typeof DeviceOrientationEvent.requestPermission !== "function") {
    // Android / non-iOS — no gate, just attach.
    attachListener();
    notifyEnabled();
    return "granted";
  }
  try {
    const result = await DeviceOrientationEvent.requestPermission();
    try {
      localStorage.setItem("tilt-permission", result);
    } catch {}
    if (result === "granted") {
      attachListener();
      notifyEnabled();
    }
    return result;
  } catch {
    return "denied";
  }
}

export function useDeviceTilt() {
  // Derived synchronously so components can use them in render (SSR-safe via
  // the typeof window guard — returns false on the server, true only on client).
  const supported =
    typeof window !== "undefined" &&
    typeof DeviceOrientationEvent !== "undefined" &&
    window.matchMedia("(hover: none), (pointer: coarse)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const needsPermission =
    supported && typeof DeviceOrientationEvent.requestPermission === "function";

  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!supported) return;

    enabledCallbacks.add(setEnabled);
    let tid = 0;

    if (!needsPermission) {
      // Non-iOS touch device — attach immediately; defer setState out of
      // the synchronous effect body to satisfy the lint rule.
      attachListener();
      tid = setTimeout(notifyEnabled, 0);
    } else {
      // iOS: silently re-request if the visitor already granted permission.
      let stored = "";
      try {
        stored = localStorage.getItem("tilt-permission") ?? "";
      } catch {}
      if (stored === "granted") {
        DeviceOrientationEvent.requestPermission()
          .then((result) => {
            if (result === "granted") {
              attachListener();
              notifyEnabled();
            }
          })
          .catch(() => {});
      }
    }

    return () => {
      clearTimeout(tid);
      enabledCallbacks.delete(setEnabled);
    };
  }, [supported, needsPermission]);

  return { x: tiltX, y: tiltY, supported, needsPermission, enabled };
}
