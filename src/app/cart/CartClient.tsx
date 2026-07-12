'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, Calendar, MapPin, Tag, Car } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartClient() {
  const { cartItems, removeFromCart } = useBookingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-white min-h-screen text-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const gst = subtotal * 0.18;
  const totalDeposit = cartItems.reduce((acc, item) => acc + item.deposit, 0);
  const totalAmount = subtotal + gst;
  const advanceHold = totalAmount * 0.3; // 30% advance hold

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              <Link href="/self-drive" className="hover:text-green-600 transition-colors flex items-center gap-1">
                <ArrowLeft size={12} /> BACK TO FLEET
              </Link>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900">
              YOUR <span className="text-green-600">GARAGE</span>
            </h1>
          </div>

          <div className="bg-gray-50 border border-gray-200 px-6 py-3 rounded-2xl flex items-center gap-3">
            <ShoppingBag className="text-green-600" size={20} />
            <div className="font-mono text-xs uppercase tracking-wider text-gray-600">
              Ledger Count: <span className="font-bold text-gray-900">{cartItems.length} RESERVATIONS</span>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-[40px] p-16 text-center max-w-2xl mx-auto shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 border border-gray-200 shadow-sm">
              <ShoppingBag size={36} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider mb-2 font-mono text-gray-900">Your Garage is Empty</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 font-medium leading-relaxed">
              Explore our sovereign collection of premium vehicles, luxury stay combos, and custom private tours to begin your booking.
            </p>
            <Link href="/self-drive" className="inline-flex items-center gap-2 bg-gray-900 hover:bg-green-600 text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all font-mono">
              Browse Sovereign Fleet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-mono">Items Overview</div>
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 border border-gray-200/60 rounded-[24px] p-6 relative group flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-gray-300 transition-all shadow-sm">
                  {/* Item Image */}
                  <div className="relative w-full md:w-36 h-28 bg-white rounded-2xl overflow-hidden shrink-0 border border-gray-200/60 flex items-center justify-center shadow-sm">
                    <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-2 border border-green-200 font-mono">
                      {item.serviceType === 'selfDrive' ? 'Self Drive' : item.serviceType === 'withDriver' ? 'Chauffeur' : item.serviceType}
                    </div>
                    <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 font-mono mb-4">{item.extraInfo}</p>

                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono">
                      <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-600" /> Refundable: ₹{item.deposit.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Price and Delete Actions */}
                  <div className="flex md:flex-col justify-between items-end w-full md:w-auto self-stretch shrink-0 font-mono md:border-l border-gray-200/60 md:pl-6 pt-4 md:pt-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors md:mb-auto self-start md:self-end flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                    >
                      <Trash2 size={16} /> <span className="md:hidden">Remove</span>
                    </button>
                    <div className="text-right">
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Reservation Rate</div>
                      <div className="text-2xl font-black text-green-700">₹{item.price.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Summary Sidepanel */}
            <div className="lg:col-span-1 space-y-6 sticky top-[70px]">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 font-mono">Ledger Summary</div>

              <div className="bg-gray-50 border border-gray-200 rounded-[24px] p-8 shadow-sm space-y-6">

                <div className="space-y-4 font-mono text-xs uppercase tracking-wider border-b border-gray-200 pb-6 text-gray-650">
                  <div className="flex justify-between">
                    <span>Base Subtotal</span>
                    <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (18% GST)</span>
                    <span className="text-gray-900 font-bold">₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Deposit Hold</span>
                    <span className="text-green-700 font-bold">₹{totalDeposit.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-dashed border-gray-300 pt-4 flex justify-between text-sm font-bold text-gray-900">
                    <span>Estimated Total</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-green-600/20 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest font-mono">Advance Hold (30%)</span>
                    <span className="text-2xl font-black text-green-700">₹{advanceHold.toLocaleString()}</span>
                  </div>
                  <div className="text-[9px] text-gray-500 font-sans leading-relaxed mt-2">
                    Pay 30% advance now to lock in your reservation. Balance + security deposit payable on delivery.
                  </div>
                </div>

                <Link href="/checkout" className="block w-full">
                  <button className="w-full bg-green-600 hover:bg-[#8dbb00] text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer">
                    Proceed to Checkout
                  </button>
                </Link>

                <div className="text-[9px] text-gray-400 font-mono text-center tracking-widest uppercase flex items-center justify-center gap-1.5">
                  <ShieldCheck size={12} className="text-green-600" /> 100% Secured reservation hold
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
