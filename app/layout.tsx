import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Irmak ile Bir Zaman Seç",
  description: "Kişiye özel tarih ve saat seçim sayfası.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}