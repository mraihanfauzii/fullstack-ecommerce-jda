"use client";

import { useSession } from "next-auth/react";

export const useCurrentUser = () => {
  const { data: session, status } = useSession();

  return {
    user: session?.user,
    isAdmin: session?.user?.role === 'ADMIN',
    isSeller: session?.user?.role === 'SELLER',
    isBuyer: session?.user?.role === 'BUYER',
    storeId: session?.user?.storeId,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
  };
};