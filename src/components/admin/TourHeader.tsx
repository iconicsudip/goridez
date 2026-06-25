'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import TourDrawer from './TourDrawer';

export default function TourHeader({ cities }: { cities: any[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight mb-1">EXPERIENCE COORDINATOR</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Curate multi-day excursions, track guest manifests, and deploy localized itineraries.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter tours..." 
              className="bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-6 text-xs text-gray-900 focus:outline-none focus:border-green-600 focus:bg-white transition-all w-64 font-mono"
            />
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="bg-green-600 hover:bg-brand-hover text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)]"
          >
            <Plus size={16} /> Curate New Tour
          </button>
        </div>
      </div>
      
      <TourDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} cities={cities} />
    </>
  );
}
