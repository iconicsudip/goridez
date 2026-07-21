'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChauffeurBookingModal from './ChauffeurBookingModal';
import { useBookingStore } from '@/store/useBookingStore';

import { ShieldCheck, CheckCircle, User, Fuel, MapPin, Navigation } from 'lucide-react';
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

        return (
          <div key={car.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col group hover:border-green-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

            {/* Top Image Section */}
            <div className="relative h-[220px] w-full bg-white flex items-center justify-center">
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-white/90 backdrop-blur-md text-green-700 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <ShieldCheck size={14} /> Premium
                </span>
              </div>

              {/* Car Image */}
              <Image
                src={car.image}
                alt={`${car.make} ${car.model}`}
                fill
                className="object-cover p-4 group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex-1 flex flex-col">

              <h3 className="text-xl font-black mb-2">{car.make} {car.model} {car.make.includes('Mercedes') || car.make.includes('Audi') ? '(VIP)' : ''}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 text-[10px] font-semibold">
                  <ShieldCheck size={12} /> Sanitized
                </span>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-[10px] font-semibold">
                  <CheckCircle size={12} /> Verified Driver
                </span>
              </div>

              {/* Feature List */}
              <div className="space-y-4 mb-8 text-xs font-medium">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-600 flex items-center gap-2"><User size={14} className="text-gray-400" /> Professional Driver</span>
                  <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded text-[10px]">INCLUDED</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-600 flex items-center gap-2"><Fuel size={14} className="text-gray-400" /> Fuel Surcharge</span>
                  <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded text-[10px]">INCLUDED</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <span className="text-gray-600 flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> Interstate Toll Permits</span>
                  <span className="text-gray-900 font-bold">Tolls Pre-Paid</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-xs font-medium flex items-center gap-2"><Navigation size={14} className="text-gray-400" /> Allowed Limit</span>
                  <span className="text-gray-900 font-bold text-xs bg-gray-100 px-2 py-1 rounded">{currentPackage?.limitValue ? `${Math.round(currentPackage.limitValue * durationDays)} ${currentPackage.type === 'KM' ? 'KM' : 'Hours'}` : 'Unlimited'} allowance</span>
                </div>
              </div>

              {/* Fare Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-xs font-mono">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200/60">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">
                    {durationDays > 1 ? `Base Fare (${Math.round(durationDays * 10) / 10} Days)` : 'Base Fare'}
                  </span>
                  <span className="text-gray-900 font-bold">₹{finalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="text-gray-900 font-semibold">₹{Math.round(finalPrice * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500">Refundable Deposit</span>
                  <span className="text-green-700 font-bold">₹{(currentPackage?.deposit || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-dashed border-gray-300">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">EST. TRIP TOTAL</div>
                    <div className="text-green-700 text-2xl font-black">₹{Math.round(finalPrice * 1.18).toLocaleString()}</div>
                  </div>
                  <div className="text-right text-[10px] text-gray-400">
                    <div>Inc. Chauffeur</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto items-stretch h-12">
                <Link href={`/cars/${getCarSlug(car)}`} className="flex-grow flex items-center justify-center text-center px-4 py-0 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors">
                  Details
                </Link>
                <button
                  onClick={() => !isAlreadyBooked && setSelectedBookingCarId(car.id)}
                  disabled={isAlreadyBooked}
                  className={`flex-grow flex items-center justify-center text-center px-4 py-0 text-sm font-semibold rounded-xl transition-all ${isAlreadyBooked
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                      : 'bg-green-600 text-white shadow-lg shadow-green-600/20 hover:shadow-xl hover:shadow-green-600/30 hover:-translate-y-0.5 relative overflow-hidden group/btn'
                    }`}
                >
                  <span className="absolute inset-0 w-full h-full -ml-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shimmer"></span>
                  <span className="relative z-10">{isAlreadyBooked ? 'Booked' : 'Book Now'}</span>
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
