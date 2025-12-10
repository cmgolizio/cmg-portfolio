export const metadata = {
  title: "Cut Sheet — Resume | Christopher Golizio",
};

export default function ResumePage() {
  return (
    <div className='mx-auto max-w-xl px-4 py-12'>
      <header className='mb-6'>
        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A954]'>
          Cut Sheet
        </p>
        <h1 className='mt-2 text-3xl font-semibold text-[#1A1A1A]'>Resume</h1>
        <p className='mt-2 text-sm text-neutral-700'>
          A concise overview of my work history, skills, and impact.
          Downloadable PDF available below.
        </p>
      </header>

      <div className='rounded-2xl border border-[#D1A1A1]/30 bg-[#FAF7F2] p-6'>
        <a
          href='/resume.pdf'
          target='_blank'
          className='block w-full rounded-full bg-[#5A3E2B] px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF7F2] shadow transition hover:bg-[#4A301F]'
        >
          Download Resume (PDF)
        </a>
      </div>
    </div>
  );
}
