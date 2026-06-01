import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Providers from "@/components/Providers";

const poppins = Poppins({
  weight: ['400', '600', '700', '800'],
  variable: "--font-poppins",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoRidez - Luxury Travel & Booking",
  description: "Premium car rentals, tour packages, and villa stays.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <ClientLayout>
            <main>{children}</main>
          </ClientLayout>
        </Providers>
        {/* Portal target for react-datepicker — renders above all stacking contexts */}
        <div id="datepicker-root" style={{ position: 'relative', zIndex: 9999 }} />
      </body>
    </html>
  );
}
