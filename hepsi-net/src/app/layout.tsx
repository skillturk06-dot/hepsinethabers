import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEPSİ NET — Haber Merkezi",
  description: "Canlı haber izleme ve içerik üretim platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-text-primary antialiased">{children}</body>
    </html>
  );
}
