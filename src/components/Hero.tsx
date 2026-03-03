import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroVideo from "@/assets/hero-video.mp4";

gsap.registerPlugin(ScrollTrigger);

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
    <section ref={sectionRef} className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      {/* Video background */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover object-center md:object-center"
          style={{ objectPosition: "center 70%" }}
          src={heroVideo}
        />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
      </div>

      {/* Floating decorative elements */}
      <div className="float-on-scroll absolute left-[10%] top-[20%] h-16 w-16 rounded-full bg-primary/10 blur-xl" />
      <div className="float-on-scroll absolute right-[15%] top-[60%] h-24 w-24 rounded-full bg-accent/10 blur-xl" />
      <div className="float-on-scroll absolute left-[60%] top-[15%] h-12 w-12 rounded-full bg-rose/15 blur-lg" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 sm:px-6 lg:flex-row lg:gap-16 lg:px-12">
        <div className="flex-1 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-3 font-body text-xs font-medium uppercase tracking-[0.3em] text-primary sm:mb-4 sm:text-sm"
          >
            Handcrafted with love
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Stitched with
            <br />
            <span className="italic text-primary">soul</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-8 max-w-lg font-body text-base leading-relaxed text-muted-foreground sm:mb-10 sm:text-lg lg:text-xl"
          >
            Every stitch tells a story. Discover handmade crochet creations
            crafted with premium yarn and endless patience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:justify-start"
          >
            <Link
              to="/products"
              className="group rounded-full bg-primary px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-all duration-300 hover:shadow-card-hover hover:scale-105 hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-sm"
            >
              Explore Creations
            </Link>
            <button
              onClick={scrollToAbout}
              className="rounded-full border border-border bg-card/50 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-card hover:shadow-soft hover:-translate-y-1 sm:px-8 sm:py-4 sm:text-sm"
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
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float text-muted-foreground transition-colors hover:text-primary"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
};

export default Hero;
