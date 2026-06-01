'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

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
  const [activeCityId, setActiveCityId] = useState(cities[0]?.id || '');
  const [activeTab, setActiveTab] = useState<Tab>('SELF DRIVE');

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
    <section className="py-24 bg-[#0A0A0A] border-t border-white/5 relative">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-brand-neon text-[10px] font-black uppercase tracking-widest mb-4">
            <MapPin size={14} /> Destinations
          </div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-10">
            EXPLORE BY <span className="text-outline-neon">CITY</span>
          </h2>
          
          {/* City Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {cities.map(city => (
              <button
                key={city.id}
                onClick={() => setActiveCityId(city.id)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors ${
                  activeCityId === city.id 
                    ? 'bg-brand-neon text-black' 
                    : 'bg-[#161616] border border-white/5 text-white/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-6 border-b border-white/10 pb-4 mb-10">
          {(['SELF DRIVE', 'CHAUFFEUR', 'TAXI', 'VILLAS', 'TOURS'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-black tracking-widest uppercase flex items-center gap-2 transition-colors ${
                activeTab === tab
                  ? 'text-brand-neon'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tab === 'SELF DRIVE' && <span>🏎️</span>}
              {tab === 'CHAUFFEUR' && <span>👤</span>}
              {tab === 'TAXI' && <span>🚕</span>}
              {tab === 'VILLAS' && <span>🏰</span>}
              {tab === 'TOURS' && <span>🗺️</span>}
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        {displayItems.length === 0 ? (
          <div className="text-center py-20 text-white/30 text-sm font-mono italic bg-[#111111] rounded-2xl border border-white/5">
            No items found for {cities.find(c => c.id === activeCityId)?.name} in {activeTab}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex flex-col group">
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
                  <div className="text-[10px] text-brand-neon font-bold tracking-[0.2em] uppercase mb-1">
                    {item.category || (activeTab === 'VILLAS' ? 'Palace Stay' : 'Experience')}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                    {item.name || `${item.make || ''} ${item.model || ''}`.trim() || item.title}
                  </h3>
                  
                  <Link href={getLinkForTab()} className="mt-auto">
                    <button className="w-full bg-[#1A1A1A] hover:bg-white/10 text-white border border-white/10 text-[10px] font-black py-4 rounded-xl transition-colors uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-brand-neon/30">
                      BOOK NOW <ArrowRight size={14} className="group-hover:text-brand-neon" />
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
