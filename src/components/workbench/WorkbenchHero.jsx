import Link from "next/link";

export default function WorkbenchHero() {
  return (
    <section className='rounded-3xl border border-[#D1A954]/30 bg-gradient-to-br from-[#FAF7F2] via-[#EAD8C9]/60 to-[#FAF7F2] px-6 py-10 shadow-sm'>
      <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A954]'>
        Digital Woodshop
      </p>
      <h1 className='mt-3 text-3xl font-semibold text-[#1A1A1A] sm:text-4xl'>
        I build interfaces like finely crafted joinery.
      </h1>
      <p className='mt-3 max-w-xl text-sm text-neutral-700'>
        I’m Christopher Golizio, a web developer and woodworker. I design and
        ship fast, clean experiences — the kind that feel solid, intentional,
        and built to last.
      </p>
      <div className='mt-6 flex flex-wrap gap-3 text-sm'>
        <Link
          href='/projects'
          className='rounded-full bg-[#5A3E2B] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#FAF7F2] shadow-sm transition hover:bg-[#4A301F]'
        >
          Explore the Tool Rack
        </Link>
        <Link
          href='/about'
          className='rounded-full border border-[#D1A954]/60 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#5A3E2B] hover:bg-[#EAD8C9]/60'
        >
          Open the Blueprint
        </Link>
      </div>
    </section>
  );
}
