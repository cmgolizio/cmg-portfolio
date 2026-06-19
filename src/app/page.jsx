import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Workshop from "@/components/workshop/Workshop";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className='wrap' id='app'>
      <Hero />
      <Skills />
      <Projects />
      <Workshop />
      <Contact />
      <Footer />
    </main>
  );
}
