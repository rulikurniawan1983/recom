import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SLIDER - REKOMENDASI ONLINE",
  description: "Sistem layanan informasi untuk rekomendasi Nomor Kontrol Veteriner dan Dokter Hewan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900">{children}</body>
    </html>
  );
}
