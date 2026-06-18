// Tiny WebAudio synth for the tactile controls: every press/release gets a
// quiet mechanical sound matched to the theme. No audio files — each click is
// a few milliseconds of filtered noise and/or a pitched blip, synthesized on
// the fly. The context is created lazily inside a user gesture, so autoplay
// policies never block it.

let ctx = null;

function ensure() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// A pitched blip (sine/square) with an optional pitch bend.
function blip({
  freq = 440,
  end = freq,
  dur = 0.05,
  type = "sine",
  gain = 0.05,
}) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (end !== freq) osc.frequency.exponentialRampToValueAtTime(end, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

// A short burst of band-passed noise — the "contact" part of a click.
function tick({ freq = 2500, dur = 0.012, gain = 0.07 }) {
  const t = ctx.currentTime;
  const len = Math.max(1, Math.ceil(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++)
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = 1.4;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(ctx.destination);
  src.start(t);
}

// Each theme is a different switch: minimal = soft rubber dome, technical =
// crisp mechanical keyswitch, creative = bouncy arcade button.
const VOICES = {
  minimal: {
    down: () => {
      tick({ freq: 900, dur: 0.018, gain: 0.045 });
      blip({ freq: 150, end: 116, dur: 0.05, gain: 0.05 });
    },
    up: () => tick({ freq: 1300, dur: 0.012, gain: 0.022 }),
  },
  technical: {
    down: () => {
      tick({ freq: 2800, dur: 0.012, gain: 0.085 });
      blip({ freq: 1050, end: 880, dur: 0.018, type: "square", gain: 0.016 });
    },
    up: () => tick({ freq: 3400, dur: 0.01, gain: 0.04 }),
  },
  creative: {
    down: () => {
      blip({ freq: 290, end: 560, dur: 0.07, gain: 0.06 });
      tick({ freq: 1600, dur: 0.014, gain: 0.03 });
    },
    up: () => blip({ freq: 520, end: 330, dur: 0.05, gain: 0.028 }),
  },
};

function voice() {
  const theme = document.documentElement.getAttribute("data-theme");
  return VOICES[theme] || VOICES.minimal;
}

export function pressSound() {
  if (!ensure()) return;
  voice().down();
}

export function releaseSound() {
  if (!ensure()) return;
  voice().up();
}

// One detent of the explode lever — a faint ratchet click.
export function ratchetSound() {
  if (!ensure()) return;
  tick({ freq: 2100, dur: 0.008, gain: 0.03 });
}

// Card sections scatter apart — each theme sounds like its own kind of mechanism opening.
export function explodeSound() {
  if (!ensure()) return;
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "technical") {
    // Three stepped decoupling ticks, then a rising square-wave sweep
    tick({ freq: 2200, dur: 0.01, gain: 0.06 });
    setTimeout(() => tick({ freq: 2900, dur: 0.009, gain: 0.048 }), 28);
    setTimeout(() => tick({ freq: 3600, dur: 0.008, gain: 0.038 }), 56);
    blip({ freq: 780, end: 1350, dur: 0.1, type: "square", gain: 0.012 });
  } else if (theme === "creative") {
    // Bouncy upward glide + contact burst
    blip({ freq: 300, end: 680, dur: 0.16, gain: 0.055 });
    tick({ freq: 1800, dur: 0.014, gain: 0.035 });
  } else {
    // Minimal: soft thud + gentle rise
    tick({ freq: 1100, dur: 0.015, gain: 0.04 });
    blip({ freq: 190, end: 440, dur: 0.14, gain: 0.038 });
  }
}

// Card sections click back into place — a settling, satisfying resolution.
export function assembleSound() {
  if (!ensure()) return;
  const theme = document.documentElement.getAttribute("data-theme");
  if (theme === "technical") {
    // Descending square blip, then two crisp ticks locking in
    blip({ freq: 1200, end: 580, dur: 0.09, type: "square", gain: 0.014 });
    setTimeout(() => tick({ freq: 3100, dur: 0.01, gain: 0.055 }), 65);
    setTimeout(() => tick({ freq: 2500, dur: 0.01, gain: 0.04 }), 95);
  } else if (theme === "creative") {
    // Playful descend + a small bounce-back blip
    blip({ freq: 580, end: 270, dur: 0.16, gain: 0.05 });
    setTimeout(() => blip({ freq: 360, end: 480, dur: 0.08, gain: 0.03 }), 80);
  } else {
    // Minimal: smooth descend, a quiet click to finish
    blip({ freq: 420, end: 195, dur: 0.12, gain: 0.04 });
    setTimeout(() => tick({ freq: 950, dur: 0.016, gain: 0.036 }), 85);
  }
}
