'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight, Car, User, Navigation, Home, Map } from 'lucide-react';

type Tab = 'SELF DRIVE' | 'CHAUFFEUR' | 'TAXI' | 'VILLAS' | 'TOURS';

export default function CityExplorer({ 
  cities, 
  cars, 
  villas, 
  tours 
}: { 
  cities: any[], 
  cars: any[], 
  villas: any[], 
  tours: any[] 
}) {
  // Only include cities that have at least some data
  const validCities = cities.filter(city => 
    cars.some(c => c.cityId === city.id) || 
    villas.some(v => v.cityId === city.id) || 
    tours.some(t => t.cityId === city.id)
  );

  const [activeCityId, setActiveCityId] = useState(validCities[0]?.id || '');

  // Determine which tabs have data for the active city
  const availableTabs = (['SELF DRIVE', 'CHAUFFEUR', 'TAXI', 'VILLAS', 'TOURS'] as Tab[]).filter(tab => {
    switch (tab) {
      case 'SELF DRIVE':
      case 'CHAUFFEUR':
      case 'TAXI':
        return cars.some(c => c.cityId === activeCityId);
      case 'VILLAS':
        return villas.some(v => v.cityId === activeCityId);
      case 'TOURS':
        return tours.some(t => t.cityId === activeCityId);
      default:
        return false;
    }
  });

  const [activeTab, setActiveTab] = useState<Tab>(availableTabs[0] || 'SELF DRIVE');

  // If active tab becomes invalid, switch to the first valid one
  if (!availableTabs.includes(activeTab) && availableTabs.length > 0) {
    setActiveTab(availableTabs[0]);
  }

  if (validCities.length === 0) return null;

  // Filter items based on active city and tab
  const getDisplayItems = () => {
    switch (activeTab) {
      case 'SELF DRIVE':
      case 'CHAUFFEUR':
      case 'TAXI':
        // Assuming cars are available for these services
        return cars.filter(c => c.cityId === activeCityId);
      case 'VILLAS':
        return villas.filter(v => v.cityId === activeCityId);
      case 'TOURS':
        return tours.filter(t => t.cityId === activeCityId);
      default:
        return [];
    }
  };

  const displayItems = getDisplayItems();

  const getLinkForTab = () => {
    switch (activeTab) {
      case 'SELF DRIVE': return '/self-drive';
      case 'CHAUFFEUR': return '/chauffeur';
      case 'TAXI': return '/taxi';
      case 'VILLAS': return '/villas';
      case 'TOURS': return '/tours';
    }
  };

  return (
    <section className="py-24 bg-[#0A0A0A] border-t border-zinc-900 relative overflow-hidden">
      {/* Decorative Luxury Background Glows */}
      <div className="absolute top-1/4 left-1/12 w-[450px] h-[450px] bg-brand-gold/[0.035] blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/12 w-[450px] h-[450px] bg-brand-gold/[0.035] blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
            <div className="text-brand-gold text-[10px] font-black uppercase tracking-widest">
              Destinations
            </div>
            <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-10 text-white">
            EXPLORE BY <span className="text-outline-neon">CITY</span>
          </h2>
          
          {/* City Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {validCities.map(city => (
              <button
                key={city.id}
                onClick={() => setActiveCityId(city.id)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer ${
                  activeCityId === city.id 
                    ? 'bg-brand-gold text-white shadow-md shadow-brand-gold/30 font-bold' 
                    : 'bg-[#1F1F1F] border border-zinc-800 text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
          <div className="w-20 h-1 bg-brand-gold mx-auto mt-8 rounded-full"></div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-6 border-b border-zinc-800 pb-4 mb-10">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-black tracking-widest uppercase flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'text-brand-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'SELF DRIVE' && <Car size={16} />}
              {tab === 'CHAUFFEUR' && <User size={16} />}
              {tab === 'TAXI' && <Navigation size={16} />}
              {tab === 'VILLAS' && <Home size={16} />}
              {tab === 'TOURS' && <Map size={16} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        {displayItems.length === 0 ? (
          <div className="text-center py-20 text-gray-405 text-sm font-mono italic bg-[#1F1F1F] rounded-2xl border border-zinc-800">
            No items found for {cities.find(c => c.id === activeCityId)?.name} in {activeTab}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className="bg-[#1F1F1F] border border-zinc-800 rounded-2xl p-4 flex flex-col group hover:border-brand-gold hover:shadow-lg transition-all">
                <div className="relative h-48 w-full rounded-xl overflow-hidden mb-4">
                  <Image 
                    src={item.image} 
                    alt={item.name || item.model || item.title || 'Item'} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700" 
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </div>
                
                <div className="flex flex-col flex-grow">
                  <div className="text-[10px] text-brand-gold font-bold tracking-[0.2em] uppercase mb-1">
                    {item.category || (activeTab === 'VILLAS' ? 'Palace Stay' : 'Experience')}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">
                    {item.name || `${item.make || ''} ${item.model || ''}`.trim() || item.title}
                  </h3>
                  
                  <Link href={getLinkForTab()} className="mt-auto">
                    <button className="w-full bg-black/40 hover:bg-brand-gold text-gray-300 hover:text-white border border-zinc-800 hover:border-brand-gold text-[10px] font-black py-4 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                      BOOK NOW <ArrowRight size={14} className="group-hover:text-white" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
