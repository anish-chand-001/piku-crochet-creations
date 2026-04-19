import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, MapPin, Phone, User as UserIcon, ArrowLeft, ShoppingBag } from 'lucide-react';
import { API_URL } from '@/config/api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { MERCHANT_NAME, UPI_ID } from '@/config/payment';
import { formatPrice } from '@/components/ProductCard';
import { toast } from 'sonner';
import qrCodeImage from '@/assets/qr_code.jpeg';

interface CartItem { productId: string; name: string; price: number; image: string; quantity: number; subtotal: number; }
interface CartData { items: CartItem[]; total: number; }

type Step = 'details' | 'payment' | 'success';

const stepLabels: Record<Step, string> = { details: 'Delivery', payment: 'Payment', success: 'Done' };
const STEPS: Step[] = ['details', 'payment', 'success'];

const Checkout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useUserAuth();

    const [step, setStep] = useState<Step>('details');
    const [name, setName] = useState(user?.savedAddress?.fullName || user?.name || '');
    const [mobile, setMobile] = useState(user?.savedAddress?.mobile || user?.mobile || '');
    
    // Prefill with structured address if available, otherwise just use old address string in addressLine
    const [addressLine, setAddressLine] = useState(user?.savedAddress?.addressLine || (!user?.savedAddress ? (user?.address || '') : ''));
    const [pincode, setPincode] = useState(user?.savedAddress?.pincode || '');
    const [city, setCity] = useState(user?.savedAddress?.city || '');
    const [state, setState] = useState(user?.savedAddress?.state || '');
    const [apartment, setApartment] = useState(user?.savedAddress?.apartment || '');
    const [houseNumber, setHouseNumber] = useState(user?.savedAddress?.houseNumber || '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [orderId, setOrderId] = useState('');

    const { data: cart, isLoading: cartLoading } = useQuery<CartData>({
        queryKey: ['userCart'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/cart`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch cart');
            return res.json();
        }
    });

    const orderMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({ name, mobile, addressLine, pincode, city, state, apartment, houseNumber })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Order creation failed');
            return data;
        },
        onSuccess: (data) => {
            setOrderId(data.orderId);
            queryClient.invalidateQueries({ queryKey: ['userCart'] });
            queryClient.invalidateQueries({ queryKey: ['cartCount'] });
            setStep('success');
        },
        onError: (err: any) => toast.error(err.message)
    });

    const validateDetails = () => {
        const e: Record<string, string> = {};
        if (!name.trim()) e.name = 'Name is required';
        if (!mobile.trim()) e.mobile = 'Mobile number is required';
        else if (!/^[6-9]\d{9}$/.test(mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number';
        if (!addressLine.trim() && addressLine.length < 5) e.addressLine = 'Street address is required';
        if (!city.trim()) e.city = 'City is required';
        if (!state.trim()) e.state = 'State is required';
        if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) e.pincode = 'Valid 6-digit PIN code is required';
        
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const SHIPPING_CHARGE = 150;
    const items = cart?.items || [];
    const total = (cart?.total || 0) + SHIPPING_CHARGE;
    if (cartLoading) {
        return <div className="min-h-screen pt-28 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (items.length === 0 && step !== 'success') {
        return (
            <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center gap-4 px-6">
                <ShoppingBag className="w-16 h-16 text-gray-300" />
                <h2 className="font-display text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <Link to="/products" className="text-primary font-semibold hover:underline">Browse Products</Link>
            </div>
        );
    }

    const inputCls = (field: string) =>
        `w-full rounded-xl border px-4 py-3 font-body text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-primary'}`;

    return (
        <main className="min-h-screen pt-24 pb-20 bg-[#FAFAFA]">
            <div className="mx-auto max-w-2xl px-6 lg:px-12">
                {/* Header */}
                <div className="py-10">
                    <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Cart
                    </Link>
                    <h1 className="font-display text-4xl font-extrabold text-gray-900">
                        Check<span className="italic font-light text-primary">out</span>
                    </h1>
                </div>

                {/* Step indicator */}
                {step !== 'success' && (
                    <div className="flex items-center gap-2 mb-8">
                        {STEPS.filter(s => s !== 'success').map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'bg-primary text-white' : STEPS.indexOf(step) > STEPS.indexOf(s) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {STEPS.indexOf(step) > STEPS.indexOf(s) ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`font-body text-sm font-medium ${step === s ? 'text-primary' : 'text-gray-400'}`}>{stepLabels[s]}</span>
                                {i < 1 && <div className="h-px w-8 bg-gray-200" />}
                            </div>
                        ))}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* ── Step 1: Delivery Details ─────────────────────────── */}
                    {step === 'details' && (
                        <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 mb-6">
                                <h2 className="font-display text-lg font-bold text-gray-900">Delivery Details</h2>

                                <div className="space-y-1.5">
                                    <label className="font-body text-sm font-medium text-gray-700 flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Recipient's name" className={inputCls('name')} />
                                    {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-body text-sm font-medium text-gray-700 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Mobile Number</label>
                                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit mobile number" maxLength={10} className={inputCls('mobile')} />
                                    {errors.mobile && <p className="text-xs text-red-600">{errors.mobile}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="font-body text-sm font-medium text-gray-700">House No. <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <input type="text" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} placeholder="House/Flat No." className={inputCls('houseNumber')} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-body text-sm font-medium text-gray-700">Apartment <span className="text-gray-400 font-normal">(Optional)</span></label>
                                        <input type="text" value={apartment} onChange={e => setApartment(e.target.value)} placeholder="Apartment/Society" className={inputCls('apartment')} />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-body text-sm font-medium text-gray-700 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Address Line</label>
                                    <textarea
                                        value={addressLine}
                                        onChange={e => setAddressLine(e.target.value)}
                                        placeholder="Street name, landmark, area"
                                        rows={2}
                                        className={`${inputCls('addressLine')} resize-none`}
                                    />
                                    {errors.addressLine && <p className="text-xs text-red-600">{errors.addressLine}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="font-body text-sm font-medium text-gray-700">City</label>
                                        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className={inputCls('city')} />
                                        {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-body text-sm font-medium text-gray-700">State</label>
                                        <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="State" className={inputCls('state')} />
                                        {errors.state && <p className="text-xs text-red-600">{errors.state}</p>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-body text-sm font-medium text-gray-700">PIN Code</label>
                                    <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="6-digit PIN" maxLength={6} className={inputCls('pincode')} />
                                    {errors.pincode && <p className="text-xs text-red-600">{errors.pincode}</p>}
                                </div>

                                {(user?.savedAddress || user?.address) && (
                                    <p className="font-body text-xs text-green-600 flex items-center gap-1 mt-2">
                                        <CheckCircle2 className="w-3 h-3" /> Using your saved details. You can edit them above.
                                    </p>
                                )}
                            </div>

                            {/* Order summary mini */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                                <h2 className="font-display text-base font-bold text-gray-900 mb-4">Order Summary</h2>
                                <div className="space-y-2 mb-4">
                                    {items.map(item => (
                                        <div key={item.productId} className="flex justify-between text-sm font-body text-gray-600">
                                            <span>{item.name} × {item.quantity}</span>
                                            <span>{formatPrice(item.subtotal)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between text-sm font-body text-gray-600">
                                        <span>Shipping</span>
                                        <span>{formatPrice(SHIPPING_CHARGE)}</span>
                                    </div>
                                    <p className="text-xs text-green-600 font-medium">If distance is near cashback would be done</p>
                                    <div className="flex justify-between mt-2 pt-2 border-t border-gray-50">
                                        <span className="font-display font-bold text-gray-900">Total</span>
                                        <span className="font-display font-extrabold text-primary text-lg">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => { if (validateDetails()) setStep('payment'); }}
                                className="w-full rounded-xl bg-primary py-4 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                Proceed to Payment
                            </button>
                        </motion.div>
                    )}

                    {/* ── Step 2: QR Payment ───────────────────────────────── */}
                    {step === 'payment' && (
                        <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mb-6">
                                <h2 className="font-display text-lg font-bold text-gray-900 mb-1">Scan to Pay</h2>
                                <p className="font-body text-sm text-gray-500 mb-6">
                                    Open Google Pay, PhonePe, or any UPI app and scan this code
                                </p>

                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-100">
                                        <img
                                            src={qrCodeImage}
                                            alt="Payment QR code"
                                            className="w-[220px] h-[220px] rounded-lg object-cover"
                                        />
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-xl p-4 mb-6 text-left space-y-2">
                                    <div className="flex justify-between text-sm font-body">
                                        <span className="text-gray-500">Pay to</span>
                                        <span className="font-semibold text-gray-900">{MERCHANT_NAME}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-body">
                                        <span className="text-gray-500">UPI ID</span>
                                        <span className="font-mono text-gray-700 text-xs">{UPI_ID}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-500 font-body">Amount</span>
                                        <span className="font-display text-lg font-extrabold text-primary">{formatPrice(total)}</span>
                                    </div>
                                </div>

                                <p className="font-body text-xs text-gray-400 mb-6">
                                    After completing payment in your UPI app, tap the button below to confirm your order
                                </p>

                                <button
                                    onClick={() => orderMutation.mutate()}
                                    disabled={orderMutation.isPending}
                                    className="w-full rounded-xl bg-green-600 py-4 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-green-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {orderMutation.isPending ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
                                    ) : (
                                        <><CheckCircle2 className="w-4 h-4" /> I Have Paid — Confirm Order</>
                                    )}
                                </button>
                            </div>

                            <button onClick={() => setStep('details')} className="w-full text-center font-body text-sm text-gray-500 hover:text-primary transition-colors">
                                ← Edit Delivery Details
                            </button>
                        </motion.div>
                    )}

                    {/* ── Step 3: Success ──────────────────────────────────── */}
                    {step === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </motion.div>

                            <h2 className="font-display text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed! 🎉</h2>
                            <p className="font-body text-gray-500 mb-2">Thank you for your purchase</p>
                            {orderId && (
                                <p className="font-mono text-xs text-gray-400 mb-8">Order ID: {orderId}</p>
                            )}

                            <p className="font-body text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8 text-left">
                                <strong>What's next?</strong> We'll prepare your handmade order with care. You'll be contacted on{' '}
                                <strong>{mobile}</strong> once it's ready to ship.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    to="/orders"
                                    className="rounded-xl bg-primary px-8 py-3.5 font-body text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                                >
                                    View My Orders
                                </Link>
                                <Link
                                    to="/products"
                                    className="rounded-xl border-2 border-gray-200 px-8 py-3.5 font-body text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-all"
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
};

export default Checkout;
