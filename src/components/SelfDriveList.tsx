'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookingStore } from '@/store/useBookingStore';
import { ArrowLeftRight, ShieldCheck, CheckCircle } from 'lucide-react';
import { getCarSlug, calculatePackagePricing, getPackageDurationHours } from '@/lib/utils';

export default function SelfDriveList({ initialCars, pickupDate, returnDate }: { initialCars: any[], pickupDate?: Date, returnDate?: Date | null }) {
  const router = useRouter();
  const { addToCart, session } = useBookingStore();

  // Keep track of which package is selected for which car
  const [selectedPackages, setSelectedPackages] = useState<Record<string, number>>({});


  const handlePackageSelect = (carId: string, limitValue: number) => {
    setSelectedPackages(prev => ({ ...prev, [carId]: limitValue }));
  };

  const handleBook = (carId: string) => {
    const car = initialCars.find(c => c.id === carId);
    if (!car) return;

    const durationHours = pickupDate && returnDate 
      ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
      : 24;

    const priceInfo = calculatePackagePricing(car.packages || [], durationHours);
    const activePackage = priceInfo.selectedPkg || car.packages?.[0];

    addToCart({
      serviceType: 'selfDrive',
      referenceId: carId,
      packageId: activePackage?.id,
      title: `${car.make} ${car.model}`,
      image: car.image || '',
      price: priceInfo.basePrice,
      deposit: activePackage?.deposit || 0,
      extraInfo: priceInfo.extraInfo + (pickupDate && returnDate ? ` • ${pickupDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })} - ${returnDate.toLocaleString('en-GB', { timeStyle: 'short' })}` : '')
    });

    router.push('/cart');
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {initialCars.map((car) => {
        const durationHours = pickupDate && returnDate 
          ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
          : 24;

        const priceInfo = calculatePackagePricing(car.packages || [], durationHours);
        const finalPrice = priceInfo.basePrice;
        const usedPackageIds = priceInfo.usedPkgIds;
        const activePackage = priceInfo.selectedPkg || car.packages?.[0];
        
        const isAlreadyBooked = car.bookings && car.bookings.length > 0 && car.bookings.some((booking: any) => {
          if (booking.status === 'CANCELLED') return false;
          const bStart = new Date(booking.startDate);
          const bEnd = new Date(booking.endDate);
          const currentStart = pickupDate || new Date();
          const currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
          return currentStart <= bEnd && currentEnd >= bStart;
        });

        const extraCharge = activePackage?.extraChargePerUnit || 0;
        const deposit = activePackage?.deposit || 0;
        const unitType = activePackage?.type === 'KM' ? 'KM' : 'Hour';

        const allowedPackages = (car.packages || []).filter(
          (p: any) => p.name === '12 Hours' || p.name === '24 Hours'
        );

        return (
          <div key={car.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden flex flex-col group hover:border-green-300 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            
            {/* Top Image Section */}
            <div className="relative h-[220px] w-full bg-white flex items-center justify-center">
              
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="bg-white/90 backdrop-blur-md text-green-700 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <ShieldCheck size={14} /> Self-Drive
                </span>
                <span className="bg-green-500 text-white px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(196,240,0,0.3)]">VIP Choice</span>
              </div>

              {/* Car Image */}
              <Link href={`/cars/${getCarSlug(car)}`} className="relative w-full h-full block">
                <Image 
                  src={car.image} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </Link>
            </div>

            {/* Middle Specs Row */}
            <div className="grid grid-cols-3 border-y border-gray-200 bg-white">
              <div className="py-3 text-center text-xs text-gray-600 font-medium capitalize border-r border-gray-200">{car.transmission} Gearbox</div>
              <div className="py-3 text-center text-xs text-gray-600 font-medium capitalize border-r border-gray-200">{car.fuelType}</div>
              <div className="py-3 text-center text-xs text-gray-600 font-medium capitalize">{car.seatingCapacity} Seats</div>
            </div>

            {/* Bottom Content */}
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              
              <Link href={`/cars/${getCarSlug(car)}`}>
                <h3 className="text-xl font-black mb-2 hover:text-green-700 transition-colors">{car.make} {car.model}</h3>
              </Link>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 text-[10px] font-semibold">
                  <ShieldCheck size={12}/> Insured
                </span>
                <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-[10px] font-semibold">
                  <CheckCircle size={12}/> GPS Tracked
                </span>
              </div>

              {/* Package Selector (Read Only) */}
              <div className="flex gap-2 mb-8 border-b border-gray-200 pb-8 overflow-x-auto custom-scrollbar pointer-events-none">
                {allowedPackages.map((pkg: any) => {
                  const isSelected = usedPackageIds.has(pkg.id);
                  return (
                    <div 
                      key={pkg.id}
                      className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl text-center border transition-all ${
                        isSelected 
                          ? 'bg-green-600 border-green-600 text-white shadow-sm font-black' 
                          : 'bg-gray-50 border-gray-200 text-gray-400 opacity-60'
                      }`}
                    >
                      {pkg.name} ({pkg.limitValue} {pkg.type === 'KM' ? 'KM' : 'Hours'})
                    </div>
                  );
                })}
              </div>

              {/* Fare Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6 text-xs font-mono">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200/60">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">
                    Base Fare ({priceInfo.extraInfo})
                  </span>
                  <span className="text-gray-900 font-bold">₹{finalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="text-gray-900 font-semibold">₹{Math.round(finalPrice * 0.18).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-500">Refundable Deposit</span>
                  <span className="text-green-750 font-bold">₹{deposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end pt-2 border-t border-dashed border-gray-300">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">EST. TRIP TOTAL</div>
                    <div className="text-green-700 text-2xl font-black">₹{Math.round(finalPrice * 1.18).toLocaleString()}</div>
                  </div>
                  <div className="text-right text-[10px] text-gray-500">
                    <div>Extra Limit: ₹{extraCharge}/{unitType}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto items-stretch h-12">
                <Link href={`/cars/${getCarSlug(car)}`} className="flex-grow flex items-center justify-center text-center px-4 py-0 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors">
                  Details
                </Link>
                <button 
                  onClick={() => !isAlreadyBooked && handleBook(car.id)}
                  disabled={isAlreadyBooked}
                  className={`flex-grow flex items-center justify-center text-center px-4 py-0 text-sm font-semibold rounded-xl transition-all ${
                    isAlreadyBooked 
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


    </div>
  );
}
