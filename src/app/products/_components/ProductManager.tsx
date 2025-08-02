// src/app/products/_components/ProductManager.tsx
"use client";

import { Product } from "@prisma/client";
import { useState, useEffect } from "react";
import { ProductForm } from "./ProductForm";
import Image from "next/image";
import { ProductActions } from "./ProductActions";

export function ProductManager({ initialProducts, productToEdit }: { initialProducts: Product[], productToEdit: Product | null }) {
    const [products, setProducts] = useState(initialProducts);
    const [editingProduct, setEditingProduct] = useState<Product | null>(productToEdit);

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);
    
    // Jika ada productToEdit dari URL, scroll ke form
    useEffect(() => {
        if (productToEdit) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [productToEdit]);

    const handleSetEditing = (product: Product | null) => {
        setEditingProduct(product);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const onProductUpdated = (updatedProducts: Product[]) => {
        setProducts(updatedProducts);
    };

    return (
        <>
            <div className="mb-12">
                <ProductForm
                    productToEdit={editingProduct}
                    onFormSubmit={() => {
                        handleSetEditing(null); // Tutup form setelah submit
                    }}
                />
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-gray-900 text-2xl font-bold mb-6">My Current Products</h2>
                {products.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">You haven&apos;t added any products yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="th-style">Image</th>
                                    <th className="th-style">Name</th>
                                    <th className="th-style">Price</th>
                                    <th className="th-style">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td className="td-style"><Image src={product.imageUrl || '/default-product.png'} alt={product.name} width={60} height={60} className="object-cover rounded" /></td>
                                        <td className="td-style font-medium text-gray-900">{product.name}</td>
                                        <td className="td-style text-gray-900">Rp{product.price.toLocaleString('id-ID')}</td>
                                        <td className="td-style">
                                            <ProductActions product={product} onEdit={() => handleSetEditing(product)} onProductUpdate={onProductUpdated} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <style jsx global>{`
                .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .td-style { padding: 1rem 1.5rem; white-space: nowrap; font-size: 0.875rem; }
            `}</style>
        </>
    );
}