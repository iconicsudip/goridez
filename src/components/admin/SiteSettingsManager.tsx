'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSiteSettings, updateGuestCheckoutToggle } from '@/app/admin/actions';
import { Settings, Save, X, UserCheck } from 'lucide-react';
import ImageUpload from './ImageUpload';

function GuestCheckoutCard({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [on, setOn] = useState(enabled);
  const [saving, setSaving] = useState(false);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    setSaving(true);
    await updateGuestCheckoutToggle(next);
    setSaving(false);
    router.refresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-4 max-w-lg">
        <div className="w-11 h-11 rounded-2xl bg-green-600/10 border border-green-600/20 flex items-center justify-center shrink-0">
          <UserCheck className="text-green-700" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-gray-900">Guest Checkout</h3>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            When enabled, customers can complete a booking and pay on <code className="font-mono text-[11px]">/checkout</code> without creating an account or logging in first. Their name, email &amp; phone from the checkout form are still captured on the booking as usual.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`shrink-0 font-bold text-[10px] uppercase tracking-wider px-6 py-3 rounded-xl transition-all disabled:opacity-50 ${
          on ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {saving ? 'Saving…' : on ? 'Disable Guest Checkout' : 'Enable Guest Checkout'}
      </button>
    </div>
  );
}

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
    taxiExclusions: initialData?.taxiExclusions || '',
    taxiTerms: initialData?.taxiTerms || '',
    facebookUrl: initialData?.facebookUrl || '',
    instagramUrl: initialData?.instagramUrl || '',
    twitterUrl: initialData?.twitterUrl || '',
    youtubeUrl: initialData?.youtubeUrl || '',
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
            <Settings className="text-brand-gold" size={32} /> Branding Settings
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

      <GuestCheckoutCard enabled={initialData?.guestCheckoutEnabled || false} />

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

          {/* Social Media Links */}
          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-sm font-black uppercase tracking-tight mb-1 text-gray-900">Social Media Links</h3>
            <p className="text-[11px] text-gray-400 mb-4">Leave a field blank to hide that icon from the footer.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://www.facebook.com/..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://www.instagram.com/..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  Twitter / X URL
                </label>
                <input
                  type="url"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={handleChange}
                  placeholder="https://x.com/..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  YouTube URL
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
                />
              </div>
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

          {/* Taxi Round Trip Exclusions & Terms Configuration */}
          <div className="border-t border-gray-100 pt-8 mt-8">
            <h3 className="text-sm font-black uppercase tracking-tight mb-4 text-gray-900">Taxi / Round Trip Package Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  Taxi Exclusions (One Item Per Line)
                </label>
                <textarea
                  name="taxiExclusions"
                  value={formData.taxiExclusions}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter excluded items..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                  Taxi Terms & Conditions (One Item Per Line)
                </label>
                <textarea
                  name="taxiTerms"
                  value={formData.taxiTerms}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Enter terms and conditions..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
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
            className="bg-brand-gold hover:bg-brand-gold-hover text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} /> {loading ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
