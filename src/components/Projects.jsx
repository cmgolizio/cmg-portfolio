"use client";

import { useState } from "react";
import { projects } from "@/data/projects";
import TiltCard from "@/components/TiltCard";

const DELAYS = ["d2", "d3", "d4"];

// Clicking a card swaps it into an exploded assembly drawing — the same
// language as the workshop's CAD viewer: layers separate in Z, each tagged
// with a numbered callout. Clicking again (or the corner toggle) reassembles.
// Links keep working; clicks on them don't toggle the card.

function ProjectCard({ project, delay }) {
  const [exploded, setExploded] = useState(false);
  const toggle = () => setExploded((v) => !v);

  const onCardClick = (e) => {
    if (e.target.closest("a, button")) return;
    toggle();
  };

  return (
    <TiltCard
      className={`card reveal ${delay}${exploded ? " exploded" : ""}`}
      frozen={exploded}
      onClick={onCardClick}
    >
      <button
        type='button'
        className='x-toggle'
        aria-pressed={exploded}
        aria-label={`Toggle exploded view of ${project.name}`}
        title='Exploded view'
        onClick={toggle}
      >
        {/* mini stack that separates when latched — the icon demos the move */}
        <span aria-hidden='true' className='x-icon'>
          <i />
          <i />
          <i />
        </span>
      </button>
      <div className='stack'>
        <div className='layer' data-part='01 · preview' style={{ "--z": 4 }}>
          <div className='bar'>
            <span />
            <span />
            <span />
          </div>
          <div className='thumb'>
            <span className='status'>{project.status}</span>
            {project.slug}
          </div>
        </div>
        <div className='layer' data-part='02 · title' style={{ "--z": 3 }}>
          <h3>{project.name}</h3>
        </div>
        <div className='layer' data-part='03 · summary' style={{ "--z": 2 }}>
          <p>{project.description}</p>
        </div>
        <div className='layer' data-part='04 · stack' style={{ "--z": 1 }}>
          <div className='tags'>
            {project.tags.map((tag) => (
              <span className='tag' key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className='layer' data-part='05 · links' style={{ "--z": 0 }}>
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
        </div>
      </div>
    </TiltCard>
  );
}

export default function Projects() {
  return (
    <section id='work' className='section-pad'>
      <div className='sec-head reveal d1'>
        <span className='idx'>01</span>
        <h2>Selected work</h2>
        <span className='sec-note'>click a card to explode it</span>
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
