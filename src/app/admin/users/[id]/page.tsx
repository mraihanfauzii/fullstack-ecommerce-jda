// src/app/admin/users/[id]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { OrderStatus, Role } from "@prisma/client";
import { AdminManageUserActions } from "./_components/AdminManageUserActions";

async function getUserDetailsForAdmin(userId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') redirect('/dashboard');

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            // Ambil semua pesanan aktif, baik sebagai buyer maupun seller
            orders: { where: { status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] } } },
            store: { include: { orders: { where: { status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] } } } } }
        }
    });
    return user;
}


export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const user = await getUserDetailsForAdmin(params.id);
    if (!user) return <p>User not found.</p>;

    const activeOrders = user.role === Role.BUYER ? user.orders : user.store?.orders || [];

    return (
        <div className="container mx-auto p-8">
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-6 block">&larr; Back to Admin Dashboard</Link>
            <div className="text-gray-900 bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-gray-600">{user.email}</p>
                        <span className={`mt-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'SELLER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span>
                    </div>
                    {/* Komponen untuk tombol Cancel & Delete */}
                    <AdminManageUserActions userId={user.id} userName={user.name || ''} activeOrderCount={activeOrders.length} />
                </div>

                <div className="mt-8 border-t pt-6">
                    <h2 className="text-gray-900 text-2xl font-semibold">Active Orders ({activeOrders.length})</h2>
                    <div className="mt-4 space-y-3">
                        {activeOrders.length > 0 ? activeOrders.map(order => (
                            <div key={order.id} className="text-gray-900 p-4 border rounded-md flex justify-between items-center">
                                <div>
                                    <p className="font-mono text-sm">{order.id}</p>
                                    <p>Total: Rp{order.totalAmount.toLocaleString('id-ID')}</p>
                                </div>
                                <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline text-sm font-semibold">Manage Order</Link>
                            </div>
                        )) : <p className="text-gray-500">No active orders.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}