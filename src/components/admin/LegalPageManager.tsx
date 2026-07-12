'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Save, X, Trash2, Mail } from 'lucide-react';
import { updateLegalPage, updateContactSubmissionStatus, deleteContactSubmission } from '@/app/admin/actions';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';

interface LegalPageData {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: Date;
}

const PAGE_TABS = [
  { id: 'privacy', label: 'Privacy Policy', defaultTitle: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Service', defaultTitle: 'Terms of Service' },
  { id: 'cancellation-refund', label: 'Cancellation & Refund', defaultTitle: 'Cancellation & Refund Policy' },
  { id: 'shipping-policy', label: 'Shipping & Delivery', defaultTitle: 'Shipping & Service Delivery Policy' },
  { id: 'contact', label: 'Contact Us', defaultTitle: 'Contact Us' },
];

function PageEditor({ page }: { page: LegalPageData }) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({ title: page.title, content: page.content, imageUrl: page.imageUrl || '' });
  const showBanner = page.id !== 'contact';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('imageUrl', formData.imageUrl);

    const res = await updateLegalPage(page.id, data);
    setLoading(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Page content updated successfully!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Failed to save changes.' });
    }
  };

  return (
    <div>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-6">
          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
              Page Header Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
            />
          </div>

          {showBanner && (
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
                Hero Banner Image
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(value) => setFormData({ ...formData, imageUrl: value })}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
              Body Content
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="Write the page content here..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-brand-hover text-black px-8 py-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={14} />
            {loading ? 'Saving Changes...' : 'Save Page'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SubmissionsPanel({ submissions }: { submissions: ContactSubmission[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await updateContactSubmissionStatus(id, 'READ');
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this submission permanently?')) return;
    startTransition(async () => {
      await deleteContactSubmission(id);
      router.refresh();
    });
  };

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-green-700 font-black tracking-widest uppercase mb-1 block">Contact Desk</span>
          <h2 className="text-lg font-black uppercase text-gray-900">Inbound Contact Submissions</h2>
        </div>
        <span className="text-[10px] font-mono text-gray-400 uppercase">{submissions.length} Records</span>
      </div>

      <div className="divide-y divide-gray-200">
        {submissions.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-xs font-mono uppercase">No submissions yet</div>
        )}
        {submissions.map((s) => (
          <div key={s.id} className="p-6 flex flex-col md:flex-row gap-4 md:items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-black text-sm text-gray-900">{s.name}</span>
                <span
                  className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                    s.status === 'NEW'
                      ? 'bg-green-600/10 text-green-700 border-green-600/20'
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <div className="text-[11px] text-gray-500 font-mono mb-2">
                {s.email}{s.phone ? ` · ${s.phone}` : ''} · {new Date(s.createdAt).toLocaleString()}
              </div>
              {s.subject && <div className="text-xs font-bold text-gray-700 mb-1">{s.subject}</div>}
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{s.message}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {s.status === 'NEW' && (
                <button
                  disabled={isPending}
                  onClick={() => handleMarkRead(s.id)}
                  className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50"
                >
                  Mark Read
                </button>
              )}
              <button
                disabled={isPending}
                onClick={() => handleDelete(s.id)}
                className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LegalPageManager({
  pages,
  submissions,
}: {
  pages: Record<string, LegalPageData>;
  submissions: ContactSubmission[];
}) {
  const [activeTab, setActiveTab] = useState('privacy');
  const newCount = submissions.filter(s => s.status === 'NEW').length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            <FileText className="text-green-700" size={32} /> Legal Pages Editor
          </h1>
          <p className="text-gray-500 text-[13px]">
            Manage the content of the Privacy Policy, Terms of Service, Cancellation & Refund, Shipping & Delivery, and Contact Us pages, and review inbound contact submissions.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === tab.id
                ? 'bg-green-600 border-green-600 text-black shadow-md'
                : 'bg-transparent border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-green-600 border-green-600 text-black shadow-md'
              : 'bg-transparent border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900'
          }`}
        >
          <Mail size={12} /> Submissions
          {newCount > 0 && (
            <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">
              {newCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'submissions' ? (
        <SubmissionsPanel submissions={submissions} />
      ) : (
        <PageEditor key={activeTab} page={pages[activeTab]} />
      )}
    </div>
  );
}
