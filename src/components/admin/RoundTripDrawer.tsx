'use client';

import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { addRoundTripRoute, updateRoundTripRoute } from '@/app/admin/actions';

export default function RoundTripDrawer({ isOpen, onClose, cities, route }: any) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      cityId: formData.get('cityId'),
      routeTitle: formData.get('routeTitle'),
      distanceKm: parseInt(formData.get('distanceKm') as string) || 0,
      sedan1D: parseFloat(formData.get('sedan1D') as string) || 0,
      sedan2D: parseFloat(formData.get('sedan2D') as string) || 0,
      sedan3D: parseFloat(formData.get('sedan3D') as string) || 0,
      suv1D: parseFloat(formData.get('suv1D') as string) || 0,
      suv2D: parseFloat(formData.get('suv2D') as string) || 0,
      suv3D: parseFloat(formData.get('suv3D') as string) || 0,
      crysta1D: parseFloat(formData.get('crysta1D') as string) || 0,
      crysta2D: parseFloat(formData.get('crysta2D') as string) || 0,
      crysta3D: parseFloat(formData.get('crysta3D') as string) || 0,
      luxury1D: parseFloat(formData.get('luxury1D') as string) || 0,
      luxury2D: parseFloat(formData.get('luxury2D') as string) || 0,
      luxury3D: parseFloat(formData.get('luxury3D') as string) || 0,
      nightAllowance: parseFloat(formData.get('nightAllowance') as string) || 0,
    };

    let res;
    if (route?.id) {
      res = await updateRoundTripRoute(route.id, data);
    } else {
      res = await addRoundTripRoute(data);
    }

    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      alert('Error: ' + res.error);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[640px] lg:w-[860px] bg-[#0A0A0A] border-l border-white/10 z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-brand-neon">{route ? '✎' : '+'}</span> {route ? 'EDIT ROUND TRIP ROUTE' : 'ADD ROUND TRIP ROUTE'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">City Hub *</label>
                  <select name="cityId" required defaultValue={route?.cityId || ''} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors appearance-none">
                    <option value="" disabled>Select City</option>
                    {cities.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Distance (KM) *</label>
                  <input name="distanceKm" type="number" required defaultValue={route?.distanceKm || ''} placeholder="e.g. 150"
                    className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Route Title *</label>
                <input name="routeTitle" type="text" required defaultValue={route?.routeTitle || ''} placeholder="e.g. Udaipur - Kumbhalgarh"
                  className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Night Allowance (₹) *</label>
                <input name="nightAllowance" type="number" required defaultValue={route?.nightAllowance ?? 300} placeholder="e.g. 300"
                  className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
              </div>

              {/* Pricing Matrix */}
              <div className="border-t border-white/5 pt-8">
                <p className="text-[9px] text-brand-neon font-mono uppercase tracking-widest mb-5">— Pricing Configuration</p>
                
                {[
                  { label: 'Sedan', prefix: 'sedan' },
                  { label: 'SUV', prefix: 'suv' },
                  { label: 'Crysta', prefix: 'crysta' },
                  { label: 'Luxury', prefix: 'luxury' },
                ].map(cat => (
                  <div key={cat.prefix} className="mb-6 bg-[#111111] p-5 rounded-2xl border border-white/5">
                    <h3 className="text-[10px] font-bold text-white mb-4 uppercase tracking-widest">{cat.label} Pricing</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">1 Day (₹)</label>
                        <input name={`${cat.prefix}1D`} type="number" required defaultValue={route?.[`${cat.prefix}1D`] || ''} placeholder="0"
                          className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">2 Days (₹)</label>
                        <input name={`${cat.prefix}2D`} type="number" required defaultValue={route?.[`${cat.prefix}2D`] || ''} placeholder="0"
                          className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">3 Days (₹)</label>
                        <input name={`${cat.prefix}3D`} type="number" required defaultValue={route?.[`${cat.prefix}3D`] || ''} placeholder="0"
                          className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit"
                className="w-full bg-brand-neon hover:bg-brand-hover text-black px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)] disabled:opacity-50">
                {loading ? 'SAVING...' : 'SAVE ROUTE'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
