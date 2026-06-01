'use client';

import { useState } from 'react';
import { updateAboutPage } from '@/app/admin/actions';
import { Info, Save, X, Image as ImageIcon } from 'lucide-react';

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

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById('about-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    setFormData({ ...formData, content: newValue });
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 0);
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-white flex items-center gap-3">
            <Info className="text-brand-neon" size={32} /> About Page Editor
          </h1>
          <p className="text-white/50 text-[13px]">
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
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50 border-b border-white/5 pb-4 mb-4">
            Header Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold font-mono">
                Page Header Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. About GoRidez"
                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold font-mono">
                Banner Image URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#050505] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors"
                />
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold font-mono">
              Subtitle / Vision Catchphrase
            </label>
            <input
              type="text"
              required
              value={formData.subtitle}
              onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Redefining premium transport across the heart of Rajasthan."
              className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors"
            />
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white/50 border-b border-white/5 pb-4 mb-4">
            Storytelling & Page Body Content
          </h2>

          <div>
            <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold font-mono">
              Body Content (HTML Supported)
            </label>
            <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden focus-within:border-brand-neon transition-colors">
              {/* Toolbar */}
              <div className="bg-[#111111] border-b border-white/10 p-2 flex flex-wrap gap-1">
                {[
                  { label: 'Paragraph', open: '<p class="text-white/60 mb-6 leading-relaxed">', close: '</p>' },
                  { label: 'Heading 2', open: '<h2 class="text-2xl font-black uppercase tracking-tight text-white mt-8 mb-4">', close: '</h2>' },
                  { label: 'Heading 3', open: '<h3 class="text-lg font-bold uppercase text-brand-neon mt-6 mb-3">', close: '</h3>' },
                  { label: 'Bold', open: '<strong>', close: '</strong>' },
                  { label: 'Italic', open: '<em>', close: '</em>' },
                  { label: 'Bullet list', open: '<ul class="list-disc pl-5 mb-6 text-white/60 space-y-2">', close: '</ul>' },
                  { label: 'List Item', open: '<li>', close: '</li>' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => insertTag(btn.open, btn.close)}
                    className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 text-[9px] font-bold uppercase tracking-widest text-white/70 hover:text-white rounded-lg transition-colors"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <textarea
                id="about-editor-textarea"
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your brand story here (HTML tags are supported)..."
                className="w-full bg-transparent p-4 min-h-[400px] font-mono text-xs text-white outline-none border-0 resize-y"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-neon hover:bg-brand-hover text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
