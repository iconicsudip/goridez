'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const { cartItems, isCartOpen, closeCart, removeFromCart } = useBookingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!mounted || !isCartOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const gst = subtotal * 0.12;
  const totalDeposit = cartItems.reduce((acc, item) => acc + item.deposit, 0);
  const totalAmount = subtotal + gst;
  const advanceHold = totalAmount * 0.3; // 30% advance hold

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={closeCart}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-brand-border shadow-2xl z-[101] flex flex-col transform transition-transform duration-500 text-gray-900">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-brand-gold" size={20} />
            <h2 className="text-xl font-black uppercase tracking-widest">Your Garage</h2>
            <span className="bg-brand-gold/15 text-brand-gold px-2 py-0.5 rounded text-[10px] font-bold">
              {cartItems.length}
            </span>
          </div>
          <button 
            onClick={closeCart}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-500 hover:text-gray-900"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-widest">Your garage is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-brand-panel p-4 rounded-2xl border border-brand-border relative group">
                <div className="relative w-24 h-20 bg-white rounded-xl overflow-hidden shrink-0 border border-brand-border">
                  <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] text-brand-gold font-bold uppercase tracking-widest mb-1">
                    {item.serviceType === 'selfDrive' ? 'Self Drive' : item.serviceType === 'withDriver' ? 'Chauffeur' : item.serviceType}
                  </div>
                  <h3 className="font-black text-sm truncate uppercase tracking-tight mb-1 text-gray-900">{item.title}</h3>
                  <div className="text-[10px] text-gray-500 font-mono mb-2">{item.extraInfo}</div>
                  <div className="font-bold text-sm text-brand-gold">₹{item.price.toLocaleString()}</div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-brand-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="space-y-3 mb-6 font-mono text-[11px] uppercase tracking-wider text-gray-650">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span className="text-gray-900 font-bold">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-brand-border pt-3 text-gray-900">
                <span>Refundable Deposit</span>
                <span className="font-bold text-brand-gold">₹{totalDeposit.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="bg-brand-panel p-4 rounded-xl border border-brand-gold/30 mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Advance Hold (30%)</span>
                <span className="text-xl font-black text-brand-gold">₹{advanceHold.toLocaleString()}</span>
              </div>
              <div className="text-[9px] text-gray-500">Pay now to secure reservation</div>
            </div>

            <Link href="/checkout" onClick={closeCart} className="block w-full">
              <button className="w-full bg-brand-gold hover:bg-[#8dbb00] text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
