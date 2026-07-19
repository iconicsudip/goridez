import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, Settings2, Fuel, MapPin, Users, ShieldCheck, Cog, Calendar } from 'lucide-react';
import UnifiedCarBookingSidebar from '@/components/UnifiedCarBookingSidebar';
import CarDetailsGallery from '@/components/CarDetailsGallery';
import VehicleCollections from '@/components/VehicleCollections';
import { getCarSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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
    const allCars = await prisma.car.findMany({
      include: {
        city: true,
        packages: {
          orderBy: { basePrice: 'asc' }
        }
      }
    });
    car = allCars.find(c => getCarSlug(c) === id) || null;
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

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans pt-32 pb-24">
      {/* Container */}
      <div className="container mx-auto px-4 max-w-[1500px] md:px-10 lg:px-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
          <Link href="/self-drive" className="hover:text-green-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> BACK TO FLEET
          </Link>
          <ChevronRight size={10} className="opacity-50 mx-2 text-gray-300" />
          <span className="text-green-600">{car.make} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">

          {/* Main Left Content */}
          <div className="lg:col-span-2 space-y-10">

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-green-200">
                <ShieldCheck size={14} /> PREMIUM {car.category}
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-2 leading-none text-gray-900">
                {car.make} <span className="text-green-600">{car.model}</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl mt-4">
                Experience the perfect blend of performance, comfort, and style with our impeccably maintained {car.make} {car.model}.
              </p>
            </div>

            {/* Gallery Image Section */}
            <CarDetailsGallery mainImage={car.image} galleryJson={car.gallery} alt={`${car.make} ${car.model}`} />

            {/* Specifications Section */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-[24px] p-8 md:p-10 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-wider mb-8 flex items-center gap-3 font-sans text-gray-900">
                <span className="text-green-600">/</span> Technical Specifications
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-200/60 hover:shadow-md transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-green-600">
                    <Cog size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mb-1">Transmission</div>
                    <div className="text-sm font-bold text-gray-900">{car.transmission}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200/60 hover:shadow-md transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-green-600">
                    <Fuel size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mb-1">Fuel Type</div>
                    <div className="text-sm font-bold text-gray-900">{car.fuelType}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200/60 hover:shadow-md transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-green-600">
                    <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-current rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mb-1">Steering</div>
                    <div className="text-sm font-bold text-gray-900">Right Hand</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-200/60 hover:shadow-md transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-green-600">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mb-1">Capacity</div>
                    <div className="text-sm font-bold text-gray-900">{car.seatingCapacity} Seater</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Features Section */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-[24px] p-8 md:p-10 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-wider mb-8 flex items-center gap-3 font-sans text-gray-900">
                <span className="text-green-600">/</span> Premium Features
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {car.features && car.features.length > 0 ? (
                  car.features.map((feature, idx) => (
                    <div key={idx} className="bg-white rounded-xl px-5 py-3.5 text-xs font-semibold text-gray-700 border border-gray-200/80 hover:shadow-sm transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-green-600" />
                      {feature}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white rounded-xl px-5 py-3.5 text-xs font-semibold text-gray-700 border border-gray-200/80 hover:shadow-sm transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-green-600" /> Air Conditioner
                    </div>
                    <div className="bg-white rounded-xl px-5 py-3.5 text-xs font-semibold text-gray-700 border border-gray-200/80 hover:shadow-sm transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-green-600" /> Power Steering
                    </div>
                    <div className="bg-white rounded-xl px-5 py-3.5 text-xs font-semibold text-gray-700 border border-gray-200/80 hover:shadow-sm transition-all flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-green-600" /> Air Bags
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gray-50 border border-gray-200/80 rounded-[24px] p-8 md:p-10 shadow-sm">
              <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-3 font-sans text-gray-900">
                <span className="text-green-600">/</span> Vehicle Overview
              </h2>

              <h3 className="font-bold text-gray-900 text-base mb-4 tracking-wide uppercase font-sans">Premium {car.category} with Luxury, Performance, and Style</h3>

              <div className="max-w-none text-gray-650 font-medium leading-relaxed space-y-4 text-sm">
                <p>
                  The {car.make} {car.model} offers a perfect blend of elegance, advanced features, and powerful performance.
                  Perfect for business trips, city drives, and long highway journeys, it delivers unmatched comfort and driving pleasure.
                </p>
                <ul className="space-y-3 font-mono text-xs uppercase tracking-wider">
                  <li className="flex items-center gap-2 text-gray-700"><span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span> Immaculate interior condition with premium upholstery</li>
                  <li className="flex items-center gap-2 text-gray-700"><span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span> Regularly serviced and sanitized before every trip</li>
                  <li className="flex items-center gap-2 text-gray-700"><span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span> Comprehensive insurance and 24/7 roadside assistance</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Right Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <UnifiedCarBookingSidebar
              car={car}
              packages={car.packages}
              taxiSettings={taxiSettings}
              airportZones={airportZones}
              selfDriveLocations={selfDriveLocations}
              airportName={cities.find(c => c.name === 'Udaipur')?.airportName || 'the Airport'}
            />
          </div>
        </div>

        {/* Related Cars */}
        {relatedCars.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
            <VehicleCollections 
              cars={relatedCars} 
              title={<>SIMILAR <span className="text-[#8dbb00] font-sans font-black">VEHICLES</span></>}
              subtitle="SAME CATEGORY"
              description="Explore other vehicles in the same category for your trip."
              hideTabs={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
