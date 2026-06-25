import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, Settings2, Fuel, MapPin, Users, ShieldCheck, Cog, Calendar } from 'lucide-react';
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

  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' }
  });

  if (!car) {
    notFound();
  }

  const relatedCars = await prisma.car.findMany({
    where: {
      category: car.category,
      id: { not: car.id },
    },
    take: 3,
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
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
          <Link href="/self-drive" className="hover:text-green-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> BACK TO FLEET
          </Link>
          <ChevronRight size={10} className="opacity-50 mx-2" />
          <span className="text-gray-900">{car.make} {car.model}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Main Left Content */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 border border-green-200">
                <ShieldCheck size={14} /> PREMIUM {car.category}
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight mb-2">
                {car.make} <span className="text-outline-neon">{car.model}</span>
              </h1>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl mt-4">
                Experience the perfect blend of performance, comfort, and style with our impeccably maintained {car.make} {car.model}.
              </p>
            </div>

            {/* Hero Image Section */}
            <div className="bg-gray-100 rounded-[40px] p-12 border border-gray-200 flex justify-center items-center h-[350px] md:h-[450px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent z-0"></div>
              <Image 
                src={car.image || '/placeholder-car.png'} 
                alt={`${car.make} ${car.model}`}
                fill
                className="object-contain p-12 group-hover:scale-105 transition-transform duration-1000 z-10"
                unoptimized
              />
            </div>

            {/* Specifications Section */}
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 md:p-10">
              <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                <span className="text-green-600">/</span> TECHNICAL SPECIFICATIONS
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Cog size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">Transmission</div>
                    <div className="text-sm font-bold text-gray-900">{car.transmission}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Fuel size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">Fuel Type</div>
                    <div className="text-sm font-bold text-gray-900">{car.fuelType}</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center"><div className="w-1.5 h-1.5 bg-current rounded-full"></div></div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">Steering</div>
                    <div className="text-sm font-bold text-gray-900">Right Hand</div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-black tracking-widest uppercase mb-1">Capacity</div>
                    <div className="text-sm font-bold text-gray-900">{car.seatingCapacity} Persons</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Features Section */}
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 md:p-10">
              <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                <span className="text-green-600">/</span> PREMIUM FEATURES
              </h2>
              
              <div className="flex flex-wrap gap-3">
                {car.features && car.features.length > 0 ? (
                  car.features.map((feature, idx) => (
                    <div key={idx} className="bg-white rounded-xl px-5 py-3 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      {feature}
                    </div>
                  ))
                ) : (
                  <>
                    <div className="bg-white rounded-xl px-5 py-3 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" /> Air Conditioner
                    </div>
                    <div className="bg-white rounded-xl px-5 py-3 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" /> Power Steering
                    </div>
                    <div className="bg-white rounded-xl px-5 py-3 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" /> Air Bags
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 md:p-10">
              <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <span className="text-green-600">/</span> VEHICLE OVERVIEW
              </h2>
              
              <h3 className="font-black text-gray-900 text-lg mb-4">Premium {car.category} with Luxury, Performance, and Style</h3>
              
              <div className="prose prose-gray max-w-none text-gray-600 font-medium leading-relaxed">
                <p>
                  The {car.make} {car.model} offers a blend of elegance, advanced features, and powerful performance. 
                  Perfect for business trips, city drives, and long highway journeys, it delivers unmatched comfort and driving pleasure.
                </p>
                <ul className="mt-4 space-y-2">
                  <li>Immaculate interior condition with premium upholstery.</li>
                  <li>Regularly serviced and sanitized before every trip.</li>
                  <li>Comprehensive insurance and 24/7 roadside assistance included.</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Right Sidebar - Booking Form */}
          <div className="lg:col-span-1">
            <CarBookingSidebar car={car} packages={car.packages} cities={cities} />
          </div>
        </div>

        {/* Related Cars */}
        {relatedCars.length > 0 && (
          <div className="mt-24 pt-16 border-t border-gray-200">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-12 text-center">
              SIMILAR <span className="text-outline-neon">VEHICLES</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCars.map((relatedCar) => (
                <div key={relatedCar.id} className="bg-gray-100 border border-gray-200 rounded-3xl overflow-hidden group">
                  <div className="bg-white p-4 font-black uppercase text-[10px] tracking-widest text-center border-b border-gray-100 text-gray-500">
                    {relatedCar.make}
                  </div>
                  <div className="h-56 relative bg-white flex items-center justify-center p-8">
                    <Image src={relatedCar.image || '/placeholder-car.png'} alt={relatedCar.model} fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-700" unoptimized />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-black uppercase tracking-tight mb-6 text-gray-900">{relatedCar.model}</h3>
                    
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 border-t border-b border-gray-200 py-4">
                      <div className="flex items-center gap-2"><Settings2 size={14} className="text-green-600"/> {relatedCar.transmission}</div>
                      <div className="flex items-center gap-2"><Users size={14} className="text-green-600"/> {relatedCar.seatingCapacity} SEATS</div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1 text-gray-500 text-xs font-bold">
                        <MapPin size={14} /> {relatedCar.city?.name || 'Unknown'}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Starting From</div>
                        <div className="text-xl font-black text-green-600">₹{relatedCar.packages?.[0]?.basePrice || 2500}<span className="text-sm text-gray-500 font-medium">/Day</span></div>
                      </div>
                    </div>
                    
                    <Link href={`/cars/${relatedCar.id}`} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-green-600 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-colors">
                      <Calendar size={14} /> VIEW DETAILS
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
