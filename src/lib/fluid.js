import * as THREE from "three";

/* ============================================================
   GPU fluid simulation — the "stir the background" ink trail.

   A compact stable-fluids solver (Stam / Navier-Stokes) run on the
   GPU as a chain of fullscreen shader passes over ping-pong float
   render targets:

     advect velocity → add mouse splat → curl → vorticity →
     divergence → pressure (Jacobi) → subtract gradient → advect dye

   The velocity field is kept (nearly) divergence-free by the
   pressure solve, which is what gives the swirl its incompressible,
   liquid look instead of a plain fading blur. Only the dye field is
   drawn; velocity is invisible plumbing.

   Framework-agnostic on purpose: the React wrapper owns the canvas,
   the rAF loop, pointer input and theme colour — this just exposes
   resize / splat / step / dispose.
   ============================================================ */

// Internal grid sizes (independent of canvas pixels). The velocity
// solve is coarse — fluid is low-frequency — while dye runs finer so
// the ink stays crisp. Both scale with aspect so cells stay square.
const SIM_RESOLUTION = 128;
const DYE_RESOLUTION = 512;

// Tuned for a calm, faded, iridescent wash: chill movement that's
// clearly there but easy to ignore. These are the main "feel" knobs.
const PRESSURE_ITERATIONS = 20; // Jacobi sweeps; more = stiffer fluid
const CURL = 5; // vorticity confinement — lower = less smoky billow
const VELOCITY_DISSIPATION = 0.3; // how fast motion settles
const DENSITY_DISSIPATION = 1.0; // how fast the ink fades out
const SPLAT_FORCE = 2600; // mouse velocity → fluid force (gentler)
const SPLAT_RADIUS = 0.18; // ink blob size — tighter = more liquid thread
const DYE_AMOUNT = 0.09; // base ink deposited per move (kept faint)

// Shared vertex shader: a fullscreen triangle that also hands each
// neighbour texel coordinate to the fragment stage, so the stencil
// passes (curl/divergence/pressure) don't recompute offsets per pixel.
const VERT = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
    vUv = position.xy * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Semi-Lagrangian advection: trace each cell back along the velocity
// field and resample, with a little dissipation so nothing builds up
// forever.
const ADVECTION = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main () {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
  }
`;

// Inject the pointer: a soft Gaussian blob of `color` added onto the
// target (velocity force, or dye colour).
const SPLAT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main () {
    vec2 p = vUv - point.xy;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`;

const CURL_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`;

// Vorticity confinement: push velocity back toward the swirl centres
// the solver would otherwise smear away — restores the curling detail.
const VORTICITY = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main () {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = clamp(velocity, -1000.0, 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const DIVERGENCE = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

// Multiply a field by a scalar — used to bleed pressure away slightly
// between frames so it doesn't ring.
const CLEAR = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

// One Jacobi iteration of the pressure Poisson equation.
const PRESSURE = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - divergence) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`;

// Subtract the pressure gradient to make velocity divergence-free.
const GRADIENT_SUBTRACT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main () {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity -= vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

// Draw the dye to screen as an oil-slick / soap-film iridescence. The
// ink is a faint scalar "thickness"; we read its gradient to fake a
// surface normal, then shade it like a thin liquid film: hue shifts
// with both thickness and surface tilt (as a real oil film does with
// viewing angle), with a glossy rim where the film bends and a crisp
// edge so it reads as liquid, not smoke. Kept very low-alpha — a
// shimmer, not a spill. Empty water is discarded so the page shows
// straight through.
const DISPLAY = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform sampler2D uVelocity;
  uniform float uTime;
  uniform vec2 uDyeTexel;
  vec3 iridescence (float t) {
    return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
  }
  void main () {
    float c = texture2D(uTexture, vUv).r;
    if (c < 0.002) discard;
    // film slope -> a fake surface normal for the liquid sheen
    float l = texture2D(uTexture, vUv - vec2(uDyeTexel.x, 0.0)).r;
    float r = texture2D(uTexture, vUv + vec2(uDyeTexel.x, 0.0)).r;
    float tp = texture2D(uTexture, vUv + vec2(0.0, uDyeTexel.y)).r;
    float bt = texture2D(uTexture, vUv - vec2(0.0, uDyeTexel.y)).r;
    vec3 n = normalize(vec3((l - r) * 4.0, (bt - tp) * 4.0, 0.18));
    // angle-dependent thin-film hue, drifting slowly
    float hue = c * 3.0 + (1.0 - n.z) * 0.6 + uTime * 0.025;
    vec3 col = iridescence(hue);
    float rim = pow(1.0 - n.z, 2.0);     // glossy highlight on the bends
    col += rim * 0.1;
    col = mix(vec3(0.8), col, 0.85);     // pearly, not saturated
    float a = smoothstep(0.004, 0.05, c) * 0.11 + rim * 0.03;
    gl_FragColor = vec4(col, clamp(a, 0.0, 0.15));
  }
`;

function createRenderTarget(w, h, type) {
  const rt = new THREE.WebGLRenderTarget(w, h, {
    type,
    format: THREE.RGBAFormat,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
  rt.texture.generateMipmaps = false;
  return rt;
}

// A read/write pair you flip after each pass.
function createDoubleTarget(w, h, type) {
  let read = createRenderTarget(w, h, type);
  let write = createRenderTarget(w, h, type);
  return {
    get read() {
      return read;
    },
    get write() {
      return write;
    },
    swap() {
      const t = read;
      read = write;
      write = t;
    },
    dispose() {
      read.dispose();
      write.dispose();
    },
  };
}

function getResolution(gl, resolution) {
  const size = gl.getDrawingBufferSize(new THREE.Vector2());
  let aspect = size.x / size.y || 1;
  if (aspect < 1) aspect = 1 / aspect;
  const min = Math.round(resolution);
  const max = Math.round(resolution * aspect);
  return size.x > size.y
    ? { width: max, height: min }
    : { width: min, height: max };
}

export function createFluidSimulation(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  renderer.autoClear = false;
  renderer.setClearColor(0x000000, 0);
  // Decorative data, not a lit scene — skip colour-management so the
  // dye reads exactly as injected.
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  // Half-float keeps the solve stable without needing full-float
  // support; every modern WebGL2 target filters it linearly.
  const type = THREE.HalfFloatType;

  // One fullscreen triangle, reused for every pass by swapping material.
  const geometry = new THREE.BufferGeometry();
  // 3-component positions: computeBoundingSphere() reads a z per vertex,
  // so a 2-wide buffer would read past the end and produce NaN.
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
      3,
    ),
  );
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(geometry);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const camera = new THREE.Camera();

  const make = (fragmentShader) =>
    new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
      uniforms: { texelSize: { value: new THREE.Vector2() } },
    });

  const materials = {
    advection: make(ADVECTION),
    splat: make(SPLAT),
    curl: make(CURL_SHADER),
    vorticity: make(VORTICITY),
    divergence: make(DIVERGENCE),
    clear: make(CLEAR),
    pressure: make(PRESSURE),
    gradient: make(GRADIENT_SUBTRACT),
    display: make(DISPLAY),
  };

  let velocity;
  let dye;
  let divergence;
  let curlRT;
  let pressure;
  let time = 0; // seconds, drives the iridescence drift
  const simTexel = new THREE.Vector2();

  function initTargets() {
    const sim = getResolution(renderer, SIM_RESOLUTION);
    const dyeRes = getResolution(renderer, DYE_RESOLUTION);
    velocity?.dispose();
    dye?.dispose();
    divergence?.dispose();
    curlRT?.dispose();
    pressure?.dispose();
    velocity = createDoubleTarget(sim.width, sim.height, type);
    dye = createDoubleTarget(dyeRes.width, dyeRes.height, type);
    divergence = createRenderTarget(sim.width, sim.height, type);
    curlRT = createRenderTarget(sim.width, sim.height, type);
    pressure = createDoubleTarget(sim.width, sim.height, type);
    simTexel.set(1 / sim.width, 1 / sim.height);
    // Every stencil pass samples the sim grid, so its texel size is the
    // right neighbour offset for the shared vertex shader everywhere.
    for (const m of Object.values(materials))
      m.uniforms.texelSize.value.copy(simTexel);
    // The display pass reads the finer dye grid for its surface normal.
    materials.display.uniforms.uDyeTexel = {
      value: new THREE.Vector2(1 / dyeRes.width, 1 / dyeRes.height),
    };
  }

  function blit(material, target) {
    mesh.material = material;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    initTargets();
  }

  // Queue of pointer impulses to inject on the next step.
  const splats = [];

  // x, y in 0..1 with the origin bottom-left; dx, dy the pointer
  // velocity in the same space. Colour is decided at display time, so
  // none is passed in here.
  function addSplat(x, y, dx, dy) {
    splats.push({ x, y, dx, dy });
  }

  function applySplat(s) {
    const aspect = velocity.read.width / velocity.read.height;
    const radius = SPLAT_RADIUS / 100;
    // velocity impulse
    const u = materials.splat.uniforms;
    u.uTarget = { value: velocity.read.texture };
    u.aspectRatio = { value: aspect };
    u.point = { value: new THREE.Vector2(s.x, s.y) };
    u.radius = { value: radius };
    u.color = { value: new THREE.Vector3(s.dx, s.dy, 0) };
    blit(materials.splat, velocity.write);
    velocity.swap();
    // ink "thickness": a faint scalar, a touch more where the move is
    // quick. The rainbow is added by the display pass, not stored here.
    const amount = Math.min(
      DYE_AMOUNT + Math.hypot(s.dx, s.dy) * 0.00005,
      0.28,
    );
    u.uTarget = { value: dye.read.texture };
    u.color = { value: new THREE.Vector3(amount, amount, amount) };
    blit(materials.splat, dye.write);
    dye.swap();
  }

  function step(dt) {
    time += dt;
    // 1. advect velocity through itself
    let u = materials.advection.uniforms;
    u.uVelocity = { value: velocity.read.texture };
    u.uSource = { value: velocity.read.texture };
    u.dt = { value: dt };
    u.dissipation = { value: VELOCITY_DISSIPATION };
    blit(materials.advection, velocity.write);
    velocity.swap();

    // 2. inject this frame's pointer impulses
    for (const s of splats) applySplat(s);
    splats.length = 0;

    // 3. vorticity confinement
    materials.curl.uniforms.uVelocity = { value: velocity.read.texture };
    blit(materials.curl, curlRT);

    u = materials.vorticity.uniforms;
    u.uVelocity = { value: velocity.read.texture };
    u.uCurl = { value: curlRT.texture };
    u.curl = { value: CURL };
    u.dt = { value: dt };
    blit(materials.vorticity, velocity.write);
    velocity.swap();

    // 4. projection: divergence → pressure solve → subtract gradient
    materials.divergence.uniforms.uVelocity = { value: velocity.read.texture };
    blit(materials.divergence, divergence);

    u = materials.clear.uniforms;
    u.uTexture = { value: pressure.read.texture };
    u.value = { value: 0.8 };
    blit(materials.clear, pressure.write);
    pressure.swap();

    u = materials.pressure.uniforms;
    u.uDivergence = { value: divergence.texture };
    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      u.uPressure = { value: pressure.read.texture };
      blit(materials.pressure, pressure.write);
      pressure.swap();
    }

    u = materials.gradient.uniforms;
    u.uPressure = { value: pressure.read.texture };
    u.uVelocity = { value: velocity.read.texture };
    blit(materials.gradient, velocity.write);
    velocity.swap();

    // 5. carry the dye along the (now divergence-free) velocity
    u = materials.advection.uniforms;
    u.uVelocity = { value: velocity.read.texture };
    u.uSource = { value: dye.read.texture };
    u.dt = { value: dt };
    u.dissipation = { value: DENSITY_DISSIPATION };
    blit(materials.advection, dye.write);
    dye.swap();
  }

  function render() {
    materials.display.uniforms.uTexture = { value: dye.read.texture };
    materials.display.uniforms.uVelocity = { value: velocity.read.texture };
    materials.display.uniforms.uTime = { value: time };
    renderer.setRenderTarget(null);
    renderer.clear();
    blit(materials.display, null);
  }

  function dispose() {
    velocity?.dispose();
    dye?.dispose();
    divergence?.dispose();
    curlRT?.dispose();
    pressure?.dispose();
    geometry.dispose();
    for (const m of Object.values(materials)) m.dispose();
    renderer.dispose();
  }

  resize();

  return { addSplat, step, render, resize, dispose, SPLAT_FORCE };
}
