import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import product1 from "@/assets/Product-1.jpeg";
import product2 from "@/assets/Product-2.jpeg";
import product3 from "@/assets/Product-3.jpeg";
import product4 from "@/assets/Product-4.jpeg";
import product5 from "@/assets/Product-5.jpeg";
import product6 from "@/assets/Product-6.jpeg";
import product7 from "@/assets/Product-7.jpeg";
import product8 from "@/assets/Product-8.jpeg";
import product9 from "@/assets/Product-9.jpeg";
import product10 from "@/assets/Product-10.jpeg";
import product11 from "@/assets/Product-11.jpeg";
import product12 from "@/assets/Product-12.jpeg";

gsap.registerPlugin(ScrollTrigger);

const row1 = [product1, product2, product3, product4, product5, product6, product7, product8];
const row2 = [product9, product10, product11, product12, product1, product2, product3, product4];
const row3 = [product5, product6, product7, product8, product9, product10, product11, product12];

const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  // Parallax zoom on hero background
  useEffect(() => {
    if (!bgRef.current || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#FDF8F2]">
      {/* Background Collage */}
      <div ref={bgRef} className="absolute inset-0 z-0 overflow-hidden will-change-transform">
        <div className="absolute top-1/2 left-1/2 flex w-[150vw] -translate-x-1/2 -translate-y-1/2 -rotate-12 flex-col gap-4 sm:gap-6">
          {/* Row 1 */}
          <div className="flex w-max animate-slide-left gap-4 sm:gap-6">
            {row1.map((src, idx) => (
              <div key={`r1-${idx}`} className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 shrink-0 overflow-hidden rounded-xl shadow-md border-[6px] border-white pointer-events-none">
                <img src={src} className="h-full w-full object-cover" alt="" />
              </div>
            ))}
          </div>
          {/* Row 2 */}
          <div className="flex w-max animate-slide-left gap-4 sm:gap-6" style={{ animationDirection: "reverse" }}>
            {row2.map((src, idx) => (
              <div key={`r2-${idx}`} className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 shrink-0 overflow-hidden rounded-xl shadow-md border-[6px] border-white pointer-events-none">
                <img src={src} className="h-full w-full object-cover" alt="" />
              </div>
            ))}
          </div>
          {/* Row 3 */}
          <div className="flex w-max animate-slide-left gap-4 sm:gap-6">
            {row3.map((src, idx) => (
              <div key={`r3-${idx}`} className="h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80 shrink-0 overflow-hidden rounded-xl shadow-md border-[6px] border-white pointer-events-none">
                <img src={src} className="h-full w-full object-cover" alt="" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-white/10 bg-[radial-gradient(circle_at_center,rgba(253,248,242,0.85)_0%,rgba(253,248,242,0.45)_40%,transparent_100%)] sm:bg-[radial-gradient(ellipse_at_center,rgba(253,248,242,0.85)_0%,rgba(253,248,242,0.45)_30%,rgba(253,248,242,0.15)_60%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 sm:px-6 lg:px-12 mt-12">
        <div className="flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-8 font-display text-5xl font-bold leading-tight text-[#3A2D32] sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight"
          >
            Stitched with
            <br />
            <span className="italic text-[#E87EA1]">soul</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6"
          >
            <Link
              to="/products"
              className="group rounded-full bg-[#E87EA1] px-8 py-4 font-body text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-[#d66a8c] hover:shadow-lg hover:-translate-y-1"
            >
              Explore Creations
            </Link>
            <button
              onClick={scrollToAbout}
              className="rounded-full bg-[#F3EFE9] px-8 py-4 font-body text-sm font-bold uppercase tracking-widest text-[#3A2D32] shadow-sm transition-all duration-300 hover:bg-[#EAE4DC] hover:shadow-md hover:-translate-y-1"
            >
              Our Story
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-[#5C4D53] transition-colors hover:text-[#E87EA1]"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
};

export default Hero;
