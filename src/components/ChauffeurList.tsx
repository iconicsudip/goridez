'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import CompareSpecsModal from './CompareSpecsModal';
import ChauffeurBookingModal from './ChauffeurBookingModal';

export default function ChauffeurList({ initialCars, pickupDate, returnDate }: { initialCars: any[], pickupDate?: Date, returnDate?: Date | null }) {
  const router = useRouter();
  const { addToCart } = useBookingStore();
  const [compareCarId, setCompareCarId] = useState<string | null>(null);

  const [selectedBookingCarId, setSelectedBookingCarId] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {initialCars.map((car) => {
        const currentPackage = car.packages?.[0];
        const basePrice = currentPackage?.basePrice || 10000;
        
        const durationHours = pickupDate && returnDate 
          ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
          : 24;
        const durationDays = durationHours / 24;
          
        const finalPrice = Math.round(basePrice * durationDays);

        const isAlreadyBooked = car.bookings && car.bookings.length > 0 && car.bookings.some((booking: any) => {
          if (booking.status === 'CANCELLED') return false;
          const bStart = new Date(booking.startDate);
          const bEnd = new Date(booking.endDate);
          const currentStart = pickupDate || new Date();
          const currentEnd = returnDate || new Date();
          return currentStart <= bEnd && currentEnd >= bStart;
        });

        return (
          <div key={car.id} className="bg-[#111111] border border-white/5 rounded-3xl overflow-hidden flex flex-col group hover:border-white/10 transition-colors">
            
            {/* Top Image Section */}
            <div className="relative h-[220px] w-full">
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-black/80 backdrop-blur-md text-[#C4F000] px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border border-white/10">
                  Luxury
                </span>
              </div>

              {/* Car Image */}
              <Image 
                src={car.image} 
                alt={`${car.make} ${car.model}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              
              <h3 className="text-xl font-black mb-1">{car.make} {car.model} {car.make.includes('Mercedes') || car.make.includes('Audi') ? '(VIP)' : ''}</h3>
              <p className="text-[10px] text-white/50 tracking-widest font-mono mb-8">
                Available in all major Rajasthan Cities
              </p>

              {/* Feature List */}
              <div className="space-y-4 mb-8 text-[11px] font-medium font-mono">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/60">Professional Driver</span>
                  <span className="text-[#C4F000] font-bold">INCLUDED</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/60">Fuel Surcharge</span>
                  <span className="text-[#C4F000] font-bold">INCLUDED</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/60">Interstate Toll Permits</span>
                  <span className="text-white font-bold">Tolls Pre-Paid</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/50 text-[10px] font-mono">Allowed Limit</span>
                  <span className="text-white font-bold text-xs">{currentPackage?.limitValue ? `${Math.round(currentPackage.limitValue * durationDays)} ${currentPackage.type === 'KM' ? 'KM' : 'Hours'}` : 'Unlimited'} allowance</span>
                </div>
              </div>

              {/* Fare Summary */}
              <div className="flex justify-between items-end mb-6 mt-auto">
                <div>
                  <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-2">
                    {durationDays > 1 ? `Total Fare (${durationDays} Days)` : 'Package Fare'}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-brand-neon text-3xl font-black">₹{finalPrice.toLocaleString()}</span>
                    {durationDays === 1 && <span className="text-[10px] text-white/40">/ day</span>}
                  </div>
                </div>
                <div className="text-[10px] text-white/50 font-mono pb-1">
                  Security Deposit: ₹0
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto">
                <button 
                  onClick={() => setCompareCarId(car.id)}
                  className="flex-1 py-4 text-[10px] font-bold tracking-widest uppercase rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                >
                  COMPARE SPECS
                </button>
                <button 
                  onClick={() => !isAlreadyBooked && setSelectedBookingCarId(car.id)}
                  disabled={isAlreadyBooked}
                  className={`flex-1 py-4 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                    isAlreadyBooked 
                      ? 'bg-zinc-800 text-white/30 cursor-not-allowed border border-white/5 shadow-none' 
                      : 'bg-brand-neon text-black shadow-[0_0_20px_rgba(196,240,0,0.15)] hover:shadow-[0_0_30px_rgba(196,240,0,0.3)]'
                  }`}
                >
                  {isAlreadyBooked ? 'BOOKED / UNAVAILABLE' : 'Select Chauffeur Ride'}
                </button>
              </div>
              
            </div>
          </div>
        );
      })}

      {compareCarId && (() => {
        const selectedCompareCar = initialCars.find(c => c.id === compareCarId);
        if (!selectedCompareCar) return null;
        return (
          <CompareSpecsModal 
            isOpen={!!compareCarId}
            onClose={() => setCompareCarId(null)}
            selectedCar={selectedCompareCar}
            allCars={initialCars}
            onSelectCar={(carId) => {
              setCompareCarId(null);
              setSelectedBookingCarId(carId);
            }}
            pickupDate={pickupDate}
            returnDate={returnDate}
          />
        );
      })()}

      <ChauffeurBookingModal 
        isOpen={!!selectedBookingCarId}
        onClose={() => setSelectedBookingCarId(null)}
        car={initialCars.find(c => c.id === selectedBookingCarId)}
        defaultPickupDate={pickupDate}
      />
    </div>
  );
}
