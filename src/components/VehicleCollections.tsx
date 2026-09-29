'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight, Fuel, Users, Settings2, Volume2, VolumeX, Plus } from 'lucide-react';
import { getCarSlug } from '@/lib/utils';

interface VehicleCollectionsProps {
  cars: any[];
  title?: React.ReactNode;
  subtitle?: string;
  description?: string;
  hideTabs?: boolean;
}

export default function VehicleCollections({ 
  cars,
  title = <>BUILT <span className="text-[#DFB574] italic font-serif">DIFFERENT.</span></>,
  subtitle = 'Royal Automotive Collection',
  description = 'Rugged automotive essentials crafted with character, purpose, and lasting style for Rajasthan expeditions.',
  hideTabs = false
}: VehicleCollectionsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isMuted, setIsMuted] = useState(true);

  // Category filter tabs inspired by the reference design
  const categoryPills = [
    { id: 'all', label: 'ALL PIECES' },
    { id: 'suv', label: 'SUVs & 4×4' },
    { id: 'sedan', label: 'LUXURY SEDANS' },
    { id: 'tempo', label: 'TEMPO & MPV' },
    { id: 'taxi', label: 'CHAUFFEUR FLEET' },
    { id: 'airport', label: 'AIRPORT TRANSFERS' },
  ];

  // Filter cars based on selected category pill
  const activeCars = useMemo(() => {
    if (!cars || cars.length === 0) return [];
    if (hideTabs || activeCategory === 'all') return cars;

    return cars.filter((car) => {
      const cat = (car.category || '').toUpperCase();
      const model = (car.model || '').toUpperCase();
      const make = (car.make || '').toUpperCase();
      const services = car.serviceTypes || [];

      if (activeCategory === 'suv') {
        return cat.includes('SUV') || model.includes('THAR') || model.includes('FORTUNER') || model.includes('SCORPIO') || model.includes('XUV') || model.includes('CRETA') || model.includes('BREZZA');
      }
      if (activeCategory === 'sedan') {
        return cat.includes('SEDAN') || model.includes('CITY') || model.includes('VERNA') || model.includes('CIAZ') || cat.includes('LUXURY');
      }
      if (activeCategory === 'tempo') {
        return cat.includes('TEMPO') || model.includes('TRAVELLER') || model.includes('URBANIA') || model.includes('INNOVA') || model.includes('ERTIGA');
      }
      if (activeCategory === 'taxi') {
        return services.includes('TAXI') || services.includes('WITH_DRIVER');
      }
      if (activeCategory === 'airport') {
        return services.includes('AIRPORT_TRANSFER');
      }
      return true;
    });
  }, [activeCategory, cars, hideTabs]);

  // Designate the spotlight car for the right-hand Studio Motion card
  const spotlightCar = useMemo(() => {
    if (!cars || cars.length === 0) return null;
    // Prefer Fortuner, Thar, Innova, or first vehicle
    return (
      cars.find(c => (c.model || '').toUpperCase().includes('FORTUNER')) ||
      cars.find(c => (c.model || '').toUpperCase().includes('THAR')) ||
      cars.find(c => (c.model || '').toUpperCase().includes('INNOVA')) ||
      cars[0]
    );
  }, [cars]);

  // Embla Carousel setup for the left product grid
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: 'trimSnaps',
      slidesToScroll: 1,
      loop: activeCars.length > 2,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onInit = useCallback((api: any) => {
    setScrollSnaps(api.scrollSnapList());
  }, []);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
    setPrevBtnEnabled(api.canScrollPrev());
    setNextBtnEnabled(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('init', onInit);
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0, false);
      emblaApi.reInit();
    }
    setSelectedIndex(0);
  }, [activeCategory, activeCars.length, emblaApi]);

  const spotlightCheapestPkg = spotlightCar?.packages?.sort((a: any, b: any) => a.basePrice - b.basePrice)[0];
  const spotlightPrice = spotlightCar?.perDayPrice || spotlightCar?.price || (spotlightCheapestPkg ? spotlightCheapestPkg.basePrice : 4500);

  return (
    <section id="collection" className="py-24 bg-[#180501] border-t border-[#C89D5C]/20 text-white relative overflow-hidden font-body">
      {/* Background Decorative Warm Accents */}
      <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-[#551A0C]/25 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#C89D5C]/12 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Heading & Controls */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#551A0C]/40 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] w-8 bg-[#C89D5C]"></span>
              <div className="text-[#DFB574] text-xs font-bold tracking-[0.25em] uppercase font-mono">
                {subtitle}
              </div>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tight text-white leading-none mb-3">
              {title}
            </h2>
            <p className="text-[#FAF6F0]/75 font-editorial italic text-base md:text-lg max-w-2xl">
              {description}
            </p>
          </div>

          {/* Navigation & View All link */}
          <div className="flex items-center gap-5 mt-auto">
            <Link 
              href="/self-drive" 
              className="text-xs font-black uppercase tracking-[0.2em] text-[#DFB574] hover:text-white transition-colors flex items-center gap-1.5 border-b border-[#C89D5C]/50 pb-1"
            >
              VIEW ALL <ArrowUpRight size={15} />
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-95 ${
                  prevBtnEnabled 
                    ? 'bg-[#2A0E07] hover:bg-[#551A0C] text-[#DFB574] border-[#C89D5C]/40 hover:border-[#C89D5C] cursor-pointer' 
                    : 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed opacity-40'
                }`}
                title="Previous"
                aria-label="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-95 ${
                  nextBtnEnabled 
                    ? 'bg-[#2A0E07] hover:bg-[#551A0C] text-[#DFB574] border-[#C89D5C]/40 hover:border-[#C89D5C] cursor-pointer' 
                    : 'bg-white/5 text-white/20 border-white/10 cursor-not-allowed opacity-40'
                }`}
                title="Next"
                aria-label="Next Slide"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills Bar */}
        {!hideTabs && (
          <div className="flex gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-hide justify-start">
            {categoryPills.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#FAF6F0] text-[#250903] shadow-lg shadow-black/40 ring-2 ring-[#DFB574]/40 font-black'
                    : 'bg-[#230B05] border border-[#551A0C]/70 text-[#FAF6F0]/80 hover:text-white hover:border-[#C89D5C]/60 hover:bg-[#350E05]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Showcase Grid (Left: Carousel of Luxury Cards, Right: Studio Motion Card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Column: Carousel Cards (8 cols) */}
          <div className="lg:col-span-8 flex flex-col justify-between overflow-hidden">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-5">
                {activeCars.length === 0 ? (
                  <div className="w-full ml-5 text-center py-20 text-[#DFB574]/80 font-editorial italic text-base border border-dashed border-[#551A0C] rounded-3xl bg-[#230B05]/50">
                    No vehicles currently available in this category.
                  </div>
                ) : (
                  activeCars.map((car) => {
                    const cheapestPkg = car.packages?.sort((a: any, b: any) => a.basePrice - b.basePrice)[0];
                    const startingPrice = car.perDayPrice || car.price || (cheapestPkg ? cheapestPkg.basePrice : 2800);
                    const originalPrice = Math.round(startingPrice * 1.22);
                    const targetLink = `/cars/${getCarSlug(car)}`;

                    return (
                      <div
                        key={car.id}
                        className="flex-[0_0_90%] sm:flex-[0_0_50%] min-w-0 pl-5"
                      >
                        <div className="bg-[#240C06] border border-[#551A0C]/80 hover:border-[#C89D5C] rounded-3xl p-4 sm:p-5 flex flex-col justify-between group transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)] h-full">
                          
                          {/* Inner Vehicle Image Container with Radial Warm Spotlight */}
                          <div className="relative h-[210px] w-full rounded-2xl flex items-center justify-center overflow-hidden border border-[#551A0C]/60 mb-4 bg-gradient-to-b from-[#381108] via-[#240C06] to-[#170501]">
                            {/* Radial Glow */}
                            <div className="absolute inset-0 bg-radial from-[#551A0C]/70 via-transparent to-transparent opacity-80 pointer-events-none" />
                            
                            <Image
                              src={car.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80'}
                              alt={`${car.make} ${car.model}`}
                              fill
                              className="object-contain p-3 group-hover:scale-108 transition-transform duration-700 ease-out"
                              unoptimized
                            />

                            <div className="absolute top-3 left-3 z-10">
                              <span className="bg-[#170501]/90 text-[#DFB574] text-[8.5px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#C89D5C]/40 backdrop-blur-md shadow-sm">
                                ✦ {car.category ? car.category.replace(/\bClass\b/gi, '').trim() : 'ROYAL SELECTION'}
                              </span>
                            </div>
                          </div>

                          {/* Content Details */}
                          <div className="flex flex-col flex-grow justify-between">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89D5C] mb-1 font-mono">
                                {car.make}
                              </div>
                              <h3 className="text-base sm:text-lg font-heading font-black text-white uppercase tracking-wide mb-3 truncate group-hover:text-[#DFB574] transition-colors">
                                {car.model}
                              </h3>

                              {/* Specs row */}
                              <div className="grid grid-cols-3 border border-[#551A0C]/60 rounded-xl bg-[#170501]/60 p-2 mb-4 text-[10.5px] text-[#FAF6F0]/80 font-medium">
                                <div className="flex items-center justify-center gap-1.5 py-0.5">
                                  <Fuel size={12} className="text-[#C89D5C]" />
                                  <span className="capitalize">{car.fuelType || 'Petrol'}</span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 py-0.5 border-x border-[#551A0C]/60">
                                  <Users size={12} className="text-[#C89D5C]" />
                                  <span>{car.seatingCapacity || 5} Seats</span>
                                </div>
                                <div className="flex items-center justify-center gap-1.5 py-0.5">
                                  <Settings2 size={12} className="text-[#C89D5C]" />
                                  <span className="capitalize">{car.transmission ? car.transmission.replace(' Gearbox', '') : 'Auto/Man'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Price & Action Row (Matching Reference) */}
                            <div className="pt-2 border-t border-[#551A0C]/60 flex items-center justify-between gap-2">
                              <div>
                                <div className="text-white font-heading font-black text-lg leading-none">
                                  Rs. {startingPrice.toLocaleString('en-IN')}.00
                                </div>
                                <div className="text-[10px] text-white/40 line-through mt-0.5 font-mono">
                                  Rs. {originalPrice.toLocaleString('en-IN')}.00
                                </div>
                              </div>

                              <Link href={targetLink}>
                                <button className="bg-[#FAF6F0] hover:bg-[#DFB574] text-[#250903] text-[11px] font-black uppercase tracking-wider px-4 py-2 rounded-full transition-all flex items-center gap-1 shadow-md hover:scale-105 active:scale-95 cursor-pointer">
                                  ADD <Plus size={13} strokeWidth={3} />
                                </button>
                              </Link>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Carousel Snap Indicators */}
            {scrollSnaps.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      selectedIndex === index 
                        ? 'w-8 bg-[#DFB574] shadow-sm' 
                        : 'w-2 bg-white/20 hover:bg-[#C89D5C]'
                    }`}
                    aria-label={`Go to vehicle slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Studio Motion Feature Showcase Card (4 cols) */}
          <div className="lg:col-span-4">
            {spotlightCar ? (
              <div className="relative rounded-3xl overflow-hidden border border-[#551A0C] bg-[#240C06] flex flex-col justify-between min-h-[460px] lg:h-full p-6 sm:p-7 group shadow-2xl">
                {/* Background Photo with Cinematic Treatment */}
                <Image
                  src={spotlightCar.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80'}
                  alt={`${spotlightCar.make} ${spotlightCar.model} in motion`}
                  fill
                  className="object-cover object-center group-hover:scale-108 transition-transform duration-1000 ease-out brightness-[0.78]"
                  unoptimized
                />
                
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85 z-10 pointer-events-none" />

                {/* Top Badge & Sound Controller */}
                <div className="relative z-20 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 bg-black/60 border border-white/20 rounded-full px-3.5 py-1.5 backdrop-blur-md shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">
                      STUDIO MOTION
                    </span>
                  </div>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/80 hover:scale-110 transition-all cursor-pointer"
                    title={isMuted ? 'Enable Sound' : 'Mute'}
                    aria-label="Toggle sound"
                  >
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>

                {/* Bottom Showcase Card with Product Floating Overlay */}
                <div className="relative z-20 mt-auto pt-36">
                  <div className="text-white text-xs font-semibold tracking-wide mb-3 drop-shadow-md flex items-center gap-2">
                    <span className="text-[#DFB574]">✦</span> Full-grain luxury fleet in motion
                  </div>

                  {/* Floating White Luxury Product Pill */}
                  <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 pr-4 flex items-center justify-between gap-3 shadow-2xl border border-white/40 hover:bg-white transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#250903] overflow-hidden relative shrink-0 border border-[#551A0C]/30 flex items-center justify-center">
                        <Image
                          src={spotlightCar.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=300&q=80'}
                          alt={spotlightCar.model}
                          fill
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black uppercase text-[#250903] truncate font-heading">
                          {spotlightCar.make} {spotlightCar.model}
                        </div>
                        <div className="text-[11px] font-bold text-[#551A0C]">
                          Rs. {spotlightPrice.toLocaleString('en-IN')}.00
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/cars/${getCarSlug(spotlightCar)}`}
                      className="w-8 h-8 rounded-full bg-[#551A0C] hover:bg-[#250903] text-[#DFB574] flex items-center justify-center shrink-0 transition-transform hover:scale-110 shadow-md"
                      aria-label={`View ${spotlightCar.model}`}
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

              </div>
            ) : null}
          </div>

        </div>

      </div>
    </section>
  );
}
