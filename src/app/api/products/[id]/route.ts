// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import prisma from '@/lib/db';

// GET: Mengambil satu produk berdasarkan ID (Publik)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: { select: { id: true, name: true, description: true } }
      }
    });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ status: 'success', data: product }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Internal server error, ${error}.` }, { status: 500 });
  }
}

// PUT: Mengupdate produk (Hanya pemilik toko atau ADMIN)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const store = session.user.role === 'SELLER' ? await prisma.store.findUnique({ where: { userId: session.user.id }}) : null;
    const isOwner = store?.id === product.storeId;
    
    if (session.user.role !== 'ADMIN' && !isOwner) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updatedData = await req.json();
    const updatedProduct = await prisma.product.update({ where: { id }, data: updatedData });
    return NextResponse.json({ status: 'success', data: updatedProduct }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Internal server error, ${error}.` }, { status: 500 });
  }
}

// DELETE: Menghapus produk (Hanya pemilik toko atau ADMIN)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const store = session.user.role === 'SELLER' ? await prisma.store.findUnique({ where: { userId: session.user.id } }) : null;
    const isOwner = store?.id === product.storeId;

    if (session.user.role !== 'ADMIN' && !isOwner) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.product.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ message: `Internal server error, ${error}.` }, { status: 500 });
  }
}