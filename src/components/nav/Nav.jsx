import Link from "next/link";

const links = [
  { href: "/", label: "Workbench" },
  { href: "/projects", label: "Tool Rack" },
  { href: "/about", label: "Blueprint" },
  { href: "/contact", label: "Branding" },
  { href: "/resume", label: "Cut Sheet" },
];

export default function Nav() {
  return (
    <header className='border-b border-[#D1A954]/30 bg-[#FAF7F2]/90 backdrop-blur'>
      <div className='mx-auto flex max-w-5xl items-center justify-between px-4 py-3'>
        <Link href='/' className='font-semibold tracking-tight'>
          <span className='text-sm uppercase text-[#D1A954]'>Workshop of</span>
          <br />
          <span className='text-lg'>Christopher Golizio</span>
        </Link>
        <nav className='flex items-center gap-4 text-sm'>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#5A3E2B] transition hover:bg-[#EAD8C9] hover:text-[#1A1A1A]'
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
