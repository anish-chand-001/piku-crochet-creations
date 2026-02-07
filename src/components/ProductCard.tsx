import { motion } from "framer-motion";
import { formatPrice, Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  image: string;
  index?: number;
}

/**
 * A single product card with hover animations:
 * lift effect, soft glow, and scale transition.
 */
const ProductCard = ({ product, image, index = 0 }: ProductCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-card-hover">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Soft glow overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Category badge */}
          <span className="absolute left-4 top-4 rounded-full bg-card/80 px-3 py-1 font-body text-xs font-medium text-foreground backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="mb-1 font-display text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="mb-3 font-body text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          <p className="font-display text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
