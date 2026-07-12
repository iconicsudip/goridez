'use client';

import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Car as CarIcon, Home, Compass, ArrowRight, UserCircle, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';

export default function CitiesClient({ initialCities, initialCars, initialVillas, initialTours }: any) {
  const router = useRouter();
  const updateSession = useBookingStore(state => state.updateSession);
  
  const [activeCityId, setActiveCityId] = useState<string>(initialCities[0]?.id || '');
  const [activeSegment, setActiveSegment] = useState<'Self Drive' | 'Chauffeur' | 'Taxi' | 'Villas' | 'Tours'>('Self Drive');

  const activeCity = initialCities.find((c: any) => c.id === activeCityId) || initialCities[0];

  const cityCars = initialCars.filter((c: any) => c.cityId === activeCityId);
  const cityVillas = initialVillas.filter((v: any) => v.cityId === activeCityId);
  const cityTours = initialTours.filter((t: any) => t.cityId === activeCityId || !t.cityId); 

  const taxiCars = cityCars.filter((c: any) => c.packages?.some((p: any) => p.type === 'TRANSFER' || p.type === 'KM'));

  const segments = [
    { id: 'Self Drive', icon: CarIcon },
    { id: 'Chauffeur', icon: UserCircle },
    { id: 'Taxi', icon: Send },
    { id: 'Villas', icon: Home },
    { id: 'Tours', icon: Compass },
  ];

  const handleBookCar = (car: any, withDriver: boolean) => {
    updateSession({
      serviceType: withDriver ? 'withDriver' : 'selfDrive',
      selectedCarId: car.id,
      driverOption: withDriver
    });
    router.push(withDriver ? '/chauffeur' : '/self-drive');
  };

  const handleBookTaxi = (car: any) => {
    updateSession({
      serviceType: 'oneWayTaxi',
      selectedCarId: car.id,
      pickupLocation: activeCity.name
    });
    router.push('/taxi');
  };

  const handleBookVilla = (villa: any) => {
    updateSession({
      serviceType: 'villaCar',
      selectedVillaId: villa.id,
    });
    router.push('/villas'); 
  };

  const handleBookTour = (tour: any) => {
    updateSession({
      serviceType: 'tours',
      selectedTourId: tour.id,
    });
    router.push('/tours');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-10 mb-8 text-center">
          <div className="text-green-700 text-[10px] font-black tracking-widest uppercase mb-4 flex justify-center items-center gap-2">
            <MapPin size={14} /> Destinations
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-8">
            EXPLORE BY <span className="text-outline-neon">CITY</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {initialCities.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setActiveCityId(c.id)}
                className={`px-6 py-3 text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all ${
                  activeCityId === c.id
                    ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(196,240,0,0.2)]'
                    : 'bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Segments */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-4">
          {segments.map(seg => {
            const Icon = seg.icon;
            const isActive = activeSegment === seg.id;
            return (
              <button
                key={seg.id}
                onClick={() => setActiveSegment(seg.id as any)}
                className={`flex items-center gap-2 px-6 py-4 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'bg-gray-100 text-green-700 border-t border-x border-green-300 -mb-4 pb-8' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <Icon size={14} /> {seg.id}
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 min-h-[400px]">
          
          {/* Self Drive or Chauffeur */}
          {(activeSegment === 'Self Drive' || activeSegment === 'Chauffeur') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityCars.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 font-mono text-sm">No cars available in {activeCity?.name}</div>
              ) : (
                cityCars.map((car: any) => (
                  <div key={car.id} className="bg-white border border-gray-200 rounded-2xl p-6 group hover:border-green-300 transition-all">
                    <div className="relative w-full h-[140px] mb-4 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                      <Image src={car.image} alt={car.model} fill className="object-cover" unoptimized />
                    </div>
                    <div className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">{car.category}</div>
                    <h3 className="text-lg font-black uppercase mb-4">{car.make} {car.model}</h3>
                    <button 
                      onClick={() => handleBookCar(car, activeSegment === 'Chauffeur')}
                      className="w-full bg-gray-100 group-hover:bg-green-600 group-hover:text-black text-gray-900 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      Book Now <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Taxi */}
          {activeSegment === 'Taxi' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taxiCars.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 font-mono text-sm">No taxis available from {activeCity?.name}</div>
              ) : (
                taxiCars.map((car: any) => (
                  <div key={car.id} className="bg-white border border-gray-200 rounded-2xl p-6 group hover:border-green-300 transition-all">
                    <div className="relative w-full h-[140px] mb-4 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
                      <Image src={car.image} alt={car.model} fill className="object-cover" unoptimized />
                    </div>
                    <div className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">{car.category}</div>
                    <h3 className="text-lg font-black uppercase mb-4">{car.make} {car.model}</h3>
                    <button 
                      onClick={() => handleBookTaxi(car)}
                      className="w-full bg-gray-100 group-hover:bg-green-600 group-hover:text-black text-gray-900 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                    >
                      Book Taxi <ArrowRight size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Villas */}
          {activeSegment === 'Villas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cityVillas.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 font-mono text-sm">No villas available in {activeCity?.name}</div>
              ) : (
                cityVillas.map((villa: any) => (
                  <div key={villa.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-green-300 transition-all flex flex-col md:flex-row">
                    <div className="relative w-full md:w-[200px] h-[160px] md:h-auto">
                      <Image src={villa.image} alt={villa.name} fill className="object-cover" unoptimized />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">Premium Stay</div>
                      <h3 className="text-lg font-black uppercase mb-4">{villa.name}</h3>
                      <button 
                        onClick={() => handleBookVilla(villa)}
                        className="mt-auto w-full bg-gray-100 group-hover:bg-green-600 group-hover:text-black text-gray-900 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                      >
                        Explore Villa Combo <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tours */}
          {activeSegment === 'Tours' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cityTours.length === 0 ? (
                <div className="col-span-full text-center py-20 text-gray-500 font-mono text-sm">No tours available for {activeCity?.name}</div>
              ) : (
                cityTours.map((tour: any) => (
                  <div key={tour.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group hover:border-green-300 transition-all flex flex-col md:flex-row">
                    <div className="relative w-full md:w-[200px] h-[160px] md:h-auto">
                      <Image src={tour.image} alt={tour.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">{tour.duration} Days Expedition</div>
                      <h3 className="text-lg font-black uppercase mb-4">{tour.title}</h3>
                      <button 
                        onClick={() => handleBookTour(tour)}
                        className="mt-auto w-full bg-gray-100 group-hover:bg-green-600 group-hover:text-black text-gray-900 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                      >
                        Book Expedition <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
