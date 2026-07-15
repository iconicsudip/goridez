'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookingStore } from '@/store/useBookingStore';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { getCarSlug, calculatePackagePricing } from '@/lib/utils';

import CarImageSlider from '@/components/CarImageSlider';

export default function SelfDriveList({ initialCars, pickupDate, returnDate }: { initialCars: any[], pickupDate?: Date, returnDate?: Date | null }) {
  const router = useRouter();
  const { addToCart } = useBookingStore();

  const [selectedPackages, setSelectedPackages] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const CARS_PER_PAGE = 6;

  // Reset pagination when list filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [initialCars.length]);

  const totalPages = Math.ceil(initialCars.length / CARS_PER_PAGE);
  const paginatedCars = initialCars.slice((currentPage - 1) * CARS_PER_PAGE, currentPage * CARS_PER_PAGE);

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
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-5">
        {paginatedCars.map((car) => {
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
            <div key={car.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden group">
              <div className="flex flex-col md:flex-row">

                {/* ── Left: Image ── */}
                <div className="relative md:w-64 shrink-0 bg-gray-50 min-h-[200px]">
                  <div className="absolute inset-0 overflow-hidden">
                    <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full">
                      <CarImageSlider
                        mainImage={car.image}
                        galleryJson={car.gallery}
                        alt={`${car.make} ${car.model}`}
                        imageClassName="object-contain group-hover:scale-105 transition-transform duration-500 w-full h-full"
                      />
                    </Link>
                  </div>
                  {/* Self-Drive badge – top left */}
                  <span className="absolute top-3 left-3 z-10 bg-white/95 border border-gray-200 text-gray-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <ShieldCheck size={10} /> Self-Drive
                  </span>
                  {/* Availability badge – top right */}
                  <span className={`absolute top-3 right-3 z-10 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${car.availability ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-white' : 'bg-red-500'}`}></span>
                    {car.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* ── Center: Info ── */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 p-5 border-b border-gray-100">
                    {/* Title */}
                    <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">
                      <Link href={`/cars/${getCarSlug(car)}`} className="hover:text-green-600 transition-colors">
                        {car.make} {car.model}
                      </Link>
                    </h3>
                    {/* Specs subtitle */}
                    <p className="text-[11px] text-gray-400 font-mono mb-3">
                      {car.seatingCapacity} Seats &nbsp;•&nbsp; {car.transmission} &nbsp;•&nbsp; {car.fuelType}
                    </p>
                    {/* Trust badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                        <ShieldCheck size={10}/> Insured
                      </span>
                      <span className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                        <CheckCircle size={10}/> GPS Tracked
                      </span>
                    </div>
                    {/* Features pills */}
                    {car.features && car.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {car.features.map((feat: string, idx: number) => (
                          <span key={idx} className="bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Package selector */}
                    {allowedPackages.length > 0 && (
                      <div className="flex gap-2 pointer-events-none">
                        {allowedPackages.map((pkg: any) => {
                          const isSelected = usedPackageIds.has(pkg.id);
                          return (
                            <div
                              key={pkg.id}
                              className={`px-3 py-2 text-[9px] font-bold rounded-xl text-center border transition-all ${
                                isSelected
                                  ? 'bg-green-600 border-green-600 text-white'
                                  : 'bg-gray-50 border-gray-200 text-gray-400 opacity-50'
                              }`}
                            >
                              {pkg.name} ({pkg.limitValue} {pkg.type === 'KM' ? 'KM' : 'Hrs'})
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Inclusions strip */}
                  <div className="px-5 py-3 flex flex-wrap items-center gap-4 bg-gray-50">
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      Insured vehicle
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      GPS Tracked
                    </span>
                    {deposit > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ₹{deposit.toLocaleString()} refundable deposit
                      </span>
                    )}
                    {extraCharge > 0 && (
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ₹{extraCharge}/{unitType} extra limit
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Right: Fare Panel ── */}
                <div className="shrink-0 md:w-52 bg-green-50 border-l border-green-100 p-5 flex flex-col items-center justify-between">
                  <div className="text-center w-full">
                    <div className="text-[9px] font-black uppercase tracking-widest text-green-700/60 mb-1">Est. Trip Total</div>
                    <div className="text-4xl font-black text-green-700 leading-none">
                      ₹{Math.round(finalPrice * 1.18).toLocaleString()}
                    </div>
                    <div className="text-[9px] text-green-600/70 font-mono mt-1">incl. 18% GST</div>
                    <div className="mt-3 w-full space-y-1.5 text-left">
                      <div className="flex justify-between text-[9px] font-mono text-gray-500">
                        <span>Base fare</span>
                        <span className="font-bold text-gray-700">₹{finalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-gray-500">
                        <span>GST (18%)</span>
                        <span className="font-bold text-gray-700">₹{Math.round(finalPrice * 0.18).toLocaleString()}</span>
                      </div>
                      {deposit > 0 && (
                        <div className="flex justify-between text-[9px] font-mono text-gray-500 border-t border-green-100 pt-1.5 mt-1">
                          <span>Refundable deposit</span>
                          <span className="font-bold text-green-700">₹{deposit.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-full mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => !isAlreadyBooked && handleBook(car.id)}
                      disabled={isAlreadyBooked}
                      className={`w-full font-black text-[10px] tracking-widest uppercase py-3.5 px-4 rounded-xl transition-all ${
                        isAlreadyBooked
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/30'
                      }`}
                    >
                      {isAlreadyBooked ? 'Already Booked' : 'Book Now'}
                    </button>
                    <Link
                      href={`/cars/${getCarSlug(car)}`}
                      className="w-full font-black text-[10px] tracking-widest uppercase py-3 px-4 rounded-xl border border-gray-200 text-gray-600 text-center hover:border-green-300 hover:text-green-700 transition-all"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 border-t border-gray-250 pt-8">
          <button
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:border-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
          >
            &larr;
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-green-600 border-green-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-green-600 hover:text-green-700'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => {
              setCurrentPage(prev => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:border-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
