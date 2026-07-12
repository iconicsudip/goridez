import type { Metadata } from "next";
import { Cinzel, Outfit, Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Providers from "@/components/Providers";
import { prisma } from "@/lib/prisma";
import { AntdRegistry } from '@ant-design/nextjs-registry';

const cinzel = Cinzel({
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: "--font-cinzel",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
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
  const [selfDriveCount, chauffeurCount, taxiCount, tourCount, villaCount, siteSettingsData] = await Promise.all([
    prisma.car.count({ where: { serviceTypes: { has: 'SELF_DRIVE' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'WITH_DRIVER' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'TAXI' } } }),
    prisma.tour.count(),
    prisma.villa.count(),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
  ]);

  const navVisibility = {
    showSelfDrive: selfDriveCount > 0,
    showChauffeur: chauffeurCount > 0,
    showTaxi: taxiCount > 0,
    showTours: tourCount > 0,
    showVillas: villaCount > 0
  };

  const siteSettings = siteSettingsData || {
    logoRidez: '/logo-ridez.png',
    logoFull: '/logo-full.png',
    favicon: '/favicon.ico',
    copyrightText: '© GoRidez. All rights reserved.',
  };

  return (
    <html lang="en" className={`${cinzel.variable} ${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href={siteSettings.favicon} />
      </head>
      <body suppressHydrationWarning>
        <AntdRegistry>
          <Providers>
            <ClientLayout navVisibility={navVisibility} siteSettings={siteSettings}>
              <main>{children}</main>
            </ClientLayout>
          </Providers>
        </AntdRegistry>
        {/* Portal target for react-datepicker — renders above all stacking contexts */}
        <div id="datepicker-root" style={{ position: 'relative', zIndex: 9999 }} />
      </body>
    </html>
  );
}
