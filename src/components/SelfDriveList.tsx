'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBookingStore } from '@/store/useBookingStore';
import { ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import { getCarSlug, calculatePackagePricing } from '@/lib/utils';
import CarImageSlider from '@/components/CarImageSlider';
import VehicleCard, { getCarPerks } from '@/components/VehicleCard';

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

  const renderCard = (car: any, layout: 'horizontal' | 'vertical') => {
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
    const gstAmount = Math.round(finalPrice * 0.18);
    const totalWithGst = Math.round(finalPrice * 1.18);
    const horizontal = layout === 'horizontal';

    return (
      <VehicleCard
        car={car}
        layout={layout}
        href={`/cars/${getCarSlug(car)}`}
        stage={{
          badge: 'Self-Drive',
          showServiceChips: false,
          unavailableLabel: 'Reserved',
          cityName: car.city?.name ? `${car.city.name} Hub` : undefined,
          imageSlot: (
            <Link href={`/cars/${getCarSlug(car)}`} className="relative block h-full w-full">
              <CarImageSlider
                mainImage={car.image}
                galleryJson={car.gallery}
                alt={`${car.make} ${car.model}`}
                slideClassName="mix-blend-multiply"
                imageClassName="object-contain w-full h-full group-hover:scale-105 transition-transform duration-700"
              />
            </Link>
          ),
        }}
        perks={getCarPerks(car, activePackage)}
        maxFeatures={horizontal ? 6 : 3}
        extra={
          <div className="mb-3 flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 rounded-full border border-[#C89D5C]/35 bg-[#FAF6F0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#551A0C]">
              <ShieldCheck size={11} className="text-[#C89D5C]" /> Comprehensive Insurance
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#C89D5C]/35 bg-[#FAF6F0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#551A0C]">
              <CheckCircle size={11} className="text-[#C89D5C]" /> GPS Monitored &amp; SOS
            </span>
          </div>
        }
        priceLabel="Estimated fare"
        price={totalWithGst}
        priceSuffix="incl. 18% GST"
        breakdown={
          horizontal
            ? [
                { label: 'Base fare', value: `₹${finalPrice.toLocaleString('en-IN')}` },
                { label: 'GST (18%)', value: `₹${gstAmount.toLocaleString('en-IN')}` },
                ...(deposit > 0 ? [{ label: 'Refundable deposit', value: `₹${deposit.toLocaleString('en-IN')}`, strong: true }] : []),
                { label: 'Advance to reserve', value: `₹${Math.round(totalWithGst * 0.3).toLocaleString('en-IN')} (30%)` },
              ]
            : undefined
        }
        cta={{
          label: isAlreadyBooked ? 'Already Reserved' : 'Reserve Carriage',
          onClick: () => handleBook(car.id),
          disabled: !!isAlreadyBooked,
        }}
        secondary={horizontal ? { label: 'Vehicle Dossier', href: `/cars/${getCarSlug(car)}` } : undefined}
      />
    );
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
      <div className={viewMode === 'list' ? 'flex flex-col gap-6' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7'}>
        {paginatedCars.map((car) => (
          <div key={car.id} className="min-w-0">
            {renderCard(car, viewMode === 'list' ? 'horizontal' : 'vertical')}
          </div>
        ))}
      </div>

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
