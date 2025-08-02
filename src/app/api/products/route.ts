// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import prisma from '@/lib/db';

// GET: Mengambil semua produk (Bisa diakses siapa saja untuk etalase utama)
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    return NextResponse.json({
      status: 'success',
      data: products
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Menambahkan produk baru (Hanya SELLER)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== 'SELLER') {
    return NextResponse.json({ message: 'Forbidden. Only sellers can create products.' }, { status: 403 });
  }

  try {
    const { name, description, price, imageUrl } = await req.json();

    if (!name || typeof price !== 'number' || price <= 0) {
      return NextResponse.json({ message: 'Invalid product data.' }, { status: 400 });
    }

    const store = await prisma.store.findUnique({
      where: { userId: session.user.id },
    });

    if (!store) {
        return NextResponse.json({ message: 'Seller store not found.' }, { status: 404 });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        storeId: store.id,
      },
    });

    return NextResponse.json({ status: 'success', data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}