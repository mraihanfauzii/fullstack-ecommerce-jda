// src/components/HeaderNav.tsx
"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import SignOutButton from "@/components/SignOutButton";

export default function HeaderNav() {
  const { user, isSeller, isBuyer, storeId, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <ul className="flex space-x-6 items-center">
        <li><div className="h-6 w-20 bg-blue-700 rounded animate-pulse"></div></li>
        <li><div className="h-6 w-24 bg-blue-700 rounded animate-pulse"></div></li>
      </ul>
    );
  }

  return (
    <nav>
      <ul className="flex space-x-6 items-center">
        {user ? (
          <>
            {/* Dashboard adalah link utama untuk semua peran yang sudah login */}
            <li><Link href="/dashboard" className="hover:text-blue-200">Dashboard</Link></li>
            
            {/* Menu khusus SELLER */}
            {isSeller && (
              <>
                <li><Link href="/products" className="hover:text-blue-200">Manage Products</Link></li>
                <li><Link href="/orders" className="hover:text-blue-200">Incoming Orders</Link></li>
                {storeId && (
                  <li><Link href={`/store/${storeId}`} className="font-bold text-white bg-green-500 px-3 py-1 rounded-md hover:bg-green-600">My Store</Link></li>
                )}
              </>
            )}

            {/* Menu khusus BUYER */}
            {isBuyer && (
              <>
                <li><Link href="/orders" className="hover:text-blue-200">My Orders</Link></li>
                <li><Link href="/cart" className="hover:text-blue-200">Cart</Link></li>
              </>
            )}
            
            {/* Link Admin Panel dihapus dari sini */}

            <li><Link href="/profile" className="hover:text-blue-200">Profile</Link></li>
            <li><SignOutButton /></li>
          </>
        ) : (
          <>
            <li><Link href="/auth/signin" className="hover:text-blue-200">Sign In</Link></li>
            <li><Link href="/auth/register" className="hover:text-blue-200">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}