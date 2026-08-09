import type { Metadata } from "next";
import { Cinzel, Outfit, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Providers from "@/components/Providers";
import { prisma } from "@/lib/prisma";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { unstable_cache } from 'next/cache';

const getCachedLayoutData = unstable_cache(
  async () => {
    const [selfDriveCount, chauffeurCount, taxiCount, tourCount, villaCount, siteSettingsData, cities] = await Promise.all([
      prisma.car.count({ where: { serviceTypes: { has: 'SELF_DRIVE' } } }),
      prisma.car.count({ where: { serviceTypes: { has: 'WITH_DRIVER' } } }),
      prisma.car.count({ where: { serviceTypes: { has: 'TAXI' } } }),
      prisma.tour.count(),
      prisma.villa.count(),
      prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
      prisma.city.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } })
    ]);
    return {
      selfDriveCount,
      chauffeurCount,
      taxiCount,
      tourCount,
      villaCount,
      siteSettingsData,
      cities
    };
  },
  ['root-layout-data'],
  { revalidate: 300 }
);

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
  const { selfDriveCount, chauffeurCount, taxiCount, tourCount, villaCount, siteSettingsData, cities } = await getCachedLayoutData();

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

  const {
    googleAnalyticsId = '',
    googleSearchConsoleVerification = '',
    googleTagManagerId = '',
    googleAdsensePublisherId = '',
  } = siteSettingsData || {};

  return (
    <html lang="en" className={`${cinzel.variable} ${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href={siteSettings.favicon || '/favicon.ico'} />
        <link rel="shortcut icon" href={siteSettings.favicon || '/favicon.ico'} />
        <link rel="apple-touch-icon" href={siteSettings.favicon || '/favicon.ico'} />
        {googleSearchConsoleVerification && (
          <meta name="google-site-verification" content={googleSearchConsoleVerification} />
        )}
        {googleTagManagerId && (
          <Script id="gtm-head" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${googleTagManagerId}');`}
          </Script>
        )}
        {googleAnalyticsId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${googleAnalyticsId}');`}
            </Script>
          </>
        )}
        {googleAdsensePublisherId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${googleAdsensePublisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body suppressHydrationWarning>
        {googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <AntdRegistry>
          <Providers>
            <ClientLayout navVisibility={navVisibility} siteSettings={siteSettings} cities={cities}>
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
