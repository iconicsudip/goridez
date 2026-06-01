'use client';

import { useState } from 'react';
import { X, ArrowRight, Plus, Trash2, Check, Tag, ChevronDown } from 'lucide-react';
import { addVehicle } from '@/app/admin/actions';

interface VehicleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cities: any[];
  tiers: any[]; // GlobalPackageTier[]
}

interface PackageRow {
  id: string;
  name: string;
  type: string;
  basePrice: string;
  limitValue: string;
  extraChargePerUnit: string;
  deposit: string;
}

const FEATURE_SUGGESTIONS = [
  'GPS Tracker', 'Android Auto', 'Apple CarPlay', 'Sunroof', 'Leather Seats',
  'AC', 'Rear Camera', 'Bluetooth', '4WD', 'Airbags', 'ABS', 'USB Charging',
  'Child Seat', 'First Aid Kit', 'Dashcam', 'Parking Sensors'
];

export default function VehicleDrawer({ isOpen, onClose, cities, tiers }: VehicleDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  function toggleCity(id: string) {
    setSelectedCityIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function addPackageFromTier(tier: any) {
    // Parse limitInfo to extract limit value e.g. "150 KM included limit" -> 150
    const limitMatch = tier.limitInfo.match(/^(\d+)/);
    const limitValue = limitMatch ? limitMatch[1] : '';
    setPackages(prev => [...prev, {
      id: crypto.randomUUID(),
      name: tier.name,
      type: tier.type === 'HOURS' ? 'HOUR' : tier.type === 'KM' ? 'KM' : 'TRANSFER',
      basePrice: '',
      limitValue,
      extraChargePerUnit: '',
      deposit: ''
    }]);
  }

  function addBlankPackage() {
    setPackages(prev => [...prev, {
      id: crypto.randomUUID(), name: '', type: 'KM', basePrice: '', limitValue: '', extraChargePerUnit: '', deposit: ''
    }]);
  }

  function updatePackage(id: string, field: keyof PackageRow, value: string) {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  function removePackage(id: string) {
    setPackages(prev => prev.filter(p => p.id !== id));
  }

  function addFeature(f: string) {
    const trimmed = f.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures(prev => [...prev, trimmed]);
    }
    setFeatureInput('');
    setShowSuggestions(false);
  }

  function removeFeature(f: string) {
    setFeatures(prev => prev.filter(x => x !== f));
  }

  function handleFeatureKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFeature(featureInput);
    }
    if (e.key === 'Backspace' && featureInput === '' && features.length > 0) {
      setFeatures(prev => prev.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedCityIds.length === 0) { alert('Please select at least one city.'); return; }
    if (packages.length === 0) { alert('Please add at least one package.'); return; }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('cityIds', JSON.stringify(selectedCityIds));
    formData.set('packages', JSON.stringify(packages));
    formData.set('features', features.join(','));
    const res = await addVehicle(formData);
    setLoading(false);
    if (res.success) {
      setSelectedCityIds([]);
      setPackages([]);
      setFeatures([]);
      onClose();
    } else {
      alert('Failed to save: ' + res.error);
    }
  }

  if (!isOpen) return null;

  const filteredSuggestions = FEATURE_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(featureInput.toLowerCase()) && !features.includes(s)
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[640px] lg:w-[860px] bg-[#0A0A0A] border-l border-white/10 z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 custom-scrollbar">
        <div className="p-8 md:p-10">

          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-brand-neon">+</span> REGISTER NEW PLATFORM VEHICLE
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* ── SECTION: VEHICLE IDENTITY ── */}
            <div>
              <p className="text-[9px] text-brand-neon font-mono uppercase tracking-widest mb-5">— Vehicle Identity</p>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Vehicle Name</label>
                    <input name="vehicleName" required type="text" placeholder="E.G. SCORPIO CLASSIC VIP"
                      className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Segment Type</label>
                    <select name="segmentType" className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors appearance-none">
                      <option>Luxury Class</option>
                      <option>SUV</option>
                      <option>Sedan</option>
                      <option>Tempo</option>
                      <option>Innova</option>
                      <option>Hatchback</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Image Photo URL</label>
                  <input name="imageUrl" required type="text" placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Fuel Type</label>
                    <select name="fuelType" className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors appearance-none">
                      <option>Petrol</option>
                      <option>Diesel</option>
                      <option>EV</option>
                      <option>Hybrid</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Transmission</label>
                    <select name="transmission" className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors appearance-none">
                      <option>Automatic Gearbox</option>
                      <option>Manual Gearbox</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block">Seating Capacity</label>
                    <select name="seatingCapacity" className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors appearance-none">
                      <option value="4">4 Seater</option>
                      <option value="5">5 Seater</option>
                      <option value="6">6 Seater</option>
                      <option value="7">7 Seater</option>
                      <option value="8">8 Seater</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION: CITY COVERAGE ── */}
            <div className="border-t border-white/5 pt-8">
              <p className="text-[9px] text-brand-neon font-mono uppercase tracking-widest mb-4">— Active City Coverage (Multi-Select)</p>
              <div className="flex flex-wrap gap-2">
                {cities.map(c => {
                  const selected = selectedCityIds.includes(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleCity(c.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        selected
                          ? 'bg-brand-neon/10 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(196,240,0,0.08)]'
                          : 'bg-[#111111] border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                      }`}>
                      {selected && <Check size={11} strokeWidth={3} />}
                      {c.name}
                    </button>
                  );
                })}
                {cities.length === 0 && <p className="text-[10px] text-white/30 font-mono">No cities configured.</p>}
              </div>
              {selectedCityIds.length > 0 && (
                <p className="text-[9px] text-white/30 font-mono mt-2">{selectedCityIds.length} city hub{selectedCityIds.length > 1 ? 's' : ''} selected</p>
              )}
            </div>

            {/* ── SECTION: PRICING PACKAGES ── */}
            <div className="border-t border-white/5 pt-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[9px] text-brand-neon font-mono uppercase tracking-widest">— Pricing Packages</p>
                <button type="button" onClick={addBlankPackage}
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/40 hover:text-brand-neon border border-white/10 hover:border-brand-neon/40 px-3 py-1.5 rounded-lg transition-all">
                  <Plus size={11} /> Add Custom
                </button>
              </div>

              {/* Package Tiers from DB */}
              {tiers.length > 0 && (
                <div className="mb-5">
                  <p className="text-[9px] text-white/30 font-mono mb-2">From your configured package tiers — click to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {tiers.map(tier => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => addPackageFromTier(tier)}
                        disabled={packages.some(p => p.name === tier.name)}
                        className={`flex items-center gap-1.5 text-[9px] font-mono px-3 py-2 rounded-xl border transition-all ${
                          packages.some(p => p.name === tier.name)
                            ? 'border-brand-neon/40 text-brand-neon bg-brand-neon/5 cursor-default'
                            : 'border-white/10 text-white/50 hover:text-brand-neon hover:border-brand-neon/40 hover:bg-brand-neon/5'
                        }`}
                      >
                        {packages.some(p => p.name === tier.name) ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                        {tier.name}
                        <span className="text-white/30 ml-1">• {tier.limitInfo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tiers.length === 0 && (
                <p className="text-[9px] text-white/20 font-mono mb-4">No global tiers defined yet. <span className="text-brand-neon/60">Configure them in Pricing & Packages.</span></p>
              )}

              {/* Package Rows */}
              <div className="space-y-4">
                {packages.map((pkg, idx) => (
                  <div key={pkg.id} className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4 relative group hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-white/30 font-mono uppercase tracking-widest">Package #{idx + 1}</span>
                      <button type="button" onClick={() => removePackage(pkg.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Package Name</label>
                        <input value={pkg.name} onChange={e => updatePackage(pkg.id, 'name', e.target.value)} required
                          placeholder="e.g. 120 KM Package"
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Type</label>
                        <select value={pkg.type} onChange={e => updatePackage(pkg.id, 'type', e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors appearance-none">
                          <option value="KM">KM</option>
                          <option value="HOUR">HOUR</option>
                          <option value="TRANSFER">TRANSFER</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Base Price (₹)</label>
                        <input value={pkg.basePrice} onChange={e => updatePackage(pkg.id, 'basePrice', e.target.value)}
                          required type="number" min="0" placeholder="4500"
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Limit ({pkg.type === 'HOUR' ? 'Hrs' : 'KM'})</label>
                        <input value={pkg.limitValue} onChange={e => updatePackage(pkg.id, 'limitValue', e.target.value)}
                          type="number" min="0" placeholder="120"
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Extra/Unit (₹)</label>
                        <input value={pkg.extraChargePerUnit} onChange={e => updatePackage(pkg.id, 'extraChargePerUnit', e.target.value)}
                          type="number" min="0" placeholder="40"
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/30 font-mono uppercase tracking-widest block">Deposit (₹)</label>
                        <input value={pkg.deposit} onChange={e => updatePackage(pkg.id, 'deposit', e.target.value)}
                          type="number" min="0" placeholder="5000"
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-brand-neon/40 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}

                {packages.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl text-white/30 text-[10px] font-mono">
                    Click a tier above to add a package, or use &quot;Add Custom&quot;.
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION: FEATURES ── */}
            <div className="border-t border-white/5 pt-8">
              <p className="text-[9px] text-brand-neon font-mono uppercase tracking-widest mb-4">— Vehicle Features</p>

              {/* Tag Input */}
              <div className="relative">
                <div className="min-h-[52px] bg-[#111111] border border-white/5 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-brand-neon/40 transition-colors cursor-text"
                  onClick={() => document.getElementById('feature-input')?.focus()}>
                  {features.map(f => (
                    <span key={f} className="flex items-center gap-1.5 bg-brand-neon/10 border border-brand-neon/30 text-brand-neon text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg">
                      <Tag size={9} />
                      {f}
                      <button type="button" onClick={() => removeFeature(f)} className="text-brand-neon/50 hover:text-red-400 transition-colors ml-1">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                  <input
                    id="feature-input"
                    value={featureInput}
                    onChange={e => { setFeatureInput(e.target.value); setShowSuggestions(true); }}
                    onKeyDown={handleFeatureKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder={features.length === 0 ? 'Type a feature and press Enter...' : ''}
                    className="flex-1 min-w-[160px] bg-transparent outline-none text-xs text-white font-mono placeholder:text-white/20 py-1"
                  />
                </div>

                {/* Autocomplete Suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                    {filteredSuggestions.slice(0, 6).map(s => (
                      <button key={s} type="button" onMouseDown={() => addFeature(s)}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-white/60 hover:text-brand-neon hover:bg-brand-neon/5 transition-colors flex items-center gap-2">
                        <Plus size={10} /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-white/20 font-mono mt-2">Press Enter or comma to add. Click suggestions or type custom features.</p>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit"
                className="w-full bg-brand-neon hover:bg-brand-hover text-black px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)] disabled:opacity-50">
                {loading ? 'WRITING TO DATABASE...' : 'WRITE VEHICLE TO DATABASE'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
