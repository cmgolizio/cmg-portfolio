import Link from "next/link";

export default function ProjectCard({ project }) {
  return (
    <article className='group flex flex-col rounded-2xl border border-[#D1A954]/30 bg-[#FAF7F2] dark:bg-[#2A2A2A] dark:border-[#D1A954]/40 shadow-sm transition hover:-translate-y-0.5'>
      {/* <article className='group flex flex-col rounded-2xl border border-[#D1A954]/30 bg-[#FAF7F2] p-4 shadow-[0_3px_0_rgba(0,0,0,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.08)]'> */}
      <header className='flex items-start justify-between gap-2'>
        <div>
          <h2 className='text-base font-semibold text-[#1A1A1A]'>
            <Link href={`/projects/${project.slug}`}>
              <span className='hover:underline'>{project.name}</span>
            </Link>
          </h2>
          <p className='mt-1 text-xs uppercase tracking-[0.16em] text-[#5A3E2B]'>
            {project.role}
          </p>
        </div>
        <span className='rounded-full bg-[#EAD8C9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#5A3E2B]'>
          {project.year}
        </span>
      </header>
      <p className='mt-3 text-xs text-neutral-700'>{project.summary}</p>
      <p className='mt-2 text-[11px] text-neutral-600'>
        <span className='font-semibold text-[#5A3E2B]'>Highlight: </span>
        {project.highlight}
      </p>
      <div className='mt-3 flex flex-wrap gap-1.5'>
        {project.stack.map((tech) => (
          <span
            key={tech}
            className='rounded-full bg-[#1C3D5A]/5 px-2 py-0.5 text-[10px] font-medium text-[#1C3D5A]'
          >
            {tech}
          </span>
        ))}
      </div>
      <div className='mt-4 flex gap-3 text-[11px] font-medium'>
        {project.url && (
          <a
            href={project.url}
            target='_blank'
            rel='noreferrer'
            className='text-[#1C3D5A] underline-offset-2 hover:underline'
          >
            Live site
          </a>
        )}
        {project.repo && (
          <a
            href={project.repo}
            target='_blank'
            rel='noreferrer'
            className='text-neutral-700 underline-offset-2 hover:underline'
          >
            GitHub
          </a>
        )}
      </div>
    </article>
  );
}
