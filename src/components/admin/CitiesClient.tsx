'use client';

import { useState } from 'react';
import {
  Globe, Pencil, Trash2, Plus, X, ArrowRight, Check, Search, Image as ImageIcon
} from 'lucide-react';
import { updateCity, deleteCity, createCity, updateCitiesPageBanner } from '@/app/admin/actions';
import ImageUpload from '@/components/admin/ImageUpload';
import { Save } from 'lucide-react';

interface City {
  id: string;
  name: string;
  slug: string | null;
  banner: string | null;
  faqQuestion: string | null;
  faqAnswer: string | null;
  airportName: string | null;
}

function CityDrawer({ isOpen, onClose, city, mode }: { isOpen: boolean; onClose: () => void; city: City | null; mode: 'add' | 'edit' }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(city?.name ?? '');
  const [banner, setBanner] = useState(city?.banner ?? '');

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
  const accent = isEdit ? 'text-yellow-400' : 'text-green-700';
  const btnClass = isEdit ? 'bg-yellow-400 hover:bg-yellow-300' : 'bg-green-600 hover:bg-brand-hover';

  return (
    <>
      <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[560px] bg-white border-l border-gray-300 z-50 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className={`text-sm font-black uppercase tracking-widest ${accent}`}>
              {isEdit ? '✎ EDIT CITY HUB' : '+ PROVISION CITY HUB'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-colors"><X size={20} /></button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <input type="hidden" name="banner" value={banner} />

            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">City Name</label>
                <input name="name" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Jodhpur"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">
                  SEO URL Slug <span className="text-gray-400">(auto-generated, editable)</span>
                </label>
                <input name="slug" defaultValue={city?.slug ?? autoSlug} key={autoSlug}
                  placeholder="/self-drive-cars-in-jodhpur"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-green-700 outline-none font-mono focus:border-green-600/40 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">
                  City Hero Image / Banner URL
                </label>
                <ImageUpload
                  value={banner}
                  onChange={setBanner}
                  placeholder="Upload or paste Hero Banner image URL for this city"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">
                  Airport Name <span className="text-gray-400">(shown in Airport Transfer booking)</span>
                </label>
                <input name="airportName" defaultValue={city?.airportName ?? ''}
                  placeholder="e.g. Maharana Pratap Airport (UDR)"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">FAQ Schema Question</label>
                <input name="faqQuestion" defaultValue={city?.faqQuestion ?? ''}
                  placeholder="e.g. Is pickup available at Udaipur airport?"
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">FAQ Schema Answer</label>
                <textarea name="faqAnswer" defaultValue={city?.faqAnswer ?? ''} rows={3}
                  placeholder="e.g. Yes, we provide premium airport pickup..."
                  className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors resize-none" />
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

export default function CitiesClient({ cities, initialSiteSettings }: { cities: City[]; initialSiteSettings?: any }) {
  const [list, setList] = useState<City[]>(cities);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [citiesPageBanner, setCitiesPageBanner] = useState<string>(
    initialSiteSettings?.citiesPageBanner || 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1800&q=80'
  );
  const [savingBanner, setSavingBanner] = useState(false);

  async function handleSavePageBanner() {
    setSavingBanner(true);
    const res = await updateCitiesPageBanner(citiesPageBanner);
    setSavingBanner(false);
    if (res?.success) {
      alert('Cities Page Main Hero Banner updated successfully!');
    } else {
      alert('Error updating banner: ' + res?.error);
    }
  }

  const filtered = search
    ? list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : list;

  async function handleDelete(id: string) {
    if (!confirm('Remove this city? This cannot be undone.')) return;
    setDeletingId(id);
    const res = await deleteCity(id);
    if (res?.success) {
      setList(prev => prev.filter(c => c.id !== id));
    } else {
      alert(res?.error || 'Failed to delete city.');
    }
    setDeletingId(null);
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight mb-1">MULTI-CITY EXPANSION AND SEO CORRIDORS</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Upload public /cities page hero image, manage city hubs, and configure landing slugs.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search cities..."
              className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-xs text-gray-900 focus:outline-none focus:border-green-600 transition-all font-mono" />
          </div>
          <button onClick={() => setShowAdd(true)}
            className="bg-green-600 hover:bg-brand-hover text-black px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap shadow-[0_0_15px_rgba(196,240,0,0.15)]">
            <Plus size={15} /> Add City
          </button>
        </div>
      </div>

      {/* PUBLIC CITIES PAGE HERO BANNER UPLOADER */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 mb-10 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <ImageIcon size={18} className="text-green-600" /> PUBLIC CITIES PAGE MAIN HERO BANNER (/cities)
            </h2>
            <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">
              This hero image is displayed at the top of the main public /cities page where vehicles, villas & tours are listed city-wise.
            </p>
          </div>
          <button
            onClick={handleSavePageBanner}
            disabled={savingBanner}
            className="bg-green-600 hover:bg-brand-hover text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            <Save size={14} /> {savingBanner ? 'SAVING...' : 'SAVE HERO BANNER'}
          </button>
        </div>
        <ImageUpload
          value={citiesPageBanner}
          onChange={setCitiesPageBanner}
          placeholder="Upload or paste Hero Banner image URL for /cities page"
        />
      </div>

      {/* City Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        {filtered.map(city => {
          const isDeleting = deletingId === city.id;
          return (
            <div key={city.id}
              className={`bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-2xl overflow-hidden relative group transition-all ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}>

              {/* Banner Image Header */}
              <div className="relative w-full h-36 bg-gray-200 overflow-hidden border-b border-gray-200">
                {city.banner ? (
                  <img
                    src={city.banner}
                    alt={`${city.name} hero banner`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200/80 text-gray-400 gap-1">
                    <ImageIcon size={24} />
                    <span className="text-[9px] font-mono uppercase tracking-widest">No Hero Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                    <Globe size={16} />
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-xl backdrop-blur-sm">
                    <button onClick={() => setEditingCity(city)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/30 text-white flex items-center justify-center transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(city.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 flex items-center justify-center transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <h3 className="absolute bottom-3 left-4 text-base font-black uppercase tracking-widest text-white drop-shadow-md z-10">{city.name}</h3>
              </div>

              <div className="p-6 space-y-3">
                <div>
                  <div className="text-[8px] text-gray-400 font-mono tracking-widest uppercase mb-1">SEO URL Slug</div>
                  <div className="text-green-700 font-mono text-[10px] truncate">{city.slug || `/self-drive-cars-in-${city.name.toLowerCase()}`}</div>
                </div>
                {city.airportName && (
                  <div>
                    <div className="text-[8px] text-gray-400 font-mono tracking-widest uppercase mb-1">Airport</div>
                    <div className="text-gray-600 font-mono text-[9px] leading-relaxed line-clamp-2">{city.airportName}</div>
                  </div>
                )}
                {city.faqQuestion && (
                  <div>
                    <div className="text-[8px] text-gray-400 font-mono tracking-widest uppercase mb-1">FAQ Question</div>
                    <div className="text-gray-600 font-mono text-[9px] leading-relaxed line-clamp-2">{city.faqQuestion}</div>
                  </div>
                )}
                {city.faqAnswer && (
                  <div>
                    <div className="text-[8px] text-gray-400 font-mono tracking-widest uppercase mb-1">FAQ Answer</div>
                    <div className="text-gray-500 font-mono text-[9px] leading-relaxed line-clamp-2">{city.faqAnswer}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400 font-mono text-sm border border-dashed border-gray-300 rounded-3xl">
            {search ? `No cities matching "${search}"` : 'No cities configured. Add one to begin.'}
          </div>
        )}
      </div>

      <CityDrawer isOpen={showAdd} onClose={() => setShowAdd(false)} city={null} mode="add" />
      <CityDrawer isOpen={!!editingCity} onClose={() => setEditingCity(null)} city={editingCity} mode="edit" />
    </>
  );
}
