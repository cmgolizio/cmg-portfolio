import WorkbenchHero from "@/components/workbench/WorkbenchHero";
import ProjectCard from "@/components/projects/ProjectCard";
import { projects } from "@/lib/projects";

export default function HomePage() {
  return (
    <div className='mx-auto max-w-5xl px-4 py-10'>
      <WorkbenchHero />

      <section className='mt-12'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-sm font-semibold uppercase tracking-[0.2em] text-[#5A3E2B]'>
            Featured Tools on the Rack
          </h2>
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          {projects.slice(0, 2).map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
