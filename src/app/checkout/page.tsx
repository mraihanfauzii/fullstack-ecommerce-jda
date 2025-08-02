// src/app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type CartItemFromAPI = {
  id: string;
  cartItemId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard', cost: 15000, eta: '3-5 days' },
  { id: 'regular', name: 'Regular', cost: 25000, eta: '1-2 days' },
  { id: 'sameday', name: 'SameDay', cost: 50000, eta: 'Today' },
];

export default function CheckoutPage() {
  // --- PERBAIKAN: 'session' dihapus karena tidak digunakan ---
  const { status } = useSession();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItemFromAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState(SHIPPING_OPTIONS[0]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      const fetchCart = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/cart');
          if (res.ok) {
            const data = await res.json();
            setCartItems(data.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch cart:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCart();
    }
  }, [status, router]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + selectedShipping.cost;

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shippingMethod: selectedShipping.name,
                shippingCost: selectedShipping.cost,
            }),
        });
        if(res.ok) {
            alert('Order placed successfully! Redirecting to your orders page...');
            router.push('/orders');
        } else {
            const data = await res.json();
            alert(`Failed to place order: ${data.message}`);
        }
    } catch (error) {
        alert(`An error occurred while placing the order, ${error}`);
    } finally {
        setIsPlacingOrder(false);
    }
  };

  if (isLoading) return <div className="min-h-screen text-center p-10">Loading your cart...</div>;

  if (!isLoading && cartItems.length === 0) {
    return (
        <div className="min-h-screen text-center p-10">
            <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
            <Link href="/dashboard" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700">
                Continue Shopping
            </Link>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-gray-900 text-2xl font-semibold mb-4">Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.cartItemId} className="flex items-center justify-between border-b py-4">
                <div className="flex items-center">
                  <Image src={item.imageUrl} alt={item.name} width={60} height={60} className="rounded-md" />
                  <div className="ml-4">
                    <p className="text-gray-900 font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-gray-900 font-semibold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</p>
              </div>
            ))}
            <div className="mt-6">
                <h3 className="text-gray-900 text-xl font-semibold mb-3">Shipping Method</h3>
                <div className="space-y-3">
                    {SHIPPING_OPTIONS.map(opt => (
                        <label key={opt.id} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="shipping" checked={selectedShipping.id === opt.id} onChange={() => setSelectedShipping(opt)} className="mr-4" />
                            <div className="flex-grow flex justify-between">
                                <div><span className="text-gray-900 font-semibold">{opt.name}</span><p className="text-sm text-gray-500">ETA: {opt.eta}</p></div>
                                <span className="text-gray-900 font-semibold">Rp{opt.cost.toLocaleString('id-ID')}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <h2 className="text-gray-900 text-2xl font-semibold mb-4">Total</h2>
            <div className="text-gray-900 flex justify-between mb-2"><span>Subtotal</span><span>Rp{subtotal.toLocaleString('id-ID')}</span></div>
            <div className="text-gray-900 flex justify-between mb-4"><span>Shipping</span><span>Rp{selectedShipping.cost.toLocaleString('id-ID')}</span></div>
            <div className="text-gray-900 border-t pt-4 flex justify-between font-bold text-xl"><span>Total</span><span>Rp{total.toLocaleString('id-ID')}</span></div>
            <div className="mt-6">
                <h3 className="text-gray-900 text-lg font-semibold mb-2">Payment Method</h3>
                <label className="text-gray-900 flex items-center p-3 border rounded-lg"><input type="checkbox" checked readOnly className="mr-3" /><span>Dummy Payment (Virtual Account)</span></label>
            </div>
            <button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                {isPlacingOrder ? 'Processing...' : 'Place Order & Pay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}