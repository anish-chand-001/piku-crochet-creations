import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Loader2, PackageOpen } from 'lucide-react';
import { API_URL } from '@/config/api';
import { toast } from 'sonner';
import { formatPrice } from '@/components/ProductCard';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    subtotal: number;
}

interface CartData {
    items: CartItem[];
    total: number;
}

const fetchCart = async (): Promise<CartData> => {
    const res = await fetch(`${API_URL}/cart`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
};

const Cart = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: cart, isLoading } = useQuery({
        queryKey: ['userCart'],
        queryFn: fetchCart,
        retry: false
    });

    const updateMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
            const res = await fetch(`${API_URL}/cart/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({ quantity })
            });
            if (!res.ok) throw new Error('Failed to update');
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userCart'] }),
        onError: () => toast.error('Could not update quantity')
    });

    const removeMutation = useMutation({
        mutationFn: async (productId: string) => {
            const res = await fetch(`${API_URL}/cart/${productId}`, {
                method: 'DELETE',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Failed to remove');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userCart'] });
            queryClient.invalidateQueries({ queryKey: ['cartCount'] });
            toast.success('Item removed from cart');
        },
        onError: () => toast.error('Could not remove item')
    });

    if (isLoading) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const items = cart?.items || [];
    const total = cart?.total || 0;

    return (
        <main className="min-h-screen pt-24 pb-20 bg-[#FAFAFA]">
            <div className="mx-auto max-w-5xl px-6 lg:px-12">
                {/* Header */}
                <div className="py-10">
                    <p className="font-body text-sm font-semibold uppercase tracking-[0.3em] text-primary mb-2">Shopping</p>
                    <h1 className="font-display text-4xl font-extrabold text-gray-900">
                        Your <span className="italic font-light text-primary">Cart</span>
                    </h1>
                </div>

                {items.length === 0 ? (
                    /* Empty state */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <PackageOpen className="w-12 h-12 text-primary/60" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                        <p className="font-body text-gray-500 mb-8">Discover our handmade crochet collection</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Browse Products
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart items */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence>
                                {items.map(item => (
                                    <motion.div
                                        key={item.productId}
                                        layout
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4"
                                    >
                                        {/* Product image */}
                                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingCart className="w-6 h-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-display text-base font-semibold text-gray-900 leading-tight mb-1 truncate">
                                                {item.name}
                                            </h3>
                                            <p className="font-body text-sm text-gray-500 mb-3">
                                                {formatPrice(item.price)} each
                                            </p>

                                            <div className="flex items-center justify-between">
                                                {/* Quantity controls */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity - 1 })}
                                                        disabled={item.quantity <= 1 || updateMutation.isPending}
                                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="font-body text-sm font-semibold text-gray-900 w-6 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                                                        disabled={item.quantity >= 10 || updateMutation.isPending}
                                                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Subtotal + remove */}
                                                <div className="flex items-center gap-3">
                                                    <p className="font-display text-base font-bold text-primary">
                                                        {formatPrice(item.subtotal)}
                                                    </p>
                                                    <button
                                                        onClick={() => removeMutation.mutate(item.productId)}
                                                        disabled={removeMutation.isPending}
                                                        className="w-8 h-8 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Order summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                                <h2 className="font-display text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                                <div className="space-y-3 mb-5">
                                    {items.map(item => (
                                        <div key={item.productId} className="flex justify-between text-sm font-body text-gray-600">
                                            <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                                            <span className="flex-shrink-0">{formatPrice(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-100 pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-display text-base font-bold text-gray-900">Total</span>
                                        <span className="font-display text-xl font-extrabold text-primary">{formatPrice(total)}</span>
                                    </div>
                                    <p className="font-body text-xs text-gray-400 mt-1">Including all taxes</p>
                                </div>

                                <button
                                    onClick={() => navigate('/checkout')}
                                    className="w-full rounded-xl bg-primary py-4 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                <Link
                                    to="/products"
                                    className="block text-center mt-4 font-body text-sm text-gray-500 hover:text-primary transition-colors"
                                >
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Cart;
