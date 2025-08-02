// src/lib/authOptions.ts

import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import prisma from '@/lib/db';
import { User } from "@prisma/client"; // Impor tipe User

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Mengembalikan objek user lengkap agar bisa digunakan di callback jwt
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // === KODE INI DIPERBAIKI ===
    async jwt({ token, user }) {
      // Saat login pertama kali, 'user' akan terisi.
      if (user) {
        const dbUser = user as User; // Type assertion untuk kejelasan
        token.id = dbUser.id;
        token.role = dbUser.role;
        
        // Logika pencarian storeId dipindahkan ke dalam blok ini
        if (dbUser.role === 'SELLER') {
          const store = await prisma.store.findUnique({
            where: { userId: dbUser.id },
            select: { id: true },
          });
          token.storeId = store?.id || null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.storeId = token.storeId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.AUTH_SECRET,
};