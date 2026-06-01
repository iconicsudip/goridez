'use client';

import { useState, useEffect } from 'react';
import { createFaq, updateFaq, deleteFaq } from '@/app/admin/actions';
import { Edit2, Trash2, X, Plus, HelpCircle, Check, Play, Power } from 'lucide-react';

export default function FaqManager({ faqs }: { faqs: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    question: '',
    answer: '',
    isActive: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditing) {
      await updateFaq(formData.id, {
        question: formData.question,
        answer: formData.answer,
        isActive: formData.isActive
      });
    } else {
      const data = new FormData();
      data.append('question', formData.question);
      data.append('answer', formData.answer);
      data.append('isActive', String(formData.isActive));
      await createFaq(data);
    }

    setFormData({ id: '', question: '', answer: '', isActive: true });
    setIsEditing(false);
    setIsDrawerOpen(false);
    setLoading(false);
  };

  const handleEdit = (faq: any) => {
    setFormData({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      isActive: faq.isActive
    });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleNewFaq = () => {
    setFormData({
      id: '',
      question: '',
      answer: '',
      isActive: true
    });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      await deleteFaq(id);
    }
  };

  const toggleActive = async (id: string, currentActiveStatus: boolean) => {
    await updateFaq(id, { isActive: !currentActiveStatus });
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-white flex items-center gap-3">
            <HelpCircle className="text-brand-neon" size={32} /> FAQ CMS Controls
          </h1>
          <p className="text-white/50 text-[13px]">
            Manage frequently asked questions displayed at the bottom of the home page.
          </p>
        </div>
        <button
          onClick={handleNewFaq}
          className="bg-brand-neon hover:bg-brand-hover text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] flex items-center gap-2 shrink-0"
        >
          <Plus size={14} strokeWidth={3} /> Create FAQ Entry
        </button>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 mb-8">
        <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4 font-mono">
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Question & Answer Summary</div>
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Status & Controls</div>
        </div>

        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="text-[11px] text-white/30 italic text-center py-10 font-mono border border-dashed border-white/10 rounded-2xl">
              No FAQs created yet. Click "Create FAQ Entry" to add one.
            </div>
          ) : (
            faqs.map((faq) => (
              <div key={faq.id} className="flex flex-col md:flex-row md:items-center justify-between py-5 border-b border-white/5 last:border-0 group gap-4">
                <div className="max-w-3xl">
                  <h3 className="font-bold text-sm text-white mb-2 flex items-start gap-2">
                    <span className="text-brand-neon font-black">Q:</span> {faq.question}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed font-mono pl-5">
                    <span className="text-white/30 font-black mr-1">A:</span> {faq.answer}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t border-white/5 pt-3 md:border-t-0 md:pt-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleActive(faq.id, faq.isActive)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${faq.isActive
                          ? 'border-[#00FF66]/30 text-[#00FF66] bg-[#00FF66]/5 hover:bg-[#00FF66]/10'
                          : 'border-white/10 text-white/40 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                    >
                      <Power size={10} />
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(faq)}
                      title="Edit"
                      className="p-2 bg-white/5 hover:bg-brand-neon/10 hover:text-brand-neon text-white/40 rounded-xl transition-all border border-white/5"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      title="Delete"
                      className="p-2 bg-red-500/5 hover:bg-red-500/20 text-red-500/50 hover:text-red-500 rounded-xl transition-all border border-red-500/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-xl bg-[#111111] border-l border-white/10 h-full p-8 overflow-y-auto shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] text-brand-neon font-black tracking-widest uppercase mb-1 block">FAQ CMS Controls</span>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">
                      {isEditing ? 'Edit FAQ Entry' : 'Create FAQ Entry'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold font-mono">
                      Question Text
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.question}
                      onChange={e => setFormData({ ...formData, question: e.target.value })}
                      placeholder="e.g. Do I need a security deposit for self-drive bookings?"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors placeholder:text-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold font-mono">
                      Answer Text
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.answer}
                      onChange={e => setFormData({ ...formData, answer: e.target.value })}
                      placeholder="Provide a clear, detailed answer..."
                      className="w-full bg-[#050505] border border-white/10 rounded-xl p-4 text-sm focus:border-brand-neon outline-none text-white transition-colors placeholder:text-white/20 resize-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold font-mono">
                      Status
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors cursor-pointer"
                    >
                      <option value="active">Active (Show on Home Page)</option>
                      <option value="inactive">Inactive (Hide)</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/5 mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-brand-neon hover:bg-brand-hover text-black py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : isEditing ? 'Update FAQ Entry →' : 'Publish FAQ Entry →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-6 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
