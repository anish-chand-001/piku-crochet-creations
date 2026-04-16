import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, Package, CheckCircle2, Truck, Clock, XCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '@/config/api';
import { formatPrice } from '@/components/ProductCard';

interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface Order {
    _id: string;
    name: string;
    mobile: string;
    address: string;
    items: OrderItem[];
    totalAmount: number;
    paymentStatus: 'pending' | 'paid';
    orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.FC<any> }> = {
    pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600', icon: XCircle }
};

const Orders = () => {
    const { data: orders = [], isLoading } = useQuery<Order[]>({
        queryKey: ['userOrders'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/orders/me`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json();
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen pt-28 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-20 bg-[#FAFAFA]">
            <div className="mx-auto max-w-3xl px-6 lg:px-12">
                {/* Header */}
                <div className="py-10">
                    <p className="font-body text-sm font-semibold uppercase tracking-[0.3em] text-primary mb-2">Account</p>
                    <h1 className="font-display text-4xl font-extrabold text-gray-900">
                        My <span className="italic font-light text-primary">Orders</span>
                    </h1>
                </div>

                {orders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <ShoppingBag className="w-12 h-12 text-primary/60" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
                        <p className="font-body text-gray-500 mb-8">Your order history will appear here</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Browse Products
                        </Link>
                    </motion.div>
                ) : (
                    <div className="space-y-5">
                        {orders.map((order, i) => {
                            const status = statusConfig[order.orderStatus] || statusConfig.pending;
                            const StatusIcon = status.icon;
                            const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            });

                            return (
                                <motion.div
                                    key={order._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {/* Order header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                                        <div>
                                            <p className="font-body text-xs text-gray-400">Order placed</p>
                                            <p className="font-body text-sm font-semibold text-gray-700">{date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-body text-xs text-gray-400">Total</p>
                                            <p className="font-display text-base font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-body ${status.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="p-5">
                                        <div className="space-y-3 mb-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    {item.image && (
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-body text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                        <p className="font-body text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                                                    </div>
                                                    <p className="font-body text-sm font-semibold text-gray-900 flex-shrink-0">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Delivery info */}
                                        <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs font-body text-gray-500">
                                            <span className="font-semibold text-gray-700">Deliver to: </span>
                                            {order.name} · {order.mobile} · {order.address}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
};

export default Orders;
