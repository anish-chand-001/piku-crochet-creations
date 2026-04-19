import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from '@/config/api';
import { formatPrice } from '@/components/ProductCard';
import { toast } from 'sonner';

interface OrderItem { name: string; price: number; quantity: number; image: string; }
interface Order {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    address: string;
    pincode?: string;
    city?: string;
    state?: string;
    apartment?: string;
    houseNumber?: string;
    addressLine?: string;
    shippingCharge?: number;
    items: OrderItem[];
    totalAmount: number;
    paymentStatus: 'pending' | 'paid';
    orderStatus: string;
    createdAt: string;
}

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-700'
};

const AdminOrders = () => {
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['adminOrders', page],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/orders?page=${page}&limit=15`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json() as Promise<{ orders: Order[]; totalPages: number; totalOrders: number; currentPage: number; }>;
        }
    });

    const statusMutation = useMutation({
        mutationFn: async ({ id, orderStatus }: { id: string; orderStatus: string }) => {
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({ orderStatus })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
            toast.success('Order status updated');
        },
        onError: () => toast.error('Could not update status')
    });

    const orders: Order[] = data?.orders || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                {data && (
                    <span className="text-sm text-gray-500 font-medium">
                        {data.totalOrders} total order{data.totalOrders !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No orders yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700 border-b border-gray-100">
                                <tr>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Date</th>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Contact</th>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Items</th>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Total</th>
                                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => {
                                    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    });
                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{date}</td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-gray-900">{order.name}</div>
                                                <div className="text-xs text-gray-500 mb-1">{order.email}</div>
                                                
                                                <div className="text-[10px] uppercase font-bold text-gray-400 mt-2 mb-0.5">Address</div>
                                                {order.city && order.state ? (
                                                    <div className="text-xs text-gray-600 space-y-0.5 leading-relaxed max-w-[220px]">
                                                        {(order.houseNumber || order.apartment) && (
                                                            <div>
                                                                {order.houseNumber && <span>{order.houseNumber}</span>}
                                                                {order.houseNumber && order.apartment && <span>, </span>}
                                                                {order.apartment && <span>{order.apartment}</span>}
                                                            </div>
                                                        )}
                                                        <div className="break-words">{order.addressLine || order.address}</div>
                                                        <div>{order.city}, {order.state}</div>
                                                        <div className="font-medium text-gray-800">PIN: {order.pincode}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-500 mt-0.5 break-words max-w-[220px]">{order.address}</div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-gray-700">{order.mobile}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="space-y-1 max-w-[200px]">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} className="w-7 h-7 rounded object-cover flex-shrink-0 border border-gray-100" />
                                                            )}
                                                            <span className="text-xs text-gray-700 truncate">
                                                                {item.name} ×{item.quantity}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">{formatPrice(order.totalAmount)}</div>
                                                {order.shippingCharge !== undefined && (
                                                    <div className="text-[10px] text-gray-400 mt-0.5">Includes {formatPrice(order.shippingCharge)} shipping</div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <select
                                                    value={order.orderStatus}
                                                    onChange={e => {
                                                        const nextStatus = e.target.value;
                                                        if (!window.confirm(`Change order status to ${nextStatus}?`)) {
                                                            e.target.value = order.orderStatus;
                                                            return;
                                                        }
                                                        statusMutation.mutate({ id: order._id, orderStatus: nextStatus });
                                                    }}
                                                    className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}
                                                    disabled={statusMutation.isPending}
                                                >
                                                    {ORDER_STATUSES.map(s => (
                                                        <option key={s} value={s} className="bg-white text-gray-900 font-normal">
                                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {data.currentPage} of {data.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                            className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
