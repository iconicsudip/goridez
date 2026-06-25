'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { addTour } from '@/app/admin/actions';
import ImageUpload from './ImageUpload';

interface TourDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cities: any[];
}

export default function TourDrawer({ isOpen, onClose, cities }: TourDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setImageUrl('');
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await addTour(formData);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      alert("Failed to save: " + res.error);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] lg:w-[800px] bg-white border-l border-gray-300 z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-green-700">+</span> CRAFT NEW EXPERIENCE TOUR
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">TOUR TITLE</label>
              <input name="title" required type="text" placeholder="E.G. ROYAL RAJASTHAN HERITAGE" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">SHORT DESCRIPTION</label>
              <textarea name="description" required rows={3} placeholder="Explore the magnificent forts..." className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400 resize-none"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">IMAGE BANNER URL</label>
                <input type="hidden" name="image" value={imageUrl} />
                <ImageUpload value={imageUrl} onChange={setImageUrl} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">DURATION (DAYS)</label>
                <input name="duration" required type="number" min="1" placeholder="5" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">ADULT PRICE (INR)</label>
                <input name="adultPrice" required type="number" placeholder="45000" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">CHILD PRICE (INR)</label>
                <input name="childPrice" required type="number" placeholder="20000" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">BASE CITY HUB</label>
              <select name="cityId" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-gray-400 appearance-none">
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                {cities.length === 0 && <option value="">No cities configured</option>}
              </select>
            </div>

            <div className="pt-8">
              <button disabled={loading} type="submit" className="w-full bg-green-600 hover:bg-brand-hover text-black px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)] disabled:opacity-50">
                {loading ? 'WRITING...' : 'PUBLISH TOUR EXPERIENCE'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
