'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Fuel, Users, Settings2, ArrowRight, ChevronLeft, ChevronRight, Car } from 'lucide-react';
import { getCarSlug } from '@/lib/utils';

interface BrowseCarsProps {
  cars?: any[];
}

function matchesBrandTab(car: any, tabId: string): boolean {
  if (tabId === 'ALL') return true;
  const make = (car.make || '').toUpperCase();
  const model = (car.model || '').toUpperCase();
  const category = (car.category || '').toUpperCase();

  if (tabId === 'TOYOTA') return make.includes('TOYOTA') || model.includes('FORTUNER') || model.includes('CRYSTA') || model.includes('INNOVA');
  if (tabId === 'MAHINDRA') return make.includes('MAHINDRA') || model.includes('THAR') || model.includes('SCORPIO') || model.includes('XUV');
  if (tabId === 'TATA') return make.includes('TATA') || model.includes('NEXON') || model.includes('HARRIER') || model.includes('SAFARI');
  if (tabId === 'MARUTI') return make.includes('MARUTI') || make.includes('SUZUKI') || model.includes('SWIFT') || model.includes('ERTIAGA') || model.includes('BALENO');
  if (tabId === 'HYUNDAI') return make.includes('HYUNDAI') || model.includes('CRETA') || model.includes('VERNA') || model.includes('I20');
  if (tabId === 'KIA') return make.includes('KIA') || model.includes('SELTOS') || model.includes('SONET') || model.includes('CARENS');
  if (tabId === 'HONDA') return make.includes('HONDA') || model.includes('CITY') || model.includes('AMAZES');
  if (tabId === 'LUXURY') return make.includes('BMW') || make.includes('AUDI') || make.includes('MERCEDES') || make.includes('BENZ') || category.includes('LUXURY');

  return make.includes(tabId);
}

export default function BrowseCars({ cars = [] }: BrowseCarsProps) {
  const [activeBrandTab, setActiveBrandTab] = useState<string>('ALL');

  const allPossibleTabs = [
    { id: 'ALL', label: 'All Vehicles' },
    { id: 'TOYOTA', label: 'Toyota' },
    { id: 'MAHINDRA', label: 'Mahindra' },
    { id: 'TATA', label: 'Tata' },
    { id: 'MARUTI', label: 'Maruti Suzuki' },
    { id: 'HYUNDAI', label: 'Hyundai' },
    { id: 'KIA', label: 'Kia' },
    { id: 'HONDA', label: 'Honda' },
    { id: 'LUXURY', label: 'BMW / Audi / Benz' },
  ];

  // Dynamically include ONLY brand tabs that actually have 1 or more cars in fleet
  const availableBrandTabs = useMemo(() => {
    if (!cars || cars.length === 0) return allPossibleTabs.filter(t => t.id === 'ALL');
    return allPossibleTabs.filter((tab) => {
      if (tab.id === 'ALL') return true;
      return cars.some((car) => matchesBrandTab(car, tab.id));
    });
  }, [cars]);

  // Filter cars based on selected brand tab
  const filteredCars = useMemo(() => {
    if (!cars || cars.length === 0) return [];
    if (activeBrandTab === 'ALL') return cars;

    return cars.filter((car) => matchesBrandTab(car, activeBrandTab));
  }, [activeBrandTab, cars]);

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: 'trimSnaps',
      slidesToScroll: 'auto',
      loop: filteredCars.length > 1,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

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
  }, [activeBrandTab, filteredCars.length, emblaApi]);

  return (
    <section id="browse-cars" className="py-24 bg-brand-bg border-t border-brand-border relative overflow-hidden font-body">
      {/* Decorative Background Accents */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-gold/[0.015] blur-[110px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[#8dbb00]/[0.01] blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Heading & Navigation Controls */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Browse By Brand</div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-4 text-gray-900 font-serif">
              BROWSE <span className="text-[#8dbb00] font-sans font-black">CARS</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-xl">
              Select your preferred brand to explore available luxury vehicles, specs, and instant pricing.
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border shadow-md active:scale-95 ${
                prevBtnEnabled 
                  ? 'bg-white hover:bg-brand-gold hover:text-white text-gray-800 border-gray-200 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
              }`}
              title="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border shadow-md active:scale-95 ${
                nextBtnEnabled 
                  ? 'bg-white hover:bg-brand-gold hover:text-white text-gray-800 border-gray-200 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
              }`}
              title="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Brand Tabs Bar - Dynamically rendered ONLY for available brands */}
        <div className="flex gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-hide justify-start border-b border-brand-border/10">
          {availableBrandTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveBrandTab(tab.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeBrandTab === tab.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                  : 'bg-white border border-gray-200 text-gray-600 hover:text-green-700 hover:border-green-400 hover:bg-green-50/50 shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Carousel View */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl max-w-xl mx-auto p-8 shadow-sm">
            <Car size={36} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wide mb-2">No Vehicles Found</h4>
            <p className="text-gray-500 text-xs mb-6 font-mono">
              We are constantly adding new vehicles for this brand. Explore all available cars across our fleet.
            </p>
            <button
              onClick={() => setActiveBrandTab('ALL')}
              className="bg-brand-gold hover:bg-[#8dbb00] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all"
            >
              View All Vehicles
            </button>
          </div>
        ) : (
          <div className="overflow-hidden px-1" ref={emblaRef}>
            <div className="flex -ml-6">
              {filteredCars.map((car) => {
                const cheapestPkg = car.packages?.sort((a: any, b: any) => a.basePrice - b.basePrice)[0];
                const startingPrice = car.perDayPrice || car.price || (cheapestPkg ? cheapestPkg.basePrice : 2200);

                return (
                  <div
                    key={car.id}
                    className="flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-6"
                  >
                    <div className="bg-white border border-gray-200 hover:border-brand-gold hover:shadow-2xl rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 shadow-md h-full p-4">
                      {/* Image Area */}
                      <div className="relative h-[200px] w-full bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 rounded-2xl mb-4">
                        <Image
                          src={car.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80'}
                          alt={`${car.make} ${car.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-gray-900/90 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-white/20 backdrop-blur-sm">
                            {car.category ? car.category.replace(/\bClass\b/gi, '').trim() : 'Premium'}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-3 group-hover:text-brand-gold transition-colors">
                            {car.make} {car.model}
                          </h3>

                          {/* Specs Badge Grid */}
                          <div className="grid grid-cols-3 border border-gray-100 rounded-xl bg-gray-50/70 py-2.5 mb-5 text-[10px] text-gray-500 font-medium font-mono">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Fuel size={13} className="text-brand-gold" />
                              <span className="capitalize">{car.fuelType || 'Petrol'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1 border-x border-gray-200">
                              <Users size={13} className="text-brand-gold" />
                              <span>{car.seatingCapacity || 5} Seats</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Settings2 size={13} className="text-brand-gold" />
                              <span className="capitalize text-[8px]">{car.transmission ? car.transmission.replace(' Gearbox', '') : 'Manual'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div>
                          <div className="flex justify-between items-end mb-4">
                            <div>
                              <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Starting From</div>
                              <div className="text-gray-900 font-black text-xl group-hover:text-brand-gold transition-colors">
                                ₹{startingPrice.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="text-right text-[10px] text-gray-500 font-semibold font-mono">
                              per day / trip
                            </div>
                          </div>

                          <Link href={`/cars/${getCarSlug(car)}`} className="block">
                            <button className="w-full bg-brand-gold group-hover:bg-[#8dbb00] text-white font-bold tracking-widest uppercase text-[10px] py-3.5 rounded-xl transition-all shadow-md shadow-brand-gold/10 hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer">
                              Book Now <ArrowRight size={13} />
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Carousel Page Dots */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === index 
                    ? 'w-8 bg-brand-gold shadow-md shadow-brand-gold/20' 
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide page ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
