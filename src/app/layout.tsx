import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Providers from "@/components/Providers";
import { prisma } from "@/lib/prisma";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [selfDriveCount, chauffeurCount, taxiCount, tourCount, villaCount] = await Promise.all([
    prisma.car.count({ where: { serviceTypes: { has: 'SELF_DRIVE' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'WITH_DRIVER' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'TAXI' } } }),
    prisma.tour.count(),
    prisma.villa.count()
  ]);

  const navVisibility = {
    showSelfDrive: selfDriveCount > 0,
    showChauffeur: chauffeurCount > 0,
    showTaxi: taxiCount > 0,
    showTours: tourCount > 0,
    showVillas: villaCount > 0
  };

  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <ClientLayout navVisibility={navVisibility}>
            <main>{children}</main>
          </ClientLayout>
        </Providers>
        {/* Portal target for react-datepicker — renders above all stacking contexts */}
        <div id="datepicker-root" style={{ position: 'relative', zIndex: 9999 }} />
      </body>
    </html>
  );
}
