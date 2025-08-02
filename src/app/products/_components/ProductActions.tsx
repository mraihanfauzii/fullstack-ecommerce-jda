// src/app/products/_components/ProductActions.tsx
"use client";

import { Product } from "@prisma/client";
import { useRouter } from "next/navigation";

export function ProductActions({ product, onEdit }: { product: Product, onEdit: () => void, onProductUpdate: (products: Product[]) => void }) {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                alert('Product deleted successfully.');
                router.refresh(); // Cara termudah untuk refresh data dari server
            } else {
                const data = await res.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert(`An error occurred while deleting the product, ${error}.`);
        }
    };

    return (
        <div className="flex items-center space-x-4 text-sm font-medium">
            <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-900">Edit</button>
            <button onClick={handleDelete} className="text-red-600 hover:text-red-900">Delete</button>
        </div>
    );
}