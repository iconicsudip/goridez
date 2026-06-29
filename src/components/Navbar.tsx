'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useBookingStore } from '@/store/useBookingStore';

export default function Navbar({ navVisibility }: { navVisibility?: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const { cartItems, openCart } = useBookingStore();
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

  const isHome = pathname === '/';
  const isTransparent = isHome && !scrolled && !isOpen; // Don't be transparent if mobile menu is open

  const baseLinks = [
    { name: 'Cities', href: '/cities' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'About', href: '/about' },
  ];

  const links = [
    ...(navVisibility?.showSelfDrive ? [{ name: 'Cars', href: '/self-drive' }] : []),
    ...(navVisibility?.showChauffeur ? [{ name: 'Chauffeur', href: '/chauffeur' }] : []),
    ...(navVisibility?.showTaxi ? [{ name: 'Taxi', href: '/taxi' }] : []),
    ...(navVisibility?.showTours ? [{ name: 'Tours', href: '/tours' }] : []),
    ...(navVisibility?.showVillas ? [{ name: 'Villas', href: '/villas' }] : []),
    ...baseLinks
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isTransparent 
        ? 'bg-transparent border-transparent' 
        : 'bg-white/90 backdrop-blur-xl border-b border-gray-200 shadow-sm'
    }`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-green-600 text-white font-black text-xs w-8 h-8 rounded-lg flex items-center justify-center tracking-tighter">
            GR
          </div>
          <div className={`text-xl font-black tracking-tight transition-colors ${isTransparent ? 'text-white' : 'text-gray-900'}`}>
            Go<span className="text-green-600">Ridez</span>
          </div>
        </Link>
        
        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map(link => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href 
                  ? (isTransparent ? 'text-white font-bold' : 'text-gray-900 font-bold') 
                  : (isTransparent ? 'text-gray-200 hover:text-white' : 'text-gray-600 hover:text-gray-900')
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
              <Link href="/dashboard" className={`text-sm font-medium transition-colors ${isTransparent ? 'text-gray-200 hover:text-white' : 'text-gray-900/80 hover:text-green-700'}`}>
                My Dashboard
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className={`text-sm font-medium transition-colors ${isTransparent ? 'text-gray-200 hover:text-red-400' : 'text-gray-900/80 hover:text-red-400'}`}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className={`text-sm font-medium transition-colors ${isTransparent ? 'text-gray-200 hover:text-white' : 'text-gray-900/80 hover:text-gray-900'}`}>
                Sign In
              </Link>
              <Link href="/admin" className={`text-[10px] font-mono transition-colors ${isTransparent ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                (Admin)
              </Link>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <button 
              onClick={openCart}
              className={`relative p-2 transition-colors ${isTransparent ? 'text-white hover:text-gray-200' : 'text-gray-900 hover:text-green-700'}`}
            >
              <ShoppingBag size={20} />
              {mounted && cartItems.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-green-600 text-white text-[10px] font-black rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                  {cartItems.length}
                </span>
              )}
            </button>
            <Link href="/self-drive" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)]">
              Book Now
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className={`lg:hidden ${isTransparent ? 'text-white' : 'text-gray-900'}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden p-4 border-t border-gray-300 flex flex-col gap-4 bg-white/95 backdrop-blur-xl">
          {links.map(link => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`font-medium ${pathname === link.href ? 'text-gray-900' : 'text-gray-600'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-gray-300 pt-4 flex flex-col gap-4">
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="font-medium text-gray-900/80 hover:text-gray-900">
                  My Dashboard
                </Link>
                <button 
                  onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }} 
                  className="font-medium text-left text-gray-900/80 hover:text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="font-medium text-gray-900/80 hover:text-gray-900">
                Sign In
              </Link>
            )}
            <Link href="/self-drive" onClick={() => setIsOpen(false)} className="bg-green-600 text-white px-4 py-3 rounded-xl text-center font-bold">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
