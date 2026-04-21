import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Loader2, Star } from "lucide-react";
import { formatPrice } from "@/components/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { API_URL } from "@/config/api";

export interface Product {
    _id?: string;
    name: string;
    price: number;
    description: string;
    category: string;
    imageUrl?: string;
    images?: string[];
    averageRating?: number;
    reviewCount?: number;
}

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
    
    // Reviews state
    const [reviews, setReviews] = useState<any[]>([]);
    const [isEligible, setIsEligible] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isLoadingReviews, setIsLoadingReviews] = useState(true);
    
    // Edit Review state
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");
    const [isEditingSubmit, setIsEditingSubmit] = useState(false);

    const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
    const { addToCart, isAdding } = useCart();
    const { isAuthenticated, user } = useUserAuth();

    useEffect(() => {
        if (!product._id) return;
        
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_URL}/reviews/${product._id}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                }
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            } finally {
                setIsLoadingReviews(false);
            }
        };
        fetchReviews();

        if (isAuthenticated) {
            const checkEligibility = async () => {
                try {
                    const res = await fetch(`${API_URL}/reviews/eligibility/${product._id}`, { credentials: "include" });
                    if (res.ok) {
                        const data = await res.json();
                        // Also verify there's no review by this user already fetched? 
                        // Eligibility endpoint handles hasReviewed constraint directly
                        setIsEligible(data.eligible);
                    }
                } catch (err) {
                    console.error("Failed to check eligibility", err);
                }
            };
            checkEligibility();
        }
    }, [product._id, isAuthenticated]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product._id) return;
        setIsSubmittingReview(true);
        try {
            const res = await fetch(`${API_URL}/reviews/${product._id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                credentials: "include",
                body: JSON.stringify({ rating, comment })
            });
            if (res.ok) {
                const data = await res.json();
                setReviews([data.review, ...reviews]);
                setIsEligible(false);
                setComment("");
            } else {
                console.error("Submit review failed", await res.text());
            }
        } catch (err) {
            console.error("Failed to submit review", err);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const submitEditReview = async (e: React.FormEvent, reviewId: string) => {
        e.preventDefault();
        setIsEditingSubmit(true);
        try {
            const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                credentials: "include",
                body: JSON.stringify({ rating: editRating, comment: editComment })
            });
            if (res.ok) {
                const data = await res.json();
                setReviews(reviews.map(r => r._id === reviewId ? data.review : r));
                setEditingReviewId(null);
            } else {
                console.error("Edit review failed", await res.text());
            }
        } catch (err) {
            console.error("Failed to edit review", err);
        } finally {
            setIsEditingSubmit(false);
        }
    };

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
            { productId: product._id || '', quantity }
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
                    onWheel={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
                        aria-label="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
                        <div className="md:w-1/2 bg-gray-50 flex flex-col flex-shrink-0">
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

                        <div className="md:w-1/2 flex flex-col p-6 overflow-y-auto overscroll-contain">
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
                            </div>

                            {/* Reviews Section */}
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    Customer Reviews
                                    {product.reviewCount && product.reviewCount > 0 && (
                                        <span className="text-sm font-normal text-gray-500">
                                            ({product.reviewCount})
                                        </span>
                                    )}
                                </h3>

                                {isEligible && (
                                    <form onSubmit={submitReview} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-sm font-bold text-gray-800 mb-3">Write a Review</h4>
                                        <div className="flex gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className={`hover:scale-110 transition-transform py-1 px-0.5 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                                                >
                                                    <Star className="w-6 h-6 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Tell us what you think... (optional)"
                                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3 resize-none"
                                            rows={3}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                                        >
                                            {isSubmittingReview ? "Submitting..." : "Submit Review"}
                                        </button>
                                    </form>
                                )}

                                {isLoadingReviews ? (
                                    <div className="flex justify-center py-6">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                ) : reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review: any) => (
                                            <div key={review._id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                                                {editingReviewId === review._id ? (
                                                    <form onSubmit={(e) => submitEditReview(e, review._id)} className="w-full">
                                                        <h4 className="text-sm font-bold text-gray-800 mb-3">Edit Review</h4>
                                                        <div className="flex gap-1 mb-3">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setEditRating(star)}
                                                                    className={`hover:scale-110 transition-transform py-1 px-0.5 ${star <= editRating ? "text-yellow-400" : "text-gray-300"}`}
                                                                >
                                                                    <Star className="w-6 h-6 fill-current" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <textarea
                                                            value={editComment}
                                                            onChange={(e) => setEditComment(e.target.value)}
                                                            className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary mb-3 resize-none"
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="submit"
                                                                disabled={isEditingSubmit}
                                                                className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                                                            >
                                                                {isEditingSubmit ? "Saving..." : "Save"}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingReviewId(null)}
                                                                disabled={isEditingSubmit}
                                                                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="font-semibold text-sm text-gray-900 capitalize">
                                                                {review.userId?.name || "Anonymous User"}
                                                            </div>
                                                            <div className="flex gap-0.5 text-yellow-400">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-200"}`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {review.comment && (
                                                            <p className="text-sm text-gray-600 leading-relaxed mt-1">
                                                                {review.comment}
                                                            </p>
                                                        )}
                                                        <div className="mt-3 flex justify-between items-center">
                                                            <div className="text-[11px] text-gray-400 uppercase tracking-wider">
                                                                {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                            {user?.userId === review.userId?._id && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingReviewId(review._id);
                                                                        setEditRating(review.rating);
                                                                        setEditComment(review.comment || "");
                                                                    }}
                                                                    className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                                                                >
                                                                    Edit
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                                        No reviews yet. Be the first to share your thoughts!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ProductDetailModal;
