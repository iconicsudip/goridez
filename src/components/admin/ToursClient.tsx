'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search, Plus, Trash2, Pencil, X, ArrowRight,
  Clock, Users, MapPin, Check
} from 'lucide-react';
import { deleteTour, addTour, updateTour } from '@/app/admin/actions';
import ImageUpload from './ImageUpload';
import { useEffect } from 'react';

function TourDrawer({ isOpen, onClose, tour, cities, mode }: any) {
  const [loading, setLoading] = useState(false);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>(
    tour?.cityId ? [tour.cityId] : []
  );
  const [imageUrl, setImageUrl] = useState(tour?.image || '');
  useEffect(() => {
    if (isOpen) {
      setImageUrl(tour?.image || '');
    } else {
      setImageUrl('');
    }
  }, [tour, isOpen]);

  // Reset city selection when tour prop changes (edit vs add)
  const stableKey = tour?.id ?? 'new';

  function toggleCity(id: string) {
    setSelectedCityIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Inject primary city (first selected)
    formData.set('cityId', selectedCityIds[0] ?? '');
    setLoading(true);
    const res = mode === 'edit'
      ? await updateTour(tour.id, formData)
      : await addTour(formData);
    setLoading(false);
    if (res?.success) {
      setSelectedCityIds([]);
      onClose();
    } else {
      alert('Error: ' + res?.error);
    }
  }

  if (!isOpen) return null;
  const isEdit = mode === 'edit';
  const accent = isEdit ? 'text-yellow-400' : 'text-green-700';
  const btnClass = isEdit ? 'bg-yellow-400 hover:bg-yellow-300 text-black' : 'bg-green-600 hover:bg-brand-hover text-black';

  return (
    <>
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[640px] lg:w-[800px] bg-white border-l border-gray-300 z-50 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${accent}`}>
              {isEdit ? '✎ EDIT TOUR' : '+ CURATE NEW TOUR'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-colors"><X size={20} /></button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Tour Title</label>
              <input name="title" required defaultValue={tour?.title}
                placeholder="e.g. Royal Rajasthan Heritage Circuit"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Description</label>
              <textarea name="description" required defaultValue={tour?.description} rows={3}
                placeholder="Embark on a majestic odyssey through..."
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400 resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Cover Image URL</label>
                <input type="hidden" name="image" value={imageUrl} />
                <ImageUpload value={imageUrl} onChange={setImageUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Duration (Days)</label>
                <input name="duration" required type="number" min="1" defaultValue={tour?.duration ?? 1}
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Adult Price (₹)</label>
                <input name="adultPrice" required type="number" defaultValue={tour?.adultPrice}
                  placeholder="45000"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Child Price (₹)</label>
                <input name="childPrice" required type="number" defaultValue={tour?.childPrice}
                  placeholder="20000"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
            </div>

            {/* ── MULTI-SELECT CITIES ── */}
            <div className="border-t border-gray-200 pt-6">
              <label className="text-[9px] text-green-700 font-mono uppercase tracking-widest block mb-3">
                — City Coverage (Multi-Select)
              </label>
              <div className="flex flex-wrap gap-2">
                {cities.map((c: any) => {
                  const selected = selectedCityIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCity(c.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        selected
                          ? 'bg-green-600/10 border-green-600 text-green-700 shadow-sm'
                          : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-white/30 hover:text-gray-900/80'
                      }`}
                    >
                      {selected && <Check size={11} strokeWidth={3} />}
                      {c.name}
                    </button>
                  );
                })}
                {cities.length === 0 && (
                  <p className="text-[10px] text-gray-400 font-mono">No cities configured.</p>
                )}
              </div>
              {selectedCityIds.length > 0 && (
                <p className="text-[9px] text-gray-400 font-mono mt-2">
                  {selectedCityIds.length} city hub{selectedCityIds.length > 1 ? 's' : ''} selected
                  {selectedCityIds.length > 1 && <span className="text-gray-400"> (primary: {cities.find((c: any) => c.id === selectedCityIds[0])?.name})</span>}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit"
                className={`w-full ${btnClass} px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50`}>
                {loading ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'PUBLISH TOUR'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function ToursClient({ tours, cities }: { tours: any[], cities: any[] }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingTour, setEditingTour] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cityMap = Object.fromEntries(cities.map(c => [c.id, c.name]));

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? tours : tours.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.cityId && cityMap[t.cityId]?.toLowerCase().includes(q))
    );
  }, [tours, search, cityMap]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this tour permanently?')) return;
    setDeletingId(id);
    await deleteTour(id);
    setDeletingId(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight mb-1">EXPERIENCE COORDINATOR</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Curate multi-day excursions, track guest manifests, and deploy localized itineraries.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter tours..."
              className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-xs text-gray-900 focus:outline-none focus:border-green-600 transition-all font-mono" />
          </div>
          <button onClick={() => setShowAdd(true)}
            className="bg-green-600 hover:bg-brand-hover text-black px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap shadow-[0_0_15px_rgba(196,240,0,0.15)]">
            <Plus size={15} /> Curate New Tour
          </button>
        </div>
      </div>

      {/* Tour Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(tour => {
          const cityName = tour.cityId ? cityMap[tour.cityId] : null;
          const isDeleting = deletingId === tour.id;
          return (
            <div key={tour.id} className={`bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-2xl overflow-hidden group transition-all ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>
              {/* Image */}
              <div className="relative w-full h-36 bg-white overflow-hidden">
                {tour.image ? (
                  <Image src={tour.image} alt={tour.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                ) : (
                  <div className="w-full h-full bg-green-600/5 flex items-center justify-center text-green-700/30 font-mono text-xs">NO IMAGE</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  {cityName && (
                    <span className="text-[8px] font-bold uppercase tracking-widest bg-white/60 text-green-700 border border-green-300 px-2 py-1 rounded flex items-center gap-1">
                      <MapPin size={8} /> {cityName}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-black text-sm uppercase tracking-tight mb-2 line-clamp-2">{tour.title}</h3>
                <div className="flex items-center gap-4 text-[9px] font-mono text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Clock size={10} /> {tour.duration} Days</span>
                  <span className="flex items-center gap-1"><Users size={10} /> Adult: ₹{tour.adultPrice.toLocaleString()}</span>
                </div>
                <p className="text-[9px] text-gray-400 font-mono line-clamp-2 mb-4">{tour.description}</p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div>
                    <div className="text-[9px] text-gray-400 font-mono mb-0.5">Child Price</div>
                    <div className="text-green-700 font-black">₹{tour.childPrice.toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingTour(tour)}
                      className="w-9 h-9 rounded-xl bg-white/5 hover:bg-green-600/10 hover:text-green-700 text-gray-500 flex items-center justify-center transition-colors border border-gray-200">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(tour.id)}
                      className="w-9 h-9 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 flex items-center justify-center transition-colors">
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
        <div className="text-center py-20 text-gray-400 font-mono text-sm border border-dashed border-gray-300 rounded-3xl mt-4">
          {search ? `No tours matching "${search}"` : 'No tours curated yet.'}
        </div>
      )}

      <TourDrawer isOpen={showAdd} onClose={() => setShowAdd(false)} tour={null} cities={cities} mode="add" />
      <TourDrawer isOpen={!!editingTour} onClose={() => setEditingTour(null)} tour={editingTour} cities={cities} mode="edit" />
    </>
  );
}
