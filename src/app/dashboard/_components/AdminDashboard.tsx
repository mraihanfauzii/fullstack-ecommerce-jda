// src/app/dashboard/_components/AdminDashboard.tsx
"use client";
import { User, Store } from "@prisma/client";
import Link from "next/link";
import { useState, useMemo } from "react";

// Tipe data yang diperluas untuk data yang kita terima dari server
type SellerWithDetails = User & { store: (Store & { _count: { orders: number } }) | null };
type BuyerWithDetails = User & { _count: { orders: number } };

export function AdminDashboard({ initialSellers, initialBuyers }: { initialSellers: SellerWithDetails[], initialBuyers: BuyerWithDetails[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('orders_desc');

    const filteredAndSortedSellers = useMemo(() => {
        const items = initialSellers.filter(s => 
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        items.sort((a, b) => {
            const ordersA = a.store?._count.orders || 0;
            const ordersB = b.store?._count.orders || 0;
            return sortBy === 'orders_desc' ? ordersB - ordersA : ordersA - ordersB;
        });
        return items;
    }, [initialSellers, searchTerm, sortBy]);

    const filteredAndSortedBuyers = useMemo(() => {
        const items = initialBuyers.filter(b => 
            b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            b.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        items.sort((a, b) => {
            const ordersA = a._count.orders || 0;
            const ordersB = b._count.orders || 0;
            return sortBy === 'orders_desc' ? ordersB - ordersA : ordersA - ordersB;
        });
        return items;
    }, [initialBuyers, searchTerm, sortBy]);

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8">Admin Dashboard - User Management</h1>
            {/* Filter UI */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border text-gray-900">
                <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-grow border-gray-500 rounded-md shadow-lg" />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className=" text-gray-900 rounded-md shadow-sm">
                    <option value="orders_desc">Most Orders</option>
                    <option value="orders_asc">Least Orders</option>
                </select>
            </div>

            {/* Tabel Seller */}
            <h2 className="text-2xl font-bold mt-10 mb-4">Sellers</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... thead ... */}
                        <thead className="bg-gray-50"><tr><th className="th-style">Store Name</th><th className="th-style">Owner</th><th className="th-style">Email</th><th className="th-style">Total Orders</th><th className="th-style"></th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedSellers.map(seller => (
                                <tr key={seller.id}><td className="td-style font-bold">{seller.store?.name}</td><td className="td-style">{seller.name}</td><td className="td-style">{seller.email}</td><td className="td-style">{seller.store?._count.orders || 0}</td><td className="td-style text-right"><Link href={`/admin/users/${seller.id}`} className="text-blue-600 hover:underline">Manage</Link></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabel Buyer */}
            <h2 className="text-2xl font-bold mt-10 mb-4">Buyers</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                       {/* ... thead ... */}
                       <thead className="bg-gray-50"><tr><th className="th-style">Name</th><th className="th-style">Email</th><th className="th-style">Total Orders</th><th className="th-style"></th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedBuyers.map(buyer => (
                                <tr key={buyer.id}><td className="td-style">{buyer.name}</td><td className="td-style">{buyer.email}</td><td className="td-style">{buyer._count.orders}</td><td className="td-style text-right"><Link href={`/admin/users/${buyer.id}`} className="text-blue-600 hover:underline">Manage</Link></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style jsx global>{`.th-style{padding:0.75rem 1.5rem;text-align:left;font-size:0.75rem;font-weight:500;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em}.td-style{padding:1rem 1.5rem;white-space:nowrap;font-size:0.875rem;color:#374151}`}</style>
        </div>
    );
}