// src/app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, storeName } = await req.json();

    // Validasi input dasar
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    if (role === 'SELLER' && !storeName) {
      return NextResponse.json({ message: 'Store name is required for sellers' }, { status: 400 });
    }

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    // Cek apakah nama toko sudah ada (jika mendaftar sebagai seller)
    if (role === 'SELLER') {
        const existingStore = await prisma.store.findUnique({ where: { name: storeName }});
        if (existingStore) {
            return NextResponse.json({ message: 'Store name already taken' }, { status: 409 });
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Proses pembuatan user dan toko dalam satu transaksi
    if (role === 'SELLER') {
      const newUserAndStore = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            role: 'SELLER',
          },
        });

        const store = await tx.store.create({
          data: {
            name: storeName,
            userId: user.id,
            description: `Welcome to ${storeName}!`,
          },
        });

        return { user, store };
      });

      return NextResponse.json({
        status: 'success',
        message: 'Seller and store registered successfully',
        user: newUserAndStore.user,
      }, { status: 201 });

    } else { // Pendaftaran sebagai BUYER
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'BUYER', // atau biarkan default
        },
      });

      return NextResponse.json({
        status: 'success',
        message: 'User registered successfully',
        user: user
      }, { status: 201 });
    }

  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}