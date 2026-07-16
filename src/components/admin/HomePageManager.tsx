'use client';

import { useState } from 'react';
import { updateHomePage } from '@/app/admin/actions';
import { Globe, Save, X, RefreshCw, CheckCircle } from 'lucide-react';
import ImageUpload from './ImageUpload';

export default function HomePageManager({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Google Reviews sync state (no Place ID needed — searchId baked into env)
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(
    initialData?.siteSettings?.lastReviewSync
      ? new Date(initialData.siteSettings.lastReviewSync).toLocaleString('en-IN')
      : null
  );
  const [callsUsed, setCallsUsed] = useState<number>(initialData?.siteSettings?.reviewSyncMonthCount || 0);
  const MONTHLY_LIMIT = 24;

  const handleSyncReviews = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/admin/sync-reviews', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setSyncResult({ type: 'error', text: data.error || 'Sync failed.' });
      } else {
        setSyncResult({ type: 'success', text: data.message || `Synced ${data.synced} reviews.` });
        setLastSync(new Date().toLocaleString('en-IN'));
        if (data.callsUsedThisMonth !== undefined) setCallsUsed(data.callsUsedThisMonth);
      }
    } catch (e: any) {
      setSyncResult({ type: 'error', text: e.message || 'Network error.' });
    } finally {
      setSyncLoading(false);
    }
  };

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
    selfDriveImage: initialData?.selfDriveImage || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80',
    chauffeurImage: initialData?.chauffeurImage || 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
    airportTransferImage: initialData?.airportTransferImage || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Self Drive Card Image
              </label>
              <ImageUpload
                value={formData.selfDriveImage}
                onChange={(val) => setFormData({ ...formData, selfDriveImage: val })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Taxi Service Card Image
              </label>
              <ImageUpload
                value={formData.chauffeurImage}
                onChange={(val) => setFormData({ ...formData, chauffeurImage: val })}
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Airport Transfer Card Image
              </label>
              <ImageUpload
                value={formData.airportTransferImage}
                onChange={(val) => setFormData({ ...formData, airportTransferImage: val })}
              />
            </div>
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

        {/* ── Google Reviews Integration ── */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-blue-700 mb-1">Google Reviews Auto-Sync</h2>
              <p className="text-xs text-blue-500">Powered by RapidAPI scraper · Reviews update on the homepage after each sync.</p>
            </div>
            {/* Usage meter */}
            <div className="text-right shrink-0 ml-4">
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">This Month</div>
              <div className={`text-lg font-black ${callsUsed >= MONTHLY_LIMIT ? 'text-red-600' : callsUsed >= 20 ? 'text-amber-600' : 'text-blue-700'}`}>
                {callsUsed} <span className="text-xs font-mono text-blue-400">/ {MONTHLY_LIMIT}</span>
              </div>
              <div className="text-[9px] text-blue-400 font-mono">API calls used</div>
              {/* Usage bar */}
              <div className="w-24 h-1.5 bg-blue-100 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${callsUsed >= MONTHLY_LIMIT ? 'bg-red-500' : callsUsed >= 20 ? 'bg-amber-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (callsUsed / MONTHLY_LIMIT) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={handleSyncReviews}
                disabled={syncLoading || callsUsed >= MONTHLY_LIMIT}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={13} className={syncLoading ? 'animate-spin' : ''} />
                {syncLoading ? 'Syncing...' : callsUsed >= MONTHLY_LIMIT ? 'Limit Reached' : 'Sync Google Reviews Now'}
              </button>
              {lastSync && (
                <span className="text-[10px] text-blue-400 font-mono">Last synced: {lastSync}</span>
              )}
            </div>

            {syncResult && (
              <div className={`text-xs font-mono px-4 py-3 rounded-xl flex items-center gap-2 ${
                syncResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <CheckCircle size={13} />
                {syncResult.text}
              </div>
            )}

            {callsUsed >= 20 && callsUsed < MONTHLY_LIMIT && (
              <div className="text-[10px] text-amber-600 font-mono bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                ⚠ {MONTHLY_LIMIT - callsUsed} calls remaining this month. Use sparingly.
              </div>
            )}
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
