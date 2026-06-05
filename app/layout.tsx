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

export const metadata: Metadata = {
  title: "HubKarya - Galeri Karya Publik",
  description: "Wadah ekspresi, literasi digital, dan dokumentasi karya terbaik dari komunitas.",
  icons: {
    icon: "/image/logo/logo.png",
    apple: "/image/logo/logo.png",
  },
  verification: {
    google: "NS_2uyDfRN5XgMVvZrXbeF2rYfz2qX2rJXqaSkcU0VQ",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function RootLayout({
  children,
  modal,
}: Readonly<RootLayoutProps>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
        {modal}
      </body>
    </html>
  );
}