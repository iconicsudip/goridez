'use client';

import { useState } from 'react';
import { updateHomePage } from '@/app/admin/actions';
import { Globe, Save, X } from 'lucide-react';
import ImageUpload from './ImageUpload';

export default function HomePageManager({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    heroBadge: initialData?.heroBadge || '✦ PREMIUM TRANSPORTATION',
    heroTitleLine1: initialData?.heroTitleLine1 || 'EXPLORE RAJASTHAN',
    heroTitleLine2: initialData?.heroTitleLine2 || 'WITH FREEDOM',
    heroDescription: initialData?.heroDescription || 'Premium self drive cars, chauffeur services, luxury villas and curated Rajasthan travel experiences. Built specifically for elite global explorers.',
    heroBgImage: initialData?.heroBgImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2500&q=80',
    heroVideoUrl: initialData?.heroVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-luxury-car-parked-at-night-42289-large.mp4',
    
    seamlessBadge: initialData?.seamlessBadge || 'Discover the Mewar Heritage',
    seamlessTitle: initialData?.seamlessTitle || 'SEAMLESS',
    seamlessTitleHighlight: initialData?.seamlessTitleHighlight || 'EXPERIENCES',
    seamlessDescription: initialData?.seamlessDescription || 'Navigate through our curated premium transportation lists and elite private escapes.',
    
    vehiclesBadge: initialData?.vehiclesBadge || 'Real Automotive Collection',
    vehiclesTitle: initialData?.vehiclesTitle || 'VEHICLE',
    vehiclesTitleHighlight: initialData?.vehiclesTitleHighlight || 'COLLECTION',
    vehiclesDescription: initialData?.vehiclesDescription || 'Select key luxury automotive segments vetting senior brand names (Maruti Suzuki, Hyundai, Kia, Mahindra, Tata).',
    
    villasBadge: initialData?.villasBadge || 'Royal Residency Alliance',
    villasTitle: initialData?.villasTitle || 'VILLAS',
    villasTitleHighlight: initialData?.villasTitleHighlight || '& CAR BUNDLES',
    villasDescription: initialData?.villasDescription || 'Five-star private villas paired directly with vetted SUVs in a single unified concierge booking.',
    
    toursTitle: initialData?.toursTitle || 'PREMIUM TOUR',
    toursTitleHighlight: initialData?.toursTitleHighlight || 'EXPERIENCES',
    toursDescription: initialData?.toursDescription || 'Skip lines directly. Access private expert guided itineraries covering historical temples and Mewar fortresses.',
    
    blogsBadge: initialData?.blogsBadge || 'GoRidez Editorial Journal',
    blogsTitle: initialData?.blogsTitle || 'FEATURED',
    blogsTitleHighlight: initialData?.blogsTitleHighlight || 'STORIES',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    const res = await updateHomePage(data);
    setLoading(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Home Page content updated successfully!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save changes.' });
    }
  };

  const renderSectionHeader = (title: string) => (
    <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-4 mb-4 mt-8">
      {title}
    </h2>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            <Globe className="text-green-700" size={32} /> Home Page Editor
          </h1>
          <p className="text-gray-500 text-[13px]">
            Manage the content blocks, catchy titles, and hero banner for the landing page.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl mb-6 text-xs font-mono border flex justify-between items-center ${
            statusMsg.type === 'success'
              ? 'bg-[#00FF66]/5 border-[#00FF66]/20 text-[#00FF66]'
              : 'bg-red-500/5 border-red-500/20 text-red-400'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="opacity-50 hover:opacity-100" type="button">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8">
          
          {/* HERO SECTION */}
          {renderSectionHeader('Hero Section')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Hero Badge
              </label>
              <input
                type="text" name="heroBadge" value={formData.heroBadge} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
              />
            </div>
             <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Hero Banner Image URL
              </label>
              <ImageUpload
                value={formData.heroBgImage}
                onChange={(val) => setFormData({ ...formData, heroBgImage: val })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Hero Banner Video URL
              </label>
              <ImageUpload
                value={formData.heroVideoUrl}
                onChange={(val) => setFormData({ ...formData, heroVideoUrl: val })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Title Line 1
              </label>
              <input
                type="text" name="heroTitleLine1" value={formData.heroTitleLine1} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Title Line 2 (Highlighted)
              </label>
              <input
                type="text" name="heroTitleLine2" value={formData.heroTitleLine2} onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
              Hero Description
            </label>
            <textarea
              name="heroDescription" value={formData.heroDescription} onChange={handleChange}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors h-24"
            />
          </div>

          {/* SEAMLESS EXPERIENCES */}
          {renderSectionHeader('Seamless Experiences Section')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Section Badge</label>
              <input type="text" name="seamlessBadge" value={formData.seamlessBadge} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title</label>
              <input type="text" name="seamlessTitle" value={formData.seamlessTitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title Highlight</label>
              <input type="text" name="seamlessTitleHighlight" value={formData.seamlessTitleHighlight} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Description</label>
            <textarea name="seamlessDescription" value={formData.seamlessDescription} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors h-20" />
          </div>

          {/* VEHICLES SECTION */}
          {renderSectionHeader('Vehicles Section')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Section Badge</label>
              <input type="text" name="vehiclesBadge" value={formData.vehiclesBadge} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title</label>
              <input type="text" name="vehiclesTitle" value={formData.vehiclesTitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title Highlight</label>
              <input type="text" name="vehiclesTitleHighlight" value={formData.vehiclesTitleHighlight} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Description</label>
            <textarea name="vehiclesDescription" value={formData.vehiclesDescription} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors h-20" />
          </div>

          {/* VILLAS SECTION */}
          {renderSectionHeader('Villas Section')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Section Badge</label>
              <input type="text" name="villasBadge" value={formData.villasBadge} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title</label>
              <input type="text" name="villasTitle" value={formData.villasTitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title Highlight</label>
              <input type="text" name="villasTitleHighlight" value={formData.villasTitleHighlight} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Description</label>
            <textarea name="villasDescription" value={formData.villasDescription} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors h-20" />
          </div>

          {/* TOURS SECTION */}
          {renderSectionHeader('Tours Section')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title</label>
              <input type="text" name="toursTitle" value={formData.toursTitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title Highlight</label>
              <input type="text" name="toursTitleHighlight" value={formData.toursTitleHighlight} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Description</label>
            <textarea name="toursDescription" value={formData.toursDescription} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors h-20" />
          </div>

          {/* BLOGS SECTION */}
          {renderSectionHeader('Blogs / Journal Section')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Section Badge</label>
              <input type="text" name="blogsBadge" value={formData.blogsBadge} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title</label>
              <input type="text" name="blogsTitle" value={formData.blogsTitle} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">Title Highlight</label>
              <input type="text" name="blogsTitleHighlight" value={formData.blogsTitleHighlight} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors" />
            </div>
          </div>

        </div>

        {/* Submit */}
        <div className="flex justify-end sticky bottom-6 z-50">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-brand-hover text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(196,240,0,0.4)] flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
