// src/app/projects/page.jsx
import { projects } from "@/lib/projects";
import ProjectCard from "@/components/projects/ProjectCard";

export const metadata = {
  title: "Tool Rack — Projects | Christopher Golizio",
};

export default function ProjectsPage() {
  return (
    <div className='mx-auto max-w-5xl px-4 py-10'>
      <header className='mb-8'>
        <h1 className='text-2xl font-semibold text-[#1A1A1A]'>
          Tool Rack — Projects
        </h1>
        <p className='mt-2 max-w-xl text-sm text-neutral-700'>
          Each project is a tool I’ve built — designed for a specific job,
          shaped by constraints, and finished with care.
        </p>
      </header>
      <div className='grid gap-6 md:grid-cols-2'>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
