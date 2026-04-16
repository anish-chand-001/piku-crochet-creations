import { motion } from "framer-motion";
import { useCardTilt } from "@/hooks/useCardTilt";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useUserAuth } from "@/contexts/UserAuthContext";

export interface Product {
  _id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
  images?: string[];
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

interface ProductCardProps {
  product: Product;
  image: string;
  index?: number;
}

/**
 * Product card with 3D tilt on hover, parallax motion, and soft glow.
 */
const ProductCard = ({ product, image, index = 0 }: ProductCardProps) => {
  const { ref, onMouseMove, onMouseLeave } = useCardTilt(6);
  const { addToCart, isAdding } = useCart();
  const { isAuthenticated } = useUserAuth();
  const [showCartFeedback, setShowCartFeedback] = useState(false);

  const handleQuickAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    // Show feedback immediately
    setShowCartFeedback(true);
    setTimeout(() => setShowCartFeedback(false), 2000);

    addToCart(
      { productId: product._id || '', quantity: 1 }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="group cursor-pointer h-full"
    >
      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-500 group-hover:shadow-card-hover h-full flex flex-col"
        style={{ transition: "transform 0.15s ease-out, box-shadow 0.5s ease" }}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden shrink-0">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <span className="absolute left-4 top-4 rounded-full bg-card/80 px-3 py-1 font-body text-xs font-medium text-foreground backdrop-blur-sm shadow-sm">
            {product.category}
          </span>

          {/* Quick add button on hover */}
          <motion.button
            onClick={handleQuickAddToCart}
            disabled={isAdding}
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-primary shadow-lg text-white flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-60"
          >
            {isAdding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </motion.button>

          {/* Add to cart success feedback */}
          {showCartFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 bg-green-600/90 flex items-center justify-center text-white font-bold"
            >
              ✓ Added to cart
            </motion.div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="mb-2 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary leading-tight">
            {product.name}
          </h3>
          <p className="mb-4 font-body text-sm leading-relaxed text-muted-foreground line-clamp-2 flex-1">
            {product.description}
          </p>
          <p className="font-display text-xl font-bold text-primary mt-auto">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </motion.div >
  );
};

export default ProductCard;
