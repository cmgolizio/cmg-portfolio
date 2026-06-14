// Single source of truth for the workshop section (mirrors data/projects.js).
// Export a Fusion 360 design as glTF (.glb) into public/models/ and add an
// entry here — part callouts label themselves from the file's component names.

export const models = [
  {
    slug: "lamp-cubey",
    name: "Cubey Lamp",
    file: "/models/cubey-lamp.glb",
    blurb:
      "A bedside lamp with a twist — literally. Turning the cube-shaped lamp shade turns the light on and off.",
    material: "Fusion 360 → glTF",
  },
  {
    slug: "sunglass-organizer",
    name: "Sunglass Organizer (woodworking)",
    file: "/models/sunglass-organizer.glb",
    blurb:
      "A stylish way to store your sunglasses. The organizer features metal dowels for hanging sunglasses.",
    material: "Fusion 360 → glTF",
  },
];
