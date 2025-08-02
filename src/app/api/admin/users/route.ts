import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";

// GET: Mengambil semua user (BUYER dan SELLER)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: {
      role: {
        in: [Role.BUYER, Role.SELLER]
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ status: 'success', data: users });
}

// DELETE: Menghapus user
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ message: 'User ID is required' }, { status: 400 });

  try {
    const activeOrderCount = await prisma.order.count({
        where: {
            OR: [{ userId: userId }, { store: { userId: userId } }],
            status: { notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED] }
        }
    });

    if (activeOrderCount > 0) {
        return NextResponse.json({ message: 'Cannot delete user. Please cancel all their active orders first.' }, { status: 409 }); // 409 Conflict
    }

    await prisma.$transaction(async (tx) => {
        const store = await tx.store.findUnique({ where: { userId } });
        if (store) {
            await tx.product.deleteMany({ where: { storeId: store.id } });
            await tx.store.delete({ where: { id: store.id } });
        }
        await tx.user.delete({ where: { id: userId } });
    });
    
    return NextResponse.json({ status: 'success', message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ message: `Failed to delete user, ${error}.` }, { status: 500 });
  }
}