// src/app/orders/[id]/_components/SubmitReviewForm.tsx
"use client";
import { OrderItem } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubmitReviewForm({ orderId, items }: { orderId: string, items: OrderItem[] }) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Untuk portofolio ini, kita asumsikan ulasan hanya untuk produk pertama dalam pesanan
        const productToReview = items[0];
        if (!productToReview) return;

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    productId: productToReview.productId,
                    rating,
                    comment,
                }),
            });
            if (res.ok) {
                alert('Review submitted successfully!');
                router.refresh();
            } else {
                alert('Failed to submit review.');
            }
        } catch (error) {
            alert(`An error occurred, ${error}.`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 border-t pt-6 space-y-4">
            <h3 className="text-lg font-semibold">Leave a Review</h3>
            <div>
                <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
            <button type="submit" disabled={isLoading} className="btn-success">
                {isLoading ? 'Submitting...' : 'Submit Review & Complete Order'}
            </button>
        </form>
    );
}