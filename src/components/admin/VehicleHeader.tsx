'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import VehicleDrawer from './VehicleDrawer';

export default function VehicleHeader({ cities, tiers }: { cities: any[], tiers: any[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight mb-1">VETTED FLEET CONTROLLER</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Configure mileage tier rates, standard features, and retire vehicles instantly.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="bg-green-600 hover:bg-brand-hover text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)]"
          >
            <Plus size={16} /> Add New Vehicle
          </button>
        </div>
      </div>
      
      <VehicleDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} cities={cities} tiers={tiers} />
    </>
  );
}
