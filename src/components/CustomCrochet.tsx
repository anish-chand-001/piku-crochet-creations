import { Lightbulb, PenTool, Hand, Heart } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Lightbulb,
    title: "Share Your Idea",
    description: "Tell us what you dream of — a special gift, a unique plushie, a bouquet that lasts forever.",
    color: "bg-rose-light text-primary",
  },
  {
    icon: PenTool,
    title: "Approve the Design",
    description: "We sketch and plan your creation, choosing the perfect colors and details together.",
    color: "bg-sage-light text-secondary-foreground",
  },
  {
    icon: Hand,
    title: "Handmade Creation",
    description: "Stitch by stitch, your custom piece comes to life with premium yarn and careful craftsmanship.",
    color: "bg-yarn-brown-light text-accent-foreground",
  },
  {
    icon: Heart,
    title: "Delivered with Love",
    description: "Your one-of-a-kind creation arrives beautifully wrapped and ready to be treasured.",
    color: "bg-rose-light text-primary",
  },
];

/**
 * Custom crochet order section with animated step cards
 * and a yarn-line connecting the steps.
 */
const CustomCrochet = () => {
  return (
    <section id="custom" className="section-padding relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-border to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <ScrollReveal>
          <p className="mb-3 text-center font-body text-sm font-medium uppercase tracking-[0.3em] text-primary">
            Custom Orders
          </p>
          <h2 className="mb-4 text-center font-display text-4xl font-bold text-foreground md:text-5xl">
            Have something in mind?
          </h2>
          <p className="mx-auto mb-20 max-w-lg text-center font-display text-2xl italic text-primary">
            Let's crochet your idea.
          </p>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <ScrollReveal key={step.title} delay={index * 0.15}>
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-2xl bg-card p-8 shadow-soft transition-shadow duration-300 hover:shadow-card-hover"
              >
                {/* Step number */}
                <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 font-body text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>

                {/* Icon */}
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${step.color} transition-transform duration-300 group-hover:scale-110`}>
                  <step.icon size={28} />
                </div>

                <h3 className="mb-3 font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Yarn divider */}
        <div className="yarn-divider mx-auto mt-20 w-3/4" />
      </div>
    </section>
  );
};

export default CustomCrochet;
