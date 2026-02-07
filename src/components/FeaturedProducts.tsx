import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";

// Product image imports
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

const productImages: Record<string, string> = {
  "1": product1,
  "2": product2,
  "3": product3,
  "4": product4,
  "5": product5,
  "6": product6,
};

/**
 * Featured products grid on the homepage.
 * Shows 6 featured items with a CTA to the full catalog.
 */
const FeaturedProducts = () => {
  const featuredItems = products.filter((p) => p.featured).slice(0, 6);

  return (
    <section className="section-padding relative overflow-hidden bg-card">
      {/* Decorative elements */}
      <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-rose-light/20 blur-3xl" />
      <div className="absolute -left-20 bottom-1/4 h-64 w-64 rounded-full bg-sage-light/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <ScrollReveal>
          <p className="mb-3 text-center font-body text-sm font-medium uppercase tracking-[0.3em] text-primary">
            Our Creations
          </p>
          <h2 className="mb-4 text-center font-display text-4xl font-bold text-foreground md:text-5xl">
            Handpicked with <span className="italic text-primary">care</span>
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center font-body text-lg text-muted-foreground">
            Each piece is a labor of love, made one stitch at a time.
          </p>
        </ScrollReveal>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredItems.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              image={productImages[product.id]}
              index={i}
            />
          ))}
        </div>

        {/* CTA */}
        <ScrollReveal>
          <div className="mt-16 text-center">
            <Link
              to="/products"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-10 py-4 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-card-hover"
            >
              View All Creations
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default FeaturedProducts;
