// src/app/products/[id]/_components/AddToCartButton.tsx

"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ProductWithStore } from '../page';

// Impor hooks dan actions dari Redux
import { useAppDispatch } from '@/redux/hooks';
import { addNotification } from '@/redux/features/notificationSlice';

export function AddToCartButton({ product }: { product: ProductWithStore }) {
    const { status } = useSession();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Inisialisasi dispatch
    const dispatch = useAppDispatch();

    const handleAddToCart = async () => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
            return;
        }
        
        if (status === 'loading') return;

        setIsLoading(true);

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: quantity,
                }),
            });

            const result = await res.json();
            if (res.ok) {
                // Gunakan Redux untuk notifikasi sukses
                dispatch(addNotification({ message: `${quantity} ${product.name} added to cart!`, type: "success" }));
            } else {
                // Gunakan Redux untuk notifikasi error
                dispatch(addNotification({ message: result.message || 'Failed to add to cart.', type: "error" }));
            }

        } catch (error) {
            dispatch(addNotification({ message: `An error occurred, ${error}.`, type: "error" }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center mb-6">
                <label htmlFor="quantity" className="text-gray-700 mr-4 text-lg font-medium">Quantity:</label>
                <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-gray-700 w-20 p-2 border border-gray-300 rounded-md text-center"
                />
            </div>
            <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
            >
                {isLoading ? 'Adding...' : 'Add to Cart'}
            </button>
        </div>
    );
}