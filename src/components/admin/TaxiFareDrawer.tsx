'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { saveTaxiFareSetting } from '@/app/admin/actions';

export default function TaxiFareDrawer({ isOpen, onClose, setting }: { isOpen: boolean, onClose: () => void, setting?: any }) {
  const [formData, setFormData] = useState({
    vehicleCategory: '',
    airportBaseFare: 0,
    airportRatePerKm: 15,
    airportMinFare: 300,
    roundTripRatePerKm: 13,
    roundTripMinKmPerDay: 250,
    driverAllowancePerDay: 350,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setting) {
      setFormData(setting);
    } else {
      setFormData({
        vehicleCategory: '',
        airportBaseFare: 0,
        airportRatePerKm: 15,
        airportMinFare: 300,
        roundTripRatePerKm: 13,
        roundTripMinKmPerDay: 250,
        driverAllowancePerDay: 350,
      });
    }
  }, [setting, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await saveTaxiFareSetting(formData);
      if (res.success) {
        onClose();
      } else {
        alert('Error: ' + res.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 w-full max-w-lg h-full bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black uppercase tracking-tight">
            {setting ? 'Edit Fare Config' : 'New Fare Config'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white font-mono text-[11px] uppercase tracking-widest">
          <form id="fare-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-[10px] text-green-700 font-bold border-b border-gray-200 pb-2">Vehicle Category</h3>
              <div>
                <label className="block text-gray-500 mb-1">Category Name (e.g. Sedan, SUV)</label>
                <input
                  required
                  type="text"
                  disabled={!!setting}
                  value={formData.vehicleCategory}
                  onChange={(e) => setFormData({ ...formData, vehicleCategory: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-[10px] text-green-700 font-bold border-b border-gray-200 pb-2">Airport Transfer Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1">Base Fare (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.airportBaseFare}
                    onChange={(e) => setFormData({ ...formData, airportBaseFare: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Rate Per KM (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.airportRatePerKm}
                    onChange={(e) => setFormData({ ...formData, airportRatePerKm: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Minimum Fare (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.airportMinFare}
                    onChange={(e) => setFormData({ ...formData, airportMinFare: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-[10px] text-green-700 font-bold border-b border-gray-200 pb-2">Round Trip Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 mb-1">Rate Per KM (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.roundTripRatePerKm}
                    onChange={(e) => setFormData({ ...formData, roundTripRatePerKm: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Min KM / Day</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={formData.roundTripMinKmPerDay}
                    onChange={(e) => setFormData({ ...formData, roundTripMinKmPerDay: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Driver Allowance / Day (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.driverAllowancePerDay}
                    onChange={(e) => setFormData({ ...formData, driverAllowancePerDay: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="submit"
            form="fare-form"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold tracking-widest uppercase py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'Saving...' : <><Save size={18} /> Save Settings</>}
          </button>
        </div>
      </div>
    </>
  );
}
