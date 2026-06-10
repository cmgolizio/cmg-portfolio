"use client";

import { heroWords } from "@/lib/themes";
import { useTheme } from "@/components/ThemeProvider";

export default function Hero() {
  const { themeId } = useTheme();

  return (
    <section className='hero'>
      <div className='hero-main'>
        <span className='eyebrow reveal d1'>Christopher Golizio · Builder</span>
        <h1 className='reveal d2'>
          I build things.
          <br />
          <span className='swap'>{heroWords[themeId]}</span>
        </h1>
        <p className='lede reveal d3'>
          Full-stack developer who builds with code, wood, plastic, and circuits
          — and likes when they meet in the middle.
        </p>
        <div className='cta-row reveal d4'>
          <a className='btn primary' href='#work'>
            View the work
          </a>
          <a className='btn ghost' href='#contact'>
            Get in touch
          </a>
        </div>
      </div>

      {/* Only visible in the Technical theme (CSS-controlled). */}
      <aside className='buildlog reveal d3' aria-hidden='true'>
        <div className='line'>
          <span className='ok'>✓</span> next build --portfolio
        </div>
        <div className='line'>
          <span className='ok'>✓</span> compiling components…
        </div>
        <div className='line'>
          <span className='ok'>✓</span> theme-engine: 3 modes
        </div>
        <div className='line'>
          <span className='warn'>●</span> deploy → vercel
        </div>
        <div className='line'>
          {">"} ready <span className='blink' />
        </div>
      </aside>
    </section>
  );
}
