// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { OrderStatus, Role } from "@prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const orderId = params.id;
    const { action, newStatus: statusFromClient } = await req.json();

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    const canBeModified = order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED;
    
    let newStatus: OrderStatus | undefined;

    // Logika Perubahan Status MANUAL
    switch (action) {
        case 'CONFIRM_PAYMENT': // Oleh Buyer
            if (order.userId === session.user.id && order.status === OrderStatus.WAITING_FOR_PAYMENT) {
                newStatus = OrderStatus.WAITING_FOR_STORE_CONFIRMATION;
            }
            break;
        case 'ACCEPT_ORDER': // Oleh Seller
            if (order.storeId === session.user.storeId && order.status === OrderStatus.WAITING_FOR_STORE_CONFIRMATION) {
                newStatus = OrderStatus.PROCESSING;
            }
            break;
        case 'SHIP_ORDER': // Oleh Seller
            if (order.storeId === session.user.storeId && order.status === OrderStatus.PROCESSING) {
                newStatus = OrderStatus.SHIPPED;
            }
            break;
         case 'ARRIVE_ORDER': // Oleh Seller
            if (order.storeId === session.user.storeId && order.status === OrderStatus.SHIPPED) {
                newStatus = OrderStatus.ARRIVED;
            }
            break;
        case 'RECEIVE_ORDER': // Oleh Buyer
            if (order.userId === session.user.id && order.status === OrderStatus.ARRIVED) {
                newStatus = OrderStatus.WAITING_FOR_REVIEW;
            }
            break;

        case 'ADMIN_UPDATE_STATUS':
            if (session.user.role === Role.ADMIN && canBeModified && statusFromClient) {
                newStatus = statusFromClient;
            }
            break;
            
        case 'ADMIN_CANCEL_ORDER':
            if (session.user.role === Role.ADMIN && order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED) {
                newStatus = OrderStatus.CANCELLED;
            }
            break;
    }

    if (!newStatus) return NextResponse.json({ message: 'Invalid action or permission denied' }, { status: 400 });

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
    });

    return NextResponse.json({ status: 'success', data: updatedOrder });
}