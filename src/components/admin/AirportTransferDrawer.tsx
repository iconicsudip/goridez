'use client';

import { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { addAirportTransfer, updateAirportTransfer } from '@/app/admin/actions';

export default function AirportTransferDrawer({ isOpen, onClose, cities, transfer }: any) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      cityId: formData.get('cityId'),
      airport: formData.get('airport'),
      zone: formData.get('zone'),
      areaLocality: formData.get('areaLocality'),
      sedanPickup: parseFloat(formData.get('sedanPickup') as string) || 0,
      sedanDrop: parseFloat(formData.get('sedanDrop') as string) || 0,
      suvPickup: parseFloat(formData.get('suvPickup') as string) || 0,
      suvDrop: parseFloat(formData.get('suvDrop') as string) || 0,
      crystaPickup: parseFloat(formData.get('crystaPickup') as string) || 0,
      crystaDrop: parseFloat(formData.get('crystaDrop') as string) || 0,
      luxuryPickup: parseFloat(formData.get('luxuryPickup') as string) || 0,
      luxuryDrop: parseFloat(formData.get('luxuryDrop') as string) || 0,
      waitCharge: parseFloat(formData.get('waitCharge') as string) || 0,
      nightFee: parseFloat(formData.get('nightFee') as string) || 0,
      meetGreet: formData.get('meetGreet') === 'on',
    };

    let res;
    if (transfer?.id) {
      res = await updateAirportTransfer(transfer.id, data);
    } else {
      res = await addAirportTransfer(data);
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
              <span className="text-brand-neon">{transfer ? '✎' : '+'}</span> {transfer ? 'EDIT AIRPORT TRANSFER' : 'ADD AIRPORT TRANSFER'}
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
                  <select name="cityId" required defaultValue={transfer?.cityId || ''} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors appearance-none">
                    <option value="" disabled>Select City</option>
                    {cities.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Airport Code *</label>
                  <input name="airport" type="text" required defaultValue={transfer?.airport || 'UDR'} placeholder="e.g. UDR"
                    className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Zone *</label>
                  <input name="zone" type="text" required defaultValue={transfer?.zone || ''} placeholder="e.g. Zone A"
                    className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Area Locality *</label>
                  <input name="areaLocality" type="text" required defaultValue={transfer?.areaLocality || ''} placeholder="e.g. City Centre / Fateh Sagar"
                    className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Night Fee (₹) *</label>
                  <input name="nightFee" type="number" required defaultValue={transfer?.nightFee ?? 200} placeholder="e.g. 200"
                    className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Wait Charge / Hr (₹) *</label>
                  <input name="waitCharge" type="number" required defaultValue={transfer?.waitCharge ?? 150} placeholder="e.g. 150"
                    className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                </div>
              </div>

              <label className="flex items-center gap-3 bg-[#111111] border border-white/5 p-4 rounded-xl cursor-pointer">
                <input type="checkbox" name="meetGreet" defaultChecked={transfer?.meetGreet ?? true} className="w-4 h-4 accent-brand-neon" />
                <span className="text-xs text-white font-mono uppercase tracking-widest">Enable Meet & Greet Service</span>
              </label>

              {/* Pricing Matrix */}
              <div className="border-t border-white/5 pt-8">
                <p className="text-[9px] text-brand-neon font-mono uppercase tracking-widest mb-5">— Pricing Configuration</p>
                
                {[
                  { label: 'Sedan', prefix: 'sedan' },
                  { label: 'SUV', prefix: 'suv' },
                  { label: 'Crysta', prefix: 'crysta' },
                  { label: 'Luxury', prefix: 'luxury' },
                ].map(cat => (
                  <div key={cat.prefix} className="mb-4 bg-[#111111] p-5 rounded-2xl border border-white/5">
                    <h3 className="text-[10px] font-bold text-white mb-4 uppercase tracking-widest">{cat.label}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Pickup (₹)</label>
                        <input name={`${cat.prefix}Pickup`} type="number" required defaultValue={transfer?.[`${cat.prefix}Pickup`] || ''} placeholder="0"
                          className="w-full bg-[#050505] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Drop (₹)</label>
                        <input name={`${cat.prefix}Drop`} type="number" required defaultValue={transfer?.[`${cat.prefix}Drop`] || ''} placeholder="0"
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
                {loading ? 'SAVING...' : 'SAVE TRANSFER'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
