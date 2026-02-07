import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { motion } from "framer-motion";

const contactMethods = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 98765 43210",
    href: "https://wa.me/919876543210",
    description: "Quick chat for orders",
    colorClass: "bg-sage-light text-secondary-foreground",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 98765 43210",
    href: "tel:+919876543210",
    description: "Call us anytime",
    colorClass: "bg-yarn-brown-light text-accent-foreground",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@pikucrochet.com",
    href: "mailto:hello@pikucrochet.com",
    description: "For detailed requests",
    colorClass: "bg-rose-light text-primary",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@pikucrochet",
    href: "https://instagram.com/pikucrochet",
    description: "DM us for orders",
    colorClass: "bg-sage-light text-secondary-foreground",
  },
];

/**
 * Contact section with animated card-style layout.
 * All contact info is dummy/placeholder data.
 */
const Contact = () => {
  return (
    <section id="contact" className="section-padding relative overflow-hidden bg-card">
      {/* Decorative shapes */}
      <div className="absolute -left-20 top-20 h-40 w-40 rounded-full bg-rose-light/30 blur-3xl" />
      <div className="absolute -right-20 bottom-20 h-56 w-56 rounded-full bg-sage-light/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <ScrollReveal>
          <p className="mb-3 text-center font-body text-sm font-medium uppercase tracking-[0.3em] text-primary">
            Get in Touch
          </p>
          <h2 className="mb-4 text-center font-display text-4xl font-bold text-foreground md:text-5xl">
            Every piece starts with
            <br />
            <span className="italic text-primary">a conversation</span>
          </h2>
          <p className="mx-auto mb-16 max-w-lg text-center font-body text-lg text-muted-foreground">
            To place an order, just reach out. We'd love to hear from you and
            create something special together.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {contactMethods.map((method, index) => (
            <ScrollReveal key={method.label} delay={index * 0.1}>
              <motion.a
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group flex items-start gap-5 rounded-2xl bg-background p-6 shadow-soft transition-shadow duration-300 hover:shadow-card-hover"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${method.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                  <method.icon size={24} />
                </div>
                <div>
                  <p className="font-body text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {method.description}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                    {method.label}
                  </h3>
                  <p className="mt-1 font-body text-sm text-primary">
                    {method.value}
                  </p>
                </div>
              </motion.a>
            </ScrollReveal>
          ))}
        </div>

        {/* Note about dummy data */}
        <p className="mt-8 text-center font-body text-xs text-muted-foreground/60">
          * Contact information shown is placeholder data for demonstration purposes
        </p>
      </div>
    </section>
  );
};

export default Contact;
