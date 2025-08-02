// src/app/api/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'BUYER') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { shippingMethod, shippingCost } = await req.json();
  const userId = session.user.id;

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    // Kelompokkan item berdasarkan toko
    const itemsByStore: { [storeId: string]: typeof cartItems } = {};
    cartItems.forEach(item => {
      const storeId = item.product.storeId;
      if (!itemsByStore[storeId]) {
        itemsByStore[storeId] = [];
      }
      itemsByStore[storeId].push(item);
    });

    // Buat pesanan terpisah untuk setiap toko dalam satu transaksi
    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = [];
      for (const storeId in itemsByStore) {
        const storeItems = itemsByStore[storeId];
        const totalProductAmount = storeItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        const totalAmount = totalProductAmount + shippingCost;

        const order = await tx.order.create({
          data: {
            userId,
            storeId,
            totalAmount,
            shippingMethod,
            shippingCost,
            items: {
              create: storeItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price, // Simpan harga saat checkout
              })),
            },
          },
        });
        orders.push(order);
      }
      
      // Kosongkan keranjang setelah pesanan dibuat
      await tx.cartItem.deleteMany({ where: { userId } });
      
      return orders;
    });

    return NextResponse.json({
      status: 'success',
      message: 'Order placed successfully',
      data: createdOrders,
    }, { status: 201 });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}