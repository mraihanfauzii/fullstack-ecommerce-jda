// src/app/orders/[id]/page.tsx
import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Image from "next/image";
import { OrderActions } from "./_components/OrderActions";

async function getOrderDetails(orderId: string, session: Session | null) {
    if (!session?.user) return null;
    
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: { include: { product: true } },
            user: { select: { name: true, email: true } },
            store: { select: { name: true } },
        },
    });

    // Otorisasi: Pastikan user adalah buyer atau seller dari order ini
    if (!order || (session.user.id !== order.userId && session.user.storeId !== order.storeId)) {
        return null;
    }
    return order;
}

export default async function OrderDetailPage({ params }: { params: { id: string }}) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/signin');

    const order = await getOrderDetails(params.id, session);

    if (!order) {
        return <div className="text-center p-10"><h1>Order not found or access denied.</h1></div>
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-2">Order Details</h1>
            <p className="font-mono text-sm text-white-500 mb-8">ID: {order.id}</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-gray-900 text-xl font-semibold mb-4">Items Ordered</h2>
                        {order.items.map(item => (
                            <div key={item.id} className="flex items-center justify-between border-b last:border-b-0 py-3">
                                <div className="flex items-center">
                                    <Image src={item.product.imageUrl || ''} alt={item.product.name} width={50} height={50} className="rounded" />
                                    <div className="ml-4">
                                        <p className="text-gray-900 font-semibold">{item.product.name}</p>
                                        <p className="text-sm text-gray-600">{item.quantity} x Rp{item.price.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <p className="text-gray-900 font-semibold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <h2 className="text-gray-900 text-xl font-semibold mb-4">Summary</h2>
                        <div className="text-gray-900 flex justify-between mb-2"><span>Subtotal</span><span>Rp{(order.totalAmount - order.shippingCost).toLocaleString('id-ID')}</span></div>
                        <div className="text-gray-900 flex justify-between mb-4"><span>Shipping ({order.shippingMethod})</span><span>Rp{order.shippingCost.toLocaleString('id-ID')}</span></div>
                        <div className="text-gray-900 border-t pt-4 flex justify-between font-bold text-lg"><span>Total</span><span>Rp{order.totalAmount.toLocaleString('id-ID')}</span></div>
                        <div className="mt-6">
                            <h3 className="text-gray-900 text-lg font-semibold mb-2">Status</h3>
                            <p className="font-bold text-blue-600">{order.status.replace(/_/g, ' ')}</p>
                        </div>
                        <OrderActions order={order} currentUserRole={session.user.role!} items={order.items}/>
                    </div>
                </div>
            </div>
        </div>
    );
}