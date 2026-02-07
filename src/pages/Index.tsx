import Hero from "@/components/Hero";
import About from "@/components/About";
import FeaturedProducts from "@/components/FeaturedProducts";
import CustomCrochet from "@/components/CustomCrochet";
import Contact from "@/components/Contact";

/**
 * Home page combining all main sections:
 * Hero → About → Featured Products → Custom Crochet → Contact
 */
const Index = () => {
  return (
    <main>
      <Hero />
      <About />
      <FeaturedProducts />
      <CustomCrochet />
      <Contact />
    </main>
  );
};

export default Index;
