import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Loader2 } from "lucide-react";
import ProductCard, { Product } from "@/components/ProductCard";
import ScrollReveal from "@/components/ScrollReveal";
import { API_URL } from '@/config/api';
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useEffect, useState } from "react";
import ProductDetailModal from "@/components/ProductDetailModal";

// The Wishlist route returns populated products array directly in a wrapper
interface PopulatedProduct {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
  images?: string[];
}

const Wishlist = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useUserAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Redirect instantly if unauthorized
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data, isLoading: queryLoading } = useQuery({
    queryKey: ['wishlistDisplay', user?.userId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/wishlist`, { credentials: 'include' });
      if (res.status === 401) {
        navigate('/login');
        return { wishlist: [] };
      }
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      return res.json() as Promise<{ wishlist: PopulatedProduct[] }>;
    },
    enabled: isAuthenticated
  });

  const products = data?.wishlist || [];
  const isLoading = authLoading || queryLoading;

  if (isLoading) {
    return (
      <main className="min-h-screen pt-32 bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </main>
    );
  }

  if (!isAuthenticated) return null; // Wait for redirect to happen

  return (
    <main className="min-h-screen pt-24 bg-[#FAFAFA]">
      <section className="px-6 pb-8 pt-12 lg:px-12 bg-white rounded-b-[3rem] shadow-sm mb-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <Link
              to="/products"
              className="mb-8 inline-flex items-center gap-2 rounded-full bg-gray-100 px-5 py-2.5 font-body text-sm font-medium text-gray-700 transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back to Creations
            </Link>

            <span className="mb-3 flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              <Heart className="w-4 h-4 fill-primary" />
              Saved Items
            </span>
            <h1 className="mb-4 font-display text-5xl font-extrabold text-gray-900 md:text-6xl tracking-tight">
              Your <span className="italic font-light text-primary">Wishlist</span>
            </h1>
            <p className="max-w-xl font-body text-lg text-gray-600 leading-relaxed">
              Every creation you've fallen in love with, saved right here for you.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {products.length === 0 ? (
            <div className="py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm mt-8 flex flex-col items-center">
              <Heart className="w-16 h-16 text-gray-200 mb-6" />
              <p className="font-display text-2xl text-gray-500 mb-4">
                Your wishlist is empty.
              </p>
              <Link
                to="/products"
                className="rounded-full bg-primary px-8 py-3 font-body text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Browse Creations
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product, i) => (
                  <div
                    key={product._id}
                    onClick={() => setSelectedProduct(product as unknown as Product)}
                    className="cursor-pointer"
                  >
                    <ProductCard
                      product={product as unknown as Product}
                      image={product.images?.[0] || product.imageUrl || ''}
                      index={i}
                    />
                  </div>
                ))}
              </div>

              {selectedProduct && (
                <ProductDetailModal
                  product={selectedProduct}
                  onClose={() => setSelectedProduct(null)}
                />
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Wishlist;
