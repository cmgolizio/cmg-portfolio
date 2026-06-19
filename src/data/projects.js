// // Single source of truth for the work section.
// // Add/edit projects here; the Projects component maps over this list.

// export const projects = [
//   {
//     name: "Draw and Order",
//     slug: "draw-and-order",
//     status: "Live",
//     description:
//       "A police-sketch-artist simulator. Interpret an AI-written suspect, draw them on a live canvas, then reveal the real face and get scored on accuracy.",
//     tags: ["Next.js", "Konva", "Zustand", "Supabase", "OpenAI"],
//     live: "https://drawandorder.vercel.app",
//     code: "https://github.com/cmgolizio/draw-and-order",
//   },
//   {
//     name: "Rummisphere",
//     slug: "rummisphere",
//     status: "WIP",
//     description:
//       "Real-time multiplayer Rummikub in the browser. Built to master WebSocket sync — including dragging whole tile runs as a unit across live clients.",
//     tags: ["Next.js", "Socket.IO", "Zustand", "Vitest"],
//     live: null,
//     code: "https://github.com/cmgolizio/rummisphere-starter",
//   },
//   {
//     name: "Recipeace",
//     slug: "recipeace",
//     status: "Live",
//     description:
//       'A home food & bar inventory that turns "what\'s in my kitchen" into "what can I make tonight" — surfacing meals and cocktails from what you own.',
//     tags: ["Next.js", "Firebase", "Zod", "Framer Motion"],
//     live: "https://recipeaceful.vercel.app/login",
//     code: "https://github.com/cmgolizio/recipeace",
//   },
// ];
// Single source of truth for the work section.
// Add/edit projects here; the Projects component maps over this list.
//
// `caseStudy` is OPTIONAL. When present, a static /work/[slug] page is built
// for that project and a "Case study →" link appears in its exploded card.
// Projects without it simply have no case-study page or link.
// The copy below is scaffolding — replace the TODO text with real writing.

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
    caseStudy: {
      tagline:
        "Turning an AI text description into a drawing game that scores how close your sketch lands.",
      role: "Solo — concept, design, full-stack, deployment",
      timeline: "TODO — e.g. 3 weeks, 2024",
      // The frame: why this exists and what was genuinely hard.
      problem:
        "TODO — Describe the core challenge: interpreting an AI-written suspect, capturing a freehand sketch on a performant canvas, and scoring visual similarity in a way that feels fair.",
      sections: [
        {
          heading: "The core decision",
          body: "TODO — Why Konva for the canvas, and how the drawing state is structured so it stays smooth while capturing every stroke.",
        },
        {
          heading: "Scoring the unscoreable",
          body: "TODO — How you turned 'how close is this drawing' into a number players trust, and what you tried before it worked.",
        },
        {
          heading: "What broke",
          body: "TODO — The honest part: the bug, the dead end, or the rewrite that taught you the most.",
        },
      ],
      outcome:
        "TODO — What shipped, how it performed, and what you'd do differently next time.",
    },
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
    caseStudy: {
      tagline:
        "Real-time multiplayer Rummikub — built to master WebSocket sync of complex board state.",
      role: "Solo — architecture, full-stack, real-time sync",
      timeline: "TODO — ongoing",
      problem:
        "TODO — Keeping a shared board perfectly in sync across clients while one player drags a whole run of tiles as a single unit, without flicker or conflicting state.",
      sections: [
        {
          heading: "Designing the sync model",
          body: "TODO — How board state is shaped, what travels over the socket, and why you chose authoritative-server vs optimistic updates.",
        },
        {
          heading: "Dragging a run as one unit",
          body: "TODO — The interaction that drove the whole project: grouping tiles and moving them atomically across live clients.",
        },
        {
          heading: "Testing real-time logic",
          body: "TODO — How Vitest fits into validating sync behavior that's normally hard to test.",
        },
      ],
      outcome: "TODO — Current state, what's working, and the path to done.",
    },
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
    caseStudy: {
      tagline:
        'Turning "what\'s in my kitchen" into "what can I make tonight" from your real inventory.',
      role: "Solo — design, full-stack, deployment",
      timeline: "TODO — e.g. 4 weeks, 2024",
      problem:
        "TODO — Matching an arbitrary pantry and bar against a recipe set so the results feel useful, not just technically correct.",
      sections: [
        {
          heading: "Modeling an inventory",
          body: "TODO — How items, quantities, and substitutions are represented, and why Zod guards the data at the edges.",
        },
        {
          heading: "The match that feels right",
          body: "TODO — Surfacing meals and cocktails you can actually make, and handling near-misses gracefully.",
        },
        {
          heading: "Motion with a purpose",
          body: "TODO — Where Framer Motion earns its place in the UX rather than just decorating it.",
        },
      ],
      outcome: "TODO — What shipped, who uses it, and what you learned.",
    },
  },
];
