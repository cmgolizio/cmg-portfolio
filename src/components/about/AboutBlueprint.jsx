export default function AboutBlueprint() {
  return (
    <section className='mt-10 rounded-3xl border border-[#1C3D5A]/30 bg-[#1C3D5A]/5 p-6 backdrop-blur-sm'>
      <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-[#1C3D5A]'>
        Skills & Capabilities
      </h2>

      <div className='mt-4 grid gap-6 sm:grid-cols-2'>
        <div>
          <h3 className='text-sm font-semibold text-[#1A1A1A]'>Frontend</h3>
          <ul className='mt-1 space-y-1 text-sm text-neutral-700'>
            <li>Next.js (App Router)</li>
            <li>React</li>
            <li>Tailwind CSS</li>
            <li>Animations (Framer Motion)</li>
            <li>Responsive systems</li>
          </ul>
        </div>

        <div>
          <h3 className='text-sm font-semibold text-[#1A1A1A]'>Backend</h3>
          <ul className='mt-1 space-y-1 text-sm text-neutral-700'>
            <li>Supabase / Postgres</li>
            <li>Firebase</li>
            <li>Authentication</li>
            <li>REST + API design</li>
          </ul>
        </div>

        <div>
          <h3 className='text-sm font-semibold text-[#1A1A1A]'>AI / Tools</h3>
          <ul className='mt-1 space-y-1 text-sm text-neutral-700'>
            <li>OpenAI API</li>
            <li>Embeddings & scoring logic</li>
            <li>Image pipelines</li>
          </ul>
        </div>

        <div>
          <h3 className='text-sm font-semibold text-[#1A1A1A]'>Woodworking</h3>
          <ul className='mt-1 space-y-1 text-sm text-neutral-700'>
            <li>Furniture building</li>
            <li>Joinery techniques</li>
            <li>Tool usage & maintenance</li>
            <li>Shop workflow design</li>
          </ul>
        </div>
      </div>

      <div className='mt-10'>
        <h2 className='text-xs font-semibold uppercase tracking-[0.18em] text-[#1C3D5A]'>
          My Philosophy
        </h2>
        <p className='mt-2 max-w-xl text-sm leading-relaxed text-neutral-700'>
          Whether writing code or shaping wood, I believe in clarity, precision,
          and building things that someone will want to use every day. Problems
          are puzzles, constraints are opportunities, and craftsmanship matters
          as much in software as it does in a workshop.
        </p>
      </div>
    </section>
  );
}
