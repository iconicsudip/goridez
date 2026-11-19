'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Car as CarIcon, Home, Compass, ArrowRight, UserCircle, RefreshCw, Plane, KeyRound, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import { getCarSlug } from '@/lib/utils';
import VehicleCard, { getCarPricing, getCarPerks } from '@/components/VehicleCard';
import FloatingBackdrop from '@/components/FloatingBackdrop';

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
    <div className="col-span-full relative overflow-hidden rounded-[28px] border border-dashed border-[#C89D5C]/50 bg-gradient-to-b from-[#FFFDFA] to-[#F6EEE1] px-8 py-16 text-center">
      <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF4DF] to-[#F0DDB8] text-[#8A5A1F] shadow-inner">
        <Compass size={28} />
      </span>
      <p className="font-heading text-base font-extrabold tracking-tight text-[#551A0C]">{label}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#8C6D53]">Try another city or segment above, or talk to our concierge desk and we will arrange something for you.</p>
      <Link href="/contact" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#C89D5C]/50 bg-[#551A0C] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#DFB574] transition-all hover:bg-[#451408]">
        Contact concierge <ArrowRight size={14} />
      </Link>
    </div>
  );

  const CarCard = ({ car, ctaLabel, onBook, driver = false }: { car: any; ctaLabel: string; onBook: () => void; driver?: boolean }) => (
    <VehicleCard
      car={car}
      href={`/cars/${getCarSlug(car)}`}
      stage={{
        showServiceChips: false,
        chips: (
          <span className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#551A0C] ring-1 ring-[#E7DFD5] backdrop-blur">
            {driver ? <UserRound size={10} className="text-[#C89D5C]" /> : <KeyRound size={10} className="text-[#C89D5C]" />}
            {driver ? 'With driver' : 'Self-drive'}
          </span>
        ),
      }}
      perks={getCarPerks(car, getCarPricing(car).refPkg)}
      cta={{ label: ctaLabel, onClick: onBook }}
    />
  );

  const segmentCounts: Record<Segment, number> = {
    'Self Drive': selfDriveCars.length,
    'Round Trip': taxiCapableCars.length,
    'Airport Transfer': cityHasAirportZone ? taxiCapableCars.length : 0,
  };

  const cityCarCount = (id: string) => initialCars.filter((c: any) => c.cityId === id).length;

  const stats = [
    { icon: CarIcon, value: cityCars.length, label: 'Vetted vehicles' },
    { icon: Home, value: cityVillas.length, label: 'Villa stays' },
    { icon: Compass, value: cityTours.length, label: 'Curated expeditions' },
  ];

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#FAF6F0] pb-24 font-sans text-[#250903]">
      <FloatingBackdrop tone="light" variant="c" road={false} />

      {/* Hero Banner */}
      <section className="relative flex h-[52vh] items-end overflow-hidden bg-[#250903] md:h-[62vh]">
        <Image
          key={activeCity?.id}
          src={activeCity?.banner || siteSettings?.citiesPageBanner || CITY_FALLBACK_IMAGE}
          alt={activeCity?.name || 'City banner'}
          fill
          className="scale-105 object-cover opacity-55 transition-opacity duration-700"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#250903] via-[#250903]/45 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(223,181,116,0.22),transparent_55%)]" />

        <div className="container relative z-10 mx-auto max-w-[1500px] px-4 pb-16 pt-28 md:px-10 md:pb-20 lg:px-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C89D5C]/40 bg-[#250903]/80 px-4 py-1.5 backdrop-blur-md">
            <MapPin size={12} className="text-[#DFB574]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#DFB574] md:text-xs">Rajasthan Territory</span>
          </div>
          <h1 className="mb-4 font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            Explore <span className="font-editorial font-normal italic text-[#DFB574]">{activeCity?.name || 'Rajasthan'}</span>
          </h1>
          <p className="mb-8 max-w-xl text-sm font-light text-[#FAF6F0]/80 md:text-base">
            Drive yourself or ride with a uniformed chauffeur. Everything below is stationed on the ground in {activeCity?.name || 'the city'}.
          </p>

          <div className="flex flex-wrap gap-3">
            {stats.map((st) => (
              <div key={st.label} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFB574] text-[#551A0C]"><st.icon size={16} /></span>
                <div>
                  <div className="font-heading text-xl font-black leading-none text-white">{st.value}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#DFB574]/90">{st.label}</div>
                </div>
              </div>
            ))}
            {activeCity?.airportName && (
              <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFB574] text-[#551A0C]"><Plane size={16} /></span>
                <div>
                  <div className="font-heading text-sm font-black leading-tight text-white">{activeCity.airportName}</div>
                  <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#DFB574]/90">Airport transfers</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto px-4">

        {/* City picker: photo tiles */}
        <div className="relative z-20 -mt-12 mb-10 flex gap-4 overflow-x-auto px-1 pb-4 pt-2 hide-scrollbar">
          {initialCities.map((c: any) => {
            const active = activeCityId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCityId(c.id)}
                aria-pressed={active}
                className={`group/city relative h-[96px] w-[190px] shrink-0 cursor-pointer overflow-hidden rounded-2xl text-left transition-all duration-500 sm:h-[110px] sm:w-[220px] ${
                  active
                    ? '-translate-y-1.5 shadow-[0_20px_40px_-12px_rgba(85,26,12,0.55)] ring-2 ring-[#DFB574]'
                    : 'shadow-[0_10px_24px_-10px_rgba(42,14,7,0.35)] ring-1 ring-[#E7DFD5] hover:-translate-y-1 hover:ring-[#C89D5C]'
                }`}
              >
                <Image
                  src={c.banner || CITY_FALLBACK_IMAGE}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-cover transition-transform duration-700 group-hover/city:scale-110"
                  unoptimized
                />
                <span className={`absolute inset-0 transition-colors duration-500 ${active ? 'bg-gradient-to-t from-[#551A0C]/90 via-[#551A0C]/40 to-transparent' : 'bg-gradient-to-t from-[#250903]/85 via-[#250903]/35 to-transparent'}`} />
                <span className="absolute inset-x-3 bottom-2.5">
                  <span className={`block font-heading text-sm font-extrabold uppercase tracking-wide ${active ? 'text-[#DFB574]' : 'text-white'}`}>{c.name}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-white/70">{cityCarCount(c.id)} vehicles</span>
                </span>
                {active && <span className="absolute right-2.5 top-2.5 flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#DFB574]/70 motion-reduce:animate-none" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#DFB574]" /></span>}
              </button>
            );
          })}
        </div>

        {/* Segment tabs with counts */}
        <div className="mb-10 flex w-full overflow-x-auto rounded-2xl border border-[#E7DFD5] bg-[#FEFBF8] p-2 shadow-md hide-scrollbar lg:w-fit" role="tablist">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveSegment(seg.id)}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] transition-all sm:px-7 lg:flex-none ${
                  isActive ? 'border border-[#C89D5C]/30 bg-[#551A0C] text-[#DFB574] shadow-md' : 'text-[#6A5749] hover:text-[#551A0C]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#DFB574]' : 'text-[#8C6D53]'} />
                <span className="sm:hidden">{seg.shortLabel}</span>
                <span className="hidden sm:inline">{seg.id}</span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] ${isActive ? 'bg-[#DFB574] text-[#551A0C]' : 'bg-[#551A0C]/10 text-[#551A0C]'}`}>{segmentCounts[seg.id]}</span>
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
                    driver
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
                      driver
                      onBook={() => handleBookTaxi(car, 'AIRPORT_TRANSFER')}
                    />
                  ))
                )}
              </div>
            )
          )}

        </div>

        {/* Stays & expeditions teaser (real counts) */}
        {(cityVillas.length > 0 || cityTours.length > 0) && (
          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {cityVillas.length > 0 && (
              <Link href="/villas" className="group relative flex items-center gap-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#551A0C] to-[#250903] p-7 text-white shadow-[0_24px_50px_-18px_rgba(85,26,12,0.6)] transition-all hover:-translate-y-1.5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#DFB574] text-[#551A0C]"><Home size={24} /></span>
                <span className="flex-1">
                  <span className="block font-heading text-xl font-extrabold">{cityVillas.length} villa stay{cityVillas.length > 1 ? 's' : ''} in {activeCity?.name}</span>
                  <span className="mt-1 block text-sm text-white/70">Bundle a private villa with your ride.</span>
                </span>
                <ArrowRight className="text-[#DFB574] transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            {cityTours.length > 0 && (
              <Link href="/tours" className="group relative flex items-center gap-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#C89D5C] to-[#A66B38] p-7 text-[#250903] shadow-[0_24px_50px_-18px_rgba(166,107,56,0.6)] transition-all hover:-translate-y-1.5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#250903] text-[#DFB574]"><Compass size={24} /></span>
                <span className="flex-1">
                  <span className="block font-heading text-xl font-extrabold">{cityTours.length} curated expedition{cityTours.length > 1 ? 's' : ''}</span>
                  <span className="mt-1 block text-sm text-[#250903]/75">Guided journeys around Rajasthan.</span>
                </span>
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        )}

        {/* City FAQ */}
        {activeCity?.faqQuestion && activeCity?.faqAnswer && (
          <div className="mt-12 rounded-[28px] border border-[#E7DFD5] bg-[#FFFDFA] p-7 shadow-sm md:p-9">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#C89D5C]">Good to know about {activeCity.name}</div>
            <h3 className="mb-3 font-heading text-xl font-extrabold text-[#250903]">{activeCity.faqQuestion}</h3>
            <p className="max-w-3xl text-sm leading-relaxed text-[#6A5749]">{activeCity.faqAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
