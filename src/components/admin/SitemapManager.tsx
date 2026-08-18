'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Map, ExternalLink, EyeOff, Save, CheckCircle2, AlertCircle, Rss, FileText } from 'lucide-react';
import { updateSitemapConfig } from '@/app/admin/actions';

interface Props {
  groupCounts: Record<string, number>;
  totalUrls: number;
  noIndexPages: { pagePath: string; pageName: string }[];
  initialExtraUrls: string;
  initialExcludedPaths: string;
}

const GROUPS = ['Core Pages', 'Legal Pages', 'Vehicles', 'Tours', 'Blog Posts', 'Custom'];

export default function SitemapManager({ groupCounts, totalUrls, noIndexPages, initialExtraUrls, initialExcludedPaths }: Props) {
  const router = useRouter();
  const [extraUrls, setExtraUrls] = useState(initialExtraUrls);
  const [excludedPaths, setExcludedPaths] = useState(initialExcludedPaths);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const res = await updateSitemapConfig(extraUrls, excludedPaths);
    setSaving(false);
    if (res.success) {
      setMsg({ type: 'success', text: 'Sitemap updated — live at /sitemap.xml' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 font-body">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
          <Map size={16} /> AI SEO
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">Sitemap</h1>
        <p className="text-gray-500 text-sm mt-1">Controls which pages search engines discover and crawl.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight">Live Formats</h2>
              <p className="text-gray-500 text-xs mt-1 max-w-xl leading-relaxed">
                Regenerated automatically from live content (at most once an hour). Vehicles, tours, and blog posts are pulled straight from the database, so it never drifts out of sync.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl whitespace-nowrap">
                XML <ExternalLink size={13} />
              </a>
              <a href="/sitemap" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl whitespace-nowrap">
                <FileText size={13} /> HTML
              </a>
              <a href="/rss.xml" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl whitespace-nowrap">
                <Rss size={13} /> RSS
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {GROUPS.map((group) => (
              <div key={group} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black text-gray-900">{groupCounts[group] || 0}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{group}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Total URLs in sitemap</span>
            <span className="text-xl font-black text-green-700">{totalUrls}</span>
          </div>
        </div>

        {/* Editable extra/excluded config */}
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight mb-1">Edit Sitemap</h2>
          <p className="text-gray-500 text-xs mb-6 max-w-2xl leading-relaxed">
            Vehicles, tours and blog posts are added automatically and can&apos;t be hand-edited here (so a renamed or deleted item can never leave a broken link behind) — but you can add extra pages the auto-detector doesn&apos;t know about, or exclude specific paths entirely. One path per line, e.g. <span className="font-mono">/villas</span>.
          </p>

          {msg && (
            <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {msg.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                Additional URLs to Include
              </label>
              <textarea
                value={extraUrls}
                onChange={(e) => setExtraUrls(e.target.value)}
                placeholder={'/some-custom-page\n/another-page'}
                spellCheck={false}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-xs font-mono focus:border-green-600 outline-none text-gray-900 h-40 leading-relaxed resize-y"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                Exclude These Paths
              </label>
              <textarea
                value={excludedPaths}
                onChange={(e) => setExcludedPaths(e.target.value)}
                placeholder={'/cars/some-old-listing'}
                spellCheck={false}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-xs font-mono focus:border-green-600 outline-none text-gray-900 h-40 leading-relaxed resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-green-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} /> {saving ? 'Saving…' : 'Save Sitemap Config'}
            </button>
          </div>
        </div>

        {noIndexPages.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
              <EyeOff size={15} className="text-amber-600" /> Also Excluded via NoIndex ({noIndexPages.length})
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              These pages are marked NoIndex in <span className="font-mono">/admin/seo</span>, so they&apos;re left out of the sitemap automatically — no need to list them above too.
            </p>
            <div className="flex flex-col gap-2">
              {noIndexPages.map((p) => (
                <div key={p.pagePath} className="flex items-center justify-between bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-2.5">
                  <span className="text-xs font-bold text-gray-800">{p.pageName}</span>
                  <span className="text-[10px] font-mono text-gray-500">{p.pagePath}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
