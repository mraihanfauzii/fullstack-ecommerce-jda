// src/app/api/admin/cancel-orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ message: 'User ID is required' }, { status: 400 });

    try {
        await prisma.order.updateMany({
            where: {
                OR: [{ userId: userId }, { store: { userId: userId } }],
                status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }
            },
            data: { status: OrderStatus.CANCELLED }
        });
        return NextResponse.json({ status: 'success', message: 'All active orders for the user have been cancelled.' });
    } catch (error) {
        return NextResponse.json({ message: `Failed to cancel orders, ${error}.` }, { status: 500 });
    }
}