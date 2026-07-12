'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, X, MapPinned, Car } from 'lucide-react';
import {
  upsertAirportZone,
  deleteAirportZone,
  upsertAirportZoneFare,
  deleteAirportZoneFare,
} from '@/app/admin/actions';

interface Fare {
  id: string;
  vehicleCategory: string;
  pickupPrice: number;
  dropPrice: number;
  waitChargePer30Min: number;
  nightFee: number;
  meetAndGreet: boolean;
}

interface Zone {
  id: string;
  cityId: string;
  name: string;
  order: number;
  localities: string[];
  fares: Fare[];
  city?: { name: string };
}

const ZONE_FORM_DEFAULT = { id: '', cityId: '', name: '', order: '0', localities: '' };
const FARE_FORM_DEFAULT = {
  id: '', zoneId: '', vehicleCategory: '',
  pickupPrice: '', dropPrice: '', waitChargePer30Min: '', nightFee: '', meetAndGreet: false,
};

export default function AirportZoneManager({ zones, cities }: { zones: Zone[]; cities: any[] }) {
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [zoneForm, setZoneForm] = useState(ZONE_FORM_DEFAULT);
  const [savingZone, setSavingZone] = useState(false);

  const [fareZoneTarget, setFareZoneTarget] = useState<string | null>(null); // zoneId currently adding/editing a fare for
  const [fareForm, setFareForm] = useState(FARE_FORM_DEFAULT);
  const [savingFare, setSavingFare] = useState(false);

  const startAddZone = () => {
    setIsAddingZone(true);
    setEditingZoneId(null);
    setZoneForm({ ...ZONE_FORM_DEFAULT, cityId: cities[0]?.id || '' });
  };

  const startEditZone = (zone: Zone) => {
    setEditingZoneId(zone.id);
    setIsAddingZone(false);
    setZoneForm({
      id: zone.id,
      cityId: zone.cityId,
      name: zone.name,
      order: String(zone.order),
      localities: zone.localities.join('\n'),
    });
  };

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingZone(true);
    const data = new FormData();
    Object.entries(zoneForm).forEach(([k, v]) => data.set(k, v));
    const res = await upsertAirportZone(data);
    setSavingZone(false);
    if (res.success) {
      setIsAddingZone(false);
      setEditingZoneId(null);
      window.location.reload();
    } else {
      alert('Failed: ' + res.error);
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Delete this zone and all its fares?')) return;
    await deleteAirportZone(id);
    window.location.reload();
  };

  const startAddFare = (zoneId: string) => {
    setFareZoneTarget(zoneId);
    setFareForm({ ...FARE_FORM_DEFAULT, zoneId });
  };

  const startEditFare = (zoneId: string, fare: Fare) => {
    setFareZoneTarget(zoneId);
    setFareForm({
      id: fare.id,
      zoneId,
      vehicleCategory: fare.vehicleCategory,
      pickupPrice: String(fare.pickupPrice),
      dropPrice: String(fare.dropPrice),
      waitChargePer30Min: String(fare.waitChargePer30Min),
      nightFee: String(fare.nightFee),
      meetAndGreet: fare.meetAndGreet,
    });
  };

  const handleSaveFare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFare(true);
    const data = new FormData();
    Object.entries(fareForm).forEach(([k, v]) => data.set(k, String(v)));
    const res = await upsertAirportZoneFare(data);
    setSavingFare(false);
    if (res.success) {
      setFareZoneTarget(null);
      window.location.reload();
    } else {
      alert('Failed: ' + res.error);
    }
  };

  const handleDeleteFare = async (id: string) => {
    if (!confirm('Delete this fare row?')) return;
    await deleteAirportZoneFare(id);
    window.location.reload();
  };

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight flex items-center gap-3">
            <MapPinned className="text-green-700" size={26} /> Airport Transfer Zones
          </h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">
            Airport Transfers are only offered for cities with at least one zone configured here. Each zone lists the exact localities customers can pick from, with per-vehicle pickup/drop pricing.
          </p>
        </div>
        <button
          onClick={startAddZone}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md shrink-0"
        >
          <Plus size={14} /> Add Zone
        </button>
      </div>

      {(isAddingZone || editingZoneId) && (
        <form onSubmit={handleSaveZone} className="mb-8 bg-gray-100 border border-green-300 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[9px] text-green-700 font-mono uppercase tracking-widest">
              — {editingZoneId ? 'Edit Zone' : 'New Zone'}
            </p>
            <button type="button" onClick={() => { setIsAddingZone(false); setEditingZoneId(null); }} className="text-gray-500 hover:text-gray-900">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">City <span className="text-red-500">*</span></label>
              <select required value={zoneForm.cityId} onChange={e => setZoneForm(f => ({ ...f, cityId: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono appearance-none">
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Zone Name <span className="text-red-500">*</span></label>
              <input required value={zoneForm.name} onChange={e => setZoneForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Zone A" className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Display Order</label>
              <input type="number" value={zoneForm.order} onChange={e => setZoneForm(f => ({ ...f, order: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
            </div>
          </div>

          <div className="space-y-1.5 mb-4">
            <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">
              Localities / Areas (one per line) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={zoneForm.localities}
              onChange={e => setZoneForm(f => ({ ...f, localities: e.target.value }))}
              placeholder={'City Centre / Fateh Sagar\nLake Pichola / Old City'}
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-gray-900 outline-none focus:border-green-600 font-mono resize-y"
            />
            <p className="text-[9px] text-gray-400 font-mono">Customers booking an airport transfer can only select from localities listed across all zones.</p>
          </div>

          <div className="flex justify-end">
            <button disabled={savingZone} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all">
              {editingZoneId ? 'Update Zone' : 'Save Zone'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {zones.map(zone => (
          <div key={zone.id} className="bg-white border border-gray-200 rounded-3xl p-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4 pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-black uppercase">{zone.name}</h3>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded border border-green-300 text-green-700 bg-green-600/10">{zone.city?.name}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {zone.localities.map((loc, i) => (
                    <span key={i} className="text-[9px] font-mono bg-gray-100 border border-gray-200 text-gray-600 px-2 py-1 rounded-lg">{loc}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEditZone(zone)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                  <Pencil size={13} />
                </button>
                <button onClick={() => handleDeleteZone(zone.id)} className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Car size={12} /> Vehicle Category Fares
              </h4>
              <button onClick={() => startAddFare(zone.id)} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-green-700 hover:text-gray-900 border border-green-300 px-3 py-1.5 rounded-lg transition-colors">
                <Plus size={11} /> Add Category Fare
              </button>
            </div>

            {fareZoneTarget === zone.id && (
              <form onSubmit={handleSaveFare} className="mb-4 bg-gray-100 border border-green-300 p-5 rounded-2xl">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
                  <div className="space-y-1 col-span-2 md:col-span-1">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Category <span className="text-red-500">*</span></label>
                    <input required value={fareForm.vehicleCategory} onChange={e => setFareForm(f => ({ ...f, vehicleCategory: e.target.value }))} placeholder="Sedan" className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Pickup (₹)</label>
                    <input type="number" required value={fareForm.pickupPrice} onChange={e => setFareForm(f => ({ ...f, pickupPrice: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Drop (₹)</label>
                    <input type="number" required value={fareForm.dropPrice} onChange={e => setFareForm(f => ({ ...f, dropPrice: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Wait/30min (₹)</label>
                    <input type="number" value={fareForm.waitChargePer30Min} onChange={e => setFareForm(f => ({ ...f, waitChargePer30Min: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block">Night Fee (₹)</label>
                    <input type="number" value={fareForm.nightFee} onChange={e => setFareForm(f => ({ ...f, nightFee: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-xs text-gray-900 outline-none focus:border-green-600 font-mono" />
                  </div>
                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="flex items-center gap-2 text-[9px] text-gray-500 font-mono uppercase tracking-widest cursor-pointer py-2.5">
                      <input type="checkbox" checked={fareForm.meetAndGreet} onChange={e => setFareForm(f => ({ ...f, meetAndGreet: e.target.checked }))} className="accent-green-600" />
                      Meet & Greet
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setFareZoneTarget(null)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900">Cancel</button>
                  <button disabled={savingFare} type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                    {fareForm.id ? 'Update Fare' : 'Save Fare'}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] font-mono">
                <thead>
                  <tr className="text-gray-400 uppercase border-b border-gray-200">
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Pickup ₹</th>
                    <th className="py-2 pr-4">Drop ₹</th>
                    <th className="py-2 pr-4">Wait/30min ₹</th>
                    <th className="py-2 pr-4">Night Fee ₹</th>
                    <th className="py-2 pr-4">Meet & Greet</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {zone.fares.map(fare => (
                    <tr key={fare.id} className="border-b border-gray-100 group">
                      <td className="py-2.5 pr-4 font-bold text-gray-900">{fare.vehicleCategory}</td>
                      <td className="py-2.5 pr-4 text-gray-700">₹{fare.pickupPrice.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-gray-700">₹{fare.dropPrice.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-gray-700">₹{fare.waitChargePer30Min.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-gray-700">₹{fare.nightFee.toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{fare.meetAndGreet ? 'Yes' : 'No'}</td>
                      <td className="py-2.5 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEditFare(zone.id, fare)} className="p-1.5 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-600/10 transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => handleDeleteFare(fare.id)} className="p-1.5 rounded-lg text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {zone.fares.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-400 uppercase">No category fares yet for this zone.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {zones.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <MapPinned size={32} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 font-medium">No airport transfer zones configured.</p>
            <p className="text-[11px] text-gray-400 font-mono mt-2">Airport Transfers will not appear on the site until at least one zone is added here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
