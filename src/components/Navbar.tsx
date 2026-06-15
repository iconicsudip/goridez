'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useBookingStore } from '@/store/useBookingStore';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const { cartItems, openCart } = useBookingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: 'Cars', href: '/self-drive' },
    { name: 'Chauffeur', href: '/chauffeur' },
    { name: 'Taxi', href: '/taxi' },
    { name: 'Tours', href: '/tours' },
    { name: 'Villas', href: '/villas' },
    { name: 'Cities', href: '/cities' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-brand-neon text-black font-black text-xs w-8 h-8 rounded-lg flex items-center justify-center tracking-tighter">
            GR
          </div>
          <div className="text-xl font-black tracking-tight">
            <span className="text-white">Go</span><span className="text-brand-neon">Ridez</span>
          </div>
        </Link>
        
        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map(link => (
            <Link 
              key={link.name} 
              href={link.href}
              className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-6">
          {status === 'authenticated' ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-white/80 hover:text-brand-neon transition-colors">
                My Dashboard
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className="text-sm font-medium text-white/80 hover:text-red-400 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/admin" className="text-[10px] font-mono text-white/40 hover:text-white transition-colors">
                (Admin)
              </Link>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <button 
              onClick={openCart}
              className="relative p-2 text-white hover:text-brand-neon transition-colors"
            >
              <ShoppingBag size={20} />
              {mounted && cartItems.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-brand-neon text-black text-[10px] font-black rounded-full flex items-center justify-center translate-x-1 -translate-y-1">
                  {cartItems.length}
                </span>
              )}
            </button>
            <Link href="/self-drive" className="bg-brand-neon hover:bg-brand-hover text-black px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)]">
              Book Now
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden p-4 border-t border-white/10 flex flex-col gap-4 bg-[#0A0A0A]/95 backdrop-blur-xl">
          {links.map(link => (
            <Link 
              key={link.name} 
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`font-medium ${pathname === link.href ? 'text-white' : 'text-white/60'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
            {status === 'authenticated' ? (
              <>
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="font-medium text-white/80 hover:text-white">
                  My Dashboard
                </Link>
                <button 
                  onClick={() => { signOut({ callbackUrl: '/' }); setIsOpen(false); }} 
                  className="font-medium text-left text-white/80 hover:text-red-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsOpen(false)} className="font-medium text-white/80 hover:text-white">
                Sign In
              </Link>
            )}
            <Link href="/self-drive" onClick={() => setIsOpen(false)} className="bg-brand-neon text-black px-4 py-3 rounded-xl text-center font-bold">
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
