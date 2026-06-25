'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, Plus, Trash2, Check, Tag, ChevronDown } from 'lucide-react';
import { addVehicle } from '@/app/admin/actions';
import MultiImageUpload from './MultiImageUpload';
import RichTextEditor from './RichTextEditor';

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
  const [gallery, setGallery] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [serviceTypes, setServiceTypes] = useState<string[]>(['SELF_DRIVE']);

  useEffect(() => {
    if (!isOpen) {
      setGallery([]);
      setContent('');
      setServiceTypes(['SELF_DRIVE']);
    }
  }, [isOpen]);

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
    setPackages(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      
      if (field === 'name') {
        const lower = value.toLowerCase();
        const match = value.match(/(\d+(\.\d+)?)/);
        
        if (lower.includes('km')) {
          updated.type = 'KM';
          if (match) updated.limitValue = match[0];
        } else if (lower.includes('hour') || lower.includes('hr')) {
          updated.type = 'HOUR';
          if (match) updated.limitValue = match[0];
        } else if (lower.includes('day')) {
          updated.type = 'HOUR';
          if (match) updated.limitValue = (parseFloat(match[0]) * 24).toString();
        } else if (match && !updated.limitValue) {
          updated.limitValue = match[0];
        }
      }
      return updated;
    }));
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
    formData.set('features', JSON.stringify(features));
    formData.set('gallery', JSON.stringify(gallery));
    formData.set('content', content);
    formData.set('serviceTypes', JSON.stringify(serviceTypes));
    const res = await addVehicle(formData);
    setLoading(false);
    if (res.success) {
      setSelectedCityIds([]);
      setPackages([]);
      setFeatures([]);
      setContent('');
      setServiceTypes(['SELF_DRIVE']);
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
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full md:w-[640px] lg:w-[860px] bg-white border-l border-gray-300 z-50 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 custom-scrollbar">
        <div className="p-8 md:p-10">

          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-green-700">+</span> REGISTER NEW PLATFORM VEHICLE
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-gray-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>

            {/* ── SECTION: VEHICLE IDENTITY ── */}
            <div>
              <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest mb-5">— Vehicle Identity</p>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Vehicle Name <span className="text-red-500">*</span></label>
                    <input name="vehicleName" required type="text" placeholder="E.G. SCORPIO CLASSIC VIP"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Segment Type <span className="text-red-500">*</span></label>
                    <select name="segmentType" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors appearance-none">
                      <option>Luxury Class</option>
                      <option>SUV</option>
                      <option>Sedan</option>
                      <option>Tempo</option>
                      <option>Innova</option>
                      <option>Hatchback</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Vehicle Gallery (Multiple) <span className="text-red-500">*</span></label>
                    <input type="hidden" name="imageUrl" value={gallery.length > 0 ? gallery[0] : ''} />
                    <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
                    <MultiImageUpload value={gallery} onChange={setGallery} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Fuel Type <span className="text-red-500">*</span></label>
                    <input name="fuelType" list="fuel-options" required placeholder="e.g. Petrol, Diesel, EV..." className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                    <datalist id="fuel-options">
                      <option value="Diesel" />
                      <option value="Petrol" />
                      <option value="Electric" />
                      <option value="Hybrid" />
                      <option value="CNG" />
                      <option value="Petrol/CNG" />
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Transmission <span className="text-red-500">*</span></label>
                    <select name="transmission" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors appearance-none">
                      <option>Automatic Gearbox</option>
                      <option>Manual Gearbox</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Seating Capacity <span className="text-red-500">*</span></label>
                    <select name="seatingCapacity" className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors appearance-none">
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

            {/* ── SECTION: SERVICE TYPES ── */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest mb-4">— Categorization</p>
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
                    <label key={type.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all ${checked ? 'bg-green-600/10 border-green-600 text-green-700' : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-white/30'}`}>
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

            {/* ── SECTION: CHAUFFEUR SETTINGS ── */}
            {serviceTypes.includes('WITH_DRIVER') && (
              <div className="border-t border-gray-200 pt-8">
                <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest mb-5">— Chauffeur Operations Pricing</p>
                
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Extra Hour Charge (₹)</label>
                    <input name="extraHourCharge" type="number" placeholder="e.g. 250"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Night Charge (₹)</label>
                    <input name="nightCharge" type="number" placeholder="e.g. 300"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Night Charge Start Time</label>
                    <input name="nightChargeStart" type="time" defaultValue="22:00"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors appearance-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Night Charge End Time</label>
                    <input name="nightChargeEnd" type="time" defaultValue="06:00"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors appearance-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Driver Allowance / Day (Internal Ops)</label>
                    <input name="driverAllowanceDay" type="number" placeholder="e.g. 250"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Driver Allowance Outstation (Internal Ops)</label>
                    <input name="driverAllowanceOut" type="number" placeholder="e.g. 400"
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION: CITY COVERAGE ── */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest mb-4">— Active City Coverage (Multi-Select)</p>
              <div className="flex flex-wrap gap-2">
                {cities.map(c => {
                  const selected = selectedCityIds.includes(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => toggleCity(c.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        selected
                          ? 'bg-green-600/10 border-green-600 text-green-700 shadow-sm'
                          : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-white/30 hover:text-gray-900/80'
                      }`}>
                      {selected && <Check size={11} strokeWidth={3} />}
                      {c.name}
                    </button>
                  );
                })}
                {cities.length === 0 && <p className="text-[10px] text-gray-400 font-mono">No cities configured.</p>}
              </div>
              {selectedCityIds.length > 0 && (
                <p className="text-[9px] text-gray-400 font-mono mt-2">{selectedCityIds.length} city hub{selectedCityIds.length > 1 ? 's' : ''} selected</p>
              )}
            </div>

            {/* ── SECTION: PRICING PACKAGES ── */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center mb-4">
                <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest">— Pricing Packages</p>
                <button type="button" onClick={addBlankPackage}
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-green-700 border border-gray-300 hover:border-green-600/40 px-3 py-1.5 rounded-lg transition-all">
                  <Plus size={11} /> Add Custom
                </button>
              </div>

              {/* Package Tiers from DB */}
              {tiers.length > 0 && (
                <div className="mb-5">
                  <p className="text-[9px] text-gray-400 font-mono mb-2">From your configured package tiers — click to add:</p>
                  <div className="flex flex-wrap gap-2">
                    {tiers.map(tier => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => addPackageFromTier(tier)}
                        disabled={packages.some(p => p.name === tier.name)}
                        className={`flex items-center gap-1.5 text-[9px] font-mono px-3 py-2 rounded-xl border transition-all ${
                          packages.some(p => p.name === tier.name)
                            ? 'border-green-600/40 text-green-700 bg-green-600/5 cursor-default'
                            : 'border-gray-300 text-gray-500 hover:text-green-700 hover:border-green-600/40 hover:bg-green-600/5'
                        }`}
                      >
                        {packages.some(p => p.name === tier.name) ? <Check size={10} strokeWidth={3} /> : <Plus size={10} />}
                        {tier.name}
                        <span className="text-gray-400 ml-1">• {tier.limitInfo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tiers.length === 0 && (
                <p className="text-[9px] text-gray-400 font-mono mb-4">No global tiers defined yet. <span className="text-green-700/60">Configure them in Pricing & Packages.</span></p>
              )}

              {/* Package Rows */}
              <div className="space-y-4">
                {packages.map((pkg, idx) => (
                  <div key={pkg.id} className="bg-gray-100 border border-gray-200 rounded-2xl p-5 space-y-4 relative group hover:border-gray-300 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 font-mono uppercase tracking-widest">Package #{idx + 1}</span>
                      <button type="button" onClick={() => removePackage(pkg.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-500/10">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Package Name <span className="text-red-500">*</span></label>
                        <input value={pkg.name} onChange={e => updatePackage(pkg.id, 'name', e.target.value)} required
                          placeholder="e.g. 120 KM Package"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Type <span className="text-red-500">*</span></label>
                        <select value={pkg.type} onChange={e => updatePackage(pkg.id, 'type', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors appearance-none">
                          <option value="KM">KM</option>
                          <option value="HOUR">HOUR</option>
                          <option value="TRANSFER">TRANSFER</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Base Price (₹) <span className="text-red-500">*</span></label>
                        <input value={pkg.basePrice} onChange={e => updatePackage(pkg.id, 'basePrice', e.target.value)}
                          required type="number" min="0" placeholder="4500"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Limit ({pkg.type === 'HOUR' ? 'Hrs' : 'KM'})</label>
                        <input value={pkg.limitValue} onChange={e => updatePackage(pkg.id, 'limitValue', e.target.value)}
                          type="number" min="0" placeholder="120"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Extra/Unit (₹)</label>
                        <input value={pkg.extraChargePerUnit} onChange={e => updatePackage(pkg.id, 'extraChargePerUnit', e.target.value)}
                          type="number" min="0" placeholder="40"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Deposit (₹) <span className="text-gray-400">(Optional)</span></label>
                        <input value={pkg.deposit} onChange={e => updatePackage(pkg.id, 'deposit', e.target.value)}
                          type="number" min="0" placeholder="e.g. 5000"
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none font-mono focus:border-green-600/40 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}

                {packages.length === 0 && (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-2xl text-gray-400 text-[10px] font-mono">
                    Click a tier above to add a package, or use &quot;Add Custom&quot;.
                  </div>
                )}
              </div>
            </div>

            {/* ── SECTION: FEATURES ── */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest mb-4">— Vehicle Features</p>

              {/* Tag Input */}
              <div className="relative">
                <div className="min-h-[52px] bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-green-600/40 transition-colors cursor-text"
                  onClick={() => document.getElementById('feature-input')?.focus()}>
                  {features.map(f => (
                    <span key={f} className="flex items-center gap-1.5 bg-green-600/10 border border-green-300 text-green-700 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg">
                      <Tag size={9} />
                      {f}
                      <button type="button" onClick={() => removeFeature(f)} className="text-green-700/50 hover:text-red-400 transition-colors ml-1">
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
                    className="flex-1 min-w-[160px] bg-transparent outline-none text-xs text-gray-900 font-mono placeholder:text-gray-400 py-1"
                  />
                </div>

                {/* Autocomplete Suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-2xl z-10 overflow-hidden">
                    {filteredSuggestions.slice(0, 6).map(s => (
                      <button key={s} type="button" onMouseDown={() => addFeature(s)}
                        className="w-full text-left px-4 py-2.5 text-[10px] font-mono text-gray-600 hover:text-green-700 hover:bg-green-600/5 transition-colors flex items-center gap-2">
                        <Plus size={10} /> {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[9px] text-gray-400 font-mono mt-2">Press Enter or comma to add. Click suggestions or type custom features.</p>
            </div>

            {/* ── SECTION: RICH CONTENT ── */}
            <div className="border-t border-gray-200 pt-8">
              <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest mb-4">— Detailed Vehicle Content</p>
              <RichTextEditor value={content} onChange={setContent} placeholder="Add detailed descriptions, rules, or special notes..." />
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit"
                className="w-full bg-green-600 hover:bg-brand-hover text-black px-6 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(196,240,0,0.15)] disabled:opacity-50">
                {loading ? 'WRITING TO DATABASE...' : 'WRITE VEHICLE TO DATABASE'} <ArrowRight size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
