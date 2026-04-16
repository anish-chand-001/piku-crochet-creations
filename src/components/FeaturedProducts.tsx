import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductCard from "./ProductCard";
import ScrollReveal from "./ScrollReveal";
import { API_URL } from '@/config/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
}

/**
 * Featured products grid on the homepage.
 * Shows exactly the images from the backend products.
 */
const FeaturedProducts = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products?limit=6`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const featuredItems: Product[] = data?.products || [];

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
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : featuredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((product, i) => (
              <ProductCard
                key={product._id}
                product={product}
                image={product.imageUrl}
                index={i}
              />
            ))}
          </div>
        )}

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
