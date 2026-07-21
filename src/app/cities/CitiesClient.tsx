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

export default function CitiesClient({ initialCities, initialCars, initialVillas, initialTours, initialAirportZones = [] }: any) {
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

  const segments: { id: Segment; icon: any }[] = [
    { id: 'Self Drive', icon: CarIcon },
    { id: 'Round Trip', icon: RefreshCw },
    { id: 'Airport Transfer', icon: Plane },
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
    <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl">
      <Compass size={32} className="mx-auto text-gray-300 mb-4" />
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </div>
  );

  const CarCard = ({ car, ctaLabel, onBook }: { car: any; ctaLabel: string; onBook: () => void }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 group hover:border-green-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/cars/${getCarSlug(car)}`} className="block">
        <div className="relative w-full h-[140px] mb-4 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
          <Image src={car.image} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
        </div>
        <div className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">{car.category}</div>
        <h3 className="text-lg font-black uppercase mb-4 group-hover:text-green-700 transition-colors">{car.make} {car.model}</h3>
      </Link>
      <button
        onClick={onBook}
        className="w-full bg-gray-100 group-hover:bg-green-600 group-hover:text-white text-gray-900 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
      >
        {ctaLabel} <ArrowRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pb-24">
      {/* Hero Banner */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end overflow-hidden bg-gray-900">
        <Image
          src={activeCity?.banner || CITY_FALLBACK_IMAGE}
          alt={activeCity?.name || 'City banner'}
          fill
          className="object-cover opacity-70 transition-opacity duration-500"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-gray-900/10" />

        <div className="container mx-auto px-4 md:px-10 lg:px-16 max-w-[1500px] relative z-10 pb-10 md:pb-14 pt-28">
          <div className="inline-flex items-center gap-2 border border-green-400/40 rounded-full px-4 py-1.5 mb-6 bg-white/10 backdrop-blur-md">
            <MapPin size={12} className="text-green-400" />
            <span className="text-green-400 text-[10px] md:text-xs font-black tracking-widest uppercase">Destinations</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight mb-3 drop-shadow-lg">
            Explore <span className="text-green-500">{activeCity?.name || 'Rajasthan'}</span>
          </h1>
          <p className="text-gray-300 text-sm md:text-base font-medium max-w-xl">
            {cityCars.length} vehicles, {cityVillas.length} villa stays, and {cityTours.length} curated expeditions on the ground.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-10 lg:px-16 max-w-[1500px] relative z-10">

        {/* City Switcher */}
        <div className="flex flex-wrap gap-2 -mt-7 mb-10 relative z-20">
          {initialCities.map((c: any) => (
            <button
              key={c.id}
              onClick={() => setActiveCityId(c.id)}
              className={`px-6 py-3 text-[10px] font-black tracking-widest uppercase rounded-full transition-all shadow-md ${activeCityId === c.id
                ? 'bg-green-600 text-white shadow-green-600/30'
                : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Segments */}
        <div className="flex bg-gray-200/50 p-1.5 rounded-2xl mb-8 overflow-x-auto hide-scrollbar w-full lg:w-fit">
          {segments.map(seg => {
            const Icon = seg.icon;
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id)}
                className={`flex items-center justify-center gap-2 flex-1 lg:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isActive
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon size={14} /> {seg.id}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">

          {/* Self Drive */}
          {activeSegment === 'Self Drive' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selfDriveCars.length === 0 ? (
                <EmptyState label={`No cars available in ${activeCity?.name}`} />
              ) : (
                selfDriveCars.map((car: any) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    ctaLabel="Book Now"
                    onBook={() => handleBookCar(car)}
                  />
                ))
              )}
            </div>
          )}

          {/* Round Trip */}
          {activeSegment === 'Round Trip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taxiCapableCars.length === 0 ? (
                <EmptyState label={`No round trip vehicles available from ${activeCity?.name}`} />
              ) : (
                taxiCapableCars.map((car: any) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    ctaLabel="Book Round Trip"
                    onBook={() => handleBookTaxi(car, 'ROUND_TRIP')}
                  />
                ))
              )}
            </div>
          )}

          {/* Airport Transfer */}
          {activeSegment === 'Airport Transfer' && (
            !cityHasAirportZone ? (
              <EmptyState label={`Airport transfers aren't available in ${activeCity?.name} yet`} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {taxiCapableCars.length === 0 ? (
                  <EmptyState label={`No airport transfer vehicles available in ${activeCity?.name}`} />
                ) : (
                  taxiCapableCars.map((car: any) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      ctaLabel="Book Transfer"
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
