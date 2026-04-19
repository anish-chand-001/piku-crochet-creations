import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, X, ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import { API_URL } from '@/config/api';
import { formatPrice } from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useUserAuth } from "@/contexts/UserAuthContext";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  images?: string[];
}

interface Category {
  _id: string;
  name: string;
}

import ProductDetailModal from "@/components/ProductDetailModal";

// ─── Products Page ────────────────────────────────────────────────────────────

/**
 * Products catalog page with category filtering fetched from API.
 * Showcases all crochet creations dynamically.
 * Clicking a card opens a detail modal with image gallery (Option A).
 */
const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortOption, setSortOption] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const priceRanges = [
    { label: "All Prices", value: "" },
    { label: "₹0 - ₹300", value: "0-300" },
    { label: "₹300 - ₹600", value: "300-600" },
    { label: "₹600 - ₹1000", value: "600-1000" },
    { label: "₹1000+", value: "1000+" }
  ];

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<Category[]>;
    }
  });

  const { data, isLoading: prodsLoading } = useQuery({
    queryKey: ['publicProducts', activeCategory, sortOption, priceRange],
    queryFn: async () => {
      let url = `${API_URL}/products?limit=100`;
      
      if (activeCategory && activeCategory !== "All") {
        url += `&category=${encodeURIComponent(activeCategory)}`;
      }
      
      if (sortOption) {
        url += `&sort=${encodeURIComponent(sortOption)}`;
      }

      if (priceRange) {
        if (priceRange === "0-300") {
          url += `&minPrice=0&maxPrice=300`;
        } else if (priceRange === "300-600") {
          url += `&minPrice=300&maxPrice=600`;
        } else if (priceRange === "600-1000") {
          url += `&minPrice=600&maxPrice=1000`;
        } else if (priceRange === "1000+") {
          url += `&minPrice=1000`;
        }
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const products: Product[] = data?.products || [];
  const catNames = ["All", ...categories.map((c: Category) => c.name)];

  const filteredProducts = products;

  return (
    <main className="min-h-screen pt-24 bg-[#FAFAFA]">
      {/* Header */}
      <section className="px-6 pb-8 pt-12 lg:px-12 bg-white rounded-b-[3rem] shadow-sm mb-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 font-body text-sm font-medium text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <p className="mb-3 font-body text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Our Collection
            </p>
            <h1 className="mb-4 font-display text-5xl font-extrabold text-gray-900 md:text-6xl tracking-tight">
              All <span className="italic font-light text-primary">Creations</span>
            </h1>
            <p className="max-w-xl font-body text-lg text-gray-600 leading-relaxed">
              Browse our complete collection of handmade crochet pieces. Every
              item is made with love, patience, and premium yarn.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Container to restrict sticky filter scope */}
      <div className="relative">
        {/* Filter Section */}
        <section className="sticky top-[72px] z-30 bg-[#FAFAFA]/90 backdrop-blur-xl border-y border-gray-100 shadow-sm">
          <div className="mx-auto flex flex-col max-w-7xl gap-4 px-6 py-4 lg:px-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {catNames.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-full px-6 py-2.5 font-body text-sm font-semibold transition-all duration-300 ${activeCategory === category
                      ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-primary/50 hover:text-primary"
                      }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex-shrink-0">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-white border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-primary focus:border-primary block w-full px-4 py-2.5 outline-none shadow-sm transition-all cursor-pointer font-body font-medium"
                >
                  <option value="">Sort By: Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Popular</option>
                </select>
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-2 border-t border-gray-200/60">
              {priceRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPriceRange(range.value)}
                  className={`shrink-0 rounded-full px-4 py-1.5 font-body text-xs font-medium transition-all duration-300 ${priceRange === range.value
                    ? "bg-gray-800 text-white shadow-md shadow-gray-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 px-6 lg:px-12">
          <div className="mx-auto max-w-7xl">
            {prodsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-gray-500 font-medium">Loading beautiful creations...</p>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {filteredProducts.map((product, i) => (
                      <div
                        key={product._id}
                        onClick={() => setSelectedProduct(product)}
                        className="cursor-pointer"
                      >
                        <ProductCard
                          product={product}
                          image={product.images?.[0] || product.imageUrl}
                          index={i}
                        />
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {filteredProducts.length === 0 && (
                  <div className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                    <p className="font-display text-2xl text-gray-500">
                      No creations found in {activeCategory} yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Order CTA */}
      <section className="pb-24 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="rounded-[2.5rem] bg-gray-900 overflow-hidden relative p-10 text-center shadow-2xl md:p-20">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
              <h3 className="mb-6 font-display text-4xl font-extrabold text-white md:text-5xl tracking-tight relative z-10">
                Love what you see?
              </h3>
              <p className="mx-auto mb-10 max-w-xl font-body text-xl text-gray-300 leading-relaxed relative z-10">
                To place an order, simply reach out via Instagram or email. Every piece starts with a conversation.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </main>
  );
};

export default Products;

