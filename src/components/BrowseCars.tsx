'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Fuel, Users, Settings2, ArrowRight, ChevronLeft, ChevronRight, Car,
  Compass, KeyRound, Gauge, MapPin, Sparkles, Route, Check, UserRound, Wallet,
} from 'lucide-react';
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


const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

function CarCard({ car }: { car: any }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Cursor-follow spotlight: updates CSS vars directly, no re-render
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const pkgs: any[] = [...(car.packages || [])].sort((a, b) => a.basePrice - b.basePrice);
  const startingPrice = car.perDayPrice || car.price || (pkgs[0] ? pkgs[0].basePrice : 2200);
  const refPkg = pkgs.find((p) => p.basePrice === startingPrice) ?? pkgs[0];

  const available = car.availability !== false;
  const services: string[] = car.serviceTypes?.length ? car.serviceTypes : ['SELF_DRIVE'];
  const hasSelfDrive = services.includes('SELF_DRIVE');
  const hasChauffeur = services.some((t) => t !== 'SELF_DRIVE');
  const features: string[] = (car.features || []).filter(Boolean);
  const category = car.category ? car.category.replace(/\bClass\b/gi, '').trim() : 'Royal Tier';

  const perks: { icon: React.ReactNode; text: string }[] = [];
  if (refPkg?.limitValue) perks.push({ icon: <Route size={12} />, text: `${refPkg.limitValue} km included` });
  if (refPkg?.extraChargePerUnit) perks.push({ icon: <Gauge size={12} />, text: `${inr(refPkg.extraChargePerUnit)}/km extra` });
  if (refPkg?.deposit > 0) perks.push({ icon: <Wallet size={12} />, text: `${inr(refPkg.deposit)} refundable deposit` });
  if (!perks.length && car.extraHourCharge) perks.push({ icon: <Gauge size={12} />, text: `${inr(car.extraHourCharge)}/extra hr` });

  const specs = [
    { icon: <Fuel size={14} />, label: car.fuelType || 'Petrol' },
    { icon: <Users size={14} />, label: `${car.seatingCapacity || 5} Seats` },
    { icon: <Settings2 size={14} />, label: car.transmission ? car.transmission.replace(' Gearbox', '') : 'Auto / Man' },
  ];

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      className="group relative h-full rounded-[28px] p-[1.5px] transition-all duration-500 ease-out hover:-translate-y-2 bg-gradient-to-b from-[#E2D3BF] via-[#EADFCF] to-[#D9C6AC] hover:from-[#DFB574] hover:via-[#C89D5C] hover:to-[#551A0C]/70 shadow-[0_18px_45px_-12px_rgba(42,14,7,0.22)] hover:shadow-[0_32px_70px_-14px_rgba(85,26,12,0.40)]"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[26.5px] bg-[#FFFDFA] p-4">
        {/* Cursor spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(320px circle at var(--mx,50%) var(--my,30%), rgba(223,181,116,0.20), transparent 60%)' }}
        />

        {/* Stage */}
        <div className="relative z-10 mb-4 h-[200px] overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_at_50%_35%,#FFFFFF_0%,#F6EEE1_55%,#EBDDC8_100%)] ring-1 ring-[#E7DFD5]">
          {/* Floating decor inside stage */}
          <span aria-hidden className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#C89D5C]/25 blur-2xl animate-float-slow motion-reduce:animate-none" />
          <span aria-hidden className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-[#551A0C]/15 blur-2xl animate-float-reverse motion-reduce:animate-none" />
          <span aria-hidden className="absolute right-6 top-12 h-2 w-2 rotate-45 bg-[#C89D5C]/70 animate-float motion-reduce:animate-none" />
          <span aria-hidden className="absolute left-8 bottom-14 h-1.5 w-1.5 rounded-full bg-[#551A0C]/40 animate-float-gentle motion-reduce:animate-none" />

          {/* Ghost make watermark */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-heading text-[64px] font-black uppercase leading-none tracking-tighter text-[#551A0C]/[0.06] transition-transform duration-700 group-hover:scale-110"
          >
            {car.make}
          </span>

          {/* Ground shadow */}
          <span aria-hidden className="absolute bottom-6 left-1/2 h-4 w-[58%] -translate-x-1/2 rounded-[50%] bg-[#250903]/25 blur-md transition-all duration-500 group-hover:w-[48%] group-hover:opacity-60" />

          <Image
            src={car.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80'}
            alt={`${car.make} ${car.model}`}
            fill
            sizes="(max-width: 768px) 88vw, 25vw"
            className="object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.07] group-hover:-rotate-1"
            unoptimized
          />

          {/* Badges */}
          <span className="absolute left-3 top-3 z-10 rounded-full border border-[#C89D5C]/40 bg-[#551A0C]/90 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#DFB574] shadow-sm backdrop-blur-md">
            {category}
          </span>
          <span
            className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
              available ? 'border-emerald-700/20 bg-white/80 text-emerald-800' : 'border-amber-700/20 bg-white/80 text-amber-800'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              {available && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70 motion-reduce:animate-none" />}
              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${available ? 'bg-emerald-600' : 'bg-amber-600'}`} />
            </span>
            {available ? 'Available' : 'Booked out'}
          </span>

          {/* Service chips */}
          <div className="absolute bottom-3 left-3 z-10 flex gap-1.5">
            {hasSelfDrive && (
              <span className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#551A0C] ring-1 ring-[#E7DFD5] backdrop-blur">
                <KeyRound size={10} className="text-[#C89D5C]" /> Self-drive
              </span>
            )}
            {hasChauffeur && (
              <span className="flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#551A0C] ring-1 ring-[#E7DFD5] backdrop-blur">
                <UserRound size={10} className="text-[#C89D5C]" /> Driver
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="relative z-10 flex flex-grow flex-col">
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89D5C]">
              <span className="h-px w-5 bg-[#C89D5C] transition-all duration-500 group-hover:w-8" />
              {car.make}
            </div>
            <h3 className="font-heading text-lg font-extrabold uppercase leading-tight tracking-wide text-[#250903] transition-colors group-hover:text-[#551A0C]">
              {car.model}
            </h3>
          </div>

          {/* Spec pods */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {specs.map((sp, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-[#FAF6F0] px-1 py-2.5 ring-1 ring-[#EFE6D8] transition-all duration-300 group-hover:bg-white group-hover:ring-[#DFB574]/60"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF4DF] to-[#F0DDB8] text-[#8A5A1F] shadow-inner">
                  {sp.icon}
                </span>
                <span className="text-center text-[10px] font-semibold capitalize leading-tight text-[#350E05]">{sp.label}</span>
              </div>
            ))}
          </div>

          {/* Included / perks */}
          {perks.length > 0 && (
            <ul className="mb-3 space-y-1.5 rounded-2xl border border-dashed border-[#DCCBB3] bg-[#FFFBF3] px-3 py-2.5">
              {perks.map((pk, i) => (
                <li key={i} className="flex items-center gap-2 text-[11px] font-medium text-[#350E05]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#551A0C] text-[#DFB574]">{pk.icon}</span>
                  {pk.text}
                </li>
              ))}
            </ul>
          )}

          {/* Feature chips */}
          {features.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {features.slice(0, 3).map((f) => (
                <span key={f} className="flex items-center gap-1 rounded-full bg-[#F3EBE1] px-2.5 py-1 text-[10px] font-semibold text-[#551A0C]">
                  <Check size={10} className="text-[#C89D5C]" /> {f}
                </span>
              ))}
              {features.length > 3 && (
                <span className="rounded-full bg-[#551A0C]/[0.07] px-2.5 py-1 text-[10px] font-bold text-[#551A0C]">+{features.length - 3} more</span>
              )}
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-auto border-t border-[#E7DFD5]/70 pt-3">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-[#7A6A65]">Tariff begins at</div>
                <div className="font-heading text-[26px] font-black leading-none text-[#250903]">{inr(startingPrice)}</div>
              </div>
              <span className="text-[11px] italic text-[#551A0C]/70">per 24-hr cycle</span>
            </div>

            <Link href={`/cars/${getCarSlug(car)}`} className="block">
              <span className="btn-luxury btn-luxury-shine group/cta relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-[#C89D5C]/50 bg-gradient-to-r from-[#551A0C] via-[#6B2210] to-[#551A0C] py-1.5 pl-5 pr-1.5 font-heading text-xs font-bold uppercase tracking-widest text-[#DFB574] shadow-lg shadow-[#551A0C]/25 transition-all hover:shadow-xl">
                {available ? 'Reserve Vehicle' : 'View Details'}
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DFB574] text-[#551A0C] transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:rotate-[-45deg]">
                  <ArrowRight size={15} />
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
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
      {/* Ambient glows */}
      <div className="absolute top-1/4 right-0 w-[550px] h-[550px] bg-[#C89D5C]/[0.08] blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[550px] h-[550px] bg-[#551A0C]/[0.05] blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Floating background elements */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* dotted road */}
        <svg className="absolute left-0 top-[18%] w-full opacity-[0.35]" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none">
          <path d="M-20 90 C 240 10, 480 130, 760 60 S 1240 0, 1460 70" stroke="#C89D5C" strokeWidth="2" strokeDasharray="2 14" strokeLinecap="round" />
        </svg>
        <svg className="absolute left-0 bottom-[10%] w-full opacity-[0.25]" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none" fill="none">
          <path d="M-20 30 C 300 120, 560 0, 860 70 S 1260 110, 1460 20" stroke="#551A0C" strokeWidth="2" strokeDasharray="2 14" strokeLinecap="round" />
        </svg>

        {/* drifting icons */}
        <Compass className="absolute left-[4%] top-[12%] h-14 w-14 text-[#C89D5C]/25 animate-float motion-reduce:animate-none" strokeWidth={1.2} />
        <KeyRound className="absolute right-[6%] top-[9%] h-12 w-12 text-[#551A0C]/15 animate-float-reverse motion-reduce:animate-none" strokeWidth={1.2} />
        <Gauge className="absolute left-[9%] bottom-[14%] h-16 w-16 text-[#551A0C]/12 animate-float-slow motion-reduce:animate-none" strokeWidth={1.2} />
        <MapPin className="absolute right-[10%] bottom-[18%] h-12 w-12 text-[#C89D5C]/30 animate-float-gentle motion-reduce:animate-none" strokeWidth={1.2} />
        <Sparkles className="absolute left-[46%] top-[6%] h-8 w-8 text-[#C89D5C]/40 animate-gold-breathe motion-reduce:animate-none" strokeWidth={1.4} />
        <Sparkles className="absolute right-[32%] bottom-[7%] h-6 w-6 text-[#C89D5C]/40 animate-gold-breathe motion-reduce:animate-none [animation-delay:1.5s]" strokeWidth={1.4} />

        {/* orbs & rings */}
        <span className="absolute left-[22%] top-[30%] h-3 w-3 rounded-full bg-[#C89D5C]/40 animate-float motion-reduce:animate-none" />
        <span className="absolute right-[18%] top-[40%] h-2 w-2 rounded-full bg-[#551A0C]/30 animate-float-reverse motion-reduce:animate-none" />
        <span className="absolute left-[60%] bottom-[22%] h-4 w-4 rounded-full border border-[#C89D5C]/50 animate-float-slow motion-reduce:animate-none" />
        <span className="absolute right-[3%] top-[48%] h-24 w-24 rounded-full border border-dashed border-[#C89D5C]/30 animate-[spin_40s_linear_infinite] motion-reduce:animate-none" />
        <span className="absolute left-[2%] top-[55%] h-16 w-16 rounded-full border border-[#551A0C]/15 animate-float-gentle motion-reduce:animate-none" />
      </div>

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
          <div className="overflow-hidden px-1 pt-4 pb-10 -mt-4 -mb-10" ref={emblaRef}>
            <div className="flex -ml-6">
              {filteredCars.map((car) => (
                <div
                  key={car.id}
                  className="flex-[0_0_88%] sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0 pl-6"
                >
                  <CarCard car={car} />
                </div>
              ))}
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
