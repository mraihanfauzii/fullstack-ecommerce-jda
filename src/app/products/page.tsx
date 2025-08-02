// src/app/products/page.tsx

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { ProductManager } from "./_components/ProductManager";

// Fungsi untuk mengambil data awal untuk halaman
async function getSellerData(session: Session | null, editProductId?: string) {
    if (session?.user?.role !== 'SELLER' || !session?.user?.id) {
        redirect("/dashboard");
    }

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
    });
    if (!store) return { myProducts: [], productToEdit: null };

    const myProducts = await prisma.product.findMany({
        where: { storeId: store.id },
        orderBy: { createdAt: 'desc' },
    });

    let productToEdit = null;
    if (editProductId) {
        productToEdit = await prisma.product.findFirst({
            where: { id: editProductId, storeId: store.id } // Pastikan produk milik seller
        });
    }

    return { myProducts, productToEdit };
}

// Komponen utama halaman (Server Component)
export default async function ProductManagementPage({ searchParams }: { searchParams: { edit?: string } }) {
  const session = await getServerSession(authOptions);
    const { myProducts, productToEdit } = await getSellerData(session, searchParams.edit);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-6">My Product Management</h1>
      <p className="text-center text-white-600 mb-10">Add, edit, or remove products for your store.</p>
      
      <div className="mb-12">
        <ProductManager initialProducts={myProducts} productToEdit={productToEdit} />
      </div>
    </div>
  );
}