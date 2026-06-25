'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, CheckCircle2, Save, X } from 'lucide-react';
import { upsertDeliveryCharge, deleteDeliveryCharge } from '@/app/admin/actions';

export default function DeliveryChargeClient({ initialCharges, cities }: { initialCharges: any[], cities: any[] }) {
  const [charges, setCharges] = useState(initialCharges);
  const [saving, setSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    id: '', cityId: '', category: 'Hatchback',
    airportPickup: '', airportDrop: '', railwayPickup: '', railwayDrop: '',
    lateNightStart: '22:00', lateNightEnd: '06:00', notes: ''
  };

  const [form, setForm] = useState(initialFormState);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cityId) {
      alert("City is required");
      return;
    }
    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.set(k, v));

    const res = await upsertDeliveryCharge(formData);
    if (res?.success) {
      // Reload page to get fresh data (optimistic would be nice, but simple reload ensures correctness)
      window.location.reload();
    } else {
      alert('Failed: ' + res?.error);
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this charge?')) return;
    setCharges(prev => prev.filter(c => c.id !== id));
    await deleteDeliveryCharge(id);
  };

  const startEdit = (charge: any) => {
    setEditingId(charge.id);
    setForm({
      id: charge.id,
      cityId: charge.cityId,
      category: charge.category,
      airportPickup: charge.airportPickup.toString(),
      airportDrop: charge.airportDrop.toString(),
      railwayPickup: charge.railwayPickup.toString(),
      railwayDrop: charge.railwayDrop.toString(),
      lateNightStart: charge.lateNightStart,
      lateNightEnd: charge.lateNightEnd,
      notes: charge.notes || ''
    });
    setIsAdding(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-[28px] font-black uppercase tracking-tight">DELIVERY CHARGES (STATIONS & LATE NIGHT)</h1>
        {saving && (
          <span className="text-green-700 text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
            <CheckCircle2 size={14} /> SYNCING…
          </span>
        )}
      </div>
      <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-8">
        Configure drop-off/pickup fees for Airports, Railway Stations and late night intervals per City and Category.
      </p>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-widest">Configured Charges</h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setForm(initialFormState);
            }}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-700 hover:text-gray-900 transition-colors border border-green-300 px-4 py-2 rounded-xl hover:bg-green-600/5"
          >
            <Plus size={13} /> Add Charge Config
          </button>
        </div>

        {(isAdding || editingId) && (
          <form onSubmit={handleSave} className="mb-8 bg-gray-100 border border-green-300 p-6 rounded-2xl shadow-[0_0_20px_rgba(196,240,0,0.04)]">
            <div className="flex justify-between items-center mb-4">
               <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest">
                  — {editingId ? 'Edit Configuration' : 'New Configuration'}
               </p>
               <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-500 hover:text-gray-900">
                  <X size={16} />
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">City <span className="text-red-500">*</span></label>
                <select required value={form.cityId} onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono appearance-none">
                  <option value="">Select City</option>
                  {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono appearance-none">
                  <option value="Hatchback">Hatchback</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Maharana Pratap Airport UDR" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Airport Pickup (₹)</label>
                <input type="number" required value={form.airportPickup} onChange={e => setForm(f => ({ ...f, airportPickup: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Airport Drop (₹)</label>
                <input type="number" required value={form.airportDrop} onChange={e => setForm(f => ({ ...f, airportDrop: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Railway Pickup (₹)</label>
                <input type="number" required value={form.railwayPickup} onChange={e => setForm(f => ({ ...f, railwayPickup: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Railway Drop (₹)</label>
                <input type="number" required value={form.railwayDrop} onChange={e => setForm(f => ({ ...f, railwayDrop: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Late Night Start</label>
                <input type="time" required value={form.lateNightStart} onChange={e => setForm(f => ({ ...f, lateNightStart: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Late Night End</label>
                <input type="time" required value={form.lateNightEnd} onChange={e => setForm(f => ({ ...f, lateNightEnd: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button disabled={saving} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:shadow-[0_0_15px_rgba(196,240,0,0.2)]">
                {editingId ? 'Update Config' : 'Save Config'}
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="space-y-3">
          {charges.map(charge => (
             <div key={charge.id} className="p-5 rounded-2xl bg-gray-100 border border-gray-200 flex flex-col md:flex-row justify-between md:items-center relative group hover:border-gray-400 transition-all">
                <div className="mb-2 md:mb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded border border-green-300 text-green-700 bg-green-600/10">{charge.category}</span>
                    <span className="font-bold text-sm uppercase">{charge.city?.name}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-2">
                    AP: ₹{charge.airportPickup} | AD: ₹{charge.airportDrop} | RP: ₹{charge.railwayPickup} | RD: ₹{charge.railwayDrop}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1">
                    Late Night: {charge.lateNightStart} - {charge.lateNightEnd} | {charge.notes}
                  </div>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button onClick={() => startEdit(charge)} className="p-2 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-600/10 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(charge.id)} className="p-2 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
             </div>
          ))}
          {charges.length === 0 && (
             <div className="text-center py-10 text-gray-400 border border-dashed border-gray-300 rounded-2xl text-[10px] font-mono">
                No delivery charges configured.
             </div>
          )}
        </div>
      </div>
    </>
  );
}
