import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import { OrderList } from "./_components/OrderList"; // Impor komponen baru

// Fungsi ini mengambil data pesanan dari database berdasarkan peran user
async function getOrders(session: Session | null) {
    if (!session?.user) return []; // Guard clause untuk memastikan session tidak null
    if (session.user.role === Role.BUYER) {
        return prisma.order.findMany({
            where: { userId: session.user.id },
            include: { store: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    if (session.user.role === Role.SELLER) {
        return prisma.order.findMany({
            where: { store: { userId: session.user.id } },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
    }
    return [];
}

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/signin');

    const orders = await getOrders(session);
    const isSeller = session.user.role === Role.SELLER;

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-8">{isSeller ? 'Incoming Orders' : 'My Transactions'}</h1>
            
            {/* Gunakan Client Component untuk menampilkan list dan filter */}
            <OrderList initialOrders={orders} isSeller={isSeller} />
        </div>
    );
}