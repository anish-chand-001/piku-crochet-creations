import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';

export const useCart = () => {
    const queryClient = useQueryClient();

    const addToCartMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
            const res = await fetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include',
                body: JSON.stringify({ productId, quantity })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to add item to cart');
            }

            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['userCart'] });
            queryClient.invalidateQueries({ queryKey: ['cartCount'] });
            toast.success('Added to cart!', {
                description: data.message || 'Item added successfully'
            });
        },
        onError: (error: Error) => {
            // Check if error is auth-related
            if (error.message.includes('Unauthorized') || error.message.includes('not authenticated')) {
                toast.error('Please log in first', {
                    description: 'You need to be signed in to add items to cart'
                });
            } else {
                toast.error('Could not add to cart', {
                    description: error.message
                });
            }
        }
    });

    return {
        addToCart: addToCartMutation.mutate,
        isAdding: addToCartMutation.isPending
    };
};
