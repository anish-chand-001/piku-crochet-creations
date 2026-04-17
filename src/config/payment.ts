// Shared UPI configuration for payment QR code
export const UPI_ID = import.meta.env.VITE_UPI_ID || 'palakme0305@okicici';
export const MERCHANT_NAME = 'Piku Crochet Creations';

/**
 * Generates a UPI deep-link string for QR code generation.
 * Compatible with Google Pay, PhonePe, Paytm, BHIM etc.
 */
export const buildUpiString = (amount: number, note = 'Order Payment'): string => {
    const params = new URLSearchParams({
        pa: UPI_ID,
        pn: MERCHANT_NAME,
        am: amount.toFixed(2),
        cu: 'INR',
        tn: note
    });
    return `upi://pay?${params.toString()}`;
};
