// src/app/orders/[id]/_components/OrderActions.tsx
"use client";
import { Order, OrderStatus, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitReviewForm } from "./SubmitReviewForm"

export function OrderActions({ order, currentUserRole, items }: { order: Order, currentUserRole: Role, items: OrderItem[] }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            if (res.ok) {
                router.refresh(); // Muat ulang data halaman untuk melihat status baru
            } else {
                const data = await res.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert(`An unexpected error occurred, ${error}.`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderButton = () => {
        // === Logika untuk Buyer ===
        if (currentUserRole === Role.BUYER) {
            if (order.status === OrderStatus.WAITING_FOR_PAYMENT) {
                return <button onClick={() => handleAction('CONFIRM_PAYMENT')} disabled={isLoading} className="btn-primary">Confirm Payment</button>;
            }
            if (order.status === OrderStatus.ARRIVED) {
                return <button onClick={() => handleAction('RECEIVE_ORDER')} disabled={isLoading} className="btn-success">Confirm & Review Order</button>;
            }
            if (order.status === OrderStatus.WAITING_FOR_REVIEW) {
                return <SubmitReviewForm orderId={order.id} items={items} />;
            }
        }
        
        // === Logika untuk Seller ===
        if (currentUserRole === Role.SELLER) {
            if (order.status === OrderStatus.WAITING_FOR_STORE_CONFIRMATION) {
                return <button onClick={() => handleAction('ACCEPT_ORDER')} disabled={isLoading} className="btn-primary">Accept Order</button>;
            }
            if (order.status === OrderStatus.PROCESSING) {
                return <button onClick={() => handleAction('SHIP_ORDER')} disabled={isLoading} className="btn-primary">Mark as Shipped</button>;
            }
            if (order.status === OrderStatus.SHIPPED) {
                return <button onClick={() => handleAction('ARRIVE_ORDER')} disabled={isLoading} className="btn-primary">Mark as Arrived</button>;
            }
        }

        // === Logika untuk Admin ===
        if (currentUserRole === Role.ADMIN) {
            if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED) {
                 return <button onClick={() => handleAction('ADMIN_CANCEL_ORDER')} disabled={isLoading} className="btn-danger">Cancel Order (Admin)</button>;
            }
        }
        
        return null; // Tidak ada aksi untuk status lain (misal: COMPLETED atau CANCELLED)
    };

    return (
        <div className="mt-6 border-t pt-6">
            {renderButton()}
            <style jsx global>{`
                .btn-primary { width: 100%; background-color: #2563eb; color: white; font-weight: bold; padding: 0.75rem 0; border-radius: 0.5rem; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: #1d4ed8; }
                .btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; }
                .btn-success { width: 100%; background-color: #16a34a; color: white; font-weight: bold; padding: 0.75rem 0; border-radius: 0.5rem; transition: background-color 0.2s; }
                .btn-success:hover { background-color: #15803d; }
            `}</style>
        </div>
    );
}