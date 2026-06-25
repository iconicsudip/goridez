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
    <section className="py-24 bg-white border-t border-gray-200 relative">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-green-700 text-[10px] font-black uppercase tracking-widest mb-4">
            <MapPin size={14} /> Destinations
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-10">
            EXPLORE BY <span className="text-outline-neon">CITY</span>
          </h2>
          
          {/* City Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {validCities.map(city => (
              <button
                key={city.id}
                onClick={() => setActiveCityId(city.id)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${
                  activeCityId === city.id 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-6 border-b border-gray-300 pb-4 mb-10">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-black tracking-widest uppercase flex items-center gap-2 transition-colors ${
                activeTab === tab
                  ? 'text-green-700'
                  : 'text-gray-500 hover:text-gray-900'
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
          <div className="text-center py-20 text-gray-400 text-sm font-mono italic bg-gray-100 rounded-2xl border border-gray-200">
            No items found for {cities.find(c => c.id === activeCityId)?.name} in {activeTab}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className="bg-gray-100 border border-gray-200 rounded-2xl p-4 flex flex-col group">
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
                  <div className="text-[10px] text-green-700 font-bold tracking-[0.2em] uppercase mb-1">
                    {item.category || (activeTab === 'VILLAS' ? 'Palace Stay' : 'Experience')}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                    {item.name || `${item.make || ''} ${item.model || ''}`.trim() || item.title}
                  </h3>
                  
                  <Link href={getLinkForTab()} className="mt-auto">
                    <button className="w-full bg-gray-100 hover:bg-white/10 text-gray-900 border border-gray-300 text-[10px] font-black py-4 rounded-xl transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-green-300">
                      BOOK NOW <ArrowRight size={14} className="group-hover:text-green-700" />
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
