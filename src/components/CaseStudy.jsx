import Link from "next/link";

// Long-form reading page for a single project. Server component — it's pure
// markup that reuses the site's tokens and .reveal animations (ScrollReveals,
// mounted in the root layout, marks these "seen" as they scroll into view).
export default function CaseStudy({ project }) {
  const cs = project.caseStudy;

  return (
    <main className='wrap' id='app'>
      <article className='case section-pad'>
        <Link href='/#work' className='btn ghost case-back'>
          ← Get back to work!
        </Link>

        <header className='case-head reveal'>
          <span className='case-status'>{project.status}</span>
          <h1>{project.name}</h1>
          <p className='case-tagline'>{cs.tagline}</p>
        </header>

        <dl className='case-meta reveal d2'>
          <div>
            <dt>Role</dt>
            <dd>{cs.role}</dd>
          </div>
          <div>
            <dt>Timeline</dt>
            <dd>{cs.timeline}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.tags.join(" · ")}</dd>
          </div>
        </dl>

        <section className='case-block reveal d2'>
          <h2>The problem</h2>
          <p>{cs.problem}</p>
        </section>

        {cs.sections.map((s, i) => (
          <section className='case-block reveal' key={i}>
            <h2>{s.heading}</h2>
            <p>{s.body}</p>
          </section>
        ))}

        <section className='case-block reveal'>
          <h2>Outcome</h2>
          <p>{cs.outcome}</p>
        </section>

        <div className='case-cta reveal'>
          {project.live && (
            <a
              className='btn primary'
              href={project.live}
              target='_blank'
              rel='noopener noreferrer'
            >
              Visit live ↗
            </a>
          )}
          <a
            className='btn ghost'
            href={project.code}
            target='_blank'
            rel='noopener noreferrer'
          >
            View code ↗
          </a>
        </div>
      </article>
    </main>
  );
}
