"use client";
import { useSyncExternalStore } from "react";
import { useDeviceTilt, requestTiltPermission } from "@/lib/useDeviceTilt";

// Stable no-op store — useSyncExternalStore returns false on the server and
// true on the client (same pattern as Projects.jsx / portal hydration guard).
const subscribe = () => () => {};

// One-time iOS permission affordance for device-orientation tilt.
// Only appears on touch devices that require an explicit gesture (iOS 13+).
// Dismissed after a single tap — result is stored so it won't re-appear.
// On Android and non-iOS touch, the listener attaches automatically and this
// component never renders.
export default function MotionPermission() {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { supported, needsPermission, enabled } = useDeviceTilt();

  // Derived — no useEffect needed, no setState, no hydration mismatch.
  const visible = isClient && supported && needsPermission && !enabled;

  if (!visible) return null;

  const handleClick = async () => {
    await requestTiltPermission();
    // The button disappears naturally: requestTiltPermission calls notifyEnabled()
    // which sets enabled=true via the useDeviceTilt hook, and visible becomes false.
  };

  return (
    <button
      type='button'
      className='motion-permission'
      onClick={handleClick}
      aria-label='Enable tilt controls for interactive effects'
    >
      enable tilt ↕
    </button>
  );
}
