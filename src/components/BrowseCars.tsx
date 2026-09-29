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
    <section id="browse-cars" className="py-24 bg-[#FAF6F0] border-t border-[#E7DFD5] relative overflow-hidden font-body">
      {/* Decorative Warm Ambient Glows */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[#C89D5C]/[0.06] blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[550px] h-[550px] bg-[#551A0C]/[0.04] blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Heading & Navigation Controls */}
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7DFD5] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] w-8 bg-[#C89D5C]"></span>
              <span className="text-[#C89D5C] text-xs font-bold tracking-[0.25em] uppercase font-body">
                ✦ PREFERRED AUTOMOTIVE MAKES ✦
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black tracking-tight text-[#250903] uppercase leading-none mb-3">
              Browse By <span className="italic font-editorial font-normal text-[#551A0C]">Marque</span>
            </h2>
            <p className="text-[#551A0C]/80 font-editorial italic text-base md:text-lg max-w-xl">
              Select your preferred royal badge to inspect our bespoke chauffeured and self-drive fleet.
            </p>
          </div>

          {/* Classic Round Navigation Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-95 ${
                prevBtnEnabled 
                  ? 'bg-[#FEFBF8] hover:bg-[#551A0C] hover:text-[#DFB574] text-[#250903] border-[#E7DFD5] hover:border-[#C89D5C] cursor-pointer' 
                  : 'bg-white/40 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
              }`}
              title="Previous"
              aria-label="Previous Vehicle"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border shadow-sm active:scale-95 ${
                nextBtnEnabled 
                  ? 'bg-[#FEFBF8] hover:bg-[#551A0C] hover:text-[#DFB574] text-[#250903] border-[#E7DFD5] hover:border-[#C89D5C] cursor-pointer' 
                  : 'bg-white/40 text-gray-300 border-gray-200 cursor-not-allowed opacity-50'
              }`}
              title="Next"
              aria-label="Next Vehicle"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Brand Tabs Bar - Mad Leather Bespoke Pill Bar */}
        <div className="flex gap-3 overflow-x-auto pb-6 mb-12 scrollbar-hide justify-start">
          {availableBrandTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveBrandTab(tab.id)}
              className={`whitespace-nowrap px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeBrandTab === tab.id
                  ? 'bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/60 shadow-lg shadow-[#551A0C]/25 ring-2 ring-[#C89D5C]/30'
                  : 'bg-[#FEFBF8] border border-[#E7DFD5] text-[#350E05] hover:text-[#551A0C] hover:border-[#C89D5C] hover:bg-white shadow-sm'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Carousel View */}
        {filteredCars.length === 0 ? (
          <div className="text-center py-20 bg-[#FEFBF8] border border-dashed border-[#E7DFD5] rounded-3xl max-w-xl mx-auto p-10 shadow-sm">
            <Car size={40} className="mx-auto text-[#C89D5C] mb-4" />
            <h4 className="text-xl font-heading font-bold text-[#250903] uppercase tracking-wide mb-2">No Vehicles Currently Available</h4>
            <p className="text-[#551A0C]/70 text-sm mb-6 font-editorial italic">
              We are constantly inducting fresh collector automobiles. Discover all vehicles currently in service.
            </p>
            <button
              onClick={() => setActiveBrandTab('ALL')}
              className="btn-luxury btn-luxury-shine bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/60 text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-full transition-all"
            >
              View Full Collection
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
                    className="flex-[0_0_88%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-6"
                  >
                    <div className="card-luxury border-classic-frame bg-white border border-[#D4C3B2] hover:border-[#C89D5C] rounded-3xl overflow-hidden flex flex-col group transition-all duration-500 shadow-[0_16px_45px_rgba(42,14,7,0.12)] hover:shadow-[0_24px_55px_rgba(42,14,7,0.22)] h-full p-5">
                      {/* Image Area */}
                      <div className="relative h-[210px] w-full bg-[radial-gradient(ellipse_at_center,_#FFFFFF_0%,_#F3EDE2_100%)] flex items-center justify-center overflow-hidden border border-[#D4C3B2] rounded-2xl mb-4.5">
                        <Image
                          src={car.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80'}
                          alt={`${car.make} ${car.model}`}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md"
                          unoptimized
                        />
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-[#551A0C]/90 text-[#DFB574] text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-[#C89D5C]/40 backdrop-blur-md shadow-sm">
                            {car.category ? car.category.replace(/\bClass\b/gi, '').trim() : 'Royal Tier'}
                          </span>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="flex flex-col flex-grow justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89D5C] mb-1">
                            {car.make}
                          </div>
                          <h3 className="text-lg font-heading font-bold text-[#250903] uppercase tracking-wide mb-4 group-hover:text-[#551A0C] transition-colors">
                            {car.model}
                          </h3>

                          {/* Specs Badge Grid with luxury medallion pods */}
                          <div className="grid grid-cols-3 border border-[#E7DFD5] rounded-2xl bg-[#FAF6F0]/80 p-2 mb-5 text-[11px] text-[#350E05] font-medium font-body">
                            <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                              <div className="w-7 h-7 rounded-full bg-white border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shadow-xs group-hover:border-[#C89D5C] transition-colors">
                                <Fuel size={13} />
                              </div>
                              <span className="capitalize text-[10px] font-semibold">{car.fuelType || 'Petrol'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1.5 py-1 border-x border-[#E7DFD5]">
                              <div className="w-7 h-7 rounded-full bg-white border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shadow-xs group-hover:border-[#C89D5C] transition-colors">
                                <Users size={13} />
                              </div>
                              <span className="text-[10px] font-semibold">{car.seatingCapacity || 5} Seats</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                              <div className="w-7 h-7 rounded-full bg-white border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shadow-xs group-hover:border-[#C89D5C] transition-colors">
                                <Settings2 size={13} />
                              </div>
                              <span className="capitalize text-[10px] font-semibold">{car.transmission ? car.transmission.replace(' Gearbox', '') : 'Auto / Man'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Pricing & CTA */}
                        <div className="pt-2 border-t border-[#E7DFD5]/60">
                          <div className="flex justify-between items-end mb-4">
                            <div>
                              <div className="text-[9px] text-[#7A6A65] font-bold uppercase tracking-widest mb-0.5">Tariff Begins At</div>
                              <div className="text-[#250903] font-heading font-black text-2xl group-hover:text-[#551A0C] transition-colors">
                                ₹{startingPrice.toLocaleString('en-IN')}
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-[#551A0C]/70 font-editorial italic">
                              per 24-hr cycle
                            </div>
                          </div>

                          <Link href={`/cars/${getCarSlug(car)}`} className="block">
                            <button className="btn-luxury btn-luxury-shine w-full bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] font-heading font-bold tracking-widest uppercase text-xs py-3.5 rounded-xl transition-all shadow-md shadow-[#551A0C]/20 hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer border border-[#C89D5C]/50">
                              Reserve Vehicle <ArrowRight size={14} />
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
          <div className="flex justify-center gap-2 mt-10">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  selectedIndex === index 
                    ? 'w-10 bg-[#551A0C] ring-2 ring-[#C89D5C]/40 shadow-sm' 
                    : 'w-2 bg-[#E7DFD5] hover:bg-[#C89D5C]'
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
