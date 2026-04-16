import { Phone, Mail, Instagram, MessageCircle } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { motion } from "framer-motion";

const contactMethods = [
  
  // {
  //   icon: Phone,
  //   label: "Phone",
  //   value: "+91 98765 43210",
  //   href: "tel:+919876543210",
  //   description: "Call us anytime",
  //   colorClass: "bg-yarn-brown-light text-accent-foreground",
  // },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@pikucrochet",
    href: "https://instagram.com/pikucrochet",
    description: "DM us for orders",
    colorClass: "bg-sage-light text-secondary-foreground",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 87993 96601",
    href: "https://wa.me/918799396601",
    description: "Quick chat for orders",
    colorClass: "bg-sage-light text-secondary-foreground",
  },
  {
    icon: Mail,
    label: "Email",
    value: "mehtapalak.crocheter@gmail.com",
    href: "https://mail.google.com/mail/?view=cm&fs=1&to=mehtapalak.crocheter@gmail.com",
    description: "For detailed requests",
    colorClass: "bg-rose-light text-primary",
  },
  
  
];


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

        <div className="grid gap-6 sm:grid-cols-3">
          {contactMethods.map((method, index) => (
            <ScrollReveal key={method.label} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <a
                  href={method.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-5 rounded-2xl bg-background p-6 shadow-soft transition-shadow duration-300 hover:shadow-card-hover w-full h-full"
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
                </a>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Contact;
