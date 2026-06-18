import Image from "next/image";
import Link from "next/link";
import { prisma } from '@/lib/prisma';
import BookingWidget from "@/components/BookingWidget";
import CityExplorer from "@/components/CityExplorer";
import FaqAccordion from "@/components/FaqAccordion";
import { Star, Shield, Clock, Map, ChevronRight, Key, Calendar, BookOpen } from 'lucide-react';

export default async function Home() {
  const [cars, villas, tours, cities, blogs, faqs] = await Promise.all([
    prisma.car.findMany({ include: { packages: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.villa.findMany({ take: 4 }),
    prisma.tour.findMany({ take: 6 }),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.blog.findMany({ where: { isDraft: false }, take: 3, orderBy: { createdAt: 'desc' } }),
    prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } })
  ]);


  return (
    <div className="flex flex-col bg-brand-bg text-white overflow-hidden font-body">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80" 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-40 mix-blend-overlay"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12 mt-12">
          {/* Left Text */}
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 border border-brand-neon/30 rounded-full px-4 py-1.5 mb-8 bg-brand-neon/10 backdrop-blur-md">
              <span className="text-brand-neon text-[10px] md:text-xs font-bold tracking-widest uppercase">
                ✦ PREMIUM TRANSPORTATION
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[80px] font-black leading-[0.95] tracking-tighter mb-6 uppercase">
              EXPLORE <br/>
              RAJASTHAN <br/>
              <span className="text-outline-neon">WITH FREEDOM</span>
            </h1>
            
            <p className="text-white/60 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
              Premium self drive cars, chauffeur services, luxury villas and curated Rajasthan travel experiences. Built specifically for elite global explorers.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <Link href="#book" className="bg-brand-neon hover:bg-brand-hover text-black font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(196,240,0,0.2)] hover:shadow-[0_0_30px_rgba(196,240,0,0.4)] tracking-wide">
                BOOK NOW
              </Link>
              <Link href="#collection" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-xl transition-all backdrop-blur-sm tracking-wide">
                EXPLORE COLLECTION
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="font-bold text-lg mb-1 uppercase tracking-wide">100% VETTED</div>
                <div className="text-white/50 text-xs">Verified Private Fleet</div>
              </div>
              <div>
                <div className="font-bold text-brand-neon text-lg mb-1 uppercase tracking-wide">₹0 DEPOSIT</div>
                <div className="text-white/50 text-xs">With driver options</div>
              </div>
              <div>
                <div className="font-bold text-lg mb-1 uppercase tracking-wide">24x7 DESK</div>
                <div className="text-white/50 text-xs">On-road dispatch</div>
              </div>
            </div>
          </div>
          
          {/* Right Widget */}
          <div className="w-full lg:w-1/2 flex justify-end">
            <BookingWidget cars={cars} villas={villas} tours={tours} cities={cities} />
          </div>
        </div>
      </section>

      {/* SECTION 2: SEAMLESS EXPERIENCES */}
      <section className="py-24 relative z-10 bg-black">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-4">Discover the Mewar Heritage</div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
              SEAMLESS <span className="text-outline-neon">EXPERIENCES</span>
            </h2>
            <p className="text-white/60 text-lg max-w-xl">
              Navigate through our curated premium transportation lists and elite private escapes.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80" alt="Self Drive" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-2">Drive Udaipur Your Way</div>
                <h3 className="text-4xl font-black uppercase tracking-tight mb-6">SELF DRIVE COLLECTION</h3>
                <Link href="/self-drive">
                  <button className="bg-black/50 backdrop-blur-md border border-white/20 hover:border-brand-neon text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mt-4">
                    EXPLORE COLLECTION <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
            {/* Card 2 */}
            <div className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80" alt="Chauffeur" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-2">Professional Driver Guided</div>
                <h3 className="text-4xl font-black uppercase tracking-tight mb-6">CHAUFFEUR COLLECTION</h3>
                <Link href="/chauffeur">
                  <button className="bg-black/50 backdrop-blur-md border border-white/20 hover:border-brand-neon text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                    EXPLORE COLLECTION <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
            {/* Card 3 */}
            <div className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80" alt="Villas" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-2">Palace Stay Category</div>
                <h3 className="text-4xl font-black uppercase tracking-tight mb-6">VILLAS & RESORT ESCAPES</h3>
                <Link href="/villas">
                  <button className="bg-black/50 backdrop-blur-md border border-white/20 hover:border-brand-neon text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                    EXPLORE COLLECTION <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
            {/* Card 4 */}
            <div className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer">
              <Image src="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80" alt="Monuments" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-10 w-full">
                <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-2">Heritage Excursions Deck</div>
                <h3 className="text-4xl font-black uppercase tracking-tight mb-6">PREMIUM TOUR EXPERIENCES</h3>
                <Link href="/tours">
                  <button className="bg-black/50 backdrop-blur-md border border-white/20 hover:border-brand-neon text-white text-xs font-bold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                    EXPLORE COLLECTION <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: CITY EXPLORER */}
      <CityExplorer cities={cities} cars={cars} villas={villas} tours={tours} />

      {/* SECTION 3: VEHICLE COLLECTION */}
      <section id="collection" className="py-24 bg-[#0A0A0A]">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-4">Real Automotive Collection</div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
              VEHICLE <span className="text-outline-neon">COLLECTION</span>
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-3xl">
              Select key luxury automotive segments vetting senior brand names (Maruti Suzuki, Hyundai, Kia, Mahindra, Tata).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car, idx) => {
              const package12 = car.packages.find(p => p.limitValue === 12) || { basePrice: 2200 };
              const package24 = car.packages.find(p => p.limitValue === 24) || { basePrice: 3000 };
              
              return (
                <div key={car.id} className="bg-[#161616] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-neon/30 transition-colors group flex flex-col h-full">
                  <div className="relative h-48 w-full">
                    <Image src={car.image} alt={car.model} fill className="object-cover" unoptimized />
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-brand-neon border border-white/10 flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> 4.8 ({(Math.random() * 200 + 50).toFixed(0)}) VETTED
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{car.model}</h3>
                    
                    <div className="flex items-center gap-3 text-[10px] text-white/50 uppercase font-bold tracking-wider mb-6">
                      <span className="flex items-center gap-1">⚙️ {car.transmission}</span>
                      <span className="flex items-center gap-1">⛽ {car.fuelType}</span>
                      <span className="flex items-center gap-1">👥 {car.seatingCapacity} SEATS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                      <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-white/40 uppercase mb-1 font-bold">12 HR PRICE</div>
                        <div className="text-lg font-bold">₹{package12.basePrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-black/50 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-brand-neon uppercase mb-1 font-bold">24 HR PRICE</div>
                        <div className="text-brand-neon text-lg font-bold">₹{package24.basePrice.toLocaleString()}</div>
                      </div>
                    </div>

                    <Link href={`/cars/${car.id}`} className="w-full">
                      <button className="w-full bg-[#222222] hover:bg-brand-neon hover:text-black text-white text-xs font-bold py-4 rounded-xl transition-colors uppercase tracking-widest">
                        VIEW DETAILS & BOOK
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: VILLAS & CAR BUNDLES */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-4">Royal Residency Alliance</div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
              VILLAS <span className="text-outline-neon">& CAR BUNDLES</span>
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-2xl">
              Five-star private villas paired directly with vetted SUVs in a single unified concierge booking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {villas.map(villa => (
              <div key={villa.id} className="bg-[#161616] rounded-3xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row h-full">
                <div className="relative w-full sm:w-[40%] h-64 sm:h-auto min-h-[250px]">
                  <Image src={villa.image} alt={villa.name} fill className="object-cover" unoptimized />
                </div>
                <div className="p-8 w-full sm:w-[60%] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-brand-neon text-[10px] font-bold tracking-[0.2em] uppercase">Palace Stay Category</div>
                      <div className="text-sm font-bold">Starting ₹{villa.startingPrice.toLocaleString()}/N</div>
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight mb-3">{villa.name}</h3>
                    <div className="text-xs text-white/50 uppercase font-bold tracking-wider mb-4">
                      {villa.occupancy > 4 ? '4+ BHK' : `${villa.occupancy/2} BHK`} • {villa.amenities.includes('Pool') ? 'DEDICATED POOL' : 'PREMIUM EXPERIENCE'}
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed line-clamp-3 mb-6">
                      {villa.description} Includes organic chef dining services, secure walled compound, and personal Chauffeur driver option checks.
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/10">
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">CHEVRON ALIGN CODES</span>
                    <Link href="/villas">
                      <button className="bg-transparent border border-white/20 hover:border-brand-neon hover:text-brand-neon text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors uppercase tracking-widest">
                        SELECT VILLA & WHEELS
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: PREMIUM TOUR EXPERIENCES */}
      <section className="py-24 bg-[#0A0A0A] relative border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-4">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase mb-4">
              PREMIUM TOUR <span className="text-outline-neon">EXPERIENCES</span>
            </h2>
            <p className="text-white/60 text-sm md:text-base max-w-3xl">
              Skip lines directly. Access private expert guided itineraries covering historical temples and Mewar fortresses.
            </p>
          </div>
        </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour, idx) => {
              const tags = ['ONE DAY TOURS', 'WEEKEND GETAWAYS', 'TEMPLE & SPIRITUAL TOURS'];
              return (
                <div key={tour.id} className="bg-[#161616] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-neon/30 transition-colors group flex flex-col h-full">
                  <div className="relative h-60 w-full">
                    <Image src={tour.image} alt={tour.title} fill className="object-cover" unoptimized />
                    <div className="absolute top-4 left-4 bg-brand-neon text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      {tags[idx % 3]}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded text-[10px] font-bold text-white border border-white/10 flex items-center gap-1.5">
                      ⏱ {tour.duration * 4} Hours
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">{tour.title}</h3>
                    
                    <div className="mb-6 flex-grow">
                      <div className="flex items-center gap-2 text-[10px] text-brand-neon font-bold uppercase tracking-widest mb-2">
                        <Key size={12} /> Places:
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        City Palace, Lake Pichola, Jagdish Temple, Saheliyon-ki-Bari, Fort Citadel Trails.
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-auto pt-6 border-t border-white/5">
                      <div>
                        <div className="text-[9px] text-white/40 uppercase tracking-widest mb-1">UPFRONT FARE</div>
                        <div className="text-brand-neon text-2xl font-bold">₹{tour.adultPrice.toLocaleString()}</div>
                      </div>
                      <Link href="/tours">
                      <button className="bg-[#222222] hover:bg-brand-neon hover:text-black text-white text-[10px] font-bold px-6 py-3 rounded-lg transition-colors uppercase tracking-widest">
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

    {/* SECTION 6: FEATURED BLOGS / JOURNAL */}
    {blogs.length > 0 && (
      <section className="py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-neon/5 blur-3xl rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <div className="text-brand-neon text-xs font-bold tracking-[0.2em] uppercase mb-4">
                GoRidez Editorial Journal
              </div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
                FEATURED <span className="text-outline-neon">STORIES</span>
              </h2>
            </div>
            <Link href="/blogs" className="text-xs font-bold uppercase tracking-widest text-brand-neon hover:text-white transition-colors flex items-center gap-1.5 border-b border-brand-neon/30 pb-1">
              View All Journal Entries <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                href={`/blogs/${blog.slug}`}
                key={blog.id}
                className="bg-[#111111] border border-white/5 hover:border-white/10 rounded-3xl overflow-hidden group transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-2 w-full bg-gradient-to-r from-brand-neon to-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-brand-neon/30 text-brand-neon">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                      <Calendar size={12} />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  <h3 className="text-lg font-black uppercase tracking-tight mb-4 group-hover:text-brand-neon transition-colors leading-tight line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-white/50 text-xs leading-relaxed mb-6 font-mono line-clamp-3">
                    {getExcerpt(blog.content)}
                  </p>

                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-neon group-hover:translate-x-1 transition-transform">
                      Read Story <ChevronRight size={12} />
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono">
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
