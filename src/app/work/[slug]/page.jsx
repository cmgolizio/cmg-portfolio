import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import CaseStudy from "@/components/CaseStudy";

// Only the slugs returned below are built; any other /work/* path 404s
// instead of being rendered on demand.
export const dynamicParams = false;

// One static page per project that has a caseStudy block.
export function generateStaticParams() {
  return projects.filter((p) => p.caseStudy).map((p) => ({ slug: p.slug }));
}

// params is a promise in this Next.js — await before reading.
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Case study · Christopher Golizio`,
    description: project.caseStudy?.tagline ?? project.description,
  };
}

export default async function CaseStudyPage({ params }) {
  const { slug } = await params;
  // Guard on caseStudy too: a project without one has no page here.
  const project = projects.find((p) => p.slug === slug && p.caseStudy);
  if (!project) notFound();
  return <CaseStudy project={project} />;
}
