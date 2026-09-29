import Image from "next/image";
import Link from "next/link";
import { prisma } from '@/lib/prisma';
import BookingWidget from "@/components/BookingWidget";
import FaqAccordion from "@/components/FaqAccordion";
import { getCarSlug } from "@/lib/utils";
import HeroVideo from "@/components/HeroVideo";
import BrowseCars from "@/components/BrowseCars";
import VideoGallery from "@/components/VideoGallery";
import VehicleCollections from "@/components/VehicleCollections";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
import BookingProcessSection from "@/components/BookingProcessSection";
import { Star, Shield, Clock, Map, ChevronRight, Key, Plane, UserCheck, Coins, ArrowRight, ArrowUpRight, Check } from 'lucide-react';

import { generatePageMetadata, getSeoForPath } from "@/lib/seo";

const BLOG_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80';

export const revalidate = 300;

export async function generateMetadata() {
  return generatePageMetadata('/');
}

export default async function Home() {
  const [cars, cities, blogs, faqs, homePageData, selfDriveCount, chauffeurCount, reels, googleReviews, siteSettings, seoSetting] = await Promise.all([
    prisma.car.findMany({ include: { packages: true }, orderBy: { createdAt: 'desc' } }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.blog.findMany({ where: { isDraft: false }, take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.homePage.findUnique({ where: { id: 'singleton' } }),
    prisma.car.count({ where: { serviceTypes: { has: 'SELF_DRIVE' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'WITH_DRIVER' } } }),
    prisma.instagramReel.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.googleReview.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    getSeoForPath('/'),
  ]);

  // Airport Transfers currently operate out of Udaipur only (same scope as /taxi).
  const udaipurForZones = cities.find(c => c.name.toLowerCase() === 'udaipur');
  const airportZones = udaipurForZones
    ? await prisma.airportZone.findMany({
      where: { cityId: udaipurForZones.id },
      include: { fares: true },
      orderBy: { order: 'asc' },
    })
    : [];

  const hp = homePageData || {
    heroBadge: '✦ PREMIUM TRANSPORTATION',
    heroTitleLine1: 'EXPLORE RAJASTHAN',
    heroTitleLine2: 'WITH FREEDOM',
    heroDescription: 'Premium self drive cars, chauffeur services, luxury villas and curated Rajasthan travel experiences. Built specifically for elite global explorers.',
    heroBgImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80',
    heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-luxury-car-parked-in-a-driveway-of-a-mansion-40502-large.mp4',
    seamlessBadge: 'Discover the Mewar Heritage',
    seamlessTitle: 'SEAMLESS',
    seamlessTitleHighlight: 'EXPERIENCES',
    seamlessDescription: 'Navigate through our curated premium transportation lists and elite private escapes.',
    selfDriveImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80',
    chauffeurImage: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
    airportTransferImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    vehiclesBadge: 'Real Automotive Collection',
    vehiclesTitle: 'VEHICLE',
    vehiclesTitleHighlight: 'COLLECTION',
    vehiclesDescription: 'Select key luxury automotive segments vetting senior brand names (Maruti Suzuki, Hyundai, Kia, Mahindra, Tata).',
    villasBadge: 'Royal Residency Alliance',
    villasTitle: 'VILLAS',
    villasTitleHighlight: '& CAR BUNDLES',
    villasDescription: 'Five-star private villas paired directly with vetted SUVs in a single unified concierge booking.',
    toursTitle: 'PREMIUM TOUR',
    toursTitleHighlight: 'EXPERIENCES',
    toursDescription: 'Skip lines directly. Access private expert guided itineraries covering historical temples and Mewar fortresses.',
    blogsBadge: 'GoRidez Editorial Journal',
    blogsTitle: 'FEATURED',
    blogsTitleHighlight: 'STORIES',
  };

  // Use the DB video URL only — no hardcoded fallback so admins can omit it
  const videoSrc = (hp as any).heroVideoUrl || null;
  const fallbackImage = (hp as any).heroBgImage || hp.heroBgImage || null;

  return (
    <div className="flex flex-col bg-brand-bg text-gray-100 overflow-hidden font-body">
      {seoSetting?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoSetting.structuredData }}
        />
      )}
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* HeroVideo shows video if src exists, otherwise falls back to heroBgImage */}
          <HeroVideo src={videoSrc} fallbackImage={fallbackImage} />
          {/* Dark luxury overlay for royal contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/85" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center pt-36 pb-16 lg:pb-32">
          {/* Ambient breathing royal gold aura */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#C89D5C]/20 blur-[130px] rounded-full pointer-events-none animate-gold-breathe -z-10" />

          <div className="inline-flex items-center gap-2 border border-[#C89D5C]/40 rounded-full px-5 py-2 mb-8 bg-[#250903]/85 backdrop-blur-md shadow-2xl animate-float-gentle">
            <span className="text-[#DFB574] text-xs font-black tracking-[0.22em] uppercase shadow-sm flex items-center gap-2">
              <span className="text-[#C89D5C] animate-pulse">✦</span> RAJASTHAN’S PREMIER LUXURY MOBILITY
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[76px] font-black leading-[1.08] tracking-tight mb-4 md:mb-6 uppercase text-white drop-shadow-2xl font-serif">
            {hp.heroTitleLine1} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89D5C] via-[#DFB574] to-[#C89D5C]">
              {hp.heroTitleLine2}
            </span>
          </h1>

          <p className="text-[#FAF6F0]/85 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium drop-shadow-md">
            {hp.heroDescription}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16">
            <Link
              href="#booking-widget"
              className="btn-luxury btn-luxury-shine w-full md:w-auto justify-center bg-[#C89D5C] hover:bg-[#DFB574] text-[#250903] shadow-[0_4px_25px_rgba(200,157,92,0.4)] hover:shadow-[0_8px_35px_rgba(200,157,92,0.65)] font-black px-9 py-4 rounded-xl transition-all tracking-wider uppercase text-xs flex items-center gap-2 border border-[#E5C07B] cursor-pointer hover:scale-105 active:scale-95"
            >
              BOOK YOUR RIDE <ChevronRight size={18} />
            </Link>
            <Link
              href="#collection"
              className="btn-luxury w-full md:w-auto justify-center bg-white/10 hover:bg-white/20 text-white font-bold px-9 py-4 rounded-xl transition-all tracking-wider uppercase text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md cursor-pointer hover:border-[#DFB574] hover:scale-105 active:scale-95"
            >
              EXPLORE FLEET <ChevronRight size={18} />
            </Link>
          </div>

          {/* Floating Booking Widget */}
          <div id="booking-widget" className="w-full max-w-5xl relative z-20">
            <BookingWidget cars={cars} cities={cities} airportZones={airportZones} airportName={udaipurForZones?.airportName || 'the Airport'} counts={{ selfDrive: selfDriveCount, chauffeur: chauffeurCount, taxi: 0, tours: 0, villas: 0 }} />
          </div>

          {/* Value Props with luxury gold medallion icons and interactive hover lift */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-8 border-t border-[#C89D5C]/25 w-full max-w-4xl mb-12 md:mb-16 mt-10">
            <div className="flex items-center gap-3.5 bg-[#250903]/60 border border-[#C89D5C]/25 rounded-2xl p-3.5 backdrop-blur-md hover:bg-[#350E05]/80 hover:border-[#C89D5C]/60 transition-all duration-300 hover:-translate-y-1 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-[#551A0C] border border-[#C89D5C]/50 flex items-center justify-center text-[#DFB574] shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.4)] transition-all">
                <Shield size={18} />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-[#DFB574] text-sm md:text-base leading-none mb-1">100% VETTED</div>
                <div className="text-[#FAF6F0]/70 text-[10px] font-semibold uppercase tracking-wider font-mono">Royal Inspection</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-[#250903]/60 border border-[#C89D5C]/25 rounded-2xl p-3.5 backdrop-blur-md hover:bg-[#350E05]/80 hover:border-[#C89D5C]/60 transition-all duration-300 hover:-translate-y-1 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-[#551A0C] border border-[#C89D5C]/50 flex items-center justify-center text-[#DFB574] shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.4)] transition-all">
                <Coins size={18} />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-[#DFB574] text-sm md:text-base leading-none mb-1">₹0 DEPOSIT</div>
                <div className="text-[#FAF6F0]/70 text-[10px] font-semibold uppercase tracking-wider font-mono">Zero Lock-in</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-[#250903]/60 border border-[#C89D5C]/25 rounded-2xl p-3.5 backdrop-blur-md hover:bg-[#350E05]/80 hover:border-[#C89D5C]/60 transition-all duration-300 hover:-translate-y-1 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-[#551A0C] border border-[#C89D5C]/50 flex items-center justify-center text-[#DFB574] shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.4)] transition-all">
                <Clock size={18} />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-[#DFB574] text-sm md:text-base leading-none mb-1">24×7 DESK</div>
                <div className="text-[#FAF6F0]/70 text-[10px] font-semibold uppercase tracking-wider font-mono">Royal Concierge</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-[#250903]/60 border border-[#C89D5C]/25 rounded-2xl p-3.5 backdrop-blur-md hover:bg-[#350E05]/80 hover:border-[#C89D5C]/60 transition-all duration-300 hover:-translate-y-1 cursor-default group">
              <div className="w-10 h-10 rounded-xl bg-[#551A0C] border border-[#C89D5C]/50 flex items-center justify-center text-[#DFB574] shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.4)] transition-all">
                <Star size={18} />
              </div>
              <div className="text-left">
                <div className="font-heading font-black text-[#DFB574] text-sm md:text-base leading-none mb-1">4.9★ RATING</div>
                <div className="text-[#FAF6F0]/70 text-[10px] font-semibold uppercase tracking-wider font-mono">2,000+ Patrons</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: SERVICES SECTION */}
      <section className="py-24 relative overflow-hidden z-10 bg-[#FAF6F0] border-t border-[#E7DFD5]">
        {/* Decorative Luxury Background Glows */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#C89D5C]/[0.05] blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-[#551A0C]/[0.03] blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-3">
              <span className="h-[1px] w-8 bg-[#C89D5C]"></span>
              <div className="text-[#C89D5C] text-xs font-bold tracking-[0.25em] uppercase font-body">{hp.seamlessBadge}</div>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black uppercase tracking-tight leading-none mb-4 text-[#250903]">
              {hp.seamlessTitle} <span className="italic font-editorial font-normal text-[#551A0C]">{hp.seamlessTitleHighlight}</span>
            </h2>
            <p className="text-[#551A0C]/80 font-editorial italic text-base md:text-lg max-w-xl">
              {hp.seamlessDescription}
            </p>
          </div>

          <div className="flex flex-col gap-10">
            {/* Card 1: Self Drive Cars */}
            <div className="card-luxury border-classic-frame group relative rounded-3xl overflow-hidden border border-[#E7DFD5] hover:border-[#C89D5C] bg-[#FEFBF8] shadow-sm hover:shadow-[0_22px_45px_rgba(85,26,12,0.14)] transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Visual Media Column */}
                <div className="relative min-h-[300px] lg:min-h-[380px] lg:col-span-5 overflow-hidden bg-[#250903]">
                  <Image 
                    src={(hp as any).selfDriveImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80"} 
                    alt="Self Drive Cars" 
                    fill 
                    sizes="(max-width: 1024px) 100vw, 40vw" 
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out" 
                    unoptimized 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250903]/80 via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-[#FEFBF8]/10" />
                  
                  {/* Watermark Roman Numeral */}
                  <span className="absolute top-4 left-6 text-7xl font-editorial font-bold text-white/20 pointer-events-none select-none">
                    I
                  </span>

                  {/* Royal Emblem Medallion */}
                  <div className="absolute top-5 right-5 z-20 w-12 h-12 rounded-2xl bg-[#551A0C]/90 border border-[#C89D5C]/60 backdrop-blur-md flex items-center justify-center text-[#DFB574] shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Key size={20} />
                  </div>

                  <div className="absolute bottom-4 left-6 z-20">
                    <span className="bg-[#551A0C]/90 text-[#DFB574] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#C89D5C]/50 shadow-md backdrop-blur-md">
                      ✦ INDEPENDENT EXPLORATION
                    </span>
                  </div>
                </div>

                {/* Content Details Column */}
                <div className="p-8 lg:p-12 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="text-[#C89D5C] text-xs font-bold tracking-[0.2em] uppercase font-mono">
                        Drive Udaipur Your Way
                      </div>
                      <span className="text-[11px] font-bold text-[#551A0C] bg-[#FAF6F0] border border-[#E7DFD5] px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                        Tariff From ₹2,000 / day
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-4xl font-heading font-black uppercase tracking-tight text-[#250903] group-hover:text-[#551A0C] transition-colors mb-4">
                      Self Drive Cars
                    </h3>

                    <p className="text-[#551A0C]/80 text-sm lg:text-base leading-relaxed mb-6 font-medium font-body max-w-2xl">
                      Drive independently with our premium fleet. Fully vetted vehicles with sanitized cabins, comprehensive roadside assistance, and zero security deposit options for discerning travelers.
                    </p>

                    {/* Key Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E7DFD5] mb-8">
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>₹0 Security Deposit</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Unlimited Kilometers</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Resort / Doorstep Drop</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link href="/self-drive">
                      <button className="btn-luxury btn-luxury-shine bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] text-xs font-heading font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all flex items-center gap-2.5 border border-[#C89D5C]/60 cursor-pointer shadow-md hover:shadow-xl active:scale-95">
                        Explore Self-Drive Fleet <ChevronRight size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Taxi Service */}
            <div className="card-luxury border-classic-frame group relative rounded-3xl overflow-hidden border border-[#E7DFD5] hover:border-[#C89D5C] bg-[#FEFBF8] shadow-sm hover:shadow-[0_22px_45px_rgba(85,26,12,0.14)] transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Visual Media Column */}
                <div className="relative min-h-[300px] lg:min-h-[380px] lg:col-span-5 overflow-hidden bg-[#250903]">
                  <Image 
                    src={(hp as any).chauffeurImage || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80"} 
                    alt="Taxi Service" 
                    fill 
                    sizes="(max-width: 1024px) 100vw, 40vw" 
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out" 
                    unoptimized 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250903]/80 via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-[#FEFBF8]/10" />
                  
                  {/* Watermark Roman Numeral */}
                  <span className="absolute top-4 left-6 text-7xl font-editorial font-bold text-white/20 pointer-events-none select-none">
                    II
                  </span>

                  {/* Royal Emblem Medallion */}
                  <div className="absolute top-5 right-5 z-20 w-12 h-12 rounded-2xl bg-[#551A0C]/90 border border-[#C89D5C]/60 backdrop-blur-md flex items-center justify-center text-[#DFB574] shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <UserCheck size={20} />
                  </div>

                  <div className="absolute bottom-4 left-6 z-20">
                    <span className="bg-[#551A0C]/90 text-[#DFB574] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#C89D5C]/50 shadow-md backdrop-blur-md">
                      ✦ CHAUFFEUR ESCORT
                    </span>
                  </div>
                </div>

                {/* Content Details Column */}
                <div className="p-8 lg:p-12 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="text-[#C89D5C] text-xs font-bold tracking-[0.2em] uppercase font-mono">
                        Professional Driver Guided
                      </div>
                      <span className="text-[11px] font-bold text-[#551A0C] bg-[#FAF6F0] border border-[#E7DFD5] px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                        Tariff From ₹1,800 / day
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-4xl font-heading font-black uppercase tracking-tight text-[#250903] group-hover:text-[#551A0C] transition-colors mb-4">
                      Chauffeur Taxi Service
                    </h3>

                    <p className="text-[#551A0C]/80 text-sm lg:text-base leading-relaxed mb-6 font-medium font-body max-w-2xl">
                      Elite door-to-door local transfers, guided day-packages, and premium round-trips. Courteous, verified chauffeurs in pristine formal uniforms with deep local heritage knowledge.
                    </p>

                    {/* Key Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E7DFD5] mb-8">
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Uniformed Chauffeurs</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Local Sightseeing Guiding</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Transparent Fixed Fares</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link href="/taxi">
                      <button className="btn-luxury btn-luxury-shine bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] text-xs font-heading font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all flex items-center gap-2.5 border border-[#C89D5C]/60 cursor-pointer shadow-md hover:shadow-xl active:scale-95">
                        Explore Taxi Fleet <ChevronRight size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Airport Transfers */}
            <div className="card-luxury border-classic-frame group relative rounded-3xl overflow-hidden border border-[#E7DFD5] hover:border-[#C89D5C] bg-[#FEFBF8] shadow-sm hover:shadow-[0_22px_45px_rgba(85,26,12,0.14)] transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Visual Media Column */}
                <div className="relative min-h-[300px] lg:min-h-[380px] lg:col-span-5 overflow-hidden bg-[#250903]">
                  <Image 
                    src={(hp as any).airportTransferImage || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
                    alt="Airport Transfers" 
                    fill 
                    sizes="(max-width: 1024px) 100vw, 40vw" 
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out" 
                    unoptimized 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#250903]/80 via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-[#FEFBF8]/10" />
                  
                  {/* Watermark Roman Numeral */}
                  <span className="absolute top-4 left-6 text-7xl font-editorial font-bold text-white/20 pointer-events-none select-none">
                    III
                  </span>

                  {/* Royal Emblem Medallion */}
                  <div className="absolute top-5 right-5 z-20 w-12 h-12 rounded-2xl bg-[#551A0C]/90 border border-[#C89D5C]/60 backdrop-blur-md flex items-center justify-center text-[#DFB574] shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Plane size={20} />
                  </div>

                  <div className="absolute bottom-4 left-6 z-20">
                    <span className="bg-[#551A0C]/90 text-[#DFB574] text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-[#C89D5C]/50 shadow-md backdrop-blur-md">
                      ✦ AIRPORT CONCIERGE
                    </span>
                  </div>
                </div>

                {/* Content Details Column */}
                <div className="p-8 lg:p-12 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="text-[#C89D5C] text-xs font-bold tracking-[0.2em] uppercase font-mono">
                        Punctual & Door-To-Door
                      </div>
                      <span className="text-[11px] font-bold text-[#551A0C] bg-[#FAF6F0] border border-[#E7DFD5] px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                        Tariff From ₹1,200 / ride
                      </span>
                    </div>

                    <h3 className="text-2xl lg:text-4xl font-heading font-black uppercase tracking-tight text-[#250903] group-hover:text-[#551A0C] transition-colors mb-4">
                      Airport Transfers
                    </h3>

                    <p className="text-[#551A0C]/80 text-sm lg:text-base leading-relaxed mb-6 font-medium font-body max-w-2xl">
                      Stress-free Maharana Pratap Airport (UDR) pickups and drops with live airline flight delay tracking and luxury terminal meet & greet hospitality right at the arrival gate.
                    </p>

                    {/* Key Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E7DFD5] mb-8">
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Flight Delay Monitoring</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>Meet & Greet Gate Reception</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-[#250903] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-[#551A0C]/10 text-[#551A0C] flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>All Tolls & Parking Included</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <Link href="/taxi?mode=AIRPORT_TRANSFER">
                      <button className="btn-luxury btn-luxury-shine bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] text-xs font-heading font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all flex items-center gap-2.5 border border-[#C89D5C]/60 cursor-pointer shadow-md hover:shadow-xl active:scale-95">
                        Book Airport Transfer <ChevronRight size={16} />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING PROCESS SECTION */}
      <BookingProcessSection />
      {cars.length > 0 && (
        <VehicleCollections cars={cars} />
      )}

      {/* SECTION 5: AIRPORT PICKUP & DROP BANNER */}
      <section className="py-24 relative overflow-hidden bg-[#170501] border-t border-[#C89D5C]/20">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src={(hp as any).airportTransferImage || "https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
            alt="Airport Transfer Background"
            fill
            className="object-cover opacity-30"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#170501] via-[#250903]/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl flex flex-col items-start text-left">
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-[#C89D5C] rounded-full"></span>
              <span className="text-[#DFB574] text-xs font-bold tracking-[0.2em] uppercase font-mono">Premium Transfer Service</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-6 font-serif">
              Airport <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89D5C] to-[#DFB574]">Pickup & Drop</span>
            </h2>

            {/* Description */}
            <p className="text-[#FAF6F0]/85 text-base md:text-lg mb-10 max-w-2xl leading-relaxed">
              Safe, Reliable & On-Time Airport Transfers Across Rajasthan. Experience ultimate travel comfort with our dedicated professional chauffeurs.
            </p>

            {/* Features Grid — 4 Columns on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 w-full">
              <div className="flex items-center gap-3.5 bg-[#250903]/80 border border-[#C89D5C]/30 p-4 rounded-2xl backdrop-blur-sm hover:-translate-y-1 hover:border-[#C89D5C] hover:bg-[#350E05]/90 transition-all duration-300 group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-[#551A0C]/50 border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.5)] transition-all">
                  <Plane size={20} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold uppercase tracking-tight group-hover:text-[#DFB574] transition-colors">Flight Tracking</h4>
                  <p className="text-[#FAF6F0]/60 text-xs mt-0.5">Adjusted for delays</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-[#250903]/80 border border-[#C89D5C]/30 p-4 rounded-2xl backdrop-blur-sm hover:-translate-y-1 hover:border-[#C89D5C] hover:bg-[#350E05]/90 transition-all duration-300 group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-[#551A0C]/50 border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.5)] transition-all">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold uppercase tracking-tight group-hover:text-[#DFB574] transition-colors">Meet & Greet</h4>
                  <p className="text-[#FAF6F0]/60 text-xs mt-0.5">Terminal assistance</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-[#250903]/80 border border-[#C89D5C]/30 p-4 rounded-2xl backdrop-blur-sm hover:-translate-y-1 hover:border-[#C89D5C] hover:bg-[#350E05]/90 transition-all duration-300 group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-[#551A0C]/50 border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.5)] transition-all">
                  <Coins size={20} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold uppercase tracking-tight group-hover:text-[#DFB574] transition-colors">Fixed Fare</h4>
                  <p className="text-[#FAF6F0]/60 text-xs mt-0.5">No hidden or toll fees</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 bg-[#250903]/80 border border-[#C89D5C]/30 p-4 rounded-2xl backdrop-blur-sm hover:-translate-y-1 hover:border-[#C89D5C] hover:bg-[#350E05]/90 transition-all duration-300 group cursor-default">
                <div className="w-11 h-11 rounded-xl bg-[#551A0C]/50 border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] flex-shrink-0 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(200,157,92,0.5)] transition-all">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold uppercase tracking-tight group-hover:text-[#DFB574] transition-colors">24×7 Availability</h4>
                  <p className="text-[#FAF6F0]/60 text-xs mt-0.5">All day & night support</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/taxi?mode=AIRPORT_TRANSFER">
              <button className="btn-luxury btn-luxury-shine bg-[#C89D5C] hover:bg-[#DFB574] text-[#250903] font-black tracking-widest uppercase text-xs px-9 py-4.5 rounded-xl transition-all shadow-[0_4px_25px_rgba(200,157,92,0.4)] hover:shadow-[0_8px_35px_rgba(200,157,92,0.65)] hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer border border-[#E5C07B]">
                Book Airport Transfer <ArrowRight size={14} />
              </button>
            </Link>

          </div>
        </div>
      </section>

      {/* SECTION 7: BROWSE CARS (Category & Brand) */}
      <BrowseCars cars={cars} />

      {/* SECTION 8: VIDEO GALLERY */}
      <VideoGallery reels={reels} />

      {/* SECTION: GOOGLE REVIEWS */}
      <GoogleReviewsSection
        reviews={googleReviews}
        placeId={(siteSettings as any)?.googlePlaceId || ''}
        averageRating={(siteSettings as any)?.googleAverageRating || 0}
        totalReviews={(siteSettings as any)?.googleTotalReviews || 0}
      />

      {/* SECTION 6: FEATURED BLOGS / JOURNAL */}
      {blogs.length > 0 && (
        <section className="py-24 bg-[#FAF6F0] border-t border-[#E7DFD5] relative overflow-hidden">
          {/* Decorative Luxury Background Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C89D5C]/[0.02] blur-[110px] rounded-full pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#551A0C]/[0.02] blur-[110px] rounded-full pointer-events-none -z-10" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-[2px] w-8 bg-[#C89D5C] rounded-full"></span>
                  <div className="text-[#551A0C] text-xs font-bold tracking-[0.2em] uppercase font-mono">
                    {hp.blogsBadge}
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#551A0C] font-serif">
                  {hp.blogsTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89D5C] to-[#A66B38]">{hp.blogsTitleHighlight}</span>
                </h2>
                <div className="w-20 h-1 bg-[#C89D5C] mt-6 rounded-full"></div>
              </div>
              <Link href="/blogs" className="btn-luxury text-xs font-black uppercase tracking-widest text-[#551A0C] hover:text-[#C89D5C] transition-all flex items-center gap-2 border-b-2 border-[#C89D5C] pb-1.5 hover:translate-x-1">
                View All Journal Entries <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link href={`/blogs/${blog.slug}`} key={blog.id} className="card-luxury group flex flex-col p-4 rounded-3xl bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] shadow-sm hover:shadow-2xl">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                    <Image
                      src={blog.image || BLOG_FALLBACK_IMAGE}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      unoptimized
                    />
                    <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#250903]/90 text-[#DFB574] border border-[#C89D5C]/40 backdrop-blur-md shadow-md">
                      {blog.category}
                    </span>
                  </div>

                  <h3 className="flex items-start justify-between gap-2 text-lg font-black text-[#250903] leading-snug mb-2 group-hover:text-[#551A0C] transition-colors font-serif">
                    <span className="line-clamp-2">{blog.title}</span>
                    <ArrowUpRight size={18} className="shrink-0 mt-1 text-[#C89D5C] group-hover:text-[#551A0C] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </h3>

                  <p className="text-[#551A0C]/70 text-sm leading-relaxed mb-5 line-clamp-2 font-medium">
                    {getExcerpt(blog.content)}
                  </p>

                  <div className="flex items-center gap-2.5 mt-auto pt-4 border-t border-[#E7DFD5]">
                    <div className="w-8 h-8 rounded-full bg-[#551A0C] text-[#DFB574] flex items-center justify-center text-[11px] font-black uppercase shrink-0 border border-[#C89D5C]/40 shadow-sm">
                      {(blog.author || 'G').charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#250903]">{blog.author || 'GoRidez Team'}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-[#551A0C]/60 font-medium">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* SECTION 7: INTERACTIVE FAQS */}
      <FaqAccordion faqs={faqs} />
    </div>
  );
}

// Helpers for displaying HTML stories on landing
const getExcerpt = (htmlContent: string) => {
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ');
  if (plainText.length <= 120) return plainText;
  return plainText.substring(0, 120).trim() + '...';
};
