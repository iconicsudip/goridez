import Image from "next/image";
import Link from "next/link";
import { prisma } from '@/lib/prisma';
import BookingWidget from "@/components/BookingWidget";
import CityExplorer from "@/components/CityExplorer";
import FaqAccordion from "@/components/FaqAccordion";
import { getCarSlug } from "@/lib/utils";
import HeroVideo from "@/components/HeroVideo";
import { Star, Shield, Clock, Map, ChevronRight, Key, Calendar, BookOpen } from 'lucide-react';

export default async function Home() {
  const [cars, cities, blogs, faqs, homePageData, selfDriveCount, chauffeurCount] = await Promise.all([
    prisma.car.findMany({ include: { packages: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.blog.findMany({ where: { isDraft: false }, take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.homePage.findUnique({ where: { id: 'singleton' } }),
    prisma.car.count({ where: { serviceTypes: { has: 'SELF_DRIVE' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'WITH_DRIVER' } } })
  ]);

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
            {hp.heroTitleLine1} <br/>
            <span className="text-brand-gold">{hp.heroTitleLine2}</span>
          </h1>
          
          <p className="text-gray-300 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium drop-shadow-md">
            {hp.heroDescription}
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16">
            <Link href="#collection" className="w-full md:w-auto justify-center bg-brand-gold hover:bg-[#8dbb00] text-white shadow-lg shadow-lg shadow-brand-gold/30 font-bold px-8 py-4 rounded-xl transition-all tracking-wide flex items-center gap-2 border border-brand-gold">
              EXPLORE FLEET <ChevronRight size={18} />
            </Link>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-gray-600" />
                <div className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-gray-700" />
                <div className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-gray-800" />
              </div>
              <div className="text-xs font-semibold text-gray-300 text-left">
                Trusted by <br/><span className="text-white font-bold">10k+ Travelers</span>
              </div>
            </div>
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
          <div className="w-full max-w-5xl relative z-20">
            <BookingWidget cars={cars} cities={cities} counts={{ selfDrive: selfDriveCount, chauffeur: chauffeurCount, taxi: 0, tours: 0, villas: 0 }} />
          </div>

        </div>
      </section>

      {/* SECTION 2: SEAMLESS EXPERIENCES */}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            {selfDriveCount > 0 && (
              <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-brand-border/10">
                <Image src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80" alt="Self Drive" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-1">Drive Udaipur Your Way</div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-white">SELF DRIVE COLLECTION</h3>
                  <Link href="/self-drive">
                    <button className="bg-white hover:bg-brand-gold hover:text-white text-black text-[10px] font-bold px-4 py-2.5 rounded transition-colors flex items-center gap-2 border border-white hover:border-brand-gold cursor-pointer">
                      EXPLORE COLLECTION <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            )}
            {/* Card 2 */}
            {chauffeurCount > 0 && (
              <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-brand-border/10">
                <Image src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80" alt="Chauffeur" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="text-brand-gold text-[10px] font-bold tracking-widest uppercase mb-1">Professional Driver Guided</div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-white">CHAUFFEUR SERVICE</h3>
                  <Link href="/taxi">
                    <button className="bg-white hover:bg-brand-gold hover:text-white text-black text-[10px] font-bold px-4 py-2.5 rounded transition-colors flex items-center gap-2 border border-white hover:border-brand-gold cursor-pointer">
                      BOOK NOW <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NEW SECTION: CITY EXPLORER */}
      {cities.length > 0 && (
        <CityExplorer cities={cities} cars={cars} />
      )}

      {/* SECTION 3: VEHICLE COLLECTION */}
      {cars.length > 0 && (
        <section id="collection" className="py-24 bg-brand-bg border-t border-brand-border relative overflow-hidden">
          {/* Decorative Luxury Background Glows */}
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-brand-gold/[0.015] blur-[110px] rounded-full pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(119,167,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(119,167,0,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(circle_at_bottom_right,transparent_10%,white_100%)] opacity-25 pointer-events-none -z-10" />
          <div className="absolute bottom-0 right-0 w-[550px] h-[550px] bg-zinc-200/50 blur-[100px] rounded-full pointer-events-none -z-10" />

          <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
              <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">{hp.vehiclesBadge}</div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6 text-gray-900">
              {hp.vehiclesTitle} <span className="text-outline-neon">{hp.vehiclesTitleHighlight}</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-3xl">
              {hp.vehiclesDescription}
            </p>
            <div className="w-20 h-1 bg-brand-gold mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car, idx) => {
              const package12 = car.packages.find(p => p.limitValue === 12) || { basePrice: 2200 };
              const package24 = car.packages.find(p => p.limitValue === 24) || { basePrice: 3000 };
              
              return (
                <div key={car.id} className="bg-white rounded-3xl overflow-hidden border border-brand-border hover:border-brand-gold hover:shadow-md hover:shadow-brand-gold/15 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full shadow-lg">
                  <div className="relative h-56 w-full bg-gray-50 p-4 flex items-center justify-center border-b border-brand-border">
                    <Image src={car.image} alt={car.model} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-700" unoptimized />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-brand-gold shadow-sm flex items-center gap-1 border border-brand-border">
                      <Star size={12} fill="currentColor" /> 4.8
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black mb-4 text-gray-900 group-hover:text-brand-gold transition-colors">{car.model}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium mb-6">
                      <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-brand-border capitalize">{car.transmission}</span>
                      <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-brand-border capitalize">{car.fuelType}</span>
                      <span className="bg-gray-50 px-3 py-1.5 rounded-lg border border-brand-border">{car.seatingCapacity} Seats</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 mt-auto">
                      <div className="bg-gray-50 p-4 rounded-xl border border-brand-border">
                        <div className="text-xs text-gray-500 font-semibold mb-1">12 HR RATE</div>
                        <div className="text-lg font-bold text-gray-900">₹{package12.basePrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-brand-gold/5 p-4 rounded-xl border border-brand-gold/25">
                        <div className="text-xs text-brand-gold font-semibold mb-1">24 HR RATE</div>
                        <div className="text-brand-gold text-lg font-bold">₹{package24.basePrice.toLocaleString()}</div>
                      </div>
                    </div>

                    <Link href={`/cars/${getCarSlug(car)}`} className="w-full">
                      <button className="w-full bg-brand-gold hover:bg-[#8dbb00] hover:shadow-lg text-white text-sm font-semibold py-4 rounded-xl transition-all relative overflow-hidden group/btn shadow-md shadow-brand-gold/20 cursor-pointer">
                        <span className="absolute inset-0 w-full h-full -ml-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shimmer"></span>
                        <span className="relative z-10">Book Vehicle</span>
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </section>
      )}

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
