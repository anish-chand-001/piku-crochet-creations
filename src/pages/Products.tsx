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

// ─── Product Detail Modal ────────────────────────────────────────────────────

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

const ProductDetailModal = ({ product, onClose }: ProductDetailModalProps) => {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const [activeIdx, setActiveIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const { addToCart, isAdding } = useCart();
  const { isAuthenticated } = useUserAuth();

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIdx((i) => (i + 1) % images.length);
  const swipeThreshold = 50;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!swipeStartRef.current || images.length <= 1) return;

    const deltaX = e.clientX - swipeStartRef.current.x;
    const deltaY = e.clientY - swipeStartRef.current.y;
    swipeStartRef.current = null;

    if (Math.abs(deltaX) < swipeThreshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    if (deltaX < 0) {
      next();
      return;
    }

    prev();
  };

  const resetSwipe = () => {
    swipeStartRef.current = null;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    addToCart(
      { productId: product._id, quantity }
    );
  };

  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(q => q + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
            {/* ── Image Viewer ──────────────────────────────────────────── */}
            <div className="md:w-1/2 bg-gray-50 flex flex-col flex-shrink-0">
              {/* Main image */}
              <div
                className="relative flex-1 min-h-[240px] md:min-h-0 overflow-hidden"
                style={{ touchAction: "pan-y" }}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={resetSwipe}
                onPointerLeave={resetSwipe}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeIdx}
                    src={images[activeIdx]}
                    alt={`${product.name} ${activeIdx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22 }}
                  />
                </AnimatePresence>

                {/* Prev / Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white hover:scale-110 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image counter dot */}
                {images.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIdx ? "bg-white scale-125" : "bg-white/50"
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-white border-t border-gray-100">
                  {images.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIdx(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeIdx
                        ? "border-primary shadow-md scale-105"
                        : "border-transparent opacity-60 hover:opacity-90"
                        }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Details ────────────────────────────────────────── */}
            <div className="md:w-1/2 flex flex-col p-6 overflow-y-auto">
              <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">
                {product.category}
              </span>
              <h2 className="font-display text-2xl font-bold text-gray-900 leading-tight mb-3">
                {product.name}
              </h2>
              <p className="font-display text-3xl font-extrabold text-primary mb-6">
                {formatPrice(product.price)}
              </p>

              <div className="flex-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Description
                </h3>
                <p className="font-body text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {images.length > 1 && (
                <p className="mt-4 text-xs text-gray-400">
                  {images.length} photos available
                </p>
              )}

              {/* Quantity Selector */}
              <div className="mt-6 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                  Quantity
                </label>
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 w-fit">
                  <button
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || isAdding}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display text-lg font-bold text-gray-900 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    disabled={quantity >= 10 || isAdding}
                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>
                <a
                  href="https://wa.me/8799396601"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center rounded-full border-2 border-gray-200 px-8 py-3.5 font-body text-sm font-bold uppercase tracking-widest text-gray-700 transition-all duration-300 hover:border-primary hover:text-primary hover:-translate-y-0.5"
                >
                  Order via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Products Page ────────────────────────────────────────────────────────────

/**
 * Products catalog page with category filtering fetched from API.
 * Showcases all crochet creations dynamically.
 * Clicking a card opens a detail modal with image gallery (Option A).
 */
const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['publicCategories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json() as Promise<Category[]>;
    }
  });

  const { data, isLoading: prodsLoading } = useQuery({
    queryKey: ['publicProducts'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products?limit=100`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const products: Product[] = data?.products || [];
  const catNames = ["All", ...categories.map((c: Category) => c.name)];

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

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
        {/* Category Filter */}
        <section className="sticky top-[72px] z-30 bg-[#FAFAFA]/90 backdrop-blur-xl border-y border-gray-100 shadow-sm">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 py-4 lg:px-12 scrollbar-hide">
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
                To place an order, simply reach out via WhatsApp, Instagram, or email. Every piece starts with a conversation.
              </p>
              <a
                href="https://wa.me/8799396601"
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center rounded-full bg-primary px-12 py-5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40"
              >
                Order via WhatsApp
              </a>
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
