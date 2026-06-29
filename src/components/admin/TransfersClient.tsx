'use client';

import { useState } from 'react';
import { Plus, Trash2, Pencil, Settings2 } from 'lucide-react';
import { deleteTaxiFareSetting } from '@/app/admin/actions';
import TaxiFareDrawer from './TaxiFareDrawer';

export default function TransfersClient({ taxiSettings }: { taxiSettings: any[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fare configuration?')) return;
    setDeletingId(id);
    await deleteTaxiFareSetting(id);
    setDeletingId(null);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-black uppercase tracking-tight">DYNAMIC FARE SETTINGS</h1>
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">
            Manage global rate configurations per vehicle category (Sedan, SUV, etc.)
          </p>
        </div>
        <div>
          <button
            onClick={() => { setEditingSetting(null); setIsDrawerOpen(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md"
          >
            <Plus size={14} /> Add Category Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {taxiSettings.map((setting: any) => (
          <div key={setting.id} className={`bg-gray-100 border border-gray-200 rounded-2xl p-6 group transition-all hover:border-gray-300 ${deletingId === setting.id ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-start mb-6 border-b border-gray-200 pb-4">
              <div>
                <div className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-1">Vehicle Category</div>
                <h3 className="text-xl font-black uppercase">{setting.vehicleCategory}</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingSetting(setting); setIsDrawerOpen(true); }} className="p-2 rounded-xl bg-white hover:bg-gray-200 text-gray-600 transition-colors shadow-sm">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(setting.id)} className="p-2 rounded-xl bg-white hover:bg-red-50 text-red-500 transition-colors shadow-sm">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Settings2 size={12} /> Airport Transfer
                </h4>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono uppercase text-center">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-400 mb-1">Base</div>
                    <div className="text-gray-900 font-bold">₹{setting.airportBaseFare}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-400 mb-1">Rate/KM</div>
                    <div className="text-gray-900 font-bold">₹{setting.airportRatePerKm}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-400 mb-1">Min Fare</div>
                    <div className="text-gray-900 font-bold">₹{setting.airportMinFare}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Settings2 size={12} /> Round Trip
                </h4>
                <div className="grid grid-cols-3 gap-2 text-[9px] font-mono uppercase text-center">
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-400 mb-1">Rate/KM</div>
                    <div className="text-gray-900 font-bold">₹{setting.roundTripRatePerKm}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-400 mb-1">Min KM</div>
                    <div className="text-gray-900 font-bold">{setting.roundTripMinKmPerDay}</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 border border-gray-200">
                    <div className="text-gray-400 mb-1">Allowance</div>
                    <div className="text-gray-900 font-bold">₹{setting.driverAllowancePerDay}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {taxiSettings.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-3xl">
            <Settings2 size={32} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-500 font-medium">No fare configurations found.</p>
            <p className="text-[11px] text-gray-400 font-mono mt-2">Click 'Add Category Config' to create rules for Sedan, SUV, etc.</p>
          </div>
        )}
      </div>

      <TaxiFareDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        setting={editingSetting}
      />
    </>
  );
}
