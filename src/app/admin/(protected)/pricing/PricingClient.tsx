'use client';

import { useState } from 'react';
import {
  ToggleRight, ToggleLeft, Plus, Trash2, Pencil,
  CheckCircle2, X, Check, Save
} from 'lucide-react';
import {
  updatePricingRule,
  createGlobalPackageTier,
  deleteGlobalPackageTier,
  updateGlobalPackageTier
} from '@/app/admin/actions';

interface PricingRule {
  id: string;
  weekendMarkup: number;
  festivalSurge: number;
  dynamicSurgeActive: boolean;
}

interface PackageTier {
  id: string;
  name: string;
  type: string;
  basePricingInfo: string;
  limitInfo: string;
  isActive?: boolean;
}

export default function PricingClient({
  initialRule,
  initialTiers,
}: {
  initialRule: PricingRule | null;
  initialTiers: PackageTier[];
}) {
  const [rule, setRule] = useState<PricingRule>(
    initialRule || { id: 'new', weekendMarkup: 15, festivalSurge: 30, dynamicSurgeActive: true }
  );
  const [tiers, setTiers] = useState<PackageTier[]>(initialTiers);
  const [saving, setSaving] = useState(false);

  // Add form state
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', type: 'KM', basePricingInfo: '', limitInfo: '' });

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PackageTier | null>(null);

  // ── Pricing Rules ──────────────────────────────────────
  const handleUpdateRule = async (updates: Partial<PricingRule>) => {
    const newRule = { ...rule, ...updates };
    setRule(newRule);
    if (rule.id !== 'new') {
      setSaving(true);
      await updatePricingRule(rule.id, updates);
      setSaving(false);
    }
  };

  // ── Add Tier ───────────────────────────────────────────
  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.type) return;
    setSaving(true);
    const formData = new FormData();
    Object.entries(addForm).forEach(([k, v]) => formData.set(k, v));
    const res = await createGlobalPackageTier(formData);
    setSaving(false);
    if (res?.success) {
      // Optimistic add with temp ID (will be replaced on next load)
      setTiers(prev => [...prev, { ...addForm, id: `tmp_${Date.now()}`, isActive: true }]);
      setAddForm({ name: '', type: 'KM', basePricingInfo: '', limitInfo: '' });
      setIsAdding(false);
    } else {
      alert('Failed: ' + res?.error);
    }
  };

  // ── Delete Tier ────────────────────────────────────────
  const handleDeleteTier = async (id: string) => {
    if (!confirm('Remove this package tier?')) return;
    // Optimistic remove
    setTiers(prev => prev.filter(t => t.id !== id));
    await deleteGlobalPackageTier(id);
  };

  // ── Edit Tier ──────────────────────────────────────────
  const startEdit = (tier: PackageTier) => {
    setEditingId(tier.id);
    setEditForm({ ...tier });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;
    setSaving(true);
    // Optimistic update
    setTiers(prev => prev.map(t => t.id === editForm.id ? { ...editForm } : t));
    setEditingId(null);
    await updateGlobalPackageTier(editForm.id, {
      name: editForm.name,
      type: editForm.type,
      basePricingInfo: editForm.basePricingInfo,
      limitInfo: editForm.limitInfo,
    });
    setSaving(false);
    setEditForm(null);
  };

  // ── Toggle isActive ───────────────────────────────────
  const handleToggleActive = async (tier: PackageTier) => {
    const updated = { ...tier, isActive: !tier.isActive };
    setTiers(prev => prev.map(t => t.id === tier.id ? updated : t));
    await updateGlobalPackageTier(tier.id, { isActive: updated.isActive });
  };

  const isCustom = (tier: PackageTier) => tier.type === 'CUSTOM';

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-[28px] font-black uppercase tracking-tight">PACKAGE & SEASONAL TARIFF RULES</h1>
        {saving && (
          <span className="text-green-700 text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
            <CheckCircle2 size={14} /> SYNCING…
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-8">
        Set multi-tier custom limits of hours, dynamic markup, and configure festival peak season multipliers.
      </p>

      {/* ── TARIFF CARDS ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 flex flex-col md:flex-row gap-12">
          {/* Weekend Markup */}
          <div className="flex-1">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest">WEEKEND MARKUP</h3>
              <span className="text-green-700 font-black text-sm">+{rule.weekendMarkup}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={rule.weekendMarkup}
              onChange={e => handleUpdateRule({ weekendMarkup: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full cursor-pointer mb-4"
            />
            <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase leading-relaxed">
              Automatically activates on Saturday & Sunday checkouts.
            </p>
          </div>
          {/* Festival Surge */}
          <div className="flex-1">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest">FESTIVAL SURGE</h3>
              <span className="text-green-700 font-black text-sm">+{rule.festivalSurge}%</span>
            </div>
            <input
              type="range" min="0" max="100" value={rule.festivalSurge}
              onChange={e => handleUpdateRule({ festivalSurge: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:rounded-full cursor-pointer mb-4"
            />
            <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase leading-relaxed">
              Applies markup during Mewari Heritage / Diwali seasons.
            </p>
          </div>
        </div>

        {/* Dynamic Surge Toggle */}
        <div className="md:col-span-1 bg-gray-100 border border-gray-200 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
          <div className={`absolute inset-0 blur-3xl rounded-full transition-colors duration-1000 ${rule.dynamicSurgeActive ? 'bg-green-600/5' : 'bg-red-500/5'}`} />
          <div className="relative z-10 flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest">AUTOMATIC DYNAMIC SURGE</h3>
            <button onClick={() => handleUpdateRule({ dynamicSurgeActive: !rule.dynamicSurgeActive })}>
              {rule.dynamicSurgeActive
                ? <ToggleRight className="text-green-700" size={28} strokeWidth={2.5} />
                : <ToggleLeft className="text-gray-400" size={28} strokeWidth={2.5} />}
            </button>
          </div>
          <p className="relative z-10 text-[9px] text-gray-400 font-mono tracking-widest uppercase leading-relaxed">
            GRU engines analyze browser analytics, cookie volume, and traffic loops to safely scale base tariff tags.
          </p>
        </div>
      </div>

      {/* ── ACTIVE TIERS MAP ──────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-widest">ACTIVE TIERS CONFIGURATION MAP</h2>
          <button
            onClick={() => setIsAdding(v => !v)}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-700 hover:text-gray-900 transition-colors border border-green-300 px-4 py-2 rounded-xl hover:bg-green-600/5"
          >
            <Plus size={13} /> Add Package Tier
          </button>
        </div>

        {/* ── Add Form ── */}
        {isAdding && (
          <form onSubmit={handleAddTier} className="mb-6 bg-gray-100 border border-green-300 p-6 rounded-2xl space-y-4 shadow-[0_0_20px_rgba(196,240,0,0.04)]">
            <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest">— New Package Tier</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Package Name</label>
                <input required value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. 12 Hours Limit Package"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Type</label>
                <select value={addForm.type} onChange={e => setAddForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono appearance-none">
                  <option value="HOURS">HOURS</option>
                  <option value="KM">KM</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Base Pricing Info</label>
                <input required value={addForm.basePricingInfo} onChange={e => setAddForm(f => ({ ...f, basePricingInfo: e.target.value }))}
                  placeholder="e.g. Standard Base Pricing"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Limit Info</label>
                <input required value={addForm.limitInfo} onChange={e => setAddForm(f => ({ ...f, limitInfo: e.target.value }))}
                  placeholder="e.g. 150 KM included limit"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase text-gray-500 hover:text-gray-900 border border-gray-300 hover:border-gray-400 transition-all">
                Cancel
              </button>
              <button disabled={saving} type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:shadow-[0_0_15px_rgba(196,240,0,0.2)]">
                Save Tier
              </button>
            </div>
          </form>
        )}

        {/* ── Tiers List ── */}
        <div className="space-y-3 font-mono text-[11px]">
          {tiers.map(tier => {
            const isEditing = editingId === tier.id;
            const custom = isCustom(tier);

            if (isEditing && editForm) {
              return (
                <div key={tier.id} className="bg-gray-100 border border-green-300 p-5 rounded-2xl space-y-4 shadow-[0_0_15px_rgba(196,240,0,0.05)]">
                  <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest">Editing Tier</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Package Name</label>
                      <input value={editForm.name} onChange={e => setEditForm(f => f ? { ...f, name: e.target.value } : f)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Type</label>
                      <select value={editForm.type} onChange={e => setEditForm(f => f ? { ...f, type: e.target.value } : f)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono appearance-none">
                        <option value="HOURS">HOURS</option><option value="KM">KM</option><option value="TRANSFER">TRANSFER</option><option value="CUSTOM">CUSTOM</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Base Pricing Info</label>
                      <input value={editForm.basePricingInfo} onChange={e => setEditForm(f => f ? { ...f, basePricingInfo: e.target.value } : f)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] text-gray-400 font-mono uppercase tracking-widest block">Limit Info</label>
                      <input value={editForm.limitInfo} onChange={e => setEditForm(f => f ? { ...f, limitInfo: e.target.value } : f)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase text-gray-500 hover:text-gray-900 border border-gray-300 hover:border-gray-400 transition-all">
                      <X size={12} /> Cancel
                    </button>
                    <button onClick={handleSaveEdit} disabled={saving}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all">
                      <Save size={12} /> Save Changes
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={tier.id}
                className={`p-5 rounded-2xl flex flex-col md:flex-row justify-between md:items-center transition-all relative group ${
                  !tier.isActive && tier.isActive !== undefined
                    ? 'opacity-40 bg-gray-100 border border-gray-200 text-gray-500'
                    : custom
                      ? 'bg-[#0A0A00] border border-green-600/20 text-green-700 font-bold shadow-[0_0_15px_rgba(196,240,0,0.05)]'
                      : 'bg-gray-100 border border-gray-200 text-gray-900/80 hover:border-gray-300 hover:bg-white/[0.02]'
                }`}
              >
                {/* Left: Name */}
                <span className="mb-2 md:mb-0 flex items-center gap-3">
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                    tier.type === 'KM' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                    tier.type === 'HOURS' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                    tier.type === 'TRANSFER' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                    'border-green-300 text-green-700 bg-green-600/10'
                  }`}>{tier.type}</span>
                  {tier.name}
                </span>

                {/* Right: Info */}
                <span className={custom ? 'text-green-700/80' : 'text-gray-500'}>
                  {tier.basePricingInfo}
                  <span className={`mx-2 ${custom ? 'text-green-700/40' : ''}`}>•</span>
                  {tier.limitInfo}
                </span>

                {/* CRUD Buttons — visible on hover */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button
                    onClick={() => handleToggleActive(tier)}
                    title={tier.isActive !== false ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-lg transition-colors ${tier.isActive !== false ? 'text-green-700/60 hover:bg-green-600/10 hover:text-green-700' : 'text-gray-400 hover:bg-white/10 hover:text-gray-900'}`}
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => startEdit(tier)}
                    className="p-2 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-600/10 transition-colors"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="p-2 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {tiers.length === 0 && (
            <div className="text-center py-10 text-gray-400 border border-dashed border-gray-300 rounded-2xl text-[10px] font-mono">
              No package tiers configured. Click &quot;Add Package Tier&quot; to begin.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
