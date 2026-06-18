import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, Settings2, Fuel, MapPin, Users, ShieldCheck } from 'lucide-react';
import CarBookingSidebar from '@/components/CarBookingSidebar';

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      city: true,
      packages: {
        orderBy: { basePrice: 'asc' }
      }
    }
  });

  if (!car) {
    notFound();
  }

  const deliveryCharge = await prisma.deliveryCharge.findUnique({
    where: {
      cityId_category: {
        cityId: car.cityId || '',
        category: car.category
      }
    }
  });

  const cheapestPkg = car.packages[0];
  const startingPrice = cheapestPkg ? cheapestPkg.basePrice : 0;

  return (
    <div className="bg-[#050505] min-h-screen text-white font-body pt-24 pb-24">
      {/* Container */}
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-white/40 mb-8">
          <Link href="/self-drive" className="hover:text-brand-neon transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Fleet Collection
          </Link>
          <ChevronRight size={10} className="mx-1 opacity-50" />
          <span className="text-white/80">{car.make} {car.model}</span>
        </div>

        {/* Hero Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative w-full h-[400px] md:h-[500px] bg-gradient-to-b from-[#111111] to-[#0A0A0A] rounded-3xl border border-white/5 p-8 flex items-center justify-center">
            <div className="absolute top-6 left-6 flex gap-2 z-10">
              <span className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                {car.category}
              </span>
              {car.availability && (
                <span className="bg-brand-neon/10 text-brand-neon px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-brand-neon/30 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Available
                </span>
              )}
            </div>
            <Image 
              src={car.image} 
              alt={`${car.make} ${car.model}`}
              fill
              className="object-contain drop-shadow-2xl p-12"
              unoptimized
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
              {car.make} <br /><span className="text-brand-neon">{car.model}</span>
            </h1>

            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-md">
              Experience the pinnacle of engineering with the {car.make} {car.model}. Perfect for {car.city?.name || 'various cities'} roadtrips and premium transport.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <Settings2 className="text-brand-neon" size={20} />
                <div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Transmission</div>
                  <div className="text-sm font-bold">{car.transmission}</div>
                </div>
              </div>
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <Fuel className="text-brand-neon" size={20} />
                <div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Fuel Type</div>
                  <div className="text-sm font-bold">{car.fuelType}</div>
                </div>
              </div>
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <Users className="text-brand-neon" size={20} />
                <div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Capacity</div>
                  <div className="text-sm font-bold">{car.seatingCapacity} Seats</div>
                </div>
              </div>
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                <MapPin className="text-brand-neon" size={20} />
                <div>
                  <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-0.5">Base Location</div>
                  <div className="text-sm font-bold">{car.city?.name || 'All Hubs'}</div>
                </div>
              </div>
            </div>

            <div className="bg-black border border-white/10 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Starting Tariff</div>
                <div className="text-3xl font-black text-white">₹{startingPrice.toLocaleString()}</div>
              </div>
              <a href="#booking-section">
                <button className="bg-brand-neon hover:bg-brand-hover text-black px-8 py-4 rounded-xl text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(196,240,0,0.2)] transition-all">
                  Configure & Book
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Content & Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Rich Text Content */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <span className="text-brand-neon">/</span> Vehicle Overview
            </h2>
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-12">
              {car.content ? (
                <div 
                  className="prose prose-invert prose-brand max-w-none 
                    prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-h2:text-3xl prose-h3:text-xl
                    prose-p:text-white/60 prose-p:leading-relaxed prose-p:text-sm
                    prose-a:text-brand-neon prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-white prose-strong:font-bold
                    prose-li:text-white/60 prose-li:text-sm
                    prose-ul:list-disc prose-ul:pl-4
                    [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                  dangerouslySetInnerHTML={{ __html: car.content }}
                />
              ) : (
                <div className="text-white/30 text-sm italic py-12 text-center">
                  No detailed overview available for this vehicle yet.
                </div>
              )}
            </div>
          </div>

          {/* Pricing Packages Sidebar */}
          <div className="lg:col-span-1" id="booking-section">
            <CarBookingSidebar car={car} deliveryCharge={deliveryCharge} />
          </div>

        </div>

      </div>
    </div>
  );
}
