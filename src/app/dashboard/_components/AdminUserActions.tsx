// src/app/admin/panel/_components/AdminUserActions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminUserActions({ userId, userName, activeOrderCount }: { userId: string, userName: string, activeOrderCount: number }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelOrders = async () => {
        if (!confirm(`Are you sure you want to cancel all ${activeOrderCount} active orders for ${userName}?`)) return;
        
        setIsCancelling(true);
        try {
            const res = await fetch('/api/admin/cancel-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                alert('Orders cancelled successfully.');
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to cancel orders: ${data.message}`);
            }
        } catch (error) {
            alert(`An error occurred, ${error}.`);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleDeleteUser = async () => {
        if (activeOrderCount > 0) {
            alert('You must cancel all active orders before deleting this user.');
            return;
        }
        if (!confirm(`Are you sure you want to permanently delete ${userName}? This cannot be undone.`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                alert('User deleted successfully.');
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to delete user: ${data.message}`);
            }
        } catch (error) {
            alert(`An error occurred, ${error}.`);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center space-x-4">
            {activeOrderCount > 0 && (
                <button onClick={handleCancelOrders} disabled={isCancelling} className="text-yellow-600 hover:text-yellow-900 disabled:text-gray-400">
                    {isCancelling ? 'Cancelling...' : 'Cancel Orders'}
                </button>
            )}
            <button onClick={handleDeleteUser} disabled={isDeleting || activeOrderCount > 0} className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed">
                {isDeleting ? 'Deleting...' : 'Delete User'}
            </button>
        </div>
    );
}