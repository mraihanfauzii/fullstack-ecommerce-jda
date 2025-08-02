// src/app/admin/orders/[id]/_components/AdminOrderActions.tsx
"use client";
import { Order, OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminOrderActions({ order }: { order: Order }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);

    const handleUpdate = async (action: 'ADMIN_UPDATE_STATUS' | 'ADMIN_CANCEL_ORDER') => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, newStatus: selectedStatus }),
            });
            if (res.ok) {
                alert('Status updated!');
                router.refresh();
            } else { alert('Failed to update status.'); }
        } catch (e) { alert(`An error occurre, ${e}.`); }
        finally { setIsLoading(false); }
    };

    const canBeModified = order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;

    if (!canBeModified) return <p className="text-sm text-gray-500 mt-6 text-center">This order is final and cannot be modified.</p>;

    return (
        <div className="mt-6 border-t pt-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-900">Change Status</label>
                <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value as OrderStatus)} className="text-gray-900 mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    {Object.values(OrderStatus).map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                    ))}
                </select>
            </div>
            <button onClick={() => handleUpdate('ADMIN_UPDATE_STATUS')} disabled={isLoading || selectedStatus === order.status} className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                Update Status
            </button>
        </div>
    );
}