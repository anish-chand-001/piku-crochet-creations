import ScrollReveal from "./ScrollReveal";
import aboutImage from "@/assets/about-craft.jpg";

/**
 * About section with editorial storytelling layout,
 * animated yarn divider, and craftsmanship imagery.
 */
const About = () => {
  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-rose-light/30 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-48 w-48 rounded-full bg-sage-light/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <ScrollReveal>
          <p className="mb-3 text-center font-body text-sm font-medium uppercase tracking-[0.3em] text-primary">
            Our Story
          </p>
          <h2 className="mb-16 text-center font-display text-4xl font-bold text-foreground md:text-5xl">
            Made by hand,
            <br />
            <span className="italic text-primary">meant for the heart</span>
          </h2>
        </ScrollReveal>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="organic-shape overflow-hidden shadow-card">
                <img
                  src={aboutImage}
                  alt="Hands crocheting with warm yarn"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-sage/30 blur-xl" />
            </div>
          </ScrollReveal>

          {/* Text Content */}
          <div className="space-y-6">
            <ScrollReveal delay={0.1}>
              <p className="font-body text-lg leading-relaxed text-foreground/80">
                {/* At <span className="font-semibold text-primary">Piku Crochet</span>, */}
                It all started right after 12th, during a simple day of cleaning at home.
                In an old drawer, I found something unfamiliar—a crochet hook wrapped in yarn.
                Curious, I decided to try it out, even though it wasn’t easy at first.
                The hook was too small, the yarn didn’t cooperate, and nothing went as planned.
                But instead of giving up, I learned, adjusted, and eventually created my very
                first piece—simple, in blue and yellow, but deeply meaningful because it marked the beginning.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p className="font-body text-lg leading-relaxed text-foreground/80">
                What began as a small moment of curiosity soon turned into a genuine passion.
                Today, I create and sell handcrafted crochet pieces, with a special focus on
                customization—bringing unique ideas to life instead of repeating the same designs.
                From that unexpected discovery in a drawer to building this brand, the journey has
                been all about creativity, learning, and growth—and it’s only just getting started.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="yarn-divider my-8 w-full" />
            </ScrollReveal>

            <ScrollReveal delay={0.35}>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="font-display text-3xl font-bold text-primary">100%</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Handmade</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">50+</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Creations</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">♡</p>
                  <p className="mt-1 font-body text-sm text-muted-foreground">Made with Love</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
