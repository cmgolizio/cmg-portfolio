import { projects } from "@/data/projects";

const DELAYS = ["d2", "d3", "d4"];

function ProjectCard({ project, delay }) {
  return (
    <article className={`card reveal ${delay}`}>
      <div className='bar'>
        <span />
        <span />
        <span />
      </div>
      <div className='thumb'>
        <span className='status'>{project.status}</span>
        {project.slug}
      </div>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      <div className='tags'>
        {project.tags.map((tag) => (
          <span className='tag' key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className='links'>
        {project.live && (
          <a href={project.live} target='_blank' rel='noopener noreferrer'>
            Live ↗
          </a>
        )}
        <a href={project.code} target='_blank' rel='noopener noreferrer'>
          Code ↗
        </a>
      </div>
    </article>
  );
}

export default function Projects() {
  return (
    <section id='work' className='section-pad'>
      <div className='sec-head reveal d1'>
        <span className='idx'>01</span>
        <h2>Selected work</h2>
      </div>
      <div className='grid'>
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            delay={DELAYS[i] || "d4"}
          />
        ))}
      </div>
    </section>
  );
}
