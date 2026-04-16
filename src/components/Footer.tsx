import { Link } from "react-router-dom";
import { Heart, Instagram, Mail } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      {/* Gradient pink fade background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      <div className="yarn-divider w-full" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-12">
        <ScrollReveal>
          <div className="grid gap-12 md:grid-cols-3">
            {/* Brand */}
            <div>
              <Link to="/" className="group inline-block">
                <span className="font-display text-2xl font-bold text-foreground">
                  Piku
                </span>
                <span className="ml-1 font-display text-lg font-light italic text-muted-foreground">
                  Crochet
                </span>
              </Link>
              <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
                Handmade with love, stitched with soul. Every piece is a tiny
                masterpiece crafted to bring warmth and joy.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Explore
              </h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">Home</Link>
                <Link to="/products" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">All Creations</Link>
                <a href="/#about" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">Our Story</a>
                <a href="/#custom" className="font-body text-sm text-muted-foreground transition-colors hover:text-primary">Custom Orders</a>
              </nav>
            </div>

            {/* Social */}
            <div>
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Connect
              </h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/pikucrochet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=mehtapalak.crocheter@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-110"
                  aria-label="Email"
                >
                  <Mail size={18} />
                </a>
              </div>
              <p className="mt-4 font-body text-sm text-muted-foreground">
                anishchand9984@gmail.com
              </p>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-8 text-center">
          <p className="flex items-center gap-1 font-body text-xs text-muted-foreground">
            Made with <Heart size={12} className="text-primary" /> by Piku Crochet
          </p>
          <p className="font-body text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Piku Crochet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
