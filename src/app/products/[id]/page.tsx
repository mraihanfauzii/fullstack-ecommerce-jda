// src/app/products/[id]/page.tsx

import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { AddToCartButton } from './_components/AddToCartButton';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { Prisma } from '@prisma/client';

export type ProductWithStore = Prisma.ProductGetPayload<{
  include: { store: { select: { id: true; name: true } } };
}>;

async function getProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      store: { select: { id: true,name: true }},
      reviews: {
        include: {
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
  });
  return product;
}

// Komponen Halaman Detail Produk (Server Component)
export default async function ProductDetailPage({ params }) {
  const product = await getProduct(params.id);
  const session = await getServerSession(authOptions);

  if (!product) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-4xl font-bold">Product Not Found</h1>
      </div>
    );
  }

  const isBuyer = session?.user?.role === 'BUYER';
  const isSeller = session?.user?.role === 'SELLER';
  
  // Cek kepemilikan hanya jika user adalah SELLER
  const store = isSeller ? await prisma.store.findUnique({ where: { userId: session?.user.id } }) : null;
  const isOwner = store?.id === product.store.id;

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-xl p-8 md:flex md:space-x-12">
        <div className="md:w-1/2">
          <Image
            src={product.imageUrl || '/default-product.png'}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        <div className="md:w-1/2 mt-6 md:mt-0">
          <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
          
          <div className="mt-4">
            <span className="text-gray-500">Sold by:</span>
            <Link href={`/store/${product.store.id}`} className="ml-2 text-blue-600 font-semibold hover:underline">
              {product.store.name}
            </Link>
          </div>
          
          <p className="text-gray-600 mt-4 text-lg">{product.description}</p>
          <p className="text-blue-700 font-bold text-3xl mt-6">
            Rp{product.price.toLocaleString('id-ID')}
          </p>
          
          <div className="mt-8 border-t pt-8">
            {isOwner ? (
              // HANYA jika user adalah PEMILIK TOKO, tampilkan tombol Edit
              <Link href={`/products?edit=${product.id}`} className="w-full block text-center bg-yellow-500 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-yellow-600 transition-colors">
                Edit Product
              </Link>
            ) : isBuyer ? (
              // Jika bukan pemilik, dan user adalah BUYER, tampilkan tombol Add to Cart
              <AddToCartButton product={product} />
            ) : (
              // Untuk kasus lain (Admin, Seller melihat produk orang lain, atau belum login), tampilkan pesan
              <div className="p-3 bg-gray-100 rounded-md text-sm text-center text-gray-600">
                {session ? 'Only buyers can purchase items.' : 'Login as a buyer to purchase this item.'}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Product Reviews</h2>
        <div className="space-y-6">
            {product.reviews.length > 0 ? (
                product.reviews.map(review => (
                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                            <span className="text-gray-900 font-bold">{review.user.name || 'Anonymous'}</span>
                            <span className="ml-4 text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No reviews for this product yet.</p>
            )}
        </div>
      </div>
    </div>
  );
}