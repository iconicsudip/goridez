'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, ArrowRight, Fuel, Users, Settings2 } from 'lucide-react';
import { getCarSlug } from '@/lib/utils';

interface VehicleCollectionsProps {
  cars: any[];
}

export default function VehicleCollections({ cars }: VehicleCollectionsProps) {
  const [activeTab, setActiveTab] = useState<'self-drive' | 'sedan-taxi' | 'suv-taxi' | 'luxury-taxi' | 'outstation-taxi'>('self-drive');

  // Filter cars based on active category tab
  const activeCars = useMemo(() => {
    switch (activeTab) {
      case 'self-drive':
        return cars.filter(c => c.serviceTypes?.includes('SELF_DRIVE'));
      case 'sedan-taxi':
        return cars.filter(c => 
          (c.serviceTypes?.includes('TAXI') || c.serviceTypes?.includes('WITH_DRIVER')) && 
          c.category?.toLowerCase() === 'sedan'
        );
      case 'suv-taxi':
        return cars.filter(c => 
          (c.serviceTypes?.includes('TAXI') || c.serviceTypes?.includes('WITH_DRIVER')) && 
          (c.category?.toLowerCase() === 'suv' || c.category?.toLowerCase() === 'innova' || c.category?.toLowerCase() === 'tempo')
        );
      case 'luxury-taxi':
        return cars.filter(c => 
          (c.serviceTypes?.includes('TAXI') || c.serviceTypes?.includes('WITH_DRIVER')) && 
          c.category?.toLowerCase()?.includes('luxury')
        );
      case 'outstation-taxi':
        return cars.filter(c => c.serviceTypes?.includes('TAXI') || c.serviceTypes?.includes('WITH_DRIVER'));
      default:
        return [];
    }
  }, [activeTab, cars]);

  // Initialize Embla Carousel with Autoplay and Group Scrolling ('auto')
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      containScroll: 'trimSnaps',
      slidesToScroll: 'auto', // Scroll by page/number of visible slides
      loop: activeCars.length > 1,
      dragFree: false, // Set to false to snap to pages properly
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

  // Reset to first slide and re-initialize snaps when tab or length changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0, false);
      emblaApi.reInit();
    }
    setSelectedIndex(0);
  }, [activeTab, activeCars.length, emblaApi]);

  const tabs = [
    { id: 'self-drive', label: 'Self Drive Cars' },
    { id: 'sedan-taxi', label: 'Sedan Taxi' },
    { id: 'suv-taxi', label: 'SUV Taxi' },
    { id: 'luxury-taxi', label: 'Luxury Taxi' },
    { id: 'outstation-taxi', label: 'Outstation Taxi' }
  ] as const;

  return (
    <section id="collection" className="py-24 bg-brand-bg border-t border-brand-border relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-brand-gold/[0.015] blur-[110px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-zinc-200/50 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Heading */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Premium Fleet</div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-4 text-gray-900 font-serif">
              VEHICLE <span className="text-[#8dbb00] font-sans font-black">COLLECTION</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-xl">
              Explore our select range of high-end vehicles vetted for Udaipur and Rajasthan adventures.
            </p>
          </div>

          {/* Navigation controls */}
          <div className="hidden md:flex gap-3 mt-auto">
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

        {/* Tab Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide justify-start md:justify-start border-b border-brand-border/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-gold text-white shadow-lg shadow-brand-gold/20'
                  : 'bg-gray-100 border border-gray-200 text-gray-500 hover:text-brand-gold hover:border-brand-gold hover:bg-brand-gold/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden px-1" ref={emblaRef}>
          <div className="flex -ml-6">
            {activeCars.length === 0 ? (
              <div className="w-full ml-6 text-center py-20 text-gray-500 font-mono text-sm border border-dashed border-gray-200 rounded-3xl">
                No vehicles available in this category.
              </div>
            ) : (
              activeCars.map((car) => {
                const cheapestPkg = car.packages?.sort((a: any, b: any) => a.basePrice - b.basePrice)[0];
                const startingPrice = cheapestPkg ? cheapestPkg.basePrice : 2000;
                const priceUnit = activeTab === 'self-drive' ? 'day' : 'trip';

                return (
                  <div
                    key={car.id}
                    className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-6"
                  >
                    <div
                      className="bg-white border border-gray-200 hover:border-brand-gold hover:shadow-2xl rounded-3xl overflow-hidden flex flex-col group transition-all duration-300 shadow-md h-full p-4"
                    >
                      {/* Image Area */}
                      <div className="relative h-[200px] w-full bg-white flex items-center justify-center overflow-hidden border border-gray-100 rounded-2xl mb-4 z-0">
                        <Image
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-[#0A0A00] text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border border-brand-gold/30">
                            {car.category}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="text-lg font-serif font-black text-gray-900 uppercase tracking-tight mb-4 group-hover:text-brand-gold transition-colors">
                            {car.make} {car.model}
                          </h3>

                          {/* Specs grid */}
                          <div className="grid grid-cols-3 border border-gray-100 rounded-2xl bg-gray-50/50 py-3 mb-6 text-[10px] text-gray-500 font-medium font-mono">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Fuel size={14} className="text-brand-gold" />
                              <span className="capitalize">{car.fuelType}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1 border-x border-gray-100">
                              <Users size={14} className="text-brand-gold" />
                              <span>{car.seatingCapacity} Seats</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1">
                              <Settings2 size={14} className="text-brand-gold" />
                              <span className="capitalize text-[8px]">{car.transmission.replace(' Gearbox', '')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing and Action */}
                        <div>
                          <div className="flex justify-between items-end mb-4">
                            <div>
                              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Starting From</div>
                              <div className="text-gray-900 font-black text-2xl group-hover:text-brand-gold transition-colors">
                                ₹{startingPrice.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right text-[10px] text-gray-600 font-semibold font-mono">
                              per {priceUnit}
                            </div>
                          </div>

                          <Link href={activeTab === 'self-drive' ? `/cars/${getCarSlug(car)}` : `/taxi`}>
                            <button className="w-full bg-brand-gold group-hover:bg-[#8dbb00] text-white font-bold tracking-widest uppercase text-[10px] py-4.5 rounded-2xl transition-all shadow-md shadow-brand-gold/10 hover:shadow-lg cursor-pointer">
                              Book Now
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

        {/* Carousel Dots representing scroll groups/pages */}
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
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Bottom Navigation CTA */}
        <div className="mt-12 flex justify-center">
          {activeTab === 'self-drive' ? (
            <Link href="/self-drive">
              <button className="bg-brand-gold hover:bg-[#8dbb00] text-white font-bold tracking-widest uppercase text-[10px] px-8 py-4.5 rounded-xl transition-all shadow-lg shadow-brand-gold/20 flex items-center gap-2 cursor-pointer">
                View All Self Drive Cars <ArrowRight size={14} />
              </button>
            </Link>
          ) : (
            <Link href="/taxi">
              <button className="bg-brand-gold hover:bg-[#8dbb00] text-white font-bold tracking-widest uppercase text-[10px] px-8 py-4.5 rounded-xl transition-all shadow-lg shadow-brand-gold/20 flex items-center gap-2 cursor-pointer">
                View All Taxi Services <ArrowRight size={14} />
              </button>
            </Link>
          )}
        </div>

      </div>
    </section>
  );
}
