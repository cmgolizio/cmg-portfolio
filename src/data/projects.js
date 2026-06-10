// Single source of truth for the work section.
// Add/edit projects here; the Projects component maps over this list.

export const projects = [
  {
    name: "Draw and Order",
    slug: "draw-and-order",
    status: "Live",
    description:
      "A police-sketch-artist simulator. Interpret an AI-written suspect, draw them on a live canvas, then reveal the real face and get scored on accuracy.",
    tags: ["Next.js", "Konva", "Zustand", "Supabase", "OpenAI"],
    live: "https://drawandorder.vercel.app",
    code: "https://github.com/cmgolizio/draw-and-order",
  },
  {
    name: "Rummisphere",
    slug: "rummisphere",
    status: "WIP",
    description:
      "Real-time multiplayer Rummikub in the browser. Built to master WebSocket sync — including dragging whole tile runs as a unit across live clients.",
    tags: ["Next.js", "Socket.IO", "Zustand", "Vitest"],
    live: null,
    code: "https://github.com/cmgolizio/rummisphere-starter",
  },
  {
    name: "Recipeace",
    slug: "recipeace",
    status: "Live",
    description:
      'A home food & bar inventory that turns "what\'s in my kitchen" into "what can I make tonight" — surfacing meals and cocktails from what you own.',
    tags: ["Next.js", "Firebase", "Zod", "Framer Motion"],
    live: "https://recipeaceful.vercel.app/login",
    code: "https://github.com/cmgolizio/recipeace",
  },
];
