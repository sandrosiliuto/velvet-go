import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VELVET contactos · Acceso Exclusivo VIP",
  description: "EN LA VIDA TODO SON CONTACTOS. VELVET contactos: socialité selectivo, lujo y conexiones VIP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${cinzel.variable} ${inter.variable} antialiased min-h-screen bg-[#0A0A0A] text-[#F4EADE] overflow-x-hidden`}>
        <div className="fixed inset-0 pointer-events-none velvet-radial" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
