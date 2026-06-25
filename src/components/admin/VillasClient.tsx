'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Trash2, Pencil, Search, Plus, X, ArrowRight, Check, MapPin, Users, Tag } from 'lucide-react';
import { deleteVilla, addVilla, updateVilla } from '@/app/admin/actions';
import ImageUpload from './ImageUpload';
import { useEffect } from 'react';

const AMENITY_SUGGESTIONS = [
  'Private Pool', 'Infinity Pool', 'Lake View', 'Fort View', 'Butler Service',
  'Private Chef', 'Bonfire Area', 'Jacuzzi', 'Spa', 'Gym', 'Home Theatre',
  'Rooftop Terrace', 'Wi-Fi', 'AC', 'Airport Pickup', 'Helipad'
];

function VillaDrawer({ isOpen, onClose, villa, cities, mode }: any) {
  const [loading, setLoading] = useState(false);
  const [amenities, setAmenities] = useState<string[]>(
    villa ? JSON.parse(villa.amenities || '[]') : []
  );
  const [amenityInput, setAmenityInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>(
    villa?.cityId ? [villa.cityId] : []
  );
  const [imageUrl, setImageUrl] = useState(villa?.image || '');

  useEffect(() => {
    if (isOpen) {
      setImageUrl(villa?.image || '');
    } else {
      setImageUrl('');
    }
  }, [villa, isOpen]);

  function toggleCity(id: string) {
    setSelectedCityIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function addAmenity(a: string) {
    const t = a.trim();
    if (t && !amenities.includes(t)) setAmenities(prev => [...prev, t]);
    setAmenityInput('');
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('amenities', amenities.join(','));
    formData.set('cityId', selectedCityIds[0] ?? '');
    const res = mode === 'edit' ? await updateVilla(villa.id, formData) : await addVilla(formData);
    setLoading(false);
    if (res.success) {
      setSelectedCityIds([]);
      onClose();
    } else {
      alert('Error: ' + res.error);
    }
  }

  if (!isOpen) return null;
  const accent = mode === 'edit' ? 'text-yellow-400' : 'text-green-700';
  const btnClass = mode === 'edit'
    ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
    : 'bg-green-600 hover:bg-brand-hover text-black';

  const filteredSuggestions = AMENITY_SUGGESTIONS.filter(s => s.toLowerCase().includes(amenityInput.toLowerCase()) && !amenities.includes(s));

  return (
    <>
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[640px] lg:w-[800px] bg-white border-l border-gray-300 z-50 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${accent}`}>
              {mode === 'edit' ? '✎ EDIT VILLA' : '+ REGISTER NEW VILLA'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-colors"><X size={20} /></button>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Villa / Property Name</label>
              <input name="name" required defaultValue={villa?.name} placeholder="e.g. Aravalli Grande Palace"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Description</label>
              <textarea name="description" required defaultValue={villa?.description} rows={3} placeholder="A luxurious lakefront property..."
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400 resize-none" />
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Location / Address</label>
                <input name="location" required defaultValue={villa?.location} placeholder="Lake Pichola, Udaipur"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
            </div>

            {/* ── MULTI-SELECT CITIES ── */}
            <div className="border-t border-gray-200 pt-5">
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
              </div>
              {selectedCityIds.length > 0 && (
                <p className="text-[9px] text-gray-400 font-mono mt-2">
                  {selectedCityIds.length} city hub{selectedCityIds.length > 1 ? 's' : ''} selected
                  {selectedCityIds.length > 1 && <span className="text-gray-400"> (primary: {cities.find((c: any) => c.id === selectedCityIds[0])?.name})</span>}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Starting Price / Night (₹)</label>
                <input name="startingPrice" required type="number" defaultValue={villa?.startingPrice} placeholder="24000"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Max Occupancy (Guests)</label>
                <input name="occupancy" required type="number" defaultValue={villa?.occupancy} placeholder="8"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Cover Image URL</label>
                <input type="hidden" name="image" value={imageUrl} />
                <ImageUpload value={imageUrl} onChange={setImageUrl} />
              </div>
            </div>

            {/* Amenities Tag Input */}
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Amenities</label>
              <div className="relative">
                <div className="min-h-[52px] bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-green-600/40 cursor-text"
                  onClick={() => document.getElementById('amenity-input')?.focus()}>
                  {amenities.map(a => (
                    <span key={a} className="flex items-center gap-1.5 bg-green-600/10 border border-green-300 text-green-700 text-[9px] font-bold uppercase px-3 py-1 rounded-lg">
                      <Tag size={9} />{a}
                      <button type="button" onClick={() => setAmenities(prev => prev.filter(x => x !== a))} className="text-green-700/50 hover:text-red-400 ml-1"><X size={9} /></button>
                    </span>
                  ))}
                  <input id="amenity-input" value={amenityInput}
                    onChange={e => { setAmenityInput(e.target.value); setShowSuggestions(true); }}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addAmenity(amenityInput); } }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder={amenities.length === 0 ? 'Type an amenity...' : ''}
                    className="flex-1 min-w-[160px] bg-transparent outline-none text-xs text-gray-900 font-mono py-1 placeholder:text-gray-400" />
                </div>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl z-10 overflow-hidden">
                    {filteredSuggestions.slice(0, 6).map(s => (
                      <button key={s} type="button" onMouseDown={() => addAmenity(s)}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-gray-600 hover:text-green-700 hover:bg-green-600/5 transition-colors flex items-center gap-2">
                        <Plus size={10} /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit" className={`w-full ${btnClass} px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50`}>
                {loading ? 'SAVING...' : mode === 'edit' ? 'SAVE CHANGES' : 'PUBLISH VILLA'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function VillasClient({ villas, cities }: { villas: any[], cities: any[] }) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingVilla, setEditingVilla] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return !q ? villas : villas.filter(v =>
      v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q) || v.city?.name?.toLowerCase().includes(q)
    );
  }, [villas, search]);

  async function handleDelete(id: string) {
    if (!confirm('Remove this villa from the platform?')) return;
    setDeletingId(id);
    await deleteVilla(id);
    setDeletingId(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight mb-1">MAJESTIC PALACE STAYS</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Manage luxury villa listings, amenities, and pricing.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search villas, cities..."
              className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-xs text-gray-900 focus:outline-none focus:border-green-600 transition-all font-mono" />
          </div>
          <button onClick={() => setShowAdd(true)}
            className="bg-green-600 hover:bg-brand-hover text-black px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap">
            <Plus size={15} /> Add Villa
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(villa => {
          const amenities = JSON.parse(villa.amenities || '[]');
          const isDeleting = deletingId === villa.id;
          return (
            <div key={villa.id} className={`bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-2xl overflow-hidden group transition-all ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="relative w-full h-40 bg-white overflow-hidden">
                <Image src={villa.image} alt={villa.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <div className="text-green-700 font-black text-lg">₹{villa.startingPrice.toLocaleString()}<span className="text-[10px] font-normal text-gray-600">/night</span></div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-sm uppercase tracking-tight mb-1">{villa.name}</h3>
                <div className="flex items-center gap-3 text-[9px] font-mono text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin size={10} />{villa.city?.name || 'Unassigned'}</span>
                  <span className="flex items-center gap-1"><Users size={10} />{villa.occupancy} guests</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {amenities.slice(0, 3).map((a: string) => (
                    <span key={a} className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-lg border border-gray-200">{a}</span>
                  ))}
                  {amenities.length > 3 && <span className="text-[8px] font-mono text-gray-400 px-2 py-1">+{amenities.length - 3}</span>}
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                  <button onClick={() => setEditingVilla(villa)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-green-600/10 hover:text-green-700 text-gray-500 flex items-center justify-center transition-colors border border-gray-200"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(villa.id)} className="w-9 h-9 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 flex items-center justify-center transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400 font-mono text-sm border border-dashed border-gray-300 rounded-3xl mt-4">
          {search ? `No villas matching "${search}"` : 'No villas listed yet.'}
        </div>
      )}

      <VillaDrawer isOpen={showAdd} onClose={() => setShowAdd(false)} villa={null} cities={cities} mode="add" />
      <VillaDrawer isOpen={!!editingVilla} onClose={() => setEditingVilla(null)} villa={editingVilla} cities={cities} mode="edit" />
    </>
  );
}
