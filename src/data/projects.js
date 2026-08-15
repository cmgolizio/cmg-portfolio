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
    name: "What's in House",
    slug: "whats-in-house",
    status: "Live",
    description:
      "One pantry, two workspaces. Add what you have, then see what you can make at the Bar or in the Kitchen — and which single ingredient would unlock the most.",
    tags: ["Next.js", "TypeScript", "Supabase", "Postgres", "Vitest"],
    live: "https://whatsinhouse.vercel.app",
    code: "https://github.com/cmgolizio/recipeace-ii",
    caseStudy: {
      tagline:
        'Turning "what\'s in my kitchen" into "what can I make tonight" — cocktails and food, from one shared pantry.',
      role: "Solo — data model, full-stack, content pipeline, deployment",
      timeline: "TODO — e.g. 4 weeks, 2026",
      problem:
        "TODO — Matching an arbitrary pantry against a recipe catalog so the results feel useful rather than merely correct: substitutions count, staples shouldn't block anything, and a near-miss is often more interesting than a match.",
      sections: [
        {
          heading: "One pantry, two rooms",
          body: "TODO — Why the Bar and the Kitchen are interface contexts over shared data instead of two systems, and how keeping a recipe's domain in exactly one column stopped that split from leaking everywhere.",
        },
        {
          heading: "Matching in SQL, not in the app",
          body: "TODO — Pushing the matcher into Postgres functions: the is-a ingredient tree that lets bourbon satisfy a recipe calling for whiskey, staples that are always assumed, and ranking what you're one ingredient away from making.",
        },
        {
          heading: "Keeping the AI out of the request path",
          body: "TODO — Recipes are generated offline by a pipeline and written to the database; the live app runs deterministic SQL only. Why that trade — reproducible results, no per-request inference — was worth the extra machinery.",
        },
      ],
      outcome: "TODO — What shipped, who uses it, and what you learned.",
    },
  },
  {
    name: "Kinemagic",
    slug: "kinemagic",
    status: "Live",
    description:
      "A planar mechanism simulator for the browser. Drag the joints of a four-bar linkage, watch its coupler curve trace live, then export the result as a laser-ready SVG or a printable STL.",
    tags: ["Next.js", "TypeScript", "Canvas 2D", "Zustand", "Vitest"],
    live: "https://kinemagic.vercel.app",
    code: "https://github.com/cmgolizio/kinemagic",
    caseStudy: {
      tagline:
        "Browser-designed motion you can hold — a kinematics solver that exports straight to the laser cutter and the 3D printer.",
      role: "Solo — kinematics engine, rendering, full-stack, deployment",
      timeline: "TODO — ongoing, 2026",
      problem:
        "TODO — Describe the core challenge: a dependency-free solver that stays continuous and never returns NaN, drawn at 60fps while a full coupler trace accumulates, and dimensionally honest enough that an exported part actually fits together.",
      sections: [
        {
          heading: "Engine before pixels",
          body: "TODO — Why the kinematics module was written as pure TypeScript with zero React or canvas imports, and how testing it against hand-verified four-bar configurations kept the rest of the app standing on something true.",
        },
        {
          heading: "The bug that makes linkages snap",
          body: "TODO — Circle–circle intersection gives two assemblies; choosing by formula flips branches mid-rotation and the mechanism visibly jumps. How nearest-point continuation from the previous frame fixed it.",
        },
        {
          heading: "From coupler curve to cut file",
          body: "TODO — Turning the on-screen mechanism into SVG contours and STL meshes with pivot bores placed, and what working in real millimeters had to mean for that to come out right.",
        },
      ],
      outcome:
        "TODO — What shipped, what it's like to print a mechanism you designed in a browser tab, and what's next.",
    },
  },
];
