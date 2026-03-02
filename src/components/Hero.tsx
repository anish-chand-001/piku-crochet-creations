import { Suspense, lazy, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import heroBg from "@/assets/hero-bg.jpg";

gsap.registerPlugin(ScrollTrigger);

const YarnBall = lazy(() => import("./YarnBall"));

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
    <section ref={sectionRef} className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Parallax background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
      </div>

      {/* Floating decorative elements */}
      <div className="float-on-scroll absolute left-[10%] top-[20%] h-16 w-16 rounded-full bg-primary/10 blur-xl" />
      <div className="float-on-scroll absolute right-[15%] top-[60%] h-24 w-24 rounded-full bg-accent/10 blur-xl" />
      <div className="float-on-scroll absolute left-[60%] top-[15%] h-12 w-12 rounded-full bg-rose/15 blur-lg" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 lg:flex-row lg:gap-16 lg:px-12">
        <div className="flex-1 text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-4 font-body text-sm font-medium uppercase tracking-[0.3em] text-primary"
          >
            Handcrafted with love
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-6 font-display text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl"
          >
            Stitched with
            <br />
            <span className="italic text-primary">soul</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mb-10 max-w-lg font-body text-lg leading-relaxed text-muted-foreground lg:text-xl"
          >
            Every stitch tells a story. Discover handmade crochet creations
            crafted with premium yarn and endless patience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 lg:justify-start"
          >
            <Link
              to="/products"
              className="group rounded-full bg-primary px-8 py-4 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-all duration-300 hover:shadow-card-hover hover:scale-105 hover:-translate-y-1"
            >
              Explore Creations
            </Link>
            <button
              onClick={scrollToAbout}
              className="rounded-full border border-border bg-card/50 px-8 py-4 font-body text-sm font-semibold uppercase tracking-wider text-foreground backdrop-blur-sm transition-all duration-300 hover:bg-card hover:shadow-soft hover:-translate-y-1"
            >
              Our Story
            </button>
          </motion.div>
        </div>

        {/* 3D Yarn Ball */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
          className="h-[350px] w-[350px] md:h-[450px] md:w-[450px] lg:h-[500px] lg:w-[500px]"
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 2]}
            style={{ background: "transparent" }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} color="#fce4ec" />
            <pointLight position={[-5, -5, 5]} intensity={0.4} color="#f8bbd0" />
            <Suspense fallback={null}>
              <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
                <YarnBall />
              </Float>
              <Environment preset="studio" />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>
        </motion.div>
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
