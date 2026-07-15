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
import { Star, Shield, Clock, Map, ChevronRight, Key, Calendar, BookOpen, Plane, UserCheck, Coins, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [cars, cities, blogs, faqs, homePageData, selfDriveCount, chauffeurCount, reels] = await Promise.all([
    prisma.car.findMany({ include: { packages: true }, orderBy: { createdAt: 'desc' } }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.blog.findMany({ where: { isDraft: false }, take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.homePage.findUnique({ where: { id: 'singleton' } }),
    prisma.car.count({ where: { serviceTypes: { has: 'SELF_DRIVE' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'WITH_DRIVER' } } }),
    prisma.instagramReel.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
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
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* HeroVideo shows video if src exists, otherwise falls back to heroBgImage */}
          <HeroVideo src={videoSrc} fallbackImage={fallbackImage} />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/65" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center pt-32 pb-16 lg:pb-32">

          <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 mb-8 bg-black/30 backdrop-blur-md">
            <span className="text-brand-gold text-xs font-bold tracking-widest uppercase shadow-sm">
              {hp.heroBadge}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[72px] font-black leading-[1.05] tracking-tight mb-4 md:mb-6 uppercase text-white drop-shadow-xl">
            {hp.heroTitleLine1} <br />
            <span className="text-brand-gold">{hp.heroTitleLine2}</span>
          </h1>

          <p className="text-gray-300 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium drop-shadow-md">
            {hp.heroDescription}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16">
            <Link href="#booking-widget" className="w-full md:w-auto justify-center bg-brand-gold hover:bg-[#8dbb00] text-white shadow-lg shadow-brand-gold/30 font-bold px-8 py-4 rounded-xl transition-all tracking-wide flex items-center gap-2 border border-brand-gold cursor-pointer">
              BOOK NOW <ChevronRight size={18} />
            </Link>
            <Link href="#collection" className="w-full md:w-auto justify-center bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl transition-all tracking-wide flex items-center gap-2 border border-white/10 backdrop-blur-md cursor-pointer">
              EXPLORE FLEET <ChevronRight size={18} />
            </Link>
          </div>

          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-8 border-t border-white/10 w-full max-w-3xl mb-12 md:mb-16">
            <div className="text-center px-2">
              <div className="font-bold text-white text-base md:text-lg mb-1 drop-shadow">100% VETTED</div>
              <div className="text-gray-400 text-[10px] md:text-xs font-medium">Verified Fleet</div>
            </div>
            <div className="hidden md:block w-px bg-white/10 h-10"></div>
            <div className="text-center px-2">
              <div className="font-bold text-brand-gold text-base md:text-lg mb-1 drop-shadow">₹0 DEPOSIT</div>
              <div className="text-gray-400 text-[10px] md:text-xs font-medium">Driver Options</div>
            </div>
            <div className="hidden md:block w-px bg-white/10 h-10"></div>
            <div className="text-center px-2">
              <div className="font-bold text-white text-base md:text-lg mb-1 drop-shadow">24x7 DESK</div>
              <div className="text-gray-400 text-[10px] md:text-xs font-medium">On-road Dispatch</div>
            </div>
          </div>

          {/* Floating Booking Widget */}
          <div id="booking-widget" className="w-full max-w-5xl relative z-20">
            <BookingWidget cars={cars} cities={cities} airportZones={airportZones} airportName={udaipurForZones?.airportName || 'the Airport'} counts={{ selfDrive: selfDriveCount, chauffeur: chauffeurCount, taxi: 0, tours: 0, villas: 0 }} />
          </div>

        </div>
      </section>

      {/* SECTION 2: SERVICES SECTION */}
      <section className="py-24 relative overflow-hidden z-10 bg-brand-bg border-t border-brand-border">
        {/* Decorative Luxury Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/[0.02] blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-200/40 blur-[100px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">{hp.seamlessBadge}</div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6 text-gray-900">
              {hp.seamlessTitle} <span className="text-outline-neon">{hp.seamlessTitleHighlight}</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-xl">
              {hp.seamlessDescription}
            </p>
            <div className="w-20 h-1 bg-brand-gold mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Self Drive Cars */}
            <div className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-brand-border/10 flex flex-col justify-end bg-brand-panel">
              <Image src={(hp as any).selfDriveImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80"} alt="Self Drive Cars" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700 z-0" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 z-10" />
              <div className="relative p-8 z-20 w-full flex flex-col">
                <div className="text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-2">Drive Udaipur Your Way</div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 text-white">Self Drive Cars</h3>
                <p className="text-gray-300 text-xs mb-6 font-medium leading-relaxed">
                  Drive independently with our premium fleet. Zero security deposit options and vetting security.
                </p>
                <Link href="/self-drive" className="w-fit">
                  <button className="bg-white hover:bg-brand-gold hover:text-white text-black text-[10px] font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 border border-white hover:border-brand-gold cursor-pointer">
                    EXPLORE <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 2: Taxi Service */}
            <div className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-brand-border/10 flex flex-col justify-end bg-brand-panel">
              <Image src={(hp as any).chauffeurImage || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80"} alt="Taxi Service" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700 z-0" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 z-10" />
              <div className="relative p-8 z-20 w-full flex flex-col">
                <div className="text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-2">Professional Driver Guided</div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 text-white">Taxi Service</h3>
                <p className="text-gray-300 text-xs mb-6 font-medium leading-relaxed">
                  Elite door-to-door local transfers, guided day-packages, and premium round-trips.
                </p>
                <Link href="/taxi" className="w-fit">
                  <button className="bg-white hover:bg-brand-gold hover:text-white text-black text-[10px] font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 border border-white hover:border-brand-gold cursor-pointer">
                    EXPLORE <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>

            {/* Card 3: Airport Transfers */}
            <div className="group relative h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-brand-border/10 flex flex-col justify-end bg-brand-panel">
              <Image src={(hp as any).airportTransferImage || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} alt="Airport Transfers" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700 z-0" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10 z-10" />
              <div className="relative p-8 z-20 w-full flex flex-col">
                <div className="text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-2">Punctual & Door-To-Door</div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2 text-white">Airport Transfers</h3>
                <p className="text-gray-300 text-xs mb-6 font-medium leading-relaxed">
                  Stress-free airport pickups and drops with flight tracking and meet & greet hospitality.
                </p>
                <Link href="/taxi?mode=AIRPORT_TRANSFER" className="w-fit">
                  <button className="bg-white hover:bg-brand-gold hover:text-white text-black text-[10px] font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 border border-white hover:border-brand-gold cursor-pointer">
                    EXPLORE <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION 3: VEHICLE COLLECTION */}
      {cars.length > 0 && (
        <VehicleCollections cars={cars} />
      )}

      {/* SECTION 5: AIRPORT PICKUP & DROP BANNER */}
      <section className="py-24 relative overflow-hidden bg-zinc-950 border-t border-brand-border">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Airport Transfer Background"
            fill
            className="object-cover opacity-35"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl flex flex-col items-start text-left">
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Premium Transfer Service</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-6 font-serif">
              Airport <span className="text-[#8dbb00] font-sans font-black">Pickup & Drop</span>
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg mb-10 max-w-2xl leading-relaxed">
              Safe, Reliable & On-Time Airport Transfers Across Rajasthan. Experience ultimate travel comfort with our dedicated professional chauffeurs.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-12 w-full max-w-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold flex-shrink-0">
                  <Plane size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">Flight Tracking</h4>
                  <p className="text-gray-400 text-xs">Adjusted for delays</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold flex-shrink-0">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">Meet & Greet</h4>
                  <p className="text-gray-400 text-xs">Terminal pickup assistance</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold flex-shrink-0">
                  <Coins size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">Fixed Fare</h4>
                  <p className="text-gray-400 text-xs">No hidden or toll charges</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/25 flex items-center justify-center text-brand-gold flex-shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold">24×7 Availability</h4>
                  <p className="text-gray-400 text-xs">All day & night assistance</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Link href="/taxi?mode=AIRPORT_TRANSFER">
              <button className="bg-brand-gold hover:bg-[#8dbb00] text-white font-bold tracking-widest uppercase text-xs px-8 py-4.5 rounded-xl transition-all shadow-lg shadow-brand-gold/20 flex items-center gap-2 cursor-pointer border border-brand-gold">
                Book Airport Transfer <ArrowRight size={14} />
              </button>
            </Link>

          </div>
        </div>
      </section>

      {/* SECTION 7: BROWSE CARS (Category & Brand) */}
      <BrowseCars />

      {/* SECTION 8: VIDEO GALLERY */}
      <VideoGallery reels={reels} />

      {/* SECTION 6: FEATURED BLOGS / JOURNAL */}
      {blogs.length > 0 && (
        <section className="py-24 bg-gray-50 border-t border-brand-border relative overflow-hidden">
          {/* Decorative Luxury Background Glows */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-gold/[0.01] blur-[110px] rounded-full pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-gold/[0.015] blur-[110px] rounded-full pointer-events-none -z-10" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
                  <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                    {hp.blogsBadge}
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-gray-900">
                  {hp.blogsTitle} <span className="text-outline-neon">{hp.blogsTitleHighlight}</span>
                </h2>
                <div className="w-20 h-1 bg-brand-gold mt-6 rounded-full"></div>
              </div>
              <Link href="/blogs" className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:text-[#8dbb00] transition-colors flex items-center gap-1.5 border-b border-brand-gold pb-1">
                View All Journal Entries <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => (
                <Link
                  href={`/blogs/${blog.slug}`}
                  key={blog.id}
                  className="bg-white border border-brand-border hover:border-brand-gold rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col h-full shadow-lg"
                >
                  <div className="h-2 w-full bg-gradient-to-r from-brand-gold to-[#8dbb00] opacity-20 group-hover:opacity-100 transition-opacity" />
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-brand-gold text-brand-gold">
                        {blog.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600 font-mono">
                        <Calendar size={12} />
                        {new Date(blog.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <h3 className="text-lg font-black uppercase tracking-tight mb-4 text-gray-900 group-hover:text-brand-gold transition-colors leading-tight line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-gray-600 text-xs leading-relaxed mb-6 line-clamp-3">
                      {getExcerpt(blog.content)}
                    </p>

                    <div className="flex justify-between items-center mt-auto pt-6 border-t border-brand-border">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-gold group-hover:translate-x-1 transition-transform">
                        Read Story <ChevronRight size={12} />
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                        <Clock size={12} />
                        <span>{getReadingTime(blog.content)}</span>
                      </div>
                    </div>
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

const getReadingTime = (htmlContent: string) => {
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 225));
  return `${minutes} min read`;
};
