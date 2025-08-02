// src/app/orders/_components/OrderList.tsx
"use client";

import { Order, OrderStatus } from "@prisma/client";
import Link from "next/link";
import { useState, useMemo } from "react";

// Tipe data yang diperluas agar bisa menerima detail user/store
type OrderWithDetails = Order & {
    user?: { name: string | null };
    store?: { name: string | null };
};

// Komponen Badge Status (disalin ke sini agar mandiri)
function OrderStatusBadge({ status }: { status: string }) {
    const styles: { [key: string]: string } = {
        WAITING_FOR_PAYMENT: 'bg-yellow-100 text-yellow-800',
        WAITING_FOR_STORE_CONFIRMATION: 'bg-cyan-100 text-cyan-800',
        PROCESSING: 'bg-blue-100 text-blue-800',
        SHIPPED: 'bg-indigo-100 text-indigo-800',
        ARRIVED: 'bg-purple-100 text-purple-800',
        WAITING_FOR_REVIEW: 'bg-pink-100 text-pink-800',
        COMPLETED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status.replace(/_/g, ' ')}</span>;
}


export function OrderList({ initialOrders, isSeller }: { initialOrders: OrderWithDetails[], isSeller: boolean }) {
    const [sortBy, setSortBy] = useState('date_desc');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredAndSortedOrders = useMemo(() => {
        let items = [...initialOrders];

        // 1. Filter berdasarkan status
        if (statusFilter !== 'all') {
            items = items.filter(order => order.status === statusFilter);
        }

        // 2. Sortir
        items.sort((a, b) => {
            switch (sortBy) {
                case 'price_desc': return b.totalAmount - a.totalAmount;
                case 'price_asc': return a.totalAmount - b.totalAmount;
                case 'date_asc': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // date_desc
            }
        });
        return items;
    }, [initialOrders, sortBy, statusFilter]);

    return (
        <div>
            {/* UI untuk Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1">
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-gray-900 w-full border-gray-300 rounded-md shadow-sm">
                        <option value="date_desc">Newest</option>
                        <option value="date_asc">Oldest</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="price_asc">Price: Low to High</option>
                    </select>
                </div>
                 <div className="flex-1">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-gray-900 w-full border-gray-300 rounded-md shadow-sm">
                        <option value="all">All Statuses</option>
                        {Object.keys(OrderStatus).map(status => (
                            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabel */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{isSeller ? 'Buyer Name' : 'Store Name'}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedOrders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-700">{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{isSeller ? order.user?.name : order.store?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">Rp{order.totalAmount.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><OrderStatusBadge status={order.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/orders/${order.id}`} className="text-blue-600 hover:text-blue-900">
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredAndSortedOrders.length === 0 && <p className="text-center text-gray-500 py-10">No orders match the current filters.</p>}
            </div>
        </div>
    );
}