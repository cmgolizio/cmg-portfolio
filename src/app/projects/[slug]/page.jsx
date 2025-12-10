// src/app/projects/[slug]/page.jsx
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const project = getProjectBySlug(params.slug);
  if (!project) return {};
  return {
    title: `${project.name} — Project | Christopher Golizio`,
    description: project.summary,
  };
}

export default function ProjectDetailPage({ params }) {
  const project = getProjectBySlug(params.slug);
  if (!project) return notFound();

  return (
    <div className='mx-auto max-w-3xl px-4 py-10'>
      <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A954]'>
        Tool Detail
      </p>
      <h1 className='mt-2 text-3xl font-semibold text-[#1A1A1A]'>
        {project.name}
      </h1>
      <p className='mt-2 text-sm text-neutral-700'>{project.summary}</p>

      <section className='mt-6 grid gap-6 sm:grid-cols-2'>
        <div>
          <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-[#5A3E2B]'>
            Role
          </h2>
          <p className='mt-1 text-sm text-neutral-800'>{project.role}</p>
        </div>
        <div>
          <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-[#5A3E2B]'>
            Stack
          </h2>
          <div className='mt-1 flex flex-wrap gap-1.5'>
            {project.stack.map((tech) => (
              <span
                key={tech}
                className='rounded-full bg-[#1C3D5A]/5 px-2 py-0.5 text-[11px] text-[#1C3D5A]'
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className='mt-6'>
        <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-[#5A3E2B]'>
          Highlight
        </h2>
        <p className='mt-1 text-sm text-neutral-800'>{project.highlight}</p>
      </section>

      <section className='mt-6 flex gap-4 text-sm'>
        {project.url && (
          <a
            href={project.url}
            target='_blank'
            rel='noreferrer'
            className='text-[#1C3D5A] underline-offset-2 hover:underline'
          >
            Visit live site
          </a>
        )}
        {project.repo && (
          <a
            href={project.repo}
            target='_blank'
            rel='noreferrer'
            className='text-neutral-700 underline-offset-2 hover:underline'
          >
            View source
          </a>
        )}
      </section>
    </div>
  );
}
