export default function Footer() {
  return (
    <footer className='border-t border-[#D1A954]/20 bg-[#FAF7F2]'>
      <div className='mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-neutral-600 sm:flex-row'>
        <p>© {new Date().getFullYear()} Christopher Golizio</p>
        <p className='italic text-neutral-500'>
          Handcrafted like fine joinery.
        </p>
      </div>
    </footer>
  );
}
