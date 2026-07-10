'use client';

import { useState } from 'react';
import { updateSiteSettings } from '@/app/admin/actions';
import { Settings, Save, X } from 'lucide-react';
import ImageUpload from './ImageUpload';

export default function SiteSettingsManager({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    logoRidez: initialData?.logoRidez || '/logo-ridez.png',
    logoFull: initialData?.logoFull || '/logo-full.png',
    favicon: initialData?.favicon || '/favicon.ico',
    copyrightText: initialData?.copyrightText || '© GoRidez. All rights reserved.',
    razorpayKeyId: initialData?.razorpayKeyId || 'rzp_test_mockkey123',
    razorpayKeySecret: initialData?.razorpayKeySecret || 'mocksecret123',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    const res = await updateSiteSettings(data);
    setLoading(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Website settings updated successfully!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save settings.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            <Settings className="text-[#ADFF00]" size={32} /> Branding Settings
          </h1>
          <p className="text-gray-500 text-[13px]">
            Manage header/footer logo assets, site icon (favicon), and copyright declarations.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl mb-6 text-xs font-mono border flex justify-between items-center ${
            statusMsg.type === 'success'
              ? 'bg-green-500/5 border-green-500/20 text-green-600'
              : 'bg-red-500/5 border-red-500/20 text-red-600'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="opacity-50 hover:opacity-100" type="button">
            <X size={14} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Header Logo */}
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Navbar / Header Logo
              </label>
              <ImageUpload
                value={formData.logoRidez}
                onChange={(val) => setFormData({ ...formData, logoRidez: val })}
              />
              <p className="text-[10px] text-gray-400 mt-2">Recommended: Transparent horizontal PNG logo</p>
            </div>

            {/* Footer Logo */}
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Footer Logo
              </label>
              <ImageUpload
                value={formData.logoFull}
                onChange={(val) => setFormData({ ...formData, logoFull: val })}
              />
              <p className="text-[10px] text-gray-400 mt-2">Recommended: Expanded signature brand block</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Favicon */}
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Browser Icon (Favicon)
              </label>
              <ImageUpload
                value={formData.favicon}
                onChange={(val) => setFormData({ ...formData, favicon: val })}
              />
              <p className="text-[10px] text-gray-400 mt-2">Recommended: Small square ICO or PNG icon</p>
            </div>

            {/* Copyright */}
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Footer Copyright Text
              </label>
              <input
                type="text"
                name="copyrightText"
                value={formData.copyrightText}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
              />
            </div>
          </div>

          {/* Razorpay Gateway Configuration */}
          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-sm font-black uppercase tracking-tight mb-4 text-gray-900">Razorpay Gateway Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  Razorpay Key ID
                </label>
                <input
                  type="text"
                  name="razorpayKeyId"
                  value={formData.razorpayKeyId}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  Razorpay Key Secret
                </label>
                <input
                  type="password"
                  name="razorpayKeySecret"
                  value={formData.razorpayKeySecret}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ADFF00] hover:bg-[#C4FF4D] text-black px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} /> {loading ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
