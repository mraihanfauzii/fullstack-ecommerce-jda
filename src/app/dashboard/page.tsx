// src/app/dashboard/page.tsx

import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Product, Store, Role, Order } from "@prisma/client";
import { AdminDashboard } from "./_components/AdminDashboard"; // Komponen Admin Dashboard BARU

// Tipe data helper
type ProductWithStore = Product & { store: { name: string } };
type OrderWithUser = Order & { user: { name: string | null }};

// Komponen Dashboard untuk Buyer
function BuyerDashboard({ products, sessionUser }: { products: ProductWithStore[], stores: Store[], sessionUser: Session['user'] }) {
    return (
      <>
        <div className="bg-white p-8 rounded-lg shadow-md mb-8 text-center">
            <h1 className="text-gray-700 text-3xl font-bold mb-4">Welcome to Your Dashboard!</h1>
            <p className="text-gray-700 text-lg">Hello, {sessionUser.name || sessionUser.email}!</p>
        </div>
        <h2 className="text-4xl font-bold text-center mb-10">Our Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform hover:scale-105">
                    <Link href={`/products/${product.id}`}><Image src={product.imageUrl || '/default-product.png'} alt={product.name} width={400} height={300} className="w-full h-48 object-cover" /></Link>
                    <div className="p-5">
                        <h3 className="text-gray-700 text-xl font-semibold mb-2 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">Sold by: {product.store.name}</p>
                        <p className="text-blue-600 font-bold text-lg">Rp{product.price.toLocaleString('id-ID')}</p>
                        <Link href={`/products/${product.id}`} className="mt-4 block text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">View Details</Link>
                    </div>
                </div>
            ))}
        </div>
      </>
    );
}

// Komponen Dashboard untuk Seller
function SellerDashboard({ storeName, todaySales, totalSales, recentOrders }: { storeName: string, todaySales: number, totalSales: number, recentOrders: OrderWithUser[] }) {
    return (
        <>
            <h1 className="text-4xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-lg text-white-600 mb-8">Welcome, {storeName}!</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500 text-sm font-medium">Sales Today</h3><p className="text-3xl font-bold mt-1 text-gray-900">Rp{todaySales.toLocaleString('id-ID')}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500 text-sm font-medium">Total Sales</h3><p className="text-3xl font-bold mt-1 text-gray-900">Rp{totalSales.toLocaleString('id-ID')}</p></div>
                <div className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-gray-500 text-sm font-medium">Grafik Penjualan</h3><p className="text-gray-400 mt-2">Fitur grafik akan segera hadir.</p></div>
            </div>
            <div className="bg-white shadow-md rounded-lg">
                <div className="p-6 border-b flex justify-between items-center"><h2 className="text-gray-900 text-2xl font-bold">Recent Orders</h2><Link href="/orders" className="text-blue-600 hover:underline font-semibold">View All Orders</Link></div>
                <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{recentOrders.map(order => (<tr key={order.id}><td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">{order.user.name}</td><td className="px-6 py-4 whitespace-nowrap text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap text-gray-700">Rp{order.totalAmount.toLocaleString('id-ID')}</td></tr>))}</tbody></table></div>
                {recentOrders.length === 0 && <p className="text-center text-gray-500 py-10">No recent orders.</p>}
            </div>
        </>
    );
}


// Halaman Dashboard utama yang mengatur logika peran
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const { user } = session;
  let content;

  switch (user.role) {
    case 'SELLER':
      const store = await prisma.store.findUnique({ where: { userId: user.id } });
      if (!store) return <p>Error: Seller account not associated with a store.</p>;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const salesToday = await prisma.order.aggregate({ _sum: { totalAmount: true }, where: { storeId: store.id, createdAt: { gte: today } } });
      const allSales = await prisma.order.aggregate({ _sum: { totalAmount: true }, where: { storeId: store.id } });
      const recentOrders = await prisma.order.findMany({ where: { storeId: store.id }, include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }) as OrderWithUser[];
      content = <SellerDashboard storeName={store.name} todaySales={salesToday._sum.totalAmount || 0} totalSales={allSales._sum.totalAmount || 0} recentOrders={recentOrders} />;
      break;
    
    case 'ADMIN':
      // Untuk Admin, kita ambil semua data Seller dan Buyer
      const sellers = await prisma.user.findMany({
        where: { role: Role.SELLER },
        include: {
            store: { include: { _count: { select: { orders: true } } } }
        }
      });
      const buyers = await prisma.user.findMany({
        where: { role: Role.BUYER },
        include: {
            _count: {
                select: { orders: true }
            }
        }
      });
      content = <AdminDashboard initialSellers={sellers} initialBuyers={buyers} />;
      break;

    case 'BUYER':
      const products = await prisma.product.findMany({ take: 8, orderBy: { createdAt: 'desc' }, include: { store: { select: { name: true } } } }) as ProductWithStore[];
      const stores = await prisma.store.findMany({ take: 6 });
      content = <BuyerDashboard products={products} stores={stores} sessionUser={user} />;
      break;
    
    default:
      content = <p>Invalid user role.</p>;
  }

  return (
    <div className="container mx-auto p-8">
      {content}
    </div>
  );
}