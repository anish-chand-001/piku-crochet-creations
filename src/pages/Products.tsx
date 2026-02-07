import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";

// Import all product images
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";
import product8 from "@/assets/product-8.jpg";
import product9 from "@/assets/product-9.jpg";
import product10 from "@/assets/product-10.jpg";
import product11 from "@/assets/product-11.jpg";
import product12 from "@/assets/product-12.jpg";

const productImages: Record<string, string> = {
  "1": product1,
  "2": product2,
  "3": product3,
  "4": product4,
  "5": product5,
  "6": product6,
  "7": product7,
  "8": product8,
  "9": product9,
  "10": product10,
  "11": product11,
  "12": product12,
};

/**
 * Products catalog page with category filtering.
 * Showcases all crochet creations in a beautiful grid.
 */
const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <main className="min-h-screen pt-24">
      {/* Header */}
      <section className="px-6 pb-8 pt-12 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 font-body text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <p className="mb-3 font-body text-sm font-medium uppercase tracking-[0.3em] text-primary">
              Our Collection
            </p>
            <h1 className="mb-4 font-display text-5xl font-bold text-foreground md:text-6xl">
              All <span className="italic text-primary">Creations</span>
            </h1>
            <p className="max-w-xl font-body text-lg text-muted-foreground">
              Browse our complete collection of handmade crochet pieces. Every
              item is made with love, patience, and premium yarn.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-[72px] z-30 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 py-4 lg:px-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-5 py-2 font-body text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="section-padding">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  image={productImages[product.id]}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <p className="font-display text-2xl text-muted-foreground">
                No creations found in this category yet.
              </p>
            </div>
          )}

          {/* Order CTA */}
          <ScrollReveal>
            <div className="mt-20 rounded-2xl bg-card p-10 text-center shadow-soft md:p-16">
              <h3 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
                Love what you see?
              </h3>
              <p className="mx-auto mb-8 max-w-md font-body text-lg text-muted-foreground">
                To place an order, simply reach out via WhatsApp, Instagram, or email. Every piece starts with a conversation.
              </p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-primary px-10 py-4 font-body text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-card-hover"
              >
                Order via WhatsApp
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
};

export default Products;
