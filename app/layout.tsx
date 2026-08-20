import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Purnima Electronics | Genuine Gadgets, Appliances & Tech in Bangladesh",
  description:
    "Buy authentic 4K Smart TVs, smartphones, inverter ACs, refrigerators, and laptops at unbeatable prices with fast nationwide home delivery via Pathao Courier.",
  openGraph: {
    title: "Purnima Electronics | Official Gadget & Appliance Retailer",
    description:
      "Buy authentic 4K Smart TVs, smartphones, inverter ACs, refrigerators, and laptops with official warranty in Bangladesh.",
    url: "https://purnimaelectronics.com",
    siteName: "Purnima Electronics",
    locale: "en_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
