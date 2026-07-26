'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { Car } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FloatingCart() {
  const { cartItems } = useBookingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // The total number of items in the cart
  const itemCount = cartItems.length;

  // Only show the floating cart if there's at least one item
  if (itemCount === 0) return null;

  return (
    <Link
      href="/cart"
      className="fixed bottom-8 right-8 z-50 bg-brand-gold hover:bg-brand-gold-hover text-white p-4 rounded-3xl shadow-lg shadow-brand-gold/30 transition-all hover:scale-105 flex items-center justify-center cursor-pointer"
      aria-label="View Cart"
    >
      <div className="relative">
        <Car size={28} strokeWidth={2.5} />
        <span className="absolute -top-4 -right-4 bg-white text-black border-2 border-brand-gold w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black">
          {itemCount}
        </span>
      </div>
    </Link>
  );
}
