'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookingStore } from '@/store/useBookingStore';
import { ArrowLeftRight } from 'lucide-react';

import CompareSpecsModal from './CompareSpecsModal';

export default function SelfDriveList({ initialCars, pickupDate, returnDate }: { initialCars: any[], pickupDate?: Date, returnDate?: Date | null }) {
  const router = useRouter();
  const { addToCart, session } = useBookingStore();

  // Keep track of which package is selected for which car
  const [selectedPackages, setSelectedPackages] = useState<Record<string, number>>({});
  const [compareCarId, setCompareCarId] = useState<string | null>(null);

  const handlePackageSelect = (carId: string, limitValue: number) => {
    setSelectedPackages(prev => ({ ...prev, [carId]: limitValue }));
  };

  const handleBook = (carId: string) => {
    const car = initialCars.find(c => c.id === carId);
    const fallbackLimit = session.selectedPackageLimit || (car?.packages && car.packages.length > 0 ? car.packages[0].limitValue : 120);
    const packageLimit = selectedPackages[carId] || fallbackLimit;
    const currentPackage = car?.packages?.find((p: any) => p.limitValue === packageLimit) || car?.packages?.[0];

    const durationHours = pickupDate && returnDate 
      ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
      : 24;
    const durationDays = durationHours / 24;

    let extra = currentPackage ? `${currentPackage.limitValue ? Math.round(currentPackage.limitValue * durationDays) + ' ' : ''}${currentPackage.type === 'KM' ? 'KM' : 'HOURS'} Package` : undefined;
    if (pickupDate && returnDate && extra) {
      extra += ` • ${pickupDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })} - ${returnDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
    }

    addToCart({
      serviceType: 'selfDrive',
      referenceId: carId,
      packageId: currentPackage?.id,
      title: `${car?.make} ${car?.model}`,
      image: car?.image || '',
      price: Math.round((currentPackage?.basePrice || 0) * durationDays),
      deposit: currentPackage?.deposit || 0,
      extraInfo: extra
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {initialCars.map((car) => {
        // If the car has no packages, provide a fallback safe default, else use the first package limit
        const fallbackLimit = session.selectedPackageLimit || (car.packages && car.packages.length > 0 ? car.packages[0].limitValue : 120);
        const packageLimit = selectedPackages[car.id] || fallbackLimit;
        const currentPackage = car.packages?.find((p: any) => p.limitValue === packageLimit) || car.packages?.[0];
        const basePrice = currentPackage?.basePrice || 0;
        
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

        const extraCharge = currentPackage?.extraChargePerUnit || 0;
        const deposit = currentPackage?.deposit || 0;
        const unitType = currentPackage?.type === 'KM' ? 'KM' : 'Hour';

        return (
          <div key={car.id} className="bg-gray-100 border border-gray-200 rounded-3xl overflow-hidden flex flex-col relative group hover:border-gray-300 transition-colors">
            
            {/* Top Image Section */}
            <div className="relative h-[240px] w-full bg-gradient-to-b from-[#1A1A1A] to-[#111111] p-4 flex items-center justify-center">
              
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="bg-black text-gray-900 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border border-gray-300">{car.category || 'Standard'}</span>
                <span className="bg-green-500 text-white px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(196,240,0,0.3)]">VIP Choice</span>
              </div>
              
              {/* Top Right Icon */}
              <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 border border-gray-300 flex items-center justify-center text-gray-500 cursor-pointer hover:text-gray-900 transition-colors">
                <ArrowLeftRight size={14} />
              </div>

              {/* Car Image */}
              <Link href={`/cars/${car.id}`} className="relative w-full h-[80%] block">
                <Image 
                  src={car.image} 
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                  unoptimized
                />
              </Link>
            </div>

            {/* Middle Specs Row */}
            <div className="grid grid-cols-3 border-y border-gray-200 bg-white">
              <div className="py-3 text-center text-[10px] text-gray-900/70 uppercase tracking-widest border-r border-gray-200">{car.transmission} GEARBOX</div>
              <div className="py-3 text-center text-[10px] text-gray-900/70 uppercase tracking-widest border-r border-gray-200">{car.fuelType}</div>
              <div className="py-3 text-center text-[10px] text-gray-900/70 uppercase tracking-widest">{car.seatingCapacity} SEATS</div>
            </div>

            {/* Bottom Content */}
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              
              <Link href={`/cars/${car.id}`}>
                <h3 className="text-xl font-black mb-1 hover:text-green-700 transition-colors">{car.make} {car.model}</h3>
              </Link>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <p className="text-[10px] text-gray-500">Active in: {car.city?.name || 'All Hubs'}</p>
              </div>

              {/* Package Selector */}
              <div className="flex gap-2 mb-8 border-b border-gray-200 pb-8 overflow-x-auto custom-scrollbar">
                {car.packages && car.packages.length > 0 ? (
                  car.packages.map((pkg: any) => (
                    <button 
                      key={pkg.id}
                      onClick={() => handlePackageSelect(car.id, pkg.limitValue)}
                      className={`flex-1 py-2 px-4 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${
                        packageLimit === pkg.limitValue 
                          ? 'bg-green-500 text-white' 
                          : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                      }`}
                    >
                      {pkg.limitValue ? `${Math.round(pkg.limitValue * durationDays)} ` : ''}{pkg.type === 'KM' ? 'KM' : 'HOURS'}
                    </button>
                  ))
                ) : (
                  <div className="text-[10px] text-gray-400 italic">No packages configured for this vehicle</div>
                )}
              </div>

              {/* Fare Summary */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                    {durationDays > 1 ? `Total Fare (${durationDays} Days)` : 'Package Fare'}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-green-700 text-3xl font-black">₹{finalPrice.toLocaleString()}</span>
                    {durationDays === 1 && <span className="text-[10px] text-gray-400">/ day</span>}
                  </div>
                </div>
                <div className="text-right text-[10px] space-y-1">
                  <div><span className="text-gray-400">Extra:</span> <span className="font-bold">₹{extraCharge}/{unitType}</span></div>
                  <div><span className="text-gray-400">Refundable:</span> <span className="font-bold">₹{deposit.toLocaleString()}</span></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-auto items-stretch h-[52px]">
                <button 
                  onClick={() => setCompareCarId(car.id)}
                  className="flex-1 flex items-center justify-center text-center px-2 py-0 text-[10px] font-bold tracking-widest uppercase rounded-xl border border-gray-300 hover:bg-white/5 transition-colors"
                >
                  COMPARE SPECS
                </button>
                <button 
                  onClick={() => !isAlreadyBooked && handleBook(car.id)}
                  disabled={isAlreadyBooked}
                  className={`flex-1 flex items-center justify-center text-center px-2 py-0 text-[10px] font-black tracking-widest uppercase rounded-xl transition-all ${
                    isAlreadyBooked 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                      : 'bg-green-500 text-white shadow-md hover:shadow-lg transition-all'
                  }`}
                >
                  {isAlreadyBooked ? 'BOOKED / UNAVAILABLE' : 'BOOK NOW'}
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
            onSelectCar={(carId) => handleBook(carId)}
            pickupDate={pickupDate}
            returnDate={returnDate}
          />
        );
      })()}
    </div>
  );
}
