'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useBookingStore } from '@/store/useBookingStore';

export default function Navbar({ navVisibility, siteSettings }: { navVisibility?: any, siteSettings?: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const { cartItems } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initialize
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled && !isOpen; // Don't be transparent if mobile menu is open
  const logoSrc = isTransparent
    ? (siteSettings?.logoRidez || '/logo-ridez.png')
    : (siteSettings?.logoFull || '/logo-full.png');
  const mobileLogoSrc = siteSettings?.logoFull || '/logo-full.png';

  const baseLinks = [
    { name: 'Cities', href: '/cities' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'About', href: '/about' },
  ];

  const links = [
    { name: 'Self Drive', href: '/self-drive' },
    { name: 'Taxi', href: '/taxi' },
    ...baseLinks
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isTransparent
        ? 'bg-transparent border-transparent'
        : 'bg-white/90 backdrop-blur-xl border-b border-brand-border shadow-sm'
        }`}>
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-32 shrink-0">
              <Image
                src={logoSrc}
                alt="GoRidez Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </Link>

          {/* Center: Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors ${pathname?.startsWith(link.href)
                  ? 'text-green-500 font-black'
                  : (isTransparent ? 'text-gray-300 hover:text-white font-medium' : 'text-gray-650 hover:text-gray-900 font-medium')
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="hidden lg:flex items-center gap-6">
            {status === 'authenticated' ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard" className={`text-sm font-medium transition-colors ${isTransparent ? 'text-gray-300 hover:text-white' : 'text-gray-650 hover:text-gray-900'}`}>
                  My Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={`text-sm font-medium transition-colors ${isTransparent ? 'text-gray-300 hover:text-red-400' : 'text-gray-650 hover:text-red-500'}`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className={`text-sm font-medium transition-colors ${isTransparent ? 'text-gray-300 hover:text-white' : 'text-gray-650 hover:text-gray-900'}`}>
                  Sign In
                </Link>
                <Link href="/admin" className={`text-[10px] font-mono transition-colors ${isTransparent ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                  (Admin)
                </Link>
              </div>
            )}

            <div className="flex items-center gap-4">
              <Link
                href="/cart"
                className={`relative p-2 transition-colors ${isTransparent ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-white'}`}
              >
                <ShoppingBag size={20} />
                {mounted && cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-brand-gold text-white text-[10px] font-black rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-[0_0_8px_rgba(173,255,0,0.3)]">
                    {cartItems.length}
                  </span>
                )}
              </Link>
              <Link href="/self-drive" className="bg-brand-gold hover:bg-[#8dbb00] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(173,255,0,0.3)] border border-[#ADFF00]">
                Book Now
              </Link>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button className={`lg:hidden ${isTransparent ? 'text-white' : 'text-gray-900'}`} onClick={() => setIsOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-[100dvh] w-[280px] bg-white z-[70] lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          } overflow-y-auto`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="relative h-9 w-28 shrink-0">
              <Image
                src={mobileLogoSrc}
                alt="GoRidez Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </Link>
          <button className="text-gray-500 hover:text-gray-900" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {links.map(link => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`py-2 transition-colors ${pathname?.startsWith(link.href)
                ? 'text-[#ADFF00] font-black'
                : 'text-gray-600 font-medium hover:text-gray-900'
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-6 mt-2 flex flex-col gap-4">
            <Link href="/cart" onClick={() => setIsOpen(false)} className="font-medium py-2 text-gray-650 hover:text-gray-900 flex items-center justify-between">
              <span>My Garage Cart</span>
              {cartItems.length > 0 && (
                <span className="bg-brand-gold text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="font-medium py-2 text-gray-600 hover:text-gray-900">
                  My Dashboard
                </Link>
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }}
                  className="font-medium py-2 text-left text-gray-600 hover:text-red-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="font-medium py-2 text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
            )}
            <Link href="/self-drive" onClick={() => setIsOpen(false)} className="bg-brand-gold text-white px-4 py-3 rounded-xl text-center font-bold mt-4 shadow-lg shadow-[0_0_15px_rgba(173,255,0,0.3)]">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
