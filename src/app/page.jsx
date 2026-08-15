import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Workshop from "@/components/workshop/Workshop";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SectionSnap from "@/components/SectionSnap";

// The home page is a deck of full-viewport panels — one section on screen at a
// time. `.panels` replaces the old `.wrap` container: each `.panel` now owns
// the measure and gutters itself, so a panel can opt out (`.panel-bleed`) and
// run the full width of the screen. SectionSnap adds the magnetism without
// ever touching the scroll itself.
export default function Home() {
  return (
    <main className='panels' id='app'>
      <Hero />
      <Skills />
      <Projects />
      <Workshop />
      <Contact />
      <Footer />
      <SectionSnap />
    </main>
  );
}
