import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hapus data lama dengan urutan yang benar untuk menghindari error foreign key
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  console.log('Old data cleared.');

  // --- Hashing Passwords ---
  const adminPassword = await bcrypt.hash('adminpassword', 10);
  const sellerPassword = await bcrypt.hash('sellerpassword', 10);
  const buyerPassword = await bcrypt.hash('buyerpassword', 10);

  // --- Create ADMIN User ---
  const adminUser = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: Role.ADMIN, // Menggunakan Enum
    },
  });
  console.log(`Created admin user: ${adminUser.email}`);

  // --- Create SELLER User and a Store for them ---
  const sellerUser = await prisma.user.create({
    data: {
      name: 'Toko Elektronik Cemerlang',
      email: 'seller@example.com',
      password: sellerPassword,
      role: Role.SELLER, // Menggunakan Enum
      // Buat toko bersamaan dengan user
      store: {
        create: {
          name: 'Toko Elektronik Cemerlang',
          description: 'Menjual berbagai macam barang elektronik original dan bergaransi.',
        },
      },
    },
    // Sertakan data toko yang baru dibuat dalam hasil
    include: {
      store: true,
    },
  });
  console.log(`Created seller user: ${sellerUser.email} with store: ${sellerUser.store?.name}`);

  // --- Create BUYER User ---
  const buyerUser = await prisma.user.create({
    data: {
      name: 'Budi Pembeli',
      email: 'buyer@example.com',
      password: buyerPassword,
      role: Role.BUYER, // Menggunakan Enum
    },
  });
  console.log(`Created buyer user: ${buyerUser.email}`);


  // --- Create Products for the SELLER's store ---
  const storeId = sellerUser.store?.id;
  if (!storeId) {
    console.error("Could not find store ID for seller. Aborting product seed.");
    return;
  }
  console.log(`Seeding products for store ID: ${storeId}`);

  const productsToCreate = [
    { name: "DJI Mini 4 Pro", description: "Drone kamera mini yang ringkas namun bertenaga.", price: 9900000, imageUrl: "/dji-mini-4-pro.jpg" },
    { name: "Sony Alpha a7 III", description: "Kamera mirrorless full-frame dengan sensor 24.2MP.", price: 25000000, imageUrl: "/sony-a7iii.jpg" },
    { name: "Logitech MX Master 3S", description: "Mouse ergonomis canggih dengan presisi tinggi.", price: 1500000, imageUrl: "/logitech-mx-master-3s.jpg" },
    { name: "Apple MacBook Air M3", description: "Laptop tipis dan ringan dengan chip Apple M3.", price: 18000000, imageUrl: "/macbook-air-m3.jpeg" },
    { name: "Samsung Galaxy S24 Ultra", description: "Smartphone flagship dengan kamera 200MP.", price: 21999000, imageUrl: "/samsung-s24-ultra.jpg" },
  ];

  for (const productData of productsToCreate) {
    await prisma.product.create({
      data: {
        ...productData,
        storeId: storeId, // Hubungkan produk dengan toko
      },
    });
    console.log(`Created product: ${productData.name}`);
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });