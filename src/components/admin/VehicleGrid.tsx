'use client';

import { useState, useMemo } from 'react';
import { Trash2, Pencil, Search, CheckCircle, XCircle, MapPin, Fuel, Settings2, Copy, Tag, CheckSquare, Square, X, ChevronDown } from 'lucide-react';
import { deleteCar, duplicateVehicle, bulkUpdateVehicles, bulkDeleteVehicles } from '@/app/admin/actions';
import EditVehicleDrawer from './EditVehicleDrawer';
import VehicleImageCarousel from './VehicleImageCarousel';

interface VehicleGridProps {
  cars: any[];
  cities: any[];
  tiers: any[];
  taxiSettings?: any[];
}

const SERVICE_TYPE_OPTIONS = [
  { id: 'SELF_DRIVE', label: 'Self Drive' },
  { id: 'TAXI', label: 'Round Trip' },
  { id: 'AIRPORT_TRANSFER', label: 'Airport Transfer' },
  { id: 'VILLA', label: 'Villa + Car' },
  { id: 'TOUR', label: 'Tour Packages' },
];

const CATEGORY_OPTIONS = ['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury', 'Tempo Traveller', 'Bus'];

export default function VehicleGrid({ cars, cities, tiers, taxiSettings = [] }: VehicleGridProps) {
  const [search, setSearch] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('ALL');
  const [editingCar, setEditingCar] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState<string | null>(null); // which dropdown is open
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

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

  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));
  const someSelected = selectedIds.size > 0;

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(c => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filtered.forEach(c => next.add(c.id));
        return next;
      });
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkOpen(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Retire this vehicle from the platform? This cannot be undone.')) return;
    setDeletingId(id);
    await deleteCar(id);
    setDeletingId(null);
  }

  async function handleDuplicate(id: string) {
    setIsDuplicating(id);
    const res = await duplicateVehicle(id);
    if (!res.success) alert('Failed to duplicate: ' + res.error);
    setIsDuplicating(null);
  }

  async function handleBulkDelete() {
    if (!confirm(`Permanently delete ${selectedIds.size} vehicle(s)? This cannot be undone.`)) return;
    setIsBulkProcessing(true);
    const res = await bulkDeleteVehicles(Array.from(selectedIds));
    setIsBulkProcessing(false);
    if (!res.success) alert('Bulk delete failed: ' + res.error);
    else clearSelection();
  }

  async function handleBulkAvailability(value: boolean) {
    setIsBulkProcessing(true);
    await bulkUpdateVehicles(Array.from(selectedIds), { availability: value });
    setIsBulkProcessing(false);
    setBulkOpen(null);
  }

  async function handleBulkServiceTypeAdd(type: string) {
    setIsBulkProcessing(true);
    await bulkUpdateVehicles(Array.from(selectedIds), { serviceTypesAdd: [type] });
    setIsBulkProcessing(false);
    setBulkOpen(null);
  }

  async function handleBulkServiceTypeRemove(type: string) {
    setIsBulkProcessing(true);
    await bulkUpdateVehicles(Array.from(selectedIds), { serviceTypesRemove: [type] });
    setIsBulkProcessing(false);
    setBulkOpen(null);
  }

  async function handleBulkCategory(cat: string) {
    setIsBulkProcessing(true);
    await bulkUpdateVehicles(Array.from(selectedIds), { category: cat });
    setIsBulkProcessing(false);
    setBulkOpen(null);
  }

  async function handleBulkCity(cityId: string) {
    setIsBulkProcessing(true);
    await bulkUpdateVehicles(Array.from(selectedIds), { cityId });
    setIsBulkProcessing(false);
    setBulkOpen(null);
  }

  const cityMap = Object.fromEntries(cities.map(c => [c.id, c.name]));

  const visibleFilters = useMemo(() => {
    const ALL_FILTERS = [
      { id: 'ALL', label: 'All Vehicles', defaultShow: true },
      { id: 'SELF_DRIVE', label: 'Self Drive', defaultShow: true },
      { id: 'TAXI', label: 'Round Trip', defaultShow: true },
      { id: 'AIRPORT_TRANSFER', label: 'Airport Transfer', defaultShow: true },
      { id: 'VILLA', label: 'Villa + Car', defaultShow: false },
      { id: 'TOUR', label: 'Tour Packages', defaultShow: false }
    ];

    return ALL_FILTERS.filter(filter => {
      if (filter.defaultShow) return true;
      return cars.some(c => c.serviceTypes?.includes(filter.id));
    });
  }, [cars]);

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="text"
          placeholder="Search by name, category, fuel type…"
          className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 pl-12 pr-6 text-xs text-gray-900 focus:outline-none focus:border-green-600 focus:bg-white transition-all font-mono"
        />
        {search && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-mono">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {visibleFilters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setServiceTypeFilter(filter.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              serviceTypeFilter === filter.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 border border-gray-300 text-gray-500 hover:border-white/30 hover:text-gray-900'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Select All Row */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
        >
          {allFilteredSelected
            ? <CheckSquare size={16} className="text-green-600" />
            : <Square size={16} />
          }
          {allFilteredSelected ? 'Deselect All' : `Select All (${filtered.length})`}
        </button>
        {someSelected && (
          <span className="text-[10px] font-bold text-green-700 bg-green-600/10 border border-green-300 px-3 py-1 rounded-lg">
            {selectedIds.size} selected
          </span>
        )}
      </div>

      {/* ── Bulk Action Toolbar ── */}
      {someSelected && (
        <div className={`sticky top-4 z-30 mb-6 bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-3 shadow-2xl transition-all ${isBulkProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-green-400 mr-2">
            {isBulkProcessing ? 'Processing…' : `${selectedIds.size} Vehicle${selectedIds.size !== 1 ? 's' : ''} Selected`}
          </span>

          {/* Availability */}
          <div className="relative">
            <button onClick={() => setBulkOpen(bulkOpen === 'avail' ? null : 'avail')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold uppercase tracking-widest border border-gray-600 transition-colors">
              Availability <ChevronDown size={12} />
            </button>
            {bulkOpen === 'avail' && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[140px] overflow-hidden">
                <button onClick={() => handleBulkAvailability(true)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 text-green-700 flex items-center gap-2">
                  <CheckCircle size={12} /> Set Available
                </button>
                <button onClick={() => handleBulkAvailability(false)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 text-red-500 flex items-center gap-2">
                  <XCircle size={12} /> Set Unavailable
                </button>
              </div>
            )}
          </div>

          {/* Add Service Type */}
          <div className="relative">
            <button onClick={() => setBulkOpen(bulkOpen === 'addType' ? null : 'addType')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold uppercase tracking-widest border border-gray-600 transition-colors">
              + Add Service <ChevronDown size={12} />
            </button>
            {bulkOpen === 'addType' && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[180px] overflow-hidden">
                {SERVICE_TYPE_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => handleBulkServiceTypeAdd(opt.id)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 text-gray-700">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Remove Service Type */}
          <div className="relative">
            <button onClick={() => setBulkOpen(bulkOpen === 'removeType' ? null : 'removeType')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold uppercase tracking-widest border border-gray-600 transition-colors">
              − Remove Service <ChevronDown size={12} />
            </button>
            {bulkOpen === 'removeType' && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[180px] overflow-hidden">
                {SERVICE_TYPE_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => handleBulkServiceTypeRemove(opt.id)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 text-red-600">
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Set Category */}
          <div className="relative">
            <button onClick={() => setBulkOpen(bulkOpen === 'cat' ? null : 'cat')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold uppercase tracking-widest border border-gray-600 transition-colors">
              Set Category <ChevronDown size={12} />
            </button>
            {bulkOpen === 'cat' && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[160px] overflow-hidden">
                {CATEGORY_OPTIONS.map(cat => (
                  <button key={cat} onClick={() => handleBulkCategory(cat)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-700">
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Set City */}
          <div className="relative">
            <button onClick={() => setBulkOpen(bulkOpen === 'city' ? null : 'city')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-bold uppercase tracking-widest border border-gray-600 transition-colors">
              Set City <ChevronDown size={12} />
            </button>
            {bulkOpen === 'city' && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 min-w-[160px] max-h-56 overflow-y-auto">
                {cities.map(city => (
                  <button key={city.id} onClick={() => handleBulkCity(city.id)} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 text-gray-700">
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Delete */}
          <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest border border-red-500 transition-colors ml-auto">
            <Trash2 size={12} /> Delete {selectedIds.size}
          </button>

          {/* Clear */}
          <button onClick={clearSelection} className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(car => {
          const cheapestPkg = car.packages.sort((a: any, b: any) => a.basePrice - b.basePrice)[0];
          const cityName = car.cityId ? (cityMap[car.cityId] || '—') : '—';
          const isDeleting = deletingId === car.id;
          const isSelected = selectedIds.has(car.id);

          return (
            <div key={car.id}
              className={`bg-gray-100 border rounded-2xl overflow-hidden group transition-all ${isDeleting ? 'opacity-40 pointer-events-none' : ''} ${isSelected ? 'border-green-500 ring-2 ring-green-500/30' : 'border-gray-200 hover:border-gray-300'}`}>

              {/* Image */}
              <div className="relative w-full h-36 bg-white overflow-hidden">
                <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                  <VehicleImageCarousel
                    images={(() => {
                      let parsed = [];
                      try { parsed = typeof car.gallery === 'string' ? JSON.parse(car.gallery) : (car.gallery || []); } catch(e) {}
                      return parsed.length > 0 ? parsed : [car.image];
                    })()}
                    alt={`${car.make} ${car.model}`}
                  />
                </div>
                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-[#0A0A00] text-green-700 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-green-300">
                    {car.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-[8px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 ${car.availability ? 'bg-green-900/80 text-green-400 border border-green-500/30' : 'bg-red-900/80 text-red-400 border border-red-500/30'}`}>
                    {car.availability ? <CheckCircle size={10} /> : <XCircle size={10} />}
                    {car.availability ? 'Available' : 'Retired'}
                  </span>
                </div>
                {/* Select checkbox overlay */}
                <button
                  onClick={() => toggleSelect(car.id)}
                  className="absolute bottom-3 left-3 w-6 h-6 rounded-lg flex items-center justify-center transition-all shadow-md"
                  title={isSelected ? 'Deselect' : 'Select'}
                >
                  {isSelected
                    ? <CheckSquare size={20} className="text-green-500 drop-shadow" />
                    : <Square size={20} className="text-white/70 hover:text-white drop-shadow" />
                  }
                </button>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-black text-sm uppercase tracking-tight mb-1">{car.make} {car.model}</h3>

                {/* Meta row */}
                <div className="flex items-center gap-3 mb-4 text-[9px] font-mono text-gray-500">
                  <span className="flex items-center gap-1"><Fuel size={10} /> {car.fuelType}</span>
                  <span className="flex items-center gap-1"><Settings2 size={10} /> {car.transmission.replace(' Gearbox', '')}</span>
                  <span className="flex items-center gap-1"><MapPin size={10} /> {cityName}</span>
                </div>

                {/* Service type pills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(car.serviceTypes || []).filter((st: string) => st !== 'WITH_DRIVER').map((st: string) => (
                    <span key={st} className="text-[7px] font-black uppercase tracking-widest bg-green-600/10 text-green-700 border border-green-300/50 px-1.5 py-0.5 rounded">
                      {SERVICE_TYPE_OPTIONS.find(o => o.id === st)?.label || (st === 'TAXI' ? 'Round Trip' : st)}
                    </span>
                  ))}
                </div>

                {/* Packages / Category Pricing pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {serviceTypeFilter === 'TAXI' ? (
                    (() => {
                      const setting = taxiSettings.find((s: any) => s.vehicleCategory.toLowerCase() === car.category.toLowerCase());
                      const rate = setting?.roundTripRatePerKm || car.packages?.[0]?.extraChargePerUnit || 13;
                      const minKm = setting?.roundTripMinKmPerDay || 250;
                      const allowance = setting?.driverAllowancePerDay || car.driverAllowanceOut || 350;
                      return (
                        <>
                          <span className="text-[8px] font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                            Rate: ₹{rate}/KM
                          </span>
                          <span className="text-[8px] font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                            Min: {minKm} KM/Day
                          </span>
                          <span className="text-[8px] font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                            Allowance: ₹{allowance}/Day
                          </span>
                        </>
                      );
                    })()
                  ) : serviceTypeFilter === 'AIRPORT_TRANSFER' ? (
                    (() => {
                      const setting = taxiSettings.find((s: any) => s.vehicleCategory.toLowerCase() === car.category.toLowerCase());
                      const base = setting?.airportBaseFare || 0;
                      const rate = setting?.airportRatePerKm || 15;
                      const minFare = setting?.airportMinFare || 300;
                      return (
                        <>
                          <span className="text-[8px] font-mono font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
                            Base: ₹{base}
                          </span>
                          <span className="text-[8px] font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                            Rate: ₹{rate}/KM
                          </span>
                          <span className="text-[8px] font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                            Min Fare: ₹{minFare}
                          </span>
                        </>
                      );
                    })()
                  ) : (
                    <>
                      {car.packages.slice(0, 4).map((pkg: any) => (
                        <span key={pkg.id} className="text-[8px] font-mono text-gray-700 bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                          {pkg.name} — ₹{pkg.basePrice?.toLocaleString()}
                        </span>
                      ))}
                      {car.packages.length > 4 && (
                        <span className="text-[8px] font-mono text-gray-400 px-2 py-1">+{car.packages.length - 4} more</span>
                      )}
                    </>
                  )}
                </div>

                {/* Features pills */}
                {car.features && car.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4 mt-2">
                    {car.features.slice(0, 3).map((feature: string, idx: number) => (
                      <span key={idx} className="text-[8px] font-bold text-green-700 bg-green-600/5 border border-green-600/20 px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
                        <Tag size={8} /> {feature}
                      </span>
                    ))}
                    {car.features.length > 3 && (
                      <span className="text-[8px] font-mono text-gray-400 px-1.5 py-0.5 border border-gray-200 rounded">+{car.features.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Bottom row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <div className="text-[9px] text-gray-400 font-mono mb-0.5">Starting from</div>
                    <div className="text-green-700 font-black text-base">
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
                      <Copy size={14} className={isDuplicating === car.id ? 'animate-pulse' : ''} />
                    </button>
                    <button
                      onClick={() => setEditingCar(car)}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-green-600/10 hover:text-green-700 text-gray-500 flex items-center justify-center transition-colors border border-gray-200 hover:border-green-300"
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
        <div className="text-center py-20 text-gray-400 font-mono text-sm border border-dashed border-gray-300 rounded-3xl">
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
