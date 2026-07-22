'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard, Calendar, ShieldCheck, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useBookingStore } from '@/store/useBookingStore';

export default function Navbar({ navVisibility, siteSettings }: { navVisibility?: any, siteSettings?: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session, status } = useSession();
  const { cartItems } = useBookingStore();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
  const isTransparent = isHome && !scrolled && !isOpen;
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

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : session?.user?.email
    ? session.user.email.charAt(0).toUpperCase()
    : 'U';

  const isAdmin = (session?.user as any)?.role === 'ADMIN' || session?.user?.email === 'admin@goridez.com';

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

          {/* Center: Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map(link => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm transition-colors ${pathname?.startsWith(link.href)
                  ? 'text-[#8dbb00] font-black'
                  : (isTransparent ? 'text-gray-300 hover:text-white font-medium' : 'text-gray-650 hover:text-gray-900 font-medium')
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className={`relative p-2 transition-colors ${isTransparent ? 'text-white hover:text-gray-200' : 'text-gray-700 hover:text-gray-900'}`}
            >
              <ShoppingBag size={20} />
              {mounted && cartItems.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-brand-gold text-white text-[10px] font-black rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-md">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* Book Now Button */}
            <Link href="/self-drive" className="bg-brand-gold hover:bg-[#8dbb00] text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md cursor-pointer">
              Book Now
            </Link>

            {/* User Avatar Dropdown (Right Most) */}
            {status === 'authenticated' ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all border cursor-pointer ${
                    isTransparent
                      ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                      : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800'
                  }`}
                  title={session.user?.name || 'My Account'}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-gold text-white font-black text-xs flex items-center justify-center shadow-md border border-white/30 shrink-0">
                    {session.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt="Profile Avatar"
                        width={32}
                        height={32}
                        className="rounded-full object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <ChevronDown size={13} className={`mr-1 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {session.user?.name || 'Logged In User'}
                      </p>
                      <p className="text-[10px] text-gray-500 font-mono truncate mt-0.5">
                        {session.user?.email || ''}
                      </p>
                    </div>

                    {/* Menu Links */}
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <LayoutDashboard size={15} className="text-brand-gold" />
                        My Dashboard
                      </Link>

                      <Link
                        href="/customer/bookings"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <Calendar size={15} className="text-brand-gold" />
                        My Bookings
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-purple-700 bg-purple-50/50 hover:bg-purple-100 transition-colors"
                        >
                          <ShieldCheck size={15} className="text-purple-600" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    {/* Sign Out Action */}
                    <div className="border-t border-gray-100 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                  isTransparent
                    ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                    : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800'
                }`}
              >
                <User size={15} className="text-brand-gold" />
                Sign In
              </Link>
            )}
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
                ? 'text-green-600 font-black'
                : 'text-gray-600 font-medium hover:text-gray-900'
                }`}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="border-t border-gray-100 pt-6 mt-2 flex flex-col gap-3">
            <Link href="/cart" onClick={() => setIsOpen(false)} className="font-medium py-2 text-gray-700 hover:text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-brand-gold" /> My Garage Cart
              </span>
              {cartItems.length > 0 && (
                <span className="bg-brand-gold text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {status === 'authenticated' ? (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                  <div className="w-9 h-9 rounded-full bg-brand-gold text-white font-black text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 truncate">{session.user?.name || 'Account'}</p>
                    <p className="text-[10px] text-gray-500 truncate">{session.user?.email}</p>
                  </div>
                </div>

                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-xs font-bold text-gray-700 py-1.5 flex items-center gap-2">
                  <LayoutDashboard size={14} className="text-brand-gold" /> My Dashboard
                </Link>
                
                <Link href="/customer/bookings" onClick={() => setIsOpen(false)} className="text-xs font-bold text-gray-700 py-1.5 flex items-center gap-2">
                  <Calendar size={14} className="text-brand-gold" /> My Bookings
                </Link>

                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="text-xs font-bold text-purple-700 py-1.5 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-purple-600" /> Admin Console
                  </Link>
                )}

                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }}
                  className="text-xs font-bold text-red-600 py-1.5 flex items-center gap-2 text-left cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="font-bold py-2.5 text-center text-gray-800 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center gap-2">
                <User size={16} className="text-brand-gold" /> Sign In
              </Link>
            )}

            <Link href="/self-drive" onClick={() => setIsOpen(false)} className="bg-brand-gold text-white px-4 py-3 rounded-xl text-center font-bold mt-2 shadow-md">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
