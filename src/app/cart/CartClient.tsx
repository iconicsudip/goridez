'use client';

import { useBookingStore } from '@/store/useBookingStore';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, Calendar, MapPin, Tag, Car } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import SelfDriveLocationSearch from '@/components/SelfDriveLocationSearch';

const LOCATION_EDITABLE_SERVICE_TYPES = ['selfDrive', 'roundTripTaxi'];

export default function CartClient({ selfDriveLocations = [], cars = [] }: { selfDriveLocations?: any[]; cars?: any[] }) {
  const { cartItems, removeFromCart, updateCartItem } = useBookingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="bg-[#FAF6F0] min-h-screen text-[#250903] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#E7DFD5] border-t-[#551A0C] rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const gst = subtotal * 0.18;
  const totalDeposit = cartItems.reduce((acc, item) => acc + item.deposit, 0);
  const totalAmount = subtotal + gst;
  const advanceHold = totalAmount * 0.3; // 30% advance hold

  return (
    <div className="bg-[#FAF6F0] min-h-screen text-[#250903] pt-32 pb-24 font-sans">
      <div className="container mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-[#E7DFD5] pb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C89D5C] mb-2 font-mono">
              <Link href="/self-drive" className="hover:text-[#551A0C] transition-colors flex items-center gap-1.5">
                <ArrowLeft size={12} /> RETURN TO FLEET COLLECTION
              </Link>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-serif uppercase tracking-tight text-[#551A0C]">
              Your Royal <span className="font-editorial italic font-normal text-[#C89D5C]">Garage</span>
            </h1>
          </div>

          <div className="bg-[#FEFBF8] border border-[#E7DFD5] px-6 py-3.5 rounded-2xl flex items-center gap-3 shadow-sm border-classic-frame">
            <div className="w-8 h-8 rounded-full bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center text-[#551A0C]">
              <ShoppingBag size={16} />
            </div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#6A5749]">
              Active Fleet: <span className="font-bold text-[#551A0C]">{cartItems.length} RESERVATIONS</span>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-16 text-center max-w-2xl mx-auto shadow-sm flex flex-col items-center justify-center border-classic-frame">
            <div className="w-20 h-20 bg-[#FAF6F0] rounded-full flex items-center justify-center mb-6 border border-[#C89D5C]/30 shadow-sm text-[#C89D5C]">
              <ShoppingBag size={36} />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-wider mb-2 font-serif text-[#551A0C]">Your Garage is Empty</h2>
            <p className="text-[#6A5749] text-sm max-w-md mx-auto mb-8 font-normal leading-relaxed">
              Experience the unmatched grandeur of Rajasthan with our sovereign collection of self-drive marques and chauffeured grand tourers.
            </p>
            <Link href="/self-drive" className="btn-luxury btn-luxury-shine inline-flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] px-8 py-4 rounded-xl shadow-lg">
              Explore Sovereign Fleet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="text-[11px] font-bold text-[#8C6D53] uppercase tracking-[0.2em] mb-2 font-mono flex items-center gap-2">
                <span className="text-[#C89D5C]">✦</span> RESERVATION SCHEDULE
              </div>
              {cartItems.map((item) => (
                <div key={item.id} className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl p-6 relative group hover:border-[#C89D5C] transition-all shadow-sm border-classic-frame">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Item Image */}
                    <div className="relative w-full md:w-40 h-28 bg-[#FAF6F0] rounded-xl overflow-hidden shrink-0 border border-[#E7DFD5] flex items-center justify-center shadow-inner">
                      <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 bg-[#FAF6F0] text-[#551A0C] px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-2 border border-[#C89D5C]/30 font-mono">
                        <span className="text-[#C89D5C]">✦</span> {item.serviceType === 'selfDrive' ? 'Self Drive' : item.serviceType === 'withDriver' ? 'Chauffeur' : item.serviceType === 'roundTripTaxi' ? 'Round Trip' : item.serviceType}
                      </div>
                      <h3 className="font-serif font-bold text-xl uppercase tracking-tight mb-1 text-[#551A0C]">{item.title}</h3>
                      <p className="text-xs text-[#6A5749] font-mono mb-3">{item.extraInfo}</p>

                      <div className="flex items-center gap-4 text-[10px] text-[#8C6D53] font-mono">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck size={14} className="text-[#C89D5C]" /> 
                          <span>Refundable Security: <strong className="text-[#551A0C]">₹{item.deposit.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Price and Delete Actions */}
                    <div className="flex md:flex-col justify-between items-end w-full md:w-auto self-stretch shrink-0 font-mono md:border-l border-[#E7DFD5] md:pl-6 pt-4 md:pt-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8C6D53] hover:text-red-700 transition-colors md:mb-auto self-start md:self-end flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                        title="Remove Reservation"
                      >
                        <Trash2 size={16} /> <span className="md:hidden">Remove</span>
                      </button>
                      <div className="text-right">
                        <div className="text-[9px] text-[#8C6D53] uppercase tracking-widest mb-0.5">Reservation Rate</div>
                        <div className="text-2xl font-black font-serif text-[#551A0C]">₹{item.price.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Pickup / Drop Location Selection */}
                  {item.serviceType === 'selfDrive' ? (
                    <div className="mt-6 pt-6 border-t border-[#E7DFD5] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SelfDriveLocationSearch
                        label="Pickup Location"
                        locations={selfDriveLocations.filter((l) => l.cityId === (cars.find((c) => c.id === item.referenceId)?.cityId || item.cityId))}
                        value={item.pickupStation || ''}
                        onChange={(name, _locationId, price) => updateCartItem(item.id, {
                          pickupStation: name,
                          pickupPrice: price,
                          price: item.price - (item.pickupPrice || 0) + price,
                        })}
                        placeholder="Select pickup station..."
                      />
                      <SelfDriveLocationSearch
                        label="Drop Location"
                        locations={selfDriveLocations.filter((l) => l.cityId === (cars.find((c) => c.id === item.referenceId)?.cityId || item.cityId))}
                        value={item.dropStation || ''}
                        onChange={(name, _locationId, price) => updateCartItem(item.id, {
                          dropStation: name,
                          dropPrice: price,
                          price: item.price - (item.dropPrice || 0) + price,
                        })}
                        placeholder="Select drop station..."
                      />
                    </div>
                  ) : LOCATION_EDITABLE_SERVICE_TYPES.includes(item.serviceType) && (
                    <div className="mt-6 pt-6 border-t border-[#E7DFD5] grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] text-[#8C6D53] uppercase tracking-widest mb-2 font-bold font-mono">
                          Pickup Location
                        </label>
                        <LocationAutocomplete
                          value={item.pickupStation || ''}
                          onChange={(name) => updateCartItem(item.id, { pickupStation: name })}
                          placeholder="Search pickup hotel, airport, station..."
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-[#8C6D53] uppercase tracking-widest mb-2 font-bold font-mono">
                          Drop Location
                        </label>
                        <LocationAutocomplete
                          value={item.dropStation || ''}
                          onChange={(name) => updateCartItem(item.id, { dropStation: name })}
                          placeholder="Search drop hotel, airport, station..."
                          searchAnywhere={true}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pricing Summary Sidepanel */}
            <div className="lg:col-span-1 space-y-6 sticky top-[100px]">
              <div className="text-[11px] font-bold text-[#8C6D53] uppercase tracking-[0.2em] mb-2 font-mono flex items-center gap-2">
                <span className="text-[#C89D5C]">✦</span> INVOICE SUMMARY
              </div>

              <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl p-7 shadow-xl space-y-6 border-classic-frame">

                <div className="space-y-4 font-mono text-xs uppercase tracking-wider border-b border-[#E7DFD5] pb-6 text-[#6A5749]">
                  <div className="flex justify-between">
                    <span>Base Subtotal</span>
                    <span className="text-[#250903] font-bold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (18% GST)</span>
                    <span className="text-[#250903] font-bold">₹{gst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Deposit Hold</span>
                    <span className="text-[#551A0C] font-bold">₹{totalDeposit.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-dashed border-[#E7DFD5] pt-4 flex justify-between text-sm font-bold text-[#551A0C] font-serif">
                    <span>Total Package</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-[#250903] text-white rounded-xl p-5 border border-[#C89D5C]/30 shadow-md">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#DFB574] uppercase tracking-widest font-mono">Advance Hold (30%)</span>
                    <span className="text-2xl font-serif font-black text-[#DFB574]">₹{advanceHold.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-white/70 font-sans leading-relaxed mt-2 border-t border-white/10 pt-2">
                    Pay 30% advance now to lock in your reservation. Balance + security deposit payable on delivery.
                  </div>
                </div>

                <Link href="/checkout" className="block w-full">
                  <button className="btn-luxury btn-luxury-shine w-full text-center py-4 rounded-xl font-serif font-bold uppercase tracking-[0.16em] text-xs shadow-lg transition-all cursor-pointer">
                    Proceed to Secure Checkout
                  </button>
                </Link>

                <div className="text-[9px] text-[#8C6D53] font-mono text-center tracking-widest uppercase flex items-center justify-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#C89D5C]" /> 100% Encrypted & Verified Booking Hold
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
