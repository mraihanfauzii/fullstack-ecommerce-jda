// src/app/products/_components/ProductForm.tsx
"use client";

import { Product } from "@prisma/client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function ProductForm({ productToEdit, onFormSubmit }: { productToEdit: Product | null, onFormSubmit: () => void }) {
  const [formData, setFormData] = useState({ name: "", description: "", price: "", imageUrl: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isEditMode = !!productToEdit;

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description || "",
        price: productToEdit.price.toString(),
        imageUrl: productToEdit.imageUrl || "",
      });
    } else {
      setFormData({ name: "", description: "", price: "", imageUrl: "" });
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    if (isNaN(productData.price) || productData.price <= 0 || !productData.name) {
      setError("Name and a valid price are required.");
      setIsLoading(false);
      return;
    }

    try {
        const url = isEditMode ? `/api/products/${productToEdit.id}` : '/api/products';
        const method = isEditMode ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
        });

        const result = await res.json();
        if (res.ok) {
            setMessage(`Product ${isEditMode ? 'updated' : 'added'} successfully! Refreshing...`);
            onFormSubmit(); // Panggil callback untuk menutup form
            router.refresh(); 
        } else {
            setError(result.message || `Failed to ${isEditMode ? 'update' : 'add'} product.`);
        }
    } catch (err) {
      setError(`An unexpected error occurred, ${err}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-gray-900 text-2xl font-bold mb-6 text-center">{isEditMode ? `Edit: ${productToEdit.name}` : "Add New Product"}</h2>
      {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label htmlFor="name" className="form-label">Name</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="text-gray-900 form-input" /></div>
        <div><label htmlFor="description" className="form-label">Description</label><textarea id="description" name="description" rows={3} value={formData.description} onChange={handleChange} className="text-gray-900 form-input"></textarea></div>
        <div><label htmlFor="price" className="form-label">Price</label><input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required min="0.01" step="0.01" className="text-gray-900 form-input" /></div>
        <div><label htmlFor="imageUrl" className="form-label">Image URL</label><input type="text" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="text-gray-900 form-input" /></div>
        <div className="flex items-center space-x-4">
            <button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400">
                {isLoading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Add Product')}
            </button>
            {isEditMode && (<button type="button" onClick={onFormSubmit} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Cancel</button>)}
        </div>
      </form>
      <style jsx global>{`.form-label{display:block;color:#374151;font-size:0.875rem;font-weight:700;margin-bottom:0.5rem}.form-input{box-shadow:0 1px 2px 0 rgba(0,0,0,.05);border:1px solid #d1d5db;border-radius:.375rem;width:100%;padding:.5rem .75rem}`}</style>
    </div>
  );
}