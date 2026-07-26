'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingCart from './FloatingCart';

export default function ClientLayout({ children, navVisibility, siteSettings, cities }: { children: React.ReactNode, navVisibility?: any, siteSettings?: any, cities?: any[] }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar navVisibility={navVisibility} siteSettings={siteSettings} />}
      {children}
      {!isAdmin && <FloatingCart />}
      {!isAdmin && <Footer siteSettings={siteSettings} cities={cities} />}
    </>
  );
}
