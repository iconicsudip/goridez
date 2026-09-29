'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChauffeurBookingModal from './ChauffeurBookingModal';
import { useBookingStore } from '@/store/useBookingStore';

import { ShieldCheck, CheckCircle2, User, Fuel, MapPin, Navigation, Sparkles, ChevronRight } from 'lucide-react';
import { getCarSlug } from '@/lib/utils';

export default function ChauffeurList({ initialCars, pickupDate, returnDate }: { initialCars: any[], pickupDate?: Date, returnDate?: Date | null }) {
  const router = useRouter();
  const { addToCart } = useBookingStore();
  const [selectedBookingCarId, setSelectedBookingCarId] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {initialCars.map((car) => {
        const currentPackage = car.packages?.[0];
        const basePrice = currentPackage?.basePrice || 10000;

        const durationHours = 24;
        const durationDays = 1;

        const finalPrice = basePrice;

        const isAlreadyBooked = car.bookings && car.bookings.length > 0 && car.bookings.some((booking: any) => {
          if (booking.status === 'CANCELLED') return false;
          const bStart = new Date(booking.startDate);
          const bEnd = new Date(booking.endDate);
          const currentStart = pickupDate || new Date();
          const currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
          return currentStart <= bEnd && currentEnd >= bStart;
        });

        const deposit = currentPackage?.deposit || 0;
        const totalWithGst = Math.round(finalPrice * 1.18);

        return (
          <div
            key={car.id}
            className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] rounded-3xl overflow-hidden flex flex-col justify-between group shadow-[0_20px_55px_rgba(42,14,7,0.13),0_2px_8px_rgba(42,14,7,0.06)] hover:shadow-[0_28px_75px_rgba(42,14,7,0.22)] transition-all duration-300"
          >
            {/* Top Image Showcase Stage */}
            <div className="relative h-[230px] w-full bg-[radial-gradient(ellipse_at_center,_#FFFFFF_0%,_#F3EDE2_100%)] flex items-center justify-center p-4 border-b border-[#E7DFD5] overflow-hidden">
              {/* Glass Badges */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                <span className="bg-[#FEFBF8]/95 backdrop-blur-md text-[#551A0C] border border-[#C89D5C]/50 px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-xs flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-[#C89D5C]" /> Royal Chauffeur
                </span>
                <span className={`text-[9px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs ${
                  car.availability
                    ? 'bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-[#DFB574]' : 'bg-red-500'}`} />
                  {car.availability ? 'Available' : 'Reserved'}
                </span>
              </div>

              {/* Car Image */}
              <div className="relative w-full h-full">
                <Image
                  src={car.image}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_12px_24px_rgba(37,9,3,0.18)]"
                  unoptimized
                />
              </div>

              {/* City Hub Stamp */}
              {car.city?.name && (
                <span className="absolute bottom-3 left-4 z-10 bg-[#250903]/90 backdrop-blur-md text-[#DFB574] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-[#C89D5C]/35 shadow-xs">
                  {car.city.name} Hub
                </span>
              )}
            </div>

            {/* Content Dossier */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-[#C89D5C] font-bold uppercase tracking-[0.25em] mb-1">
                  {car.category || 'Executive Marque'}
                </div>
                <h3 className="text-2xl font-serif font-black text-[#551A0C] tracking-tight mb-3 group-hover:text-[#C89D5C] transition-colors">
                  <Link href={`/cars/${getCarSlug(car)}`}>
                    {car.make} {car.model} {car.make.includes('Mercedes') || car.make.includes('BMW') || car.make.includes('Audi') ? '(VIP Signature)' : ''}
                  </Link>
                </h3>

                {/* Chauffeur Trust Badges */}
                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="flex items-center gap-1.5 bg-[#FAF6F0] text-[#551A0C] border border-[#C89D5C]/35 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <ShieldCheck size={12} className="text-[#C89D5C]" /> Sanitized Cabin
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#FAF6F0] text-[#551A0C] border border-[#C89D5C]/35 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 size={12} className="text-[#C89D5C]" /> Vetted Uniformed Chauffeur
                  </span>
                </div>

                {/* Feature Specifications */}
                <div className="space-y-3 mb-6 text-xs bg-[#FAF6F0]/60 p-4 rounded-2xl border border-[#E7DFD5]">
                  <div className="flex justify-between items-center pb-2.5 border-b border-[#E7DFD5]">
                    <span className="text-[#6A5749] flex items-center gap-2 font-medium">
                      <User size={14} className="text-[#C89D5C]" /> Professional Chauffeur
                    </span>
                    <span className="text-[#551A0C] font-bold bg-[#FEFBF8] border border-[#C89D5C]/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      Complimentary
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-[#E7DFD5]">
                    <span className="text-[#6A5749] flex items-center gap-2 font-medium">
                      <Fuel size={14} className="text-[#C89D5C]" /> Fuel & Maintenance
                    </span>
                    <span className="text-[#551A0C] font-bold bg-[#FEFBF8] border border-[#C89D5C]/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                      Included
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2.5 border-b border-[#E7DFD5]">
                    <span className="text-[#6A5749] flex items-center gap-2 font-medium">
                      <MapPin size={14} className="text-[#C89D5C]" /> Interstate Toll Permits
                    </span>
                    <span className="text-[#250903] font-bold text-[11px]">Tolls Pre-Paid</span>
                  </div>
                  <div className="flex justify-between items-center pt-0.5">
                    <span className="text-[#6A5749] flex items-center gap-2 font-medium">
                      <Navigation size={14} className="text-[#C89D5C]" /> Daily Kilometer Allowance
                    </span>
                    <span className="text-[#551A0C] font-bold text-xs bg-[#FEFBF8] border border-[#E7DFD5] px-2.5 py-0.5 rounded-lg">
                      {currentPackage?.limitValue ? `${Math.round(currentPackage.limitValue * durationDays)} ${currentPackage.type === 'KM' ? 'KM' : 'Hours'}` : 'Unlimited'}
                    </span>
                  </div>
                </div>

                {/* Fare Summary Console */}
                <div className="bg-[#FAF6F0] border border-[#E7DFD5] rounded-2xl p-4.5 mb-6 text-xs">
                  <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E7DFD5]">
                    <span className="text-[#8C6D53] font-bold uppercase tracking-wider text-[10px]">
                      {durationDays > 1 ? `Base Fare (${Math.round(durationDays * 10) / 10} Days)` : 'Base Fare'}
                    </span>
                    <span className="text-[#250903] font-bold">₹{finalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#8C6D53]">GST (18%)</span>
                    <span className="text-[#250903] font-medium">₹{Math.round(finalPrice * 0.18).toLocaleString()}</span>
                  </div>
                  {deposit > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#8C6D53]">Refundable Deposit</span>
                      <span className="text-[#C89D5C] font-bold">₹{deposit.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-3 border-t border-[#E7DFD5]">
                    <div>
                      <div className="text-[10px] text-[#8C6D53] font-bold uppercase tracking-[0.2em]">Estimated Total</div>
                      <div className="text-3xl font-serif font-black text-[#551A0C] leading-none mt-1">₹{totalWithGst.toLocaleString()}</div>
                    </div>
                    <div className="text-right text-[10px] text-[#8C6D53] italic">
                      <div>Chauffeur & GST Included</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 items-stretch">
                <Link
                  href={`/cars/${getCarSlug(car)}`}
                  className="flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-[0.18em] rounded-xl border border-[#E7DFD5] text-[#551A0C] bg-[#FEFBF8] text-center hover:border-[#C89D5C] hover:bg-[#FAF6F0] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Dossier</span>
                  <ChevronRight size={14} className="text-[#C89D5C]" />
                </Link>
                <button
                  onClick={() => !isAlreadyBooked && setSelectedBookingCarId(car.id)}
                  disabled={isAlreadyBooked}
                  className={`flex-[1.5] font-bold text-xs tracking-[0.2em] uppercase py-3.5 px-5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-xl ${
                    isAlreadyBooked
                      ? 'bg-[#E7DFD5] text-[#8C6D53] cursor-not-allowed'
                      : 'btn-luxury btn-luxury-shine bg-[#551A0C] text-[#DFB574] hover:bg-[#451408] border border-[#C89D5C]/50'
                  }`}
                >
                  {isAlreadyBooked ? 'Reserved' : 'Reserve Chauffeur'}
                </button>
              </div>

            </div>
          </div>
        );
      })}

      <ChauffeurBookingModal
        isOpen={!!selectedBookingCarId}
        onClose={() => setSelectedBookingCarId(null)}
        car={initialCars.find(c => c.id === selectedBookingCarId)}
        defaultPickupDate={pickupDate}
      />
    </div>
  );
}
