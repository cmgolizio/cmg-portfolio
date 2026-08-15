"use client";

import { useTheme } from "@/components/ThemeProvider";
import HeroAssemble from "@/components/HeroAssemble";
import HeroWord from "@/components/HeroWord";
import Magnetic from "@/components/Magnetic";
import { RESUME_OPEN_EVENT } from "@/data/resume";

export default function Hero() {
  const { themeId } = useTheme();

  const openResume = () => window.dispatchEvent(new Event(RESUME_OPEN_EVENT));

  return (
    <section className='panel hero' id='top'>
      <div className='hero-main'>
        <span className='eyebrow reveal d1'>Christopher Golizio · Builder</span>
        {/* HeroAssemble owns the h1 entrance; .reveal is not needed here.
            Both HeroAssemble and HeroWord are keyed by themeId so they
            remount and replay on every theme switch. */}
        <h1>
          <HeroAssemble key={themeId} themeId={themeId} />
          <br />
          <HeroWord themeId={themeId} />
        </h1>
        <p className='lede reveal d3'>
          Fullstack developer + builder of things. Happy creating with code,
          wood, plastic, and electricity, happiest when they play together.
        </p>
        <div className='cta-row reveal d4'>
          <Magnetic>
            <a className='btn primary' href='#work'>
              View my work
            </a>
          </Magnetic>
          <Magnetic>
            <a className='btn ghost' href='#contact'>
              Get in touch
            </a>
          </Magnetic>
          <Magnetic>
            <button className='btn ghost' type='button' onClick={openResume}>
              Resume
            </button>
          </Magnetic>
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
