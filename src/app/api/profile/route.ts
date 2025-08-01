import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/authOptions";
import prisma from '@/lib/db';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, password } = await req.json();
    const userId = session.user.id;

    if (!name && !email && !password) {
      return NextResponse.json({ message: 'No data provided for update' }, { status: 400 });
    }

    // 1. Cek keberadaan user dengan prisma.user.findUnique
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // 2. Siapkan data untuk diupdate
    const updatedData: { name?: string; email?: string; password?: string } = {};
    if (name !== undefined) updatedData.name = name;
    if (email !== undefined) updatedData.email = email;
    if (password !== undefined) {
        // Hashing password sebelum disimpan
      updatedData.password = password;
    }

    // 3. Update user dengan prisma.user.update
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    if (updatedUser) {
      // 4. Perbaikan pada destructuring: 'password' dihindari
      const { password: _, ...userWithoutPassword } = updatedUser;
      return NextResponse.json(userWithoutPassword, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
    }

  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}