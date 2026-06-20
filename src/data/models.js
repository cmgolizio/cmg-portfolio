// Single source of truth for the workshop section (mirrors data/projects.js).
// Export a Fusion 360 design as glTF (.glb) into public/models/ and add an
// entry here — part callouts label themselves from the file's component names.

export const models = [
  {
    slug: "lamp-cubey",
    name: "Cubey Lamp",
    file: "/models/cubey-lamp.glb",
    blurb:
      "A bedside lamp, containing two microswitches and a latching relay. Twisting the cube shaped lamp shade 90 degrees turns the LED strips within on and off.",
    // material: "Fusion 360 → glTF",
    material: "",
  },
  {
    slug: "sunglass-organizer",
    name: "Sunglass Organizer (woodworking)",
    file: "/models/sunglass-organizer.glb",
    blurb:
      'A way to store and display your overly excessive amount of sunglasses. Built IRL with a wooden frame and 3/16" dia. brass dowels.',
    // material: "Fusion 360 → glTF",
    material: "",
  },
];
