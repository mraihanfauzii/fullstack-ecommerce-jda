# Multi-Vendor E-Commerce Marketplace

Selamat datang di proyek Multi-Vendor E-Commerce Marketplace! Ini adalah aplikasi web full-stack yang dibangun menggunakan Next.js (App Router), meniru fungsionalitas inti dari platform seperti Tokopedia atau Shopee. Proyek ini memungkinkan pengguna untuk mendaftar sebagai pembeli (Buyer) atau sebagai penjual (Seller) yang dapat membuka toko dan mengelola produk mereka sendiri.

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?logo=next.js)](https://nextjs.org)
[![Powered by Vercel](https://img.shields.io/badge/Powered%20by-Vercel-black?logo=vercel)](https://vercel.com)

---

##  Demo Langsung

[**Klik di sini untuk mengunjungi live demo di Vercel**](https://fullstack-ecommerce-jda.vercel.app/)

---

## Fitur Utama 🚀

Aplikasi ini memiliki tiga peran pengguna dengan fungsionalitas yang berbeda dan terdefinisi dengan baik: **Admin**, **Seller**, dan **Buyer**.

### 🏪 Fitur Seller

Seller adalah pengguna yang dapat membuat toko dan menjual produk mereka sendiri.

-   **Registrasi Toko**: Saat mendaftar, pengguna dapat memilih peran "Seller" dan langsung membuat toko mereka.
-   **Seller Dashboard**: Halaman `/dashboard` khusus untuk Seller yang menampilkan:
    -   Statistik penjualan (penjualan hari ini, total penjualan).
    -   Daftar pesanan terbaru yang masuk ke toko mereka.
-   **Manajemen Produk (CRUD)**:
    -   Halaman `/products` khusus untuk menambah, melihat, mengedit, dan menghapus produk **milik toko mereka sendiri**.
    -   Update daftar produk terjadi secara *real-time* di halaman setelah aksi dilakukan (tanpa perlu refresh).
-   **Manajemen Pesanan**:
    -   Melihat daftar pesanan yang masuk di halaman `/orders`.
    -   Melihat detail setiap pesanan dan memperbarui statusnya secara manual (Terima Pesanan, Kirim, Tandai Tiba).
-   **Halaman Toko Publik**: Setiap toko memiliki halaman publik (`/store/[id]`) yang menampilkan informasi toko dan semua produk yang mereka jual.

### 🛒 Fitur Buyer

Buyer adalah pengguna umum yang melakukan pembelian di marketplace.

-   **Dashboard Utama**: Melihat etalase produk dari berbagai toko.
-   **Keranjang Belanja (CRUD)**:
    -   Menambahkan produk ke keranjang dari halaman detail produk.
    -   Melihat, mengubah kuantitas, dan menghapus item dari keranjang.
-   **Proses Checkout**:
    -   Halaman checkout yang menampilkan ringkasan pesanan.
    -   Pilihan metode pengiriman (dummy) dengan biaya yang berbeda.
    -   Metode pembayaran (dummy).
-   **Siklus Hidup Transaksi**:
    -   Melihat daftar semua transaksi di halaman `/orders` dengan filter berdasarkan status, harga, dan tanggal.
    -   Melihat detail setiap transaksi.
    -   Melakukan aksi seperti "Konfirmasi Pembayaran" dan "Pesanan Diterima".
-   **Sistem Ulasan Produk**:
    -   Setelah pesanan tiba, status berubah menjadi `WAITING_FOR_REVIEW`.
    -   Buyer dapat memberikan ulasan (rating bintang dan komentar) untuk produk yang dibeli.
    -   Setelah ulasan diberikan, status pesanan otomatis menjadi `COMPLETED`.
    -   Ulasan akan tampil di halaman detail produk terkait.

### 👤 Fitur Admin

Admin memiliki kontrol tingkat tinggi atas ekosistem platform, dengan fokus pada manajemen pengguna dan pengawasan transaksi.

-   **Dashboard Terintegrasi**: Panel admin terintegrasi langsung ke dalam halaman `/dashboard`, menampilkan daftar semua Seller dan Buyer.
-   **Manajemen Pengguna**:
    -   Melihat daftar Seller dan Buyer secara terpisah.
    -   **Pencarian & Penyortiran**: Mencari pengguna berdasarkan nama/email dan menyortir berdasarkan jumlah pesanan.
    -   **Detail Pengguna**: Melihat halaman detail untuk setiap pengguna yang berisi informasi akun dan daftar pesanan aktif mereka.
-   **Manajemen Pesanan**:
    -   Admin dapat melihat detail transaksi dari pengguna manapun.
    -   **Pembatalan Pesanan**: Admin memiliki wewenang untuk membatalkan pesanan aktif milik pengguna mana pun.
    -   **Perubahan Status**: Admin dapat mengubah status pesanan apapun (kecuali yang sudah selesai) secara manual.
-   **Penghapusan Pengguna yang Aman**:
    -   Admin dapat menghapus akun Seller atau Buyer.
    -   Sistem akan mencegah penghapusan jika pengguna masih memiliki pesanan aktif. Admin harus membatalkan semua pesanan terlebih dahulu.

---

## Teknologi yang Digunakan

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Database**: PostgreSQL (di-host di [Neon](https://neon.tech/))
-   **Autentikasi**: [NextAuth.js](https://next-auth.js.org/)
-   **State Management (Notifikasi)**: [Redux Toolkit](https://redux-toolkit.js.org/)

---

## Instalasi & Konfigurasi Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

**1. Clone Repositori**
```bash
git clone [https://github.com/NAMA_PENGGUNA_ANDA/NAMA_REPOSITORI_ANDA.git](https://github.com/NAMA_PENGGUNA_ANDA/NAMA_REPOSITORI_ANDA.git)
cd NAMA_REPOSITORI_ANDA
```

**2. Install Dependencies**
```bash
npm install
```

**3. Siapkan Environment Variables**
Salin file `.env.example` menjadi `.env.local` dan isi nilainya.
```bash
cp .env.example .env.local
```
Anda perlu mengisi variabel berikut di dalam `.env.local`:
```env
# URL koneksi ke database PostgreSQL Anda (misal dari Neon)
DATABASE_URL="postgresql://..."

# Secret key untuk NextAuth.js (buat string acak yang panjang)
# Anda bisa generate di sini: [https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
AUTH_SECRET="..."
```

**4. Jalankan Migrasi Database**
Perintah ini akan menyinkronkan skema Prisma dengan database Anda.
```bash
npx prisma migrate dev
```

**5. (Opsional) Seed Database**
Perintah ini akan mengisi database Anda dengan data awal (admin, seller, buyer, produk, dll.) agar aplikasi bisa langsung digunakan.
```bash
npx prisma db seed
```

**6. Jalankan Development Server**
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
