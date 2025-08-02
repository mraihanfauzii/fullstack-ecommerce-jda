// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { OrderStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'BUYER') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { orderId, productId, rating, comment } = await req.json();
    if (!orderId || !productId || !rating) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    try {
        // Transaksi untuk membuat ulasan dan menyelesaikan pesanan
        const result = await prisma.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    orderId,
                    productId,
                    userId: session.user.id,
                    rating: Number(rating),
                    comment,
                }
            });

            await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.COMPLETED }
            });

            return review;
        });

        return NextResponse.json({ status: 'success', data: result }, { status: 201 });

    } catch (error) {
        console.error("Submit review error:", error);
        return NextResponse.json({ message: 'Failed to submit review' }, { status: 500 });
    }
}