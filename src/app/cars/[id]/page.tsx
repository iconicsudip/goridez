import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, Settings2, Fuel, MapPin, Users, ShieldCheck, Cog, Calendar } from 'lucide-react';
import UnifiedCarBookingSidebar from '@/components/UnifiedCarBookingSidebar';
import CarDetailsGallery from '@/components/CarDetailsGallery';
import VehicleCollections from '@/components/VehicleCollections';
import { generateCarMetadata, buildCarJsonLd, getSeoForPath } from '@/lib/seo';
import { getCarSlug } from '@/lib/utils';

export const revalidate = 300;

export async function generateStaticParams() {
  const cars = await prisma.car.findMany({
    select: { id: true, make: true, model: true }
  });
  
  const params: { id: string }[] = [];
  cars.forEach(car => {
    params.push({ id: car.id });
    params.push({ id: getCarSlug(car) });
  });
  
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return generateCarMetadata(id);
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Try to find the car directly by CUID first
  let car = await prisma.car.findUnique({
    where: { id },
    include: {
      city: true,
      packages: {
        orderBy: { basePrice: 'asc' }
      }
    }
  });

  // If not found by CUID, try matching the slugified make + model
  if (!car) {
    const carsList = await prisma.car.findMany({
      select: { id: true, make: true, model: true }
    });
    const matchedCar = carsList.find(c => getCarSlug(c) === id);
    if (matchedCar) {
      car = await prisma.car.findUnique({
        where: { id: matchedCar.id },
        include: {
          city: true,
          packages: {
            orderBy: { basePrice: 'asc' }
          }
        }
      });
    }
  }

  const [cities, taxiSettings, airportZones, selfDriveLocations] = await Promise.all([
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.taxiFareSetting.findMany(),
    prisma.airportZone.findMany({ include: { fares: true } }),
    prisma.selfDriveLocation.findMany({ orderBy: { order: 'asc' } })
  ]);

  if (!car) {
    notFound();
  }

  const relatedCars = await prisma.car.findMany({
    where: {
      category: car.category,
      id: { not: car.id },
    },
    take: 10,
    include: {
      city: true,
      packages: {
        orderBy: { basePrice: 'asc' }
      }
    },
  });

  const carJsonLd = buildCarJsonLd(car);

  return (
    <div className="bg-[#FAF6F0] min-h-screen text-[#250903] font-serif pt-32 pb-24 border-t border-[#E7DFD5]">
      {carJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: carJsonLd }}
        />
      )}
      {/* Container */}
      <div className="container mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D53] mb-8">
          <Link href="/self-drive" className="hover:text-[#551A0C] transition-colors flex items-center gap-1.5">
            <ArrowLeft size={12} className="text-[#C89D5C]" /> BACK TO FLEET
          </Link>
          <ChevronRight size={10} className="opacity-50 mx-2 text-[#C89D5C]" />
          <span className="text-[#551A0C]">{car.make} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">

          {/* Main Left Content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FEFBF8] text-[#551A0C] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-4 border border-[#C89D5C]/40 shadow-xs">
                <ShieldCheck size={14} className="text-[#C89D5C]" /> ROYAL {car.category}
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-tight mb-2 leading-none text-[#551A0C]">
                {car.make} <span className="font-editorial italic font-normal text-[#C89D5C] lowercase">{car.model}</span>
              </h1>
              <p className="text-[#6A5749] text-base leading-relaxed max-w-2xl mt-4 font-serif">
                Experience the perfect blend of performance, comfort, and timeless prestige with our impeccably maintained {car.make} {car.model}.
              </p>
            </div>

            {/* Gallery Image Section */}
            <CarDetailsGallery mainImage={car.image} galleryJson={car.gallery} alt={`${car.make} ${car.model}`} />

            {/* Specifications Section */}
            <div className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="text-base font-bold uppercase tracking-wider mb-8 flex items-center gap-3 text-[#551A0C]">
                <span className="text-[#C89D5C]">✦</span> Technical Specifications
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEFBF8] border border-[#C89D5C]/30 flex items-center justify-center text-[#C89D5C]">
                    <Cog size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8C6D53] tracking-widest uppercase mb-1 font-bold">Transmission</div>
                    <div className="text-sm font-bold text-[#250903]">{car.transmission}</div>
                  </div>
                </div>
                <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEFBF8] border border-[#C89D5C]/30 flex items-center justify-center text-[#C89D5C]">
                    <Fuel size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8C6D53] tracking-widest uppercase mb-1 font-bold">Fuel Type</div>
                    <div className="text-sm font-bold text-[#250903]">{car.fuelType}</div>
                  </div>
                </div>
                <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEFBF8] border border-[#C89D5C]/30 flex items-center justify-center text-[#C89D5C]">
                    <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-current rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8C6D53] tracking-widest uppercase mb-1 font-bold">Steering</div>
                    <div className="text-sm font-bold text-[#250903]">Right Hand</div>
                  </div>
                </div>
                <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FEFBF8] border border-[#C89D5C]/30 flex items-center justify-center text-[#C89D5C]">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] text-[#8C6D53] tracking-widest uppercase mb-1 font-bold">Capacity</div>
                    <div className="text-sm font-bold text-[#250903]">{car.seatingCapacity} Seater</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Features Section */}
            <div className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="text-base font-bold uppercase tracking-wider mb-8 flex items-center gap-3 text-[#551A0C]">
                <span className="text-[#C89D5C]">✦</span> Premium Features
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {car.features && car.features.length > 0 ? (
                  car.features.map((feature, idx) => (
                    <div key={idx} className="bg-[#FAF6F0] rounded-xl px-5 py-3.5 text-xs font-semibold text-[#551A0C] border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#C89D5C]" />
                      {feature}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-[#FAF6F0] rounded-xl px-5 py-3.5 text-xs font-semibold text-[#551A0C] border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#C89D5C]" /> Climate Control
                    </div>
                    <div className="bg-[#FAF6F0] rounded-xl px-5 py-3.5 text-xs font-semibold text-[#551A0C] border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#C89D5C]" /> Power Steering
                    </div>
                    <div className="bg-[#FAF6F0] rounded-xl px-5 py-3.5 text-xs font-semibold text-[#551A0C] border border-[#E7DFD5] hover:border-[#C89D5C] transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-[#C89D5C]" /> Dual Airbags
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-8 md:p-10 shadow-sm">
              <h2 className="text-base font-bold uppercase tracking-wider mb-6 flex items-center gap-3 text-[#551A0C]">
                <span className="text-[#C89D5C]">✦</span> Vehicle Overview
              </h2>

              <h3 className="font-bold text-[#551A0C] text-base mb-4 tracking-wide uppercase">Prestigious {car.category} with Bespoke Comfort and Performance</h3>

              <div className="max-w-none text-[#6A5749] leading-relaxed space-y-4 text-sm">
                <p>
                  The {car.make} {car.model} offers a refined blend of elegance, advanced safety features, and effortless performance.
                  Perfect for executive travel, intimate city touring, or picturesque outstation voyages, it delivers unmatched comfort and sovereignty.
                </p>
                <ul className="space-y-3 text-xs uppercase tracking-wider">
                  <li className="flex items-center gap-2 text-[#551A0C]"><span className="text-[#C89D5C]">✦</span> Immaculate interior condition with artisan upholstery</li>
                  <li className="flex items-center gap-2 text-[#551A0C]"><span className="text-[#C89D5C]">✦</span> Regularly serviced, detailed, and sanitized before every reservation</li>
                  <li className="flex items-center gap-2 text-[#551A0C]"><span className="text-[#C89D5C]">✦</span> Comprehensive insurance and 24/7 dedicated concierge assistance</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Right Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="p-8 bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl animate-pulse text-xs text-[#8C6D53] uppercase tracking-widest text-center">Loading carriage specifications...</div>}>
              <UnifiedCarBookingSidebar
                car={car}
                packages={car.packages}
                taxiSettings={taxiSettings}
                airportZones={airportZones}
                selfDriveLocations={selfDriveLocations}
                airportName={cities.find(c => c.name === 'Udaipur')?.airportName || 'the Airport'}
              />
            </Suspense>
          </div>
        </div>

        {/* Related Cars */}
        {relatedCars.length > 0 && (
          <div className="mt-24 pt-16 border-t border-[#E7DFD5]">
            <VehicleCollections 
              cars={relatedCars} 
              title={<>SIMILAR <span className="font-editorial italic font-normal text-[#C89D5C] lowercase">carriages</span></>}
              subtitle="ROYAL FLEET SELECTION"
              description="Explore other distinguished vehicles in this category for your journey."
              hideTabs={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
