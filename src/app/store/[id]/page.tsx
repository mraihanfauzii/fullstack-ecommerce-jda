// src/app/store/[id]/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';

// Fungsi untuk mengambil data toko beserta produknya
async function getStore(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      products: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  return store;
}

export default async function StorePage({ params }: { params: { id: string } }) {
  const store = await getStore(params.id);

  if (!store) {
    return <div className="text-center p-8">Store not found.</div>;
  }

  return (
    <div className="container mx-auto p-8">
      {/* Bagian Header Toko */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-10">
        <h1 className="text-4xl font-bold text-gray-800">{store.name}</h1>
        <p className="text-gray-600 mt-2">{store.description}</p>
      </div>

      {/* Bagian Daftar Produk */}
      <h2 className="text-3xl font-bold mb-6">Products from {store.name}</h2>
      {store.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {store.products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105">
              <Link href={`/products/${product.id}`}>
                <Image
                  src={product.imageUrl || '/default-product.png'}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-5">
                <h3 className="text-gray-700 text-xl font-semibold mb-2 truncate">
                  <Link href={`/products/${product.id}`} className="hover:text-blue-600">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-blue-600 font-bold text-lg">
                  Rp{product.price.toLocaleString('id-ID')}
                </p>
                <Link href={`/products/${product.id}`} className="mt-4 block text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">This store has no products yet.</p>
      )}
    </div>
  );
}