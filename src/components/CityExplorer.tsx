'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight, Car, User, Sparkles } from 'lucide-react';

type Tab = 'SELF DRIVE' | 'TAXI';

export default function CityExplorer({ 
  cities, 
  cars, 
  villas = [], 
  tours = [] 
}: { 
  cities: any[], 
  cars: any[], 
  villas?: any[], 
  tours?: any[] 
}) {
  // Only include cities that have at least some data
  const validCities = cities.filter(city => 
    cars.some(c => c.cityId === city.id)
  );

  const [activeCityId, setActiveCityId] = useState(validCities[0]?.id || '');

  // Determine which tabs have data for the active city
  const availableTabs = (['SELF DRIVE', 'TAXI'] as Tab[]).filter(tab => {
    switch (tab) {
      case 'SELF DRIVE':
        return cars.some(c => c.cityId === activeCityId && c.serviceTypes.includes('SELF_DRIVE'));
      case 'TAXI':
        return cars.some(c => c.cityId === activeCityId && c.serviceTypes.includes('WITH_DRIVER'));
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
        return cars.filter(c => c.cityId === activeCityId && c.serviceTypes.includes('SELF_DRIVE'));
      case 'TAXI':
        return cars.filter(c => c.cityId === activeCityId && c.serviceTypes.includes('WITH_DRIVER'));
      default:
        return [];
    }
  };

  const displayItems = getDisplayItems();

  const getLinkForTab = () => {
    switch (activeTab) {
      case 'SELF DRIVE': return '/self-drive';
      case 'TAXI': return '/taxi';
    }
  };

  return (
    <section className="py-24 bg-[#180501] border-t border-[#C89D5C]/20 relative overflow-hidden font-body text-white">
      {/* Decorative Luxury Background Glows */}
      <div className="absolute top-1/4 left-1/12 w-[500px] h-[500px] bg-[#C89D5C]/10 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/12 w-[500px] h-[500px] bg-[#551A0C]/20 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 border border-[#C89D5C]/40 rounded-full px-5 py-1.5 mb-5 bg-[#250903]/80 backdrop-blur-md">
            <Sparkles size={12} className="text-[#DFB574]" />
            <span className="text-[#DFB574] text-[10px] md:text-xs font-bold uppercase tracking-[0.25em]">
              Royal Rajasthan Destinations
            </span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tight text-white mb-6">
            EXPLORE BY <span className="font-editorial italic font-normal text-[#DFB574]">Territory</span>
          </h2>
          
          {/* City Pills */}
          <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
            {validCities.map(city => (
              <button
                key={city.id}
                onClick={() => setActiveCityId(city.id)}
                className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer border ${
                  activeCityId === city.id 
                    ? 'bg-[#551A0C] border-[#C89D5C] text-[#DFB574] shadow-[0_4px_18px_rgba(200,157,92,0.35)] scale-105' 
                    : 'bg-[#250903]/80 border-[#C89D5C]/25 text-[#FAF6F0]/70 hover:border-[#C89D5C]/60 hover:text-white'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-8 border-b border-[#C89D5C]/20 pb-4 mb-12">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 transition-all cursor-pointer relative py-2 ${
                activeTab === tab
                  ? 'text-[#DFB574] font-black'
                  : 'text-[#FAF6F0]/60 hover:text-white'
              }`}
            >
              {tab === 'SELF DRIVE' && <Car size={16} className="text-[#C89D5C]" />}
              {tab === 'TAXI' && <User size={16} className="text-[#C89D5C]" />}
              <span>{tab}</span>
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#DFB574] rounded-full shadow-[0_0_8px_#DFB574]" />
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {displayItems.length === 0 ? (
          <div className="text-center py-20 text-[#FAF6F0]/60 text-sm font-editorial italic bg-[#250903]/60 rounded-3xl border border-[#C89D5C]/20">
            No carriages found for {cities.find(c => c.id === activeCityId)?.name} in {activeTab}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-[#250903]/80 border border-[#C89D5C]/25 rounded-3xl p-5 flex flex-col justify-between group hover:border-[#C89D5C] hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-300"
              >
                <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-[radial-gradient(ellipse_at_center,_#3D1006_0%,_#170501_100%)] p-2 flex items-center justify-center border border-[#C89D5C]/15">
                  <Image 
                    src={item.image} 
                    alt={item.name || item.model || item.title || 'Item'} 
                    fill 
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]" 
                    unoptimized
                  />
                  <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#180501]/85 text-[#DFB574] border border-[#C89D5C]/35 backdrop-blur-md">
                    {item.category || 'Luxury'}
                  </span>
                </div>
                
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-serif font-black uppercase tracking-tight mb-4 text-white group-hover:text-[#DFB574] transition-colors">
                    {item.name || `${item.make || ''} ${item.model || ''}`.trim() || item.title}
                  </h3>
                  
                  <Link href={getLinkForTab()} className="mt-auto block">
                    <button className="btn-luxury btn-luxury-shine w-full bg-[#551A0C] text-[#DFB574] hover:bg-[#451408] border border-[#C89D5C]/50 text-[10px] font-bold py-3.5 rounded-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer shadow-md">
                      Reserve Carriage <ArrowRight size={14} className="text-[#DFB574]" />
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
