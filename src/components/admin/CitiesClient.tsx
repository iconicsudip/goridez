'use client';

import { useState } from 'react';
import {
  Globe, Pencil, Trash2, Plus, X, ArrowRight, Check, Search
} from 'lucide-react';
import { createCity, updateCity, deleteCity } from '@/app/admin/actions';

interface City {
  id: string;
  name: string;
  slug: string | null;
  faqQuestion: string | null;
  faqAnswer: string | null;
}

function CityDrawer({ isOpen, onClose, city, mode }: { isOpen: boolean; onClose: () => void; city: City | null; mode: 'add' | 'edit' }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(city?.name ?? '');

  // Auto-generate slug from name
  const autoSlug = `/self-drive-cars-in-${name.toLowerCase().replace(/\s+/g, '-')}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = mode === 'edit' && city
      ? await updateCity(city.id, formData)
      : await createCity(formData);
    setLoading(false);
    if (res?.success) onClose();
    else alert('Error: ' + res?.error);
  }

  if (!isOpen) return null;
  const isEdit = mode === 'edit';
  const accent = isEdit ? 'text-yellow-400' : 'text-brand-neon';
  const btnClass = isEdit ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-brand-neon hover:bg-brand-hover';

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[560px] bg-[#0A0A0A] border-l border-white/10 z-50 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className={`text-sm font-black uppercase tracking-widest ${accent}`}>
              {isEdit ? '✎ EDIT CITY HUB' : '+ PROVISION CITY HUB'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">City Name</label>
                <input name="name" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jodhpur"
                  className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">
                  SEO URL Slug <span className="text-white/20">(auto-generated, editable)</span>
                </label>
                <input name="slug" defaultValue={city?.slug ?? autoSlug} key={autoSlug}
                  placeholder="/self-drive-cars-in-jodhpur"
                  className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-brand-neon outline-none font-mono focus:border-brand-neon/40 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">FAQ Schema Question</label>
                <input name="faqQuestion" defaultValue={city?.faqQuestion ?? ''}
                  placeholder="e.g. Is pickup available at Udaipur airport?"
                  className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">FAQ Schema Answer</label>
                <textarea name="faqAnswer" defaultValue={city?.faqAnswer ?? ''} rows={3}
                  placeholder="e.g. Yes, we provide premium airport pickup..."
                  className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors resize-none" />
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit"
                className={`w-full ${btnClass} text-black px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(196,240,0,0.1)]`}>
                {loading ? 'SAVING...' : isEdit ? 'SAVE CHANGES' : 'PUBLISH CITY HUB'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function CitiesClient({ cities }: { cities: City[] }) {
  const [list, setList] = useState<City[]>(cities);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = search
    ? list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : list;

  async function handleDelete(id: string) {
    if (!confirm('Remove this city? All linked vehicles, tours, and villas will lose this city assignment.')) return;
    setDeletingId(id);
    await deleteCity(id);
    setList(prev => prev.filter(c => c.id !== id));
    setDeletingId(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight mb-1">MULTI-CITY EXPANSION AND SEO CORRIDORS</h1>
          <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Add target cities, set search query schema descriptors, and configure landing slugs.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cities..."
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-brand-neon transition-all font-mono" />
          </div>
          <button onClick={() => setShowAdd(true)}
            className="bg-brand-neon hover:bg-brand-hover text-black px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap shadow-[0_0_15px_rgba(196,240,0,0.15)]">
            <Plus size={15} /> Add City
          </button>
        </div>
      </div>

      {/* City Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        {filtered.map(city => {
          const isDeleting = deletingId === city.id;
          return (
            <div key={city.id}
              className={`bg-[#111111] border border-white/5 hover:border-white/10 rounded-2xl p-6 relative overflow-hidden group transition-all ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>

              {/* Glow */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-neon/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center text-brand-neon">
                    <Globe size={18} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-widest">{city.name}</h3>
                </div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingCity(city)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-brand-neon/10 hover:text-brand-neon text-white/40 flex items-center justify-center transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(city.id)}
                    className="w-8 h-8 rounded-xl bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 flex items-center justify-center transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-[8px] text-white/30 font-mono tracking-widest uppercase mb-1">SEO URL Slug</div>
                  <div className="text-brand-neon font-mono text-[10px] truncate">{city.slug || `/self-drive-cars-in-${city.name.toLowerCase()}`}</div>
                </div>
                {city.faqQuestion && (
                  <div>
                    <div className="text-[8px] text-white/30 font-mono tracking-widest uppercase mb-1">FAQ Question</div>
                    <div className="text-white/60 font-mono text-[9px] leading-relaxed line-clamp-2">{city.faqQuestion}</div>
                  </div>
                )}
                {city.faqAnswer && (
                  <div>
                    <div className="text-[8px] text-white/30 font-mono tracking-widest uppercase mb-1">FAQ Answer</div>
                    <div className="text-white/40 font-mono text-[9px] leading-relaxed line-clamp-2">{city.faqAnswer}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-white/20 font-mono text-sm border border-dashed border-white/10 rounded-3xl">
            {search ? `No cities matching "${search}"` : 'No cities configured. Add one to begin.'}
          </div>
        )}
      </div>

      <CityDrawer isOpen={showAdd} onClose={() => setShowAdd(false)} city={null} mode="add" />
      <CityDrawer isOpen={!!editingCity} onClose={() => setEditingCity(null)} city={editingCity} mode="edit" />
    </>
  );
}
