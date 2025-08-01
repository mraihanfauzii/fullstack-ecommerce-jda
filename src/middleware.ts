import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const { pathname, searchParams } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname === "/") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    const protectedPaths = [
      "/dashboard",
      "/profile",
      "/cart",
      "/products",
    ];

    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (isProtectedPath) {
      if (!token) {
        const url = new URL("/auth/signin", req.url);
        url.searchParams.set("callbackUrl", pathname + searchParams.toString());
        return NextResponse.redirect(url);
      }
    }

    if (token && (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/register"))) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      authorized: ({ token }) => {
        return true;
      },
    },
  }
);


export const config = {
  matcher: [
    "/",
    "/dashboard/:path*", // Melindungi semua path di bawah /dashboard
    "/profile/:path*", // Melindungi semua path di bawah /profile
    "/cart/:path*",     // Melindungi semua path di bawah /cart
    "/products",        // Melindungi halaman manajemen produk /products (bukan detail produk /products/[id])
    "/auth/signin",     // Memungkinkan middleware untuk memproses halaman signin (untuk redirect jika sudah login)
    "/auth/register",   // Memungkinkan middleware untuk memproses halaman register (untuk redirect jika sudah login)
  ],
};