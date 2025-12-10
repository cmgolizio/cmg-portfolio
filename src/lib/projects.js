export const projects = [
  {
    slug: "draw-and-order",
    name: "Draw & Order",
    role: "Creator & Full-stack Developer",
    summary:
      "A police sketch artist simulator where users draw suspects from AI-generated descriptions and get scored on visual similarity.",
    stack: ["Next.js", "Supabase", "OpenAI", "Tailwind"],
    year: 2025,
    status: "Live",
    url: "https://drawandorder.vercel.app",
    repo: "https://github.com/cmgolizio/draw-and-order",
    highlight: "AI-driven scoring and suspect generation pipeline.",
  },
  {
    slug: "recipeace",
    name: "ReciPeace",
    role: "Creator & Full-stack Developer",
    summary:
      "A pantry-aware recipe and cocktail assistant that surfaces ideas based on ingredients you already have.",
    stack: ["Next.js", "Firebase", "Supabase", "Tailwind"],
    year: 2025,
    status: "Live",
    url: "https://recipeaceful.vercel.app",
    repo: "https://github.com/cmgolizio/recipeace",
    highlight: "Ingredient-based discovery with AI-enhanced suggestions.",
  },
  // add more as needed…
];

export function getProjectBySlug(slug) {
  return projects.find((p) => p.slug === slug);
}
