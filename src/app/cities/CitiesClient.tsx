'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Car as CarIcon, Home, Compass, ArrowRight, UserCircle, RefreshCw, Plane } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import { getCarSlug } from '@/lib/utils';

const CITY_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1800&q=80';

type Segment = 'Self Drive' | 'Round Trip' | 'Airport Transfer';

export default function CitiesClient({ initialCities, initialCars, initialVillas, initialTours, initialAirportZones = [], siteSettings }: any) {
  const router = useRouter();
  const updateSession = useBookingStore(state => state.updateSession);

  const [activeCityId, setActiveCityId] = useState<string>(initialCities[0]?.id || '');
  const [activeSegment, setActiveSegment] = useState<Segment>('Self Drive');

  const activeCity = initialCities.find((c: any) => c.id === activeCityId) || initialCities[0];

  const cityCars = initialCars.filter((c: any) => c.cityId === activeCityId);
  const cityVillas = initialVillas.filter((v: any) => v.cityId === activeCityId);
  const cityTours = initialTours.filter((t: any) => t.cityId === activeCityId || !t.cityId);

  const selfDriveCars = cityCars.filter((c: any) => c.serviceTypes?.includes('SELF_DRIVE'));
  const taxiCapableCars = cityCars.filter((c: any) => c.serviceTypes?.includes('TAXI'));
  const cityHasAirportZone = initialAirportZones.some((z: any) => z.cityId === activeCityId);

  const segments: { id: Segment; icon: any; shortLabel: string }[] = [
    { id: 'Self Drive', icon: CarIcon, shortLabel: 'Self Drive' },
    { id: 'Round Trip', icon: RefreshCw, shortLabel: 'Round Trip' },
    { id: 'Airport Transfer', icon: Plane, shortLabel: 'Airport' },
  ];

  const handleBookCar = (car: any) => {
    updateSession({
      serviceType: 'selfDrive',
      selectedCarId: car.id,
      driverOption: false
    });
    router.push('/self-drive');
  };

  const handleBookTaxi = (car: any, mode: 'ROUND_TRIP' | 'AIRPORT_TRANSFER') => {
    updateSession({
      serviceType: mode === 'ROUND_TRIP' ? 'roundTripTaxi' : 'airportTransfer',
      selectedCarId: car.id,
      pickupCity: activeCity.name,
      bookingMode: mode,
    });
    router.push(`/taxi?mode=${mode}`);
  };

  const handleBookVilla = (villa: any) => {
    updateSession({
      serviceType: 'villaCar',
      selectedVillaId: villa.id,
    });
    router.push('/villas');
  };

  const handleBookTour = (tour: any) => {
    updateSession({
      serviceType: 'tours',
      selectedTourId: tour.id,
    });
    router.push('/tours');
  };

  const EmptyState = ({ label }: { label: string }) => (
    <div className="col-span-full py-20 text-center border-2 border-dashed border-[#C89D5C]/30 bg-[#FEFBF8] rounded-3xl p-8 border-classic-frame">
      <Compass size={36} className="mx-auto text-[#C89D5C] mb-4" />
      <p className="text-sm font-serif text-[#551A0C] font-bold uppercase tracking-wide">{label}</p>
      <p className="text-xs text-[#8C6D53] font-mono mt-1">Select another destination or connect with our concierge desk.</p>
    </div>
  );

  const CarCard = ({ car, ctaLabel, onBook }: { car: any; ctaLabel: string; onBook: () => void }) => (
    <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-6 group hover:border-[#C89D5C] hover:shadow-2xl transition-all duration-500 border-classic-frame flex flex-col justify-between">
      <Link href={`/cars/${getCarSlug(car)}`} className="block">
        <div className="relative w-full h-[160px] mb-4 flex items-center justify-center bg-[#FAF6F0] rounded-2xl overflow-hidden border border-[#E7DFD5]">
          <Image src={car.image} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
          <span className="absolute top-3 left-3 text-[9px] font-bold font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#250903]/90 text-[#DFB574] border border-[#C89D5C]/30">
            {car.category}
          </span>
        </div>
        <h3 className="text-lg font-bold font-serif uppercase tracking-tight text-[#551A0C] mb-4 group-hover:text-[#C89D5C] transition-colors">
          {car.make} {car.model}
        </h3>
      </Link>
      <button
        onClick={onBook}
        className="btn-luxury btn-luxury-shine w-full py-3.5 rounded-xl text-[10px] font-serif font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 shadow-md cursor-pointer"
      >
        {ctaLabel} <ArrowRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans pb-24">
      {/* Hero Banner */}
      <section className="relative h-[48vh] md:h-[58vh] flex items-end overflow-hidden bg-[#250903]">
        <Image
          src={activeCity?.banner || siteSettings?.citiesPageBanner || CITY_FALLBACK_IMAGE}
          alt={activeCity?.name || 'City banner'}
          fill
          className="object-cover opacity-50 scale-105 transition-opacity duration-700"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#250903] via-[#250903]/40 to-transparent" />

        <div className="container mx-auto px-4 md:px-10 lg:px-16 max-w-[1500px] relative z-10 pb-12 md:pb-16 pt-28">
          <div className="inline-flex items-center gap-2 border border-[#C89D5C]/40 rounded-full px-4 py-1.5 mb-4 bg-[#250903]/80 backdrop-blur-md">
            <MapPin size={12} className="text-[#DFB574]" />
            <span className="text-[#DFB574] text-[10px] md:text-xs font-bold font-mono tracking-[0.25em] uppercase">Rajasthan Territory</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-serif uppercase tracking-tight text-white leading-tight mb-3 drop-shadow-lg">
            Explore <span className="font-editorial italic font-normal text-[#DFB574]">{activeCity?.name || 'Rajasthan'}</span>
          </h1>
          <p className="text-[#FAF6F0]/80 text-sm md:text-base font-light max-w-xl">
            {cityCars.length} vetted vehicles, {cityVillas.length} sovereign villa stays, and {cityTours.length} curated expeditions ready on the ground.
          </p>
        </div>
      </section>

      <div className="container mx-auto relative z-10">

        {/* City Switcher */}
        <div className="flex flex-wrap gap-2.5 -mt-7 mb-10 relative z-20">
          {initialCities.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setActiveCityId(c.id)}
              className={`px-6 py-3.5 text-[11px] font-bold font-serif tracking-[0.16em] uppercase rounded-full transition-all shadow-md cursor-pointer ${
                activeCityId === c.id
                  ? 'bg-[#551A0C] text-[#DFB574] border-2 border-[#C89D5C] shadow-xl'
                  : 'bg-[#FEFBF8] border border-[#E7DFD5] text-[#6A5749] hover:text-[#551A0C] hover:border-[#C89D5C]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Segments */}
        <div className="flex bg-[#FEFBF8] border border-[#E7DFD5] p-2 rounded-2xl mb-10 overflow-x-auto hide-scrollbar w-full lg:w-fit shadow-md border-classic-frame">
          {segments.map(seg => {
            const Icon = seg.icon;
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2.5 flex-1 lg:flex-none px-3.5 sm:px-7 py-3 rounded-xl text-[10px] font-serif font-bold uppercase tracking-[0.16em] transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#551A0C] text-[#DFB574] shadow-md border border-[#C89D5C]/30'
                    : 'text-[#6A5749] hover:text-[#551A0C]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#DFB574]' : 'text-[#8C6D53]'} />
                <span className="sm:hidden">{seg.shortLabel}</span>
                <span className="hidden sm:inline">{seg.id}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">

          {/* Self Drive */}
          {activeSegment === 'Self Drive' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {selfDriveCars.length === 0 ? (
                <EmptyState label={`No self-drive vehicles currently stationed in ${activeCity?.name}`} />
              ) : (
                selfDriveCars.map((car: any) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    ctaLabel="Reserve Self Drive"
                    onBook={() => handleBookCar(car)}
                  />
                ))
              )}
            </div>
          )}

          {/* Round Trip */}
          {activeSegment === 'Round Trip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {taxiCapableCars.length === 0 ? (
                <EmptyState label={`No round trip chauffeured vehicles available from ${activeCity?.name}`} />
              ) : (
                taxiCapableCars.map((car: any) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    ctaLabel="Reserve Round Trip"
                    onBook={() => handleBookTaxi(car, 'ROUND_TRIP')}
                  />
                ))
              )}
            </div>
          )}

          {/* Airport Transfer */}
          {activeSegment === 'Airport Transfer' && (
            !cityHasAirportZone ? (
              <EmptyState label={`Airport transfers aren't currently active in ${activeCity?.name}`} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {taxiCapableCars.length === 0 ? (
                  <EmptyState label={`No airport transfer vehicles available in ${activeCity?.name}`} />
                ) : (
                  taxiCapableCars.map((car: any) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      ctaLabel="Reserve Airport Ride"
                      onBook={() => handleBookTaxi(car, 'AIRPORT_TRANSFER')}
                    />
                  ))
                )}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}
