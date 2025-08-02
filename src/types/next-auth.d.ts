import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: 'ADMIN' | 'BUYER' | 'SELLER';
      storeId?: string | null;
    } & Omit<DefaultSession["user"], 'role'>;
  }

  interface User {
    id: string;
    role?: 'ADMIN' | 'BUYER' | 'SELLER';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: 'ADMIN' | 'BUYER' | 'SELLER';
    storeId?: string | null;
  }
}