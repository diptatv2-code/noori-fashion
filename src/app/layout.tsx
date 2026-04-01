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
    "Noori Fashion — Premium Women's Fashion. Indian & Pakistani Boutique Collection. Exclusive, Stitch, Unstitch, Plazo Set & Co-ord Set. Visit us at Police Plaza Concord, Gulshan-1, Dhaka.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Noori Fashion | Premium Women's Fashion",
    description: "Premium Indian & Pakistani Boutique Collection. Exclusive, Stitch, Unstitch, Plazo Set & Co-ord Set. Visit our store at Police Plaza Concord, Gulshan-1, Dhaka.",
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
