'use client';

import { useState } from 'react';
import { X, ArrowRight, Plus, Trash2, Check } from 'lucide-react';
import { updateVehicle } from '@/app/admin/actions';
import ImageUpload from './ImageUpload';
import { useEffect } from 'react';
import RichTextEditor from './RichTextEditor';

interface EditVehicleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  car: any;
  cities: any[];
  tiers: any[];
}

export default function EditVehicleDrawer({ isOpen, onClose, car, cities, tiers }: EditVehicleDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>(car?.cityId ? [car.cityId] : []);
  const [packages, setPackages] = useState<any[]>(
    car?.packages?.map((p: any) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      basePrice: String(p.basePrice),
      limitValue: String(p.limitValue ?? ''),
      extraChargePerUnit: String(p.extraChargePerUnit ?? ''),
      deposit: String(p.deposit),
    })) ?? []
  );
  const [imageUrl, setImageUrl] = useState(car?.image || '');
  const [content, setContent] = useState(car?.content || '');
  const [serviceTypes, setServiceTypes] = useState<string[]>(car?.serviceTypes || ['SELF_DRIVE']);

  useEffect(() => {
    if (isOpen && car) {
      setImageUrl(car.image || '');
      setSelectedCityIds(car.cityId ? [car.cityId] : []);
      setPackages(
        car.packages?.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          basePrice: String(p.basePrice),
          limitValue: String(p.limitValue ?? ''),
          extraChargePerUnit: String(p.extraChargePerUnit ?? ''),
          deposit: String(p.deposit),
        })) ?? []
      );
      setContent(car.content || '');
      setServiceTypes(car.serviceTypes || ['SELF_DRIVE']);
    } else {
      setImageUrl('');
      setContent('');
      setServiceTypes(['SELF_DRIVE']);
    }
  }, [car, isOpen]);

  function toggleCity(id: string) {
    setSelectedCityIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  function addBlankPackage() {
    setPackages(prev => [...prev, { id: crypto.randomUUID(), name: '', type: 'KM', basePrice: '', limitValue: '', extraChargePerUnit: '', deposit: '' }]);
  }

  function addFromTier(tier: any) {
    const limitMatch = tier.limitInfo.match(/^(\d+)/);
    const limitValue = limitMatch ? limitMatch[1] : '';
    setPackages(prev => [...prev, { id: crypto.randomUUID(), name: tier.name, type: tier.type === 'HOURS' ? 'HOUR' : tier.type === 'KM' ? 'KM' : 'TRANSFER', basePrice: '', limitValue, extraChargePerUnit: '', deposit: '' }]);
  }

  function updatePackage(id: string, field: string, value: string) {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  function removePackage(id: string) {
    setPackages(prev => prev.filter(p => p.id !== id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('packages', JSON.stringify(packages));
    formData.set('cityIds', JSON.stringify(selectedCityIds));
    formData.set('content', content);
    formData.set('serviceTypes', JSON.stringify(serviceTypes));
    const res = await updateVehicle(car.id, formData);
    setLoading(false);
    if (res.success) onClose();
    else alert('Update failed: ' + res.error);
  }

  if (!isOpen || !car) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[640px] lg:w-[860px] bg-[#0A0A0A] border-l border-white/10 z-50 shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-yellow-400">✎</span> EDIT — {car.make} {car.model}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form key={car.id} className="space-y-8" onSubmit={handleSubmit}>
            {/* Identity */}
            <div>
              <p className="text-[9px] text-yellow-400 font-mono uppercase tracking-widest mb-5">— Vehicle Identity</p>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Vehicle Name</label>
                    <input name="vehicleName" required defaultValue={`${car.make} ${car.model}`}
                      className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-yellow-400/40 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Segment Type</label>
                    <select name="segmentType" defaultValue={car.category} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-yellow-400/40 transition-colors appearance-none">
                      <option>Luxury Class</option><option>SUV</option><option>Sedan</option><option>Tempo</option><option>Innova</option><option>Hatchback</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Image URL</label>
                  <input type="hidden" name="imageUrl" value={imageUrl} />
                  <ImageUpload value={imageUrl} onChange={setImageUrl} />
                </div>
                <div className="grid grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Fuel</label>
                    <select name="fuelType" defaultValue={car.fuelType} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono appearance-none">
                      <option>Petrol</option><option>Diesel</option><option>EV</option><option>Hybrid</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Transmission</label>
                    <select name="transmission" defaultValue={car.transmission} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono appearance-none">
                      <option>Automatic Gearbox</option><option>Manual Gearbox</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Seats</label>
                    <select name="seatingCapacity" defaultValue={String(car.seatingCapacity)} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono appearance-none">
                      <option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest">Availability</label>
                  <div className="flex gap-3">
                    {['true', 'false'].map(v => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="availability" value={v} defaultChecked={String(car.availability) === v} className="accent-brand-neon" />
                        <span className="text-[10px] font-mono text-white/60">{v === 'true' ? 'Available' : 'Unavailable'}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* City Multi-Select */}
            {/* ── SECTION: SERVICE TYPES ── */}
            <div className="border-t border-white/5 pt-8">
              <p className="text-[9px] text-brand-neon font-mono uppercase tracking-widest mb-4">— Categorization</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'SELF_DRIVE', label: 'Self Drive' },
                  { id: 'WITH_DRIVER', label: 'With Driver' },
                  { id: 'TAXI', label: 'One Way / Round Trip' },
                  { id: 'VILLA', label: 'Villa + Car' },
                  { id: 'TOUR', label: 'Tour Packages' }
                ].map(type => {
                  const checked = serviceTypes.includes(type.id);
                  return (
                    <label key={type.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all ${checked ? 'bg-brand-neon/10 border-brand-neon text-brand-neon' : 'bg-[#111111] border-white/10 text-white/50 hover:border-white/30'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={checked} 
                        onChange={(e) => {
                          if (e.target.checked) setServiceTypes([...serviceTypes, type.id]);
                          else setServiceTypes(serviceTypes.filter(t => t !== type.id));
                        }} 
                      />
                      {checked && <Check size={12} strokeWidth={3} />}
                      {type.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 mt-8">
              <p className="text-[9px] text-yellow-400 font-mono uppercase tracking-widest mb-4">— City Coverage</p>
              <div className="flex flex-wrap gap-2">
                {cities.map(c => {
                  const selected = selectedCityIds.includes(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleCity(c.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${selected ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' : 'bg-[#111111] border-white/10 text-white/50 hover:border-white/30'}`}>
                      {selected && <Check size={11} strokeWidth={3} />}{c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Packages */}
            <div className="border-t border-white/5 pt-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[9px] text-yellow-400 font-mono uppercase tracking-widest">— Pricing Packages</p>
                <button type="button" onClick={addBlankPackage} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-yellow-400 border border-white/10 hover:border-yellow-400/40 px-3 py-1.5 rounded-lg transition-all">
                  <Plus size={11} /> Add
                </button>
              </div>
              {tiers.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tiers.map(tier => (
                    <button key={tier.id} type="button" onClick={() => addFromTier(tier)}
                      className="text-[9px] font-mono px-3 py-1.5 rounded-xl border border-white/10 text-white/40 hover:text-yellow-400 hover:border-yellow-400/40 transition-all">
                      + {tier.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="space-y-4">
                {packages.map((pkg, idx) => (
                  <div key={pkg.id} className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4 relative group hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-white/30 font-mono uppercase">Package #{idx + 1}</span>
                      <button type="button" onClick={() => removePackage(pkg.id)} className="opacity-0 group-hover:opacity-100 text-red-500 p-1.5 rounded-lg hover:bg-red-500/10 transition-all"><Trash2 size={13} /></button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Name</label>
                        <input value={pkg.name} onChange={e => updatePackage(pkg.id, 'name', e.target.value)} required placeholder="e.g. 120 KM Package"
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-yellow-400/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Type</label>
                        <select value={pkg.type} onChange={e => updatePackage(pkg.id, 'type', e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono appearance-none">
                          <option value="KM">KM</option><option value="HOUR">HOUR</option><option value="TRANSFER">TRANSFER</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Base Price (₹)', field: 'basePrice', ph: '4500' },
                        { label: `Limit (${pkg.type === 'HOUR' ? 'Hrs' : 'KM'})`, field: 'limitValue', ph: '120' },
                        { label: 'Extra/Unit (₹)', field: 'extraChargePerUnit', ph: '40' },
                        { label: 'Deposit (₹)', field: 'deposit', ph: '5000' },
                      ].map(({ label, field, ph }) => (
                        <div key={field} className="space-y-1.5">
                          <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">{label}</label>
                          <input value={(pkg as any)[field]} onChange={e => updatePackage(pkg.id, field, e.target.value)} type="number" min="0" placeholder={ph}
                            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-yellow-400/40 transition-colors" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {packages.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-white/30 text-[10px] font-mono">No packages. Add from tiers above or click Add.</div>
                )}
              </div>
            </div>

            {/* ── SECTION: RICH CONTENT ── */}
            <div className="border-t border-white/5 pt-8">
              <p className="text-[9px] text-yellow-400 font-mono uppercase tracking-widest mb-4">— Detailed Vehicle Content</p>
              <RichTextEditor value={content} onChange={setContent} placeholder="Add detailed descriptions, rules, or special notes..." />
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit" className="w-full bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(250,204,21,0.15)] disabled:opacity-50">
                {loading ? 'SAVING...' : 'SAVE CHANGES'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
