import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Pembaruan Metadata, Judul, Deskripsi, dan Favicon dari file lokal
export const metadata: Metadata = {
  title: "HubKarya - Galeri Karya Publik",
  description: "Wadah ekspresi, literasi digital, dan dokumentasi karya terbaik dari komunitas.",
  icons: {
    icon: "/image/logo/logo.png",
    apple: "/image/logo/logo.png", // Opsional, agar logo muncul saat di-bookmark di perangkat iOS
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Mengubah atribut lang menjadi "id" (Indonesia)
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}