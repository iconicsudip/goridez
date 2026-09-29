'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookingStore } from '@/store/useBookingStore';
import { ShieldCheck, CheckCircle, Users, Fuel, Gauge, ArrowRight, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { getCarSlug, calculatePackagePricing } from '@/lib/utils';
import CarImageSlider from '@/components/CarImageSlider';

interface SelfDriveListProps {
  initialCars: any[];
  pickupDate?: Date;
  returnDate?: Date | null;
  viewMode?: 'grid' | 'list';
}

export default function SelfDriveList({
  initialCars,
  pickupDate,
  returnDate,
  viewMode = 'list'
}: SelfDriveListProps) {
  const router = useRouter();
  const { addToCart } = useBookingStore();

  const [currentPage, setCurrentPage] = useState(1);
  const CARS_PER_PAGE = viewMode === 'grid' ? 9 : 6;

  // Reset pagination when list filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [initialCars.length, viewMode]);

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

  if (initialCars.length === 0) {
    return (
      <div className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-16 text-center text-[#250903] shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#FAF6F0] border border-[#C89D5C]/40 flex items-center justify-center mx-auto mb-4 text-[#C89D5C]">
          <Sparkles size={24} />
        </div>
        <h3 className="text-xl font-bold uppercase tracking-wide text-[#551A0C] mb-2">No Matching Carriage Found</h3>
        <p className="text-sm text-[#8C6D53] max-w-md mx-auto leading-relaxed">
          No vehicles in our royal fleet match your current filter parameters. Try adjusting your travel dates, city hub, or transmission filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* ── Wide Ledger View (Default) ── */}
      {viewMode === 'list' ? (
        <div className="flex flex-col gap-6">
          {paginatedCars.map((car) => {
            const durationHours = pickupDate && returnDate
              ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
              : 24;

            const priceInfo = calculatePackagePricing(car.packages || [], durationHours);
            const finalPrice = priceInfo.basePrice;
            const activePackage = priceInfo.selectedPkg || car.packages?.[0];

            const isAlreadyBooked = car.bookings && car.bookings.length > 0 && car.bookings.some((booking: any) => {
              if (booking.status === 'CANCELLED') return false;
              const bStart = new Date(booking.startDate);
              const bEnd = new Date(booking.endDate);
              const currentStart = pickupDate || new Date();
              const currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
              return currentStart <= bEnd && currentEnd >= bStart;
            });

            const deposit = activePackage?.deposit || 0;
            const extraCharge = activePackage?.extraChargePerUnit || 0;
            const unitType = activePackage?.type === 'KM' ? 'KM' : 'Hour';
            const gstAmount = Math.round(finalPrice * 0.18);
            const totalWithGst = Math.round(finalPrice * 1.18);

            return (
              <div
                key={car.id}
                className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] hover:border-[#C89D5C] rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Vehicle Image Slider Showcase */}
                  <div className="relative w-full lg:w-[360px] xl:w-[400px] shrink-0 bg-[#FAF6F0] min-h-[260px] lg:min-h-[280px] flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E7DFD5]">
                    <div className="absolute inset-0 overflow-hidden">
                      <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full">
                        <CarImageSlider
                          mainImage={car.image}
                          galleryJson={car.gallery}
                          alt={`${car.make} ${car.model}`}
                          imageClassName="object-cover group-hover:scale-108 transition-transform duration-700 w-full h-full"
                        />
                      </Link>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
                      <span className="bg-[#FEFBF8]/95 backdrop-blur-md border border-[#C89D5C]/50 text-[#551A0C] text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-[#C89D5C]" /> Self-Drive
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

                    {/* Hub Location Badge */}
                    {car.city?.name && (
                      <span className="absolute bottom-4 left-4 z-10 bg-[#250903]/85 backdrop-blur-md text-[#DFB574] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-[#C89D5C]/30 shadow-xs">
                        {car.city.name} Hub
                      </span>
                    )}
                  </div>

                  {/* Center: Vehicle Dossier & Inclusions */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      {/* Category & Title */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="text-[10px] text-[#C89D5C] font-bold uppercase tracking-[0.25em] mb-1">
                            {car.category || 'Luxury Fleet'} • {car.make}
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black text-[#551A0C] tracking-tight group-hover:text-[#C89D5C] transition-colors">
                            <Link href={`/cars/${getCarSlug(car)}`}>
                              {car.make} {car.model}
                            </Link>
                          </h3>
                        </div>

                        {car.category && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FAF6F0] text-[#8C6D53] border border-[#E7DFD5] shrink-0">
                            {car.category}
                          </span>
                        )}
                      </div>

                      {/* Technical Specs Pods */}
                      <div className="grid grid-cols-3 gap-3 my-5 py-4 border-y border-[#E7DFD5] bg-[#FAF6F0]/40 rounded-2xl px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shrink-0">
                            <Users size={15} />
                          </div>
                          <div>
                            <div className="text-[9px] text-[#8C6D53] uppercase font-bold tracking-wider">Capacity</div>
                            <div className="text-xs font-bold text-[#250903]">{car.seatingCapacity || 5} Adult Seats</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 border-x border-[#E7DFD5] px-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shrink-0">
                            <Gauge size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] text-[#8C6D53] uppercase font-bold tracking-wider">Gearbox</div>
                            <div className="text-xs font-bold text-[#250903] truncate">{car.transmission || 'Manual'}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 pl-2">
                          <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shrink-0">
                            <Fuel size={15} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[9px] text-[#8C6D53] uppercase font-bold tracking-wider">Propulsion</div>
                            <div className="text-xs font-bold text-[#250903] truncate">{car.fuelType || 'Petrol'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Trust Assurance Strip */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="flex items-center gap-1.5 bg-[#FAF6F0] text-[#551A0C] border border-[#C89D5C]/35 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <ShieldCheck size={12} className="text-[#C89D5C]" /> Comprehensive Insurance
                        </span>
                        <span className="flex items-center gap-1.5 bg-[#FAF6F0] text-[#551A0C] border border-[#C89D5C]/35 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle size={12} className="text-[#C89D5C]" /> GPS Monitored & SOS
                        </span>
                        {deposit > 0 && (
                          <span className="flex items-center gap-1.5 bg-[#FAF6F0] text-[#551A0C] border border-[#C89D5C]/35 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-[#C89D5C]">✦</span> 100% Refundable Escrow
                          </span>
                        )}
                      </div>

                      {/* Features Badges */}
                      {car.features && car.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {car.features.map((feat: string, idx: number) => (
                            <span
                              key={idx}
                              className="bg-[#FEFBF8] text-[#6A5749] text-[10px] font-medium tracking-wide px-3 py-1 rounded-lg border border-[#E7DFD5]"
                            >
                              {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Inclusions Footer */}
                    <div className="mt-5 pt-3 border-t border-[#E7DFD5] flex flex-wrap items-center gap-4 text-xs font-medium text-[#8C6D53]">
                      <span>Clean Interior Sanitized</span>
                      <span>•</span>
                      <span>Doorstep Delivery Option</span>
                      <span>•</span>
                      <span>Fastag Active</span>
                      {extraCharge > 0 && (
                        <>
                          <span>•</span>
                          <span>₹{extraCharge}/{unitType} Extra Limit</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Fare Ledger & Reservation Action */}
                  <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 bg-[#FAF6F0] border-t lg:border-t-0 lg:border-l border-[#E7DFD5] p-6 md:p-8 flex flex-col justify-between text-center">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C6D53] mb-1.5">
                        Estimated Trip Fare
                      </div>

                      <div className="text-4xl font-black text-[#551A0C] leading-none tracking-tight my-2">
                        ₹{totalWithGst.toLocaleString()}
                      </div>

                      <div className="text-[11px] text-[#8C6D53] italic">
                        incl. 18% GST (All Taxes Included)
                      </div>

                      {/* Line Breakdown */}
                      <div className="mt-6 w-full space-y-2 text-left border-t border-[#E7DFD5] pt-4 text-xs text-[#6A5749]">
                        <div className="flex justify-between">
                          <span>Base Fare</span>
                          <span className="font-bold text-[#250903]">₹{finalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18%)</span>
                          <span className="font-bold text-[#250903]">₹{gstAmount.toLocaleString()}</span>
                        </div>
                        {deposit > 0 && (
                          <div className="flex justify-between border-t border-[#E7DFD5] pt-2 mt-2 text-[#551A0C] font-bold">
                            <span>Refundable Deposit</span>
                            <span className="text-[#C89D5C]">₹{deposit.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[11px] text-[#8C6D53] pt-1">
                          <span>Advance to Reserve</span>
                          <span className="font-bold text-[#551A0C]">₹{Math.round(totalWithGst * 0.3).toLocaleString()} (30%)</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full mt-7 flex flex-col gap-2.5">
                      <button
                        onClick={() => !isAlreadyBooked && handleBook(car.id)}
                        disabled={isAlreadyBooked}
                        className={`w-full font-bold text-xs tracking-[0.2em] uppercase py-4 px-5 rounded-xl transition-all cursor-pointer shadow-md hover:shadow-xl ${
                          isAlreadyBooked
                            ? 'bg-[#E7DFD5] text-[#8C6D53] cursor-not-allowed'
                            : 'btn-luxury btn-luxury-shine bg-[#551A0C] text-[#DFB574] hover:bg-[#451408] border border-[#C89D5C]/50'
                        }`}
                      >
                        {isAlreadyBooked ? 'Already Reserved' : 'Reserve Carriage'}
                      </button>

                      <Link
                        href={`/cars/${getCarSlug(car)}`}
                        className="w-full font-bold text-xs tracking-[0.18em] uppercase py-3.5 px-4 rounded-xl border border-[#E7DFD5] text-[#551A0C] bg-[#FEFBF8] text-center hover:border-[#C89D5C] hover:bg-[#FAF6F0] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Vehicle Dossier</span>
                        <ChevronRight size={14} className="text-[#C89D5C]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Showroom Grid View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {paginatedCars.map((car) => {
            const durationHours = pickupDate && returnDate
              ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
              : 24;

            const priceInfo = calculatePackagePricing(car.packages || [], durationHours);
            const finalPrice = priceInfo.basePrice;
            const activePackage = priceInfo.selectedPkg || car.packages?.[0];

            const isAlreadyBooked = car.bookings && car.bookings.length > 0 && car.bookings.some((booking: any) => {
              if (booking.status === 'CANCELLED') return false;
              const bStart = new Date(booking.startDate);
              const bEnd = new Date(booking.endDate);
              const currentStart = pickupDate || new Date();
              const currentEnd = new Date(currentStart.getTime() + 24 * 60 * 60 * 1000);
              return currentStart <= bEnd && currentEnd >= bStart;
            });

            const deposit = activePackage?.deposit || 0;
            const totalWithGst = Math.round(finalPrice * 1.18);

            return (
              <div
                key={car.id}
                className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] hover:border-[#C89D5C] rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Image Section */}
                <div className="relative aspect-[16/10] w-full bg-[#FAF6F0] overflow-hidden border-b border-[#E7DFD5]">
                  <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full">
                    <CarImageSlider
                      mainImage={car.image}
                      galleryJson={car.gallery}
                      alt={`${car.make} ${car.model}`}
                      imageClassName="object-cover group-hover:scale-108 transition-transform duration-700 w-full h-full"
                    />
                  </Link>

                  {/* Top Tags */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 z-10 flex items-center justify-between pointer-events-none">
                    <span className="bg-[#FEFBF8]/95 backdrop-blur-md border border-[#C89D5C]/50 text-[#551A0C] text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5">
                      <ShieldCheck size={11} className="text-[#C89D5C]" /> Self-Drive
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

                  {car.city?.name && (
                    <span className="absolute bottom-3.5 left-3.5 z-10 bg-[#250903]/85 backdrop-blur-md text-[#DFB574] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-md border border-[#C89D5C]/30 shadow-xs">
                      {car.city.name} Hub
                    </span>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-[10px] text-[#C89D5C] font-bold uppercase tracking-[0.2em] mb-1">
                          {car.category || 'Luxury'}
                        </div>
                        <h3 className="text-xl font-bold text-[#551A0C] leading-snug group-hover:text-[#C89D5C] transition-colors">
                          <Link href={`/cars/${getCarSlug(car)}`}>
                            {car.make} {car.model}
                          </Link>
                        </h3>
                      </div>
                    </div>

                    {/* Specs Bar */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E7DFD5] my-4 text-center bg-[#FAF6F0]/40 rounded-xl">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-[#8C6D53] uppercase font-bold tracking-wider">Seats</span>
                        <span className="text-xs font-bold text-[#250903] mt-0.5">{car.seatingCapacity || 5}</span>
                      </div>
                      <div className="flex flex-col items-center border-x border-[#E7DFD5]">
                        <span className="text-[9px] text-[#8C6D53] uppercase font-bold tracking-wider">Trans</span>
                        <span className="text-xs font-bold text-[#250903] mt-0.5 truncate max-w-[80px]">{car.transmission || 'Manual'}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-[#8C6D53] uppercase font-bold tracking-wider">Fuel</span>
                        <span className="text-xs font-bold text-[#250903] mt-0.5 truncate max-w-[80px]">{car.fuelType || 'Petrol'}</span>
                      </div>
                    </div>

                    {/* Features Tags */}
                    {car.features && car.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {car.features.slice(0, 3).map((feat: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-[#FAF6F0] text-[#551A0C] text-[9px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full border border-[#E7DFD5]"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-4 border-t border-[#E7DFD5] space-y-3">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-[#8C6D53]">Estimated Fare</div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-black text-[#551A0C] tracking-tight">
                            ₹{totalWithGst.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#8C6D53] italic">incl. GST</span>
                        </div>
                      </div>

                      {deposit > 0 && (
                        <div className="text-right">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-[#8C6D53]">Deposit</div>
                          <div className="text-xs font-bold text-[#C89D5C] mt-0.5">₹{deposit.toLocaleString()}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => !isAlreadyBooked && handleBook(car.id)}
                        disabled={isAlreadyBooked}
                        className={`flex-1 font-bold text-[10px] tracking-[0.18em] uppercase py-3.5 px-4 rounded-xl transition-all cursor-pointer ${
                          isAlreadyBooked
                            ? 'bg-[#E7DFD5] text-[#8C6D53] cursor-not-allowed'
                            : 'btn-luxury btn-luxury-shine bg-[#551A0C] text-[#DFB574] hover:bg-[#451408] border border-[#C89D5C]/50 shadow-md'
                        }`}
                      >
                        {isAlreadyBooked ? 'Reserved' : 'Reserve Carriage'}
                      </button>

                      <Link
                        href={`/cars/${getCarSlug(car)}`}
                        className="border border-[#E7DFD5] bg-[#FEFBF8] text-[#551A0C] px-3.5 py-3.5 rounded-xl hover:border-[#C89D5C] hover:bg-[#FAF6F0] transition-colors flex items-center justify-center shrink-0"
                        title="View Details"
                      >
                        <ArrowRight size={14} className="text-[#C89D5C]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12 border-t border-[#E7DFD5] pt-8">
          <button
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-xl border border-[#E7DFD5] bg-[#FEFBF8] flex items-center justify-center text-[#551A0C] hover:border-[#C89D5C] hover:text-[#551A0C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs font-serif"
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
              className={`w-10 h-10 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-md'
                  : 'border-[#E7DFD5] bg-[#FEFBF8] text-[#551A0C] hover:border-[#C89D5C]'
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
            className="w-10 h-10 rounded-xl border border-[#E7DFD5] bg-[#FEFBF8] flex items-center justify-center text-[#551A0C] hover:border-[#C89D5C] hover:text-[#551A0C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs font-serif"
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
