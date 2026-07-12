'use client';

import { useState } from 'react';
import { updateAboutPage } from '@/app/admin/actions';
import { Info, Save, X, Image as ImageIcon } from 'lucide-react';
import ImageUpload from './ImageUpload';
import RichTextEditor from './RichTextEditor';

interface AboutPageData {
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string | null;
}

export default function AboutManager({ initialData }: { initialData: AboutPageData | null }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: initialData?.title || 'About GoRidez',
    subtitle: initialData?.subtitle || 'Premium Car Rentals & Excursions in Rajasthan',
    imageUrl: initialData?.imageUrl || '',
    content: initialData?.content || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('imageUrl', formData.imageUrl);
    data.append('content', formData.content);

    const res = await updateAboutPage(data);
    setLoading(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'About Page content updated successfully!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save changes.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            <Info className="text-green-700" size={32} /> About Page Editor
          </h1>
          <p className="text-gray-500 text-[13px]">
            Manage the content, banner images, brand vision, and storytelling blocks of the customer-facing About Page.
          </p>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl mb-6 text-xs font-mono border flex justify-between items-center ${
            statusMsg.type === 'success'
              ? 'bg-[#00FF66]/5 border-[#00FF66]/20 text-[#00FF66]'
              : 'bg-red-500/5 border-red-500/20 text-red-400'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-4 mb-4">
            Header Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Page Header Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. About GoRidez"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Banner Image URL
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(value) => setFormData({ ...formData, imageUrl: value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
              Subtitle / Vision Catchphrase
            </label>
            <input
              type="text"
              required
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Redefining premium transport across the heart of Rajasthan."
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
            />
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-4 mb-4">
            Storytelling & Page Body Content
          </h2>

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
              Body Content
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Write your brand story here..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-brand-hover text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
