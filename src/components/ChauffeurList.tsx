'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChauffeurBookingModal from './ChauffeurBookingModal';
import { useBookingStore } from '@/store/useBookingStore';

import { ShieldCheck, User, Fuel, MapPin, Navigation } from 'lucide-react';
import { getCarSlug } from '@/lib/utils';
import VehicleCard from '@/components/VehicleCard';

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

        const isLuxury = /mercedes|bmw|audi/i.test(car.make || '');
        const kmText = currentPackage?.limitValue
          ? `${Math.round(currentPackage.limitValue * durationDays)} ${currentPackage.type === 'KM' ? 'km' : 'hrs'} daily allowance`
          : 'Unlimited daily allowance';

        return (
          <div key={car.id} className="min-w-0">
            <VehicleCard
              car={car}
              layout="vertical"
              href={`/cars/${getCarSlug(car)}`}
              stage={{
                badge: isLuxury ? 'VIP Signature' : 'Royal Chauffeur',
                showServiceChips: false,
                unavailableLabel: 'Reserved',
                chips: (
                  <span className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#551A0C] ring-1 ring-[#E7DFD5] backdrop-blur">
                    <ShieldCheck size={10} className="text-[#C89D5C]" /> Uniformed chauffeur
                  </span>
                ),
                cityName: car.city?.name ? `${car.city.name} Hub` : undefined,
              }}
              perks={[
                { icon: <User size={12} />, text: 'Professional chauffeur complimentary' },
                { icon: <Fuel size={12} />, text: 'Fuel & maintenance included' },
                { icon: <MapPin size={12} />, text: 'Interstate toll permits, tolls pre-paid' },
                { icon: <Navigation size={12} />, text: kmText },
              ]}
              priceLabel="Estimated total"
              price={totalWithGst}
              priceSuffix="chauffeur & GST incl."
              breakdown={[
                { label: 'Base fare', value: `₹${finalPrice.toLocaleString('en-IN')}` },
                { label: 'GST (18%)', value: `₹${Math.round(finalPrice * 0.18).toLocaleString('en-IN')}` },
                ...(deposit > 0 ? [{ label: 'Refundable deposit', value: `₹${deposit.toLocaleString('en-IN')}`, strong: true }] : []),
              ]}
              cta={{
                label: isAlreadyBooked ? 'Reserved' : 'Reserve Chauffeur',
                onClick: () => setSelectedBookingCarId(car.id),
                disabled: !!isAlreadyBooked,
              }}
              secondary={{ label: 'Vehicle Dossier', href: `/cars/${getCarSlug(car)}` }}
            />
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
