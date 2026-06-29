import Image from "next/image";
import Link from "next/link";
import { prisma } from '@/lib/prisma';
import BookingWidget from "@/components/BookingWidget";
import CityExplorer from "@/components/CityExplorer";
import FaqAccordion from "@/components/FaqAccordion";
import { Star, Shield, Clock, Map, ChevronRight, Key, Calendar, BookOpen } from 'lucide-react';

export default async function Home() {
  const [cars, villas, tours, cities, blogs, faqs, homePageData, selfDriveCount, chauffeurCount, taxiCount] = await Promise.all([
    prisma.car.findMany({ include: { packages: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.villa.findMany({ take: 4 }),
    prisma.tour.findMany({ take: 6 }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.blog.findMany({ where: { isDraft: false }, take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
    prisma.homePage.findUnique({ where: { id: 'singleton' } }),
    prisma.car.count({ where: { serviceTypes: { has: 'SELF_DRIVE' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'WITH_DRIVER' } } }),
    prisma.car.count({ where: { serviceTypes: { has: 'TAXI' } } })
  ]);

  const hp = homePageData || {
    heroBadge: '✦ PREMIUM TRANSPORTATION',
    heroTitleLine1: 'EXPLORE RAJASTHAN',
    heroTitleLine2: 'WITH FREEDOM',
    heroDescription: 'Premium self drive cars, chauffeur services, luxury villas and curated Rajasthan travel experiences. Built specifically for elite global explorers.',
    heroBgImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80',
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

  return (
    <div className="flex flex-col bg-brand-bg text-gray-900 overflow-hidden font-body">
      {/* SECTION 1: HERO (Modern Light Layout) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0 z-0">
          {hp.heroBgImage?.match(/\.(mp4|webm)$/i) ? (
            <video 
              src={hp.heroBgImage}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <Image 
              src={hp.heroBgImage}
              alt="Luxury Transportation"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          )}
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center pt-32 pb-16 lg:pb-32">
          
          <div className="inline-flex items-center gap-2 border border-white/30 rounded-full px-4 py-1.5 mb-8 bg-white/10 backdrop-blur-md">
            <span className="text-white text-xs font-bold tracking-widest uppercase shadow-sm">
              {hp.heroBadge}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-[72px] font-black leading-[1.05] tracking-tight mb-4 md:mb-6 uppercase text-white drop-shadow-xl">
            {hp.heroTitleLine1} <br/>
            <span className="text-green-400">{hp.heroTitleLine2}</span>
          </h1>
          
          <p className="text-gray-200 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed font-medium drop-shadow-md">
            {hp.heroDescription}
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-12 md:mb-16">
            <Link href="#collection" className="w-full md:w-auto justify-center bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 font-bold px-8 py-4 rounded-xl transition-all tracking-wide flex items-center gap-2">
              EXPLORE FLEET <ChevronRight size={18} />
            </Link>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-400" />
              </div>
              <div className="text-xs font-semibold text-gray-200 text-left">
                Trusted by <br/><span className="text-white font-bold">10k+ Travelers</span>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 pt-8 border-t border-white/20 w-full max-w-3xl mb-12 md:mb-16">
            <div className="text-center px-2">
              <div className="font-bold text-white text-base md:text-lg mb-1 drop-shadow">100% VETTED</div>
              <div className="text-gray-300 text-[10px] md:text-xs font-medium">Verified Fleet</div>
            </div>
            <div className="hidden md:block w-px bg-white/20 h-10"></div>
            <div className="text-center px-2">
              <div className="font-bold text-green-400 text-base md:text-lg mb-1 drop-shadow">₹0 DEPOSIT</div>
              <div className="text-gray-300 text-[10px] md:text-xs font-medium">Driver Options</div>
            </div>
            <div className="hidden md:block w-px bg-white/20 h-10"></div>
            <div className="text-center px-2">
              <div className="font-bold text-white text-base md:text-lg mb-1 drop-shadow">24x7 DESK</div>
              <div className="text-gray-300 text-[10px] md:text-xs font-medium">On-road Dispatch</div>
            </div>
          </div>

          {/* Floating Booking Widget */}
          <div className="w-full max-w-5xl relative z-20">
            <BookingWidget cars={cars} villas={villas} tours={tours} cities={cities} counts={{ selfDrive: selfDriveCount, chauffeur: chauffeurCount, taxi: taxiCount, tours: tours.length, villas: villas.length }} />
          </div>

        </div>
      </section>

      {/* SECTION 2: SEAMLESS EXPERIENCES */}
      <section className="py-24 relative z-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="text-green-700 text-xs font-bold tracking-[0.2em] uppercase mb-4">{hp.seamlessBadge}</div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
              {hp.seamlessTitle} <span className="text-outline-neon">{hp.seamlessTitleHighlight}</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-xl">
              {hp.seamlessDescription}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            {selfDriveCount > 0 && (
              <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                <Image src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80" alt="Self Drive" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="text-green-600 text-[10px] font-bold tracking-widest uppercase mb-1">Drive Udaipur Your Way</div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-white">SELF DRIVE COLLECTION</h3>
                  <Link href="/self-drive">
                    <button className="bg-white hover:bg-gray-100 text-black text-[10px] font-bold px-4 py-2.5 rounded transition-colors flex items-center gap-2">
                      EXPLORE COLLECTION <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            )}
            {/* Card 2 */}
            {chauffeurCount > 0 && (
              <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                <Image src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80" alt="Chauffeur" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="text-green-600 text-[10px] font-bold tracking-widest uppercase mb-1">Professional Driver Guided</div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-white">CHAUFFEUR COLLECTION</h3>
                  <Link href="/chauffeur">
                    <button className="bg-white hover:bg-gray-100 text-black text-[10px] font-bold px-4 py-2.5 rounded transition-colors flex items-center gap-2">
                      EXPLORE COLLECTION <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            )}
            {/* Card 3 */}
            {villas.length > 0 && (
              <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer shadow-lg">
                <Image src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1000&q=80" alt="Villas" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="text-green-600 text-[10px] font-bold tracking-widest uppercase mb-1">Exclusive Private Stays</div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-white">LUXURY VILLAS</h3>
                  <Link href="/villas">
                    <button className="bg-white hover:bg-gray-100 text-black text-[10px] font-bold px-4 py-2.5 rounded transition-colors flex items-center gap-2">
                      VIEW ESTATES <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </div>
            )}
            {/* Card 4 */}
            {tours.length > 0 && (
              <div className="group relative h-[400px] rounded-2xl overflow-hidden cursor-pointer md:col-span-2 shadow-lg">
                <Image src="https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1500&q=80" alt="Tours" fill sizes="100vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="text-green-600 text-[10px] font-bold tracking-widest uppercase mb-1">Curated Heritage Trails</div>
                  <h3 className="text-3xl font-black uppercase tracking-tight mb-6 text-white">SIGNATURE TOURS</h3>
                  <Link href="/tours">
                    <button className="bg-white hover:bg-gray-100 text-black text-[10px] font-bold px-4 py-2.5 rounded transition-colors flex items-center gap-2">
                      BROWSE ITINERARIES <ChevronRight size={14} />
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
        <CityExplorer cities={cities} cars={cars} villas={villas} tours={tours} />
      )}

      {/* SECTION 3: VEHICLE COLLECTION */}
      {cars.length > 0 && (
        <section id="collection" className="py-24 bg-white">
          <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="text-green-700 text-xs font-bold tracking-[0.2em] uppercase mb-4">{hp.vehiclesBadge}</div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
              {hp.vehiclesTitle} <span className="text-outline-neon">{hp.vehiclesTitleHighlight}</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-3xl">
              {hp.vehiclesDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car, idx) => {
              const package12 = car.packages.find(p => p.limitValue === 12) || { basePrice: 2200 };
              const package24 = car.packages.find(p => p.limitValue === 24) || { basePrice: 3000 };
              
              return (
                <div key={car.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-green-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full shadow-sm">
                  <div className="relative h-56 w-full bg-gray-50 p-4 flex items-center justify-center">
                    <Image src={car.image} alt={car.model} fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 shadow-sm flex items-center gap-1">
                      <Star size={12} fill="currentColor" /> 4.8
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black mb-4 group-hover:text-green-700 transition-colors">{car.model}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium mb-6">
                      <span className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 capitalize">{car.transmission}</span>
                      <span className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 capitalize">{car.fuelType}</span>
                      <span className="bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">{car.seatingCapacity} Seats</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 mt-auto">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="text-xs text-gray-500 font-semibold mb-1">12 HR RATE</div>
                        <div className="text-lg font-bold text-gray-900">₹{package12.basePrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                        <div className="text-xs text-green-700 font-semibold mb-1">24 HR RATE</div>
                        <div className="text-green-700 text-lg font-bold">₹{package24.basePrice.toLocaleString()}</div>
                      </div>
                    </div>

                    <Link href={`/cars/${car.id}`} className="w-full">
                      <button className="w-full bg-gray-900 hover:bg-green-600 hover:shadow-lg hover:shadow-green-600/30 text-white text-sm font-semibold py-4 rounded-xl transition-all relative overflow-hidden group/btn">
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


      {/* SECTION 5: PREMIUM TOUR EXPERIENCES */}
      {tours.length > 0 && (
        <section className="py-24 bg-white relative border-t border-gray-200 overflow-hidden">
          <div className="container mx-auto px-4">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase mb-4">
              {hp.toursTitle} <span className="text-outline-neon">{hp.toursTitleHighlight}</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-3xl">
              {hp.toursDescription}
            </p>
          </div>
        </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, idx) => {
              const tags = ['ONE DAY TOURS', 'WEEKEND GETAWAYS', 'TEMPLE & SPIRITUAL TOURS'];
              return (
                <div key={tour.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-green-300 transition-colors group flex flex-col h-full">
                  <div className="relative h-60 w-full">
                    <Image src={tour.image} alt={tour.title} fill className="object-cover" unoptimized />
                    <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      {tags[idx % 3]}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-bold text-gray-900 border border-gray-300 flex items-center gap-1.5">
                      ⏱ {tour.duration * 4} Hours
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">{tour.title}</h3>
                    
                    <div className="mb-6 flex-grow">
                      <div className="flex items-center gap-2 text-[10px] text-green-700 font-bold uppercase tracking-widest mb-2">
                        <Key size={12} /> Places:
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        City Palace, Lake Pichola, Jagdish Temple, Saheliyon-ki-Bari, Fort Citadel Trails.
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-auto pt-6 border-t border-gray-200">
                      <div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">UPFRONT FARE</div>
                        <div className="text-green-700 text-2xl font-bold">₹{tour.adultPrice.toLocaleString()}</div>
                      </div>
                      <Link href="/tours">
                      <button className="bg-[#222222] hover:bg-green-600 hover:text-black text-gray-900 text-[10px] font-bold px-6 py-3 rounded-lg transition-colors uppercase tracking-widest">
                        LOCK EXCURSION
                      </button>
                    </Link>
                  </div>
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
      <section className="py-24 bg-gray-50 border-t border-gray-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/5 blur-3xl rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <div className="text-green-700 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                {hp.blogsBadge}
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight">
                {hp.blogsTitle} <span className="text-outline-neon">{hp.blogsTitleHighlight}</span>
              </h2>
            </div>
            <Link href="/blogs" className="text-xs font-bold uppercase tracking-widest text-green-700 hover:text-gray-900 transition-colors flex items-center gap-1.5 border-b border-green-300 pb-1">
              View All Journal Entries <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                href={`/blogs/${blog.slug}`}
                key={blog.id}
                className="bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-2 w-full bg-gradient-to-r from-brand-neon to-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-green-300 text-green-700">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                      <Calendar size={12} />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <h3 className="text-lg font-black uppercase tracking-tight mb-4 group-hover:text-green-700 transition-colors leading-tight line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-gray-500 text-xs leading-relaxed mb-6 font-mono line-clamp-3">
                    {getExcerpt(blog.content)}
                  </p>

                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-200">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-700 group-hover:translate-x-1 transition-transform">
                      Read Story <ChevronRight size={12} />
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
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
