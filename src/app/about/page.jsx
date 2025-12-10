import AboutBlueprint from "@/components/about/AboutBlueprint";

export const metadata = {
  title: "Blueprint — About Me | Christopher Golizio",
};

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-4xl px-4 py-10'>
      {/* <header>
        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A954]'>
          Blueprint Table
        </p>
        <h1 className='mt-2 text-3xl font-semibold text-[#1A1A1A]'>
          About Christopher
        </h1>
        <p className='mt-2 max-w-2xl text-sm text-neutral-700'>
          A developer and woodworker who builds things with intention — digital
          or physical. I focus on clarity, craftsmanship, and experiences that
          feel solid and well-made.
        </p>
      </header> */}
      <header>
        <p className='text-xs font-semibold uppercase tracking-[0.25em] text-[#D1A954]'>
          Blueprint Table
        </p>
        <h1 className='mt-2 text-3xl font-semibold text-[#1A1A1A]'>
          About Christopher
        </h1>
        <p className='mt-2 max-w-2xl text-sm text-neutral-700'>
          A developer and woodworker who builds with intention. This blueprint
          outlines the tools, skills, and principles that shape my work.
        </p>
      </header>

      <AboutBlueprint />
    </div>
  );
}
