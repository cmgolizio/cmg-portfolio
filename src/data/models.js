// Single source of truth for the workshop section (mirrors data/projects.js).
// Export a Fusion 360 design as glTF (.glb) into public/models/ and add an
// entry here — part callouts label themselves from the file's component names.

export const models = [
  {
    slug: "lamp-cam",
    name: "Cam Lamp",
    file: "/models/lamp-cam.glb",
    blurb:
      "A bedside lamp with a twist — literally. Turning the knob spins an eccentric cam, and a follower rod riding its edge tilts the shade. No springs, no electronics in the linkage: just one cam doing all the work.",
    material: "Fusion 360 → glTF",
  },
];
