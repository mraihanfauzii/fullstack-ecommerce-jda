// src/app/admin/users/[id]/_components/AdminManageUserActions.tsx
"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminManageUserActions({ userId, userName, activeOrderCount }: { userId: string, userName: string, activeOrderCount: number }) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    
    const handleDeleteUser = async () => {
        if (activeOrderCount > 0) {
            alert('Cannot delete user. Please cancel all their active orders from the order detail pages first.');
            return;
        }
        if (!confirm(`Are you sure you want to permanently delete ${userName}?`)) return;

        setIsDeleting(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                alert('User deleted successfully.');
                router.push('/dashboard'); // Kembali ke dashboard admin
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
        <button onClick={handleDeleteUser} disabled={isDeleting || activeOrderCount > 0} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isDeleting ? 'Deleting...' : 'Delete User'}
        </button>
    );
}