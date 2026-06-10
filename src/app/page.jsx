import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className='wrap' id='app'>
      <Hero />
      <Projects />
      <Skills />
      <Footer />
    </main>
  );
}
