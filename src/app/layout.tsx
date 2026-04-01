import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import SearchModal from "@/components/SearchModal";
import AuthProvider from "@/components/AuthProvider";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Noori Fashion | Premium Women's Fashion in Bangladesh",
  description:
    "Noori Fashion — Bangladesh's premium women's fashion brand. Shop exclusive boutique dresses, stitch & unstitch collections, plazo sets, and co-ord sets.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Noori Fashion | Premium Women's Fashion",
    description: "Discover our exclusive collection of premium women's fashion.",
    url: "https://noori.diptait.com.bd",
    siteName: "Noori Fashion",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <SearchModal />
        <WhatsAppButton />
        <ScrollToTop />
      </body>
    </html>
  );
}
