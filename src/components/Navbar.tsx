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
      <header className="fixed top-0 w-full z-50 transition-all duration-300">
        {/* Luxury Announcement Bar Ticker (Mad Leather style) */}
        <div className="bg-[#250903] text-[#DFB574] text-[10px] md:text-xs font-bold tracking-[0.18em] uppercase py-2 px-4 border-b border-[#C89D5C]/20 overflow-hidden relative select-none">
          <div className="flex whitespace-nowrap animate-marquee-left">
            <div className="flex items-center gap-10 px-4 shrink-0">
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> ROYAL RAJASTHAN MOBILITY</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> 100% VETTED FLEET & UNIFORMED CHAUFFEURS</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> 24/7 DEDICATED CONCIERGE CARE</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> ZERO SECURITY DEPOSIT OPTIONS</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> UDAIPUR &bull; JAIPUR &bull; JODHPUR &bull; JAISALMER</span>
            </div>
            <div className="flex items-center gap-10 px-4 shrink-0" aria-hidden="true">
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> ROYAL RAJASTHAN MOBILITY</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> 100% VETTED FLEET & UNIFORMED CHAUFFEURS</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> 24/7 DEDICATED CONCIERGE CARE</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> ZERO SECURITY DEPOSIT OPTIONS</span>
              <span className="flex items-center gap-2"><span className="text-[#C89D5C]">✦</span> UDAIPUR &bull; JAIPUR &bull; JODHPUR &bull; JAISALMER</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <nav className={`w-full transition-all duration-300 ${
          isTransparent
            ? 'bg-gradient-to-b from-black/70 to-transparent border-transparent'
            : 'bg-[#551A0C]/95 backdrop-blur-xl border-b border-[#C89D5C]/25 text-white shadow-2xl'
        }`}>
          <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">

            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-32 shrink-0 transition-transform group-hover:scale-105">
                <Image
                  src={siteSettings?.logoRidez || '/logo-ridez.png'}
                  alt="GoRidez Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </Link>

            {/* Center: Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {links.map(link => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-xs uppercase tracking-[0.16em] transition-all relative py-1 ${
                      isActive
                        ? 'text-[#DFB574] font-black'
                        : 'text-[#FEFBF8]/85 hover:text-[#DFB574] font-semibold'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C89D5C] rounded-full shadow-[0_0_8px_#C89D5C]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Cart Icon */}
              <Link
                href="/cart"
                aria-label="View Cart"
                className="relative p-2.5 rounded-full text-white/90 hover:text-[#DFB574] hover:bg-white/10 transition-all"
              >
                <ShoppingBag size={20} />
                {mounted && cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-[#C89D5C] text-[#250903] text-[10px] font-black rounded-full flex items-center justify-center translate-x-1 -translate-y-1 shadow-md">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Book Now Button (Mad Leather Gold CTA with luxury shine sweep) */}
              <Link
                href="/self-drive"
                className="btn-luxury btn-luxury-shine bg-[#C89D5C] hover:bg-[#DFB574] text-[#250903] px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition-all shadow-[0_4px_18px_rgba(200,157,92,0.35)] hover:shadow-[0_6px_28px_rgba(200,157,92,0.55)] hover:scale-105 active:scale-95 cursor-pointer border border-[#E5C07B]"
              >
                Book Now
              </Link>

              {/* User Avatar Dropdown (Right Most) */}
              {status === 'authenticated' ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-1.5 p-1.5 rounded-full transition-all border border-[#C89D5C]/30 bg-black/25 hover:bg-black/40 text-white cursor-pointer"
                    title={session.user?.name || 'My Account'}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#C89D5C] text-[#250903] font-black text-xs flex items-center justify-center shadow-md border border-[#E5C07B] shrink-0">
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
                    <ChevronDown size={13} className={`mr-1 text-[#DFB574] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-[#2B0D05] border border-[#C89D5C]/30 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-white backdrop-blur-2xl">
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-[#C89D5C]/15">
                        <p className="text-xs font-bold text-[#FEFBF8] truncate">
                          {session.user?.name || 'Logged In User'}
                        </p>
                        <p className="text-[10px] text-[#DFB574]/80 font-mono truncate mt-0.5">
                          {session.user?.email || ''}
                        </p>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-white/90 hover:bg-[#551A0C] hover:text-[#DFB574] transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-[#C89D5C]" />
                          My Dashboard
                        </Link>

                        <Link
                          href="/customer/bookings"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-white/90 hover:bg-[#551A0C] hover:text-[#DFB574] transition-colors"
                        >
                          <Calendar size={15} className="text-[#C89D5C]" />
                          My Bookings
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#DFB574] bg-[#551A0C]/50 hover:bg-[#551A0C] transition-colors border-t border-b border-[#C89D5C]/20"
                          >
                            <ShieldCheck size={15} className="text-[#C89D5C]" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      {/* Sign Out Action */}
                      <div className="border-t border-[#C89D5C]/15 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-950/40 transition-colors text-left cursor-pointer"
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border border-[#C89D5C]/40 bg-black/25 hover:bg-black/40 text-white cursor-pointer hover:border-[#DFB574]"
                >
                  <User size={15} className="text-[#DFB574]" />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              className="lg:hidden text-white p-1 rounded-lg hover:bg-white/10"
              onClick={() => setIsOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Sidebar (Mad Leather Luxury Styling) */}
      <div
        className={`fixed top-0 left-0 h-[100dvh] w-[300px] bg-[#250903] text-white border-r border-[#C89D5C]/20 z-[70] lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          } overflow-y-auto`}
      >
        <div className="p-5 flex items-center justify-between border-b border-[#C89D5C]/20">
          <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="relative h-9 w-28 shrink-0">
              <Image
                src={siteSettings?.logoRidez || '/logo-ridez.png'}
                alt="GoRidez Logo"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </Link>
          <button className="text-[#DFB574] hover:text-white p-1" onClick={() => setIsOpen(false)} aria-label="Close Navigation Menu">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C89D5C]/70 pb-1 border-b border-[#C89D5C]/10">
            Navigation
          </div>
          {links.map(link => {
            const isActive = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`py-2 text-sm uppercase tracking-wider transition-colors flex items-center justify-between ${
                  isActive
                    ? 'text-[#DFB574] font-black'
                    : 'text-white/85 font-medium hover:text-[#DFB574]'
                }`}
              >
                <span>{link.name}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#C89D5C]" />}
              </Link>
            );
          })}
          
          <div className="border-t border-[#C89D5C]/20 pt-6 mt-2 flex flex-col gap-3">
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="font-medium py-2 text-white/90 hover:text-[#DFB574] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#C89D5C]" /> My Garage Cart
              </span>
              {cartItems.length > 0 && (
                <span className="bg-[#C89D5C] text-[#250903] text-[10px] font-black px-2 py-0.5 rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {status === 'authenticated' ? (
              <div className="bg-[#350E05] p-4 rounded-2xl border border-[#C89D5C]/30 mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-3 pb-2 border-b border-[#C89D5C]/15">
                  <div className="w-9 h-9 rounded-full bg-[#C89D5C] text-[#250903] font-black text-xs flex items-center justify-center">
                    {userInitial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{session.user?.name || 'Account'}</p>
                    <p className="text-[10px] text-[#DFB574] truncate">{session.user?.email}</p>
                  </div>
                </div>

                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-xs font-bold text-white/90 py-1.5 flex items-center gap-2 hover:text-[#DFB574]">
                  <LayoutDashboard size={14} className="text-[#C89D5C]" /> My Dashboard
                </Link>
                
                <Link href="/customer/bookings" onClick={() => setIsOpen(false)} className="text-xs font-bold text-white/90 py-1.5 flex items-center gap-2 hover:text-[#DFB574]">
                  <Calendar size={14} className="text-[#C89D5C]" /> My Bookings
                </Link>

                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="text-xs font-bold text-[#DFB574] py-1.5 flex items-center gap-2">
                    <ShieldCheck size={14} className="text-[#C89D5C]" /> Admin Console
                  </Link>
                )}

                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }}
                  className="text-xs font-bold text-red-300 py-1.5 flex items-center gap-2 text-left cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="font-bold py-2.5 text-center text-[#250903] bg-[#FEFBF8] rounded-xl border border-[#C89D5C]/40 flex items-center justify-center gap-2 hover:bg-[#DFB574]">
                <User size={16} className="text-[#551A0C]" /> Sign In
              </Link>
            )}

            <Link
              href="/self-drive"
              onClick={() => setIsOpen(false)}
              className="bg-[#C89D5C] hover:bg-[#DFB574] text-[#250903] px-4 py-3 rounded-xl text-center font-black uppercase tracking-widest text-xs mt-2 shadow-lg shadow-[#C89D5C]/20 border border-[#E5C07B]"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
