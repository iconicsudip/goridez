'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Trash2, Pencil, Search, CheckCircle, XCircle, MapPin, Fuel, Settings2, Copy } from 'lucide-react';
import { deleteCar, duplicateVehicle } from '@/app/admin/actions';
import EditVehicleDrawer from './EditVehicleDrawer';
import VehicleImageCarousel from './VehicleImageCarousel';

interface VehicleGridProps {
  cars: any[];
  cities: any[];
  tiers: any[];
}

export default function VehicleGrid({ cars, cities, tiers }: VehicleGridProps) {
  const [search, setSearch] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('ALL');
  const [editingCar, setEditingCar] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = cars;
    if (serviceTypeFilter !== 'ALL') {
      result = result.filter(c => c.serviceTypes?.includes(serviceTypeFilter));
    }
    if (!q) return result;
    return result.filter(c =>
      `${c.make} ${c.model}`.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.fuelType.toLowerCase().includes(q)
    );
  }, [cars, search, serviceTypeFilter]);

  async function handleDelete(id: string) {
    if (!confirm('Retire this vehicle from the platform? This cannot be undone.')) return;
    setDeletingId(id);
    await deleteCar(id);
    setDeletingId(null);
  }

  async function handleDuplicate(id: string) {
    setIsDuplicating(id);
    const res = await duplicateVehicle(id);
    if (!res.success) {
      alert('Failed to duplicate: ' + res.error);
    }
    setIsDuplicating(null);
  }

  const cityMap = Object.fromEntries(cities.map(c => [c.id, c.name]));

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="text"
          placeholder="Search by name, category, fuel type…"
          className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-brand-neon focus:bg-[#161616] transition-all font-mono"
        />
        {search && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-white/30 font-mono">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'ALL', label: 'All Vehicles' },
          { id: 'SELF_DRIVE', label: 'Self Drive' },
          { id: 'WITH_DRIVER', label: 'With Driver' },
          { id: 'TAXI', label: 'One Way / Round Trip' },
          { id: 'VILLA', label: 'Villa + Car' },
          { id: 'TOUR', label: 'Tour Packages' }
        ].map(filter => (
          <button
            key={filter.id}
            onClick={() => setServiceTypeFilter(filter.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              serviceTypeFilter === filter.id 
                ? 'bg-brand-neon text-black' 
                : 'bg-[#111111] border border-white/10 text-white/50 hover:border-white/30 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(car => {
          const cheapestPkg = car.packages.sort((a: any, b: any) => a.basePrice - b.basePrice)[0];
          const cityName = car.cityId ? (cityMap[car.cityId] || '—') : '—';
          const isDeleting = deletingId === car.id;

          return (
            <div key={car.id}
              className={`bg-[#111111] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden group transition-all ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>

              {/* Image */}
              <div className="relative w-full h-36 bg-black overflow-hidden">
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                  <VehicleImageCarousel 
                    images={(() => {
                      let parsed = [];
                      try {
                        parsed = typeof car.gallery === 'string' ? JSON.parse(car.gallery) : (car.gallery || []);
                      } catch(e) {}
                      return parsed.length > 0 ? parsed : [car.image];
                    })()}
                    alt={`${car.make} ${car.model}`} 
                  />
                </div>
                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-[#0A0A00] text-brand-neon text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-brand-neon/30">
                    {car.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 ${car.availability ? 'bg-green-900/80 text-green-400 border border-green-500/30' : 'bg-red-900/80 text-red-400 border border-red-500/30'}`}>
                    {car.availability ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {car.availability ? 'Available' : 'Retired'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-black text-sm uppercase tracking-tight mb-1">{car.make} {car.model}</h3>
                
                {/* Meta row */}
                <div className="flex items-center gap-3 mb-4 text-[9px] font-mono text-white/40">
                  <span className="flex items-center gap-1"><Fuel size={10} /> {car.fuelType}</span>
                  <span className="flex items-center gap-1"><Settings2 size={10} /> {car.transmission.replace(' Gearbox', '')}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {cityName}</span>
                </div>

                {/* Packages pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {car.packages.slice(0, 4).map((pkg: any) => (
                    <span key={pkg.id} className="text-[8px] font-mono text-white/50 bg-white/5 border border-white/5 px-2 py-1 rounded-lg">
                      {pkg.name} — ₹{pkg.basePrice.toLocaleString()}
                    </span>
                  ))}
                  {car.packages.length > 4 && (
                    <span className="text-[8px] font-mono text-white/30 px-2 py-1">+{car.packages.length - 4} more</span>
                  )}
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <div className="text-[9px] text-white/30 font-mono mb-0.5">Starting from</div>
                    <div className="text-brand-neon font-black text-base">
                      ₹{cheapestPkg ? cheapestPkg.basePrice.toLocaleString() : '—'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDuplicate(car.id)}
                      disabled={isDuplicating === car.id}
                      className="w-9 h-9 rounded-xl bg-blue-500/5 hover:bg-blue-500/20 text-blue-500/50 hover:text-blue-500 flex items-center justify-center transition-colors border border-blue-500/5 hover:border-blue-500/20 disabled:opacity-50"
                      title="Duplicate Vehicle"
                    >
                      <Copy size={14} className={isDuplicating === car.id ? "animate-pulse" : ""} />
                    </button>
                    <button
                      onClick={() => setEditingCar(car)}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-brand-neon/10 hover:text-brand-neon text-white/40 flex items-center justify-center transition-colors border border-white/5 hover:border-brand-neon/30"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
                      className="w-9 h-9 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 flex items-center justify-center transition-colors border border-red-500/5 hover:border-red-500/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-white/20 font-mono text-sm border border-dashed border-white/10 rounded-3xl">
          {search ? `No vehicles matching "${search}"` : 'No vehicles registered yet. Add one above.'}
        </div>
      )}

      {/* Edit Drawer */}
      <EditVehicleDrawer
        isOpen={!!editingCar}
        onClose={() => setEditingCar(null)}
        car={editingCar}
        cities={cities}
        tiers={tiers}
      />
    </>
  );
}
