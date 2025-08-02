// src/app/admin/orders/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { AdminOrderActions } from "./_components/AdminOrderActions";

async function getOrderForAdmin(orderId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard');

    return prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: { include: { product: true } },
            user: { select: { id: true, name: true, email: true } },
            store: { select: { id: true, name: true } },
        },
    });
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string }}) {
    const order = await getOrderForAdmin(params.id);
    if (!order) return <p>Order not found.</p>;

    return (
        <div className="container mx-auto p-8">
            <Link href={`/admin/users/${order.userId}`} className="text-blue-600 hover:underline mb-6 block">&larr; Back to User Details</Link>
            <h1 className="text-3xl font-bold mb-2">Order Details (Admin View)</h1>
            <p className="font-mono text-sm text-gray-500 mb-8">ID: {order.id}</p>
            {/* ... (Salin JSX dari halaman detail order biasa untuk menampilkan detail) ... */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                    {/* ... (bagian Summary) ... */}
                    {/* Tombol Aksi KHUSUS Admin */}
                    <AdminOrderActions order={order} />
                </div>
            </div>
        </div>
    );
}