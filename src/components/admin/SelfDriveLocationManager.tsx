'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, X, Navigation } from 'lucide-react';
import { upsertSelfDriveLocation, deleteSelfDriveLocation } from '@/app/admin/actions';

interface Location {
  id: string;
  cityId: string;
  name: string;
  price: number;
  order: number;
  city?: { name: string };
}

const FORM_DEFAULT = { id: '', cityId: '', name: '', price: '', order: '0' };

export default function SelfDriveLocationManager({ locations, cities }: { locations: Location[]; cities: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(FORM_DEFAULT);
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({ ...FORM_DEFAULT, cityId: cities[0]?.id || '' });
  };

  const startEdit = (loc: Location) => {
    setEditingId(loc.id);
    setIsAdding(false);
    setForm({
      id: loc.id,
      cityId: loc.cityId,
      name: loc.name,
      price: String(loc.price),
      order: String(loc.order),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.set(k, v));
    const res = await upsertSelfDriveLocation(data);
    setSaving(false);
    if (res.success) {
      setIsAdding(false);
      setEditingId(null);
      window.location.reload();
    } else {
      alert('Failed: ' + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    await deleteSelfDriveLocation(id);
    window.location.reload();
  };

  const locationsByCity = cities
    .map(city => ({ city, items: locations.filter(l => l.cityId === city.id) }))
    .filter(group => group.items.length > 0 || group.city.id === form.cityId);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight flex items-center gap-3">
            <Navigation className="text-green-700" size={26} /> Self Drive Locations
          </h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">
            Customers picking up or dropping off a self-drive car can only choose from the named locations configured here, per city. Each location adds a flat price to the booking.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <Plus size={14} /> Add Location
        </button>
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="mb-8 bg-gray-100 border border-green-300 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest">
              — {editingId ? 'Edit Location' : 'New Location'}
            </p>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-500 hover:text-gray-900">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">City <span className="text-red-500">*</span></label>
              <select required value={form.cityId} onChange={e => setForm(f => ({ ...f, cityId: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono appearance-none">
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Location Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Udaipur Railway Station" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Price (₹) <span className="text-red-500">*</span></label>
              <input type="number" required value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Display Order</label>
              <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button disabled={saving} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all">
              {editingId ? 'Update Location' : 'Save Location'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {locationsByCity.map(({ city, items }) => (
          <div key={city.id} className="bg-white border border-gray-200 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-black uppercase">{city.name}</h3>
              <span className="text-[9px] font-black px-2 py-0.5 rounded border border-green-300 text-green-700 bg-green-600/10">{items.length} Location{items.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="text-gray-400 uppercase border-b border-gray-200">
                    <th className="py-2 pr-4">Location Name</th>
                    <th className="py-2 pr-4">Price ₹</th>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(loc => (
                    <tr key={loc.id} className="border-b border-gray-100 group">
                      <td className="py-2.5 pr-4 font-bold text-gray-900">{loc.name}</td>
                      <td className="py-2.5 pr-4 text-gray-700">₹{loc.price.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{loc.order}</td>
                      <td className="py-2.5 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(loc)} className="p-1.5 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-600/10 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDelete(loc.id)} className="p-1.5 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400 uppercase">No locations yet for this city.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {locationsByCity.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <Navigation size={32} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 font-medium">No self drive locations configured.</p>
            <p className="text-[11px] text-gray-400 font-mono mt-2">Self-drive customers won&apos;t see a pickup/drop location picker until at least one is added here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
