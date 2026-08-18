'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileCode2, Save, RotateCcw, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateRobotsTxt, getDefaultRobotsTxt } from '@/app/admin/actions';

interface Props {
  isCustomized: boolean;
  initialRobotsTxt: string;
}

export default function RobotsTxtManager({ isCustomized, initialRobotsTxt }: Props) {
  const router = useRouter();
  const [text, setText] = useState(initialRobotsTxt);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const res = await updateRobotsTxt(text);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: 'robots.txt saved — live at /robots.txt' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' });
    }
  };

  const reset = async () => {
    setResetting(true);
    const fresh = await getDefaultRobotsTxt();
    setText(fresh);
    setResetting(false);
    setMsg({ type: 'success', text: 'Reset to the auto-generated default below — click Save to publish it.' });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 font-body">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
          <FileCode2 size={16} /> AI SEO
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">Robots.txt</h1>
        <p className="text-gray-500 text-sm mt-1">Tells search engine &amp; AI crawlers which paths they may access.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight">robots.txt</h2>
            <p className="text-gray-500 text-xs mt-1">Edit directly, or reset to the auto-generated default below.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
              isCustomized ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              {isCustomized ? 'Custom' : 'Auto-Generated'}
            </span>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl whitespace-nowrap"
            >
              View Live <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {msg && (
          <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
            msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {msg.text}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          className="w-full mt-6 bg-zinc-950 text-green-400 border border-zinc-800 rounded-2xl p-4 text-xs font-mono h-80 leading-relaxed outline-none focus:border-green-500 resize-y"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={reset}
            disabled={resetting}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw size={14} /> {resetting ? 'Resetting…' : 'Reset to Generated Default'}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-green-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Save size={14} /> {saving ? 'Saving…' : 'Save robots.txt'}
          </button>
        </div>
      </div>
    </div>
  );
}
