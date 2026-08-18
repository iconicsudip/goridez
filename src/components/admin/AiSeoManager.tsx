'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bot, Map, FileCode2, Sparkles, Save, RotateCcw, ExternalLink,
  CheckCircle2, AlertCircle, EyeOff, Wand2,
} from 'lucide-react';
import {
  updateRobotsTxt, getDefaultRobotsTxt, updateLlmsTxt, generateLlmsTxtDraftAction,
} from '@/app/admin/actions';

type Tab = 'sitemap' | 'robots' | 'llms';

interface Props {
  siteUrl: string;
  isRobotsCustomized: boolean;
  isLlmsCustomized: boolean;
  initialRobotsTxt: string;
  initialLlmsTxt: string;
  noIndexPages: { pagePath: string; pageName: string }[];
  sitemapStats: { static: number; cars: number; tours: number; blogs: number };
}

const TABS: { id: Tab; label: string; icon: typeof Map }[] = [
  { id: 'sitemap', label: 'Sitemap', icon: Map },
  { id: 'robots', label: 'Robots.txt', icon: FileCode2 },
  { id: 'llms', label: 'LLMs.txt', icon: Sparkles },
];

function StatusBadge({ customized, customLabel, defaultLabel }: { customized: boolean; customLabel: string; defaultLabel: string }) {
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
      customized ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'
    }`}>
      {customized ? customLabel : defaultLabel}
    </span>
  );
}

export default function AiSeoManager({
  siteUrl, isRobotsCustomized, isLlmsCustomized, initialRobotsTxt, initialLlmsTxt, noIndexPages, sitemapStats,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam === 'robots' || tabParam === 'llms' ? tabParam : 'sitemap'
  );

  const [robotsText, setRobotsText] = useState(initialRobotsTxt);
  const [robotsSaving, setRobotsSaving] = useState(false);
  const [robotsResetting, setRobotsResetting] = useState(false);
  const [robotsMsg, setRobotsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [llmsText, setLlmsText] = useState(initialLlmsTxt);
  const [llmsSaving, setLlmsSaving] = useState(false);
  const [llmsGenerating, setLlmsGenerating] = useState(false);
  const [llmsMsg, setLlmsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalUrls = sitemapStats.static + sitemapStats.cars + sitemapStats.tours + sitemapStats.blogs - noIndexPages.length;

  const saveRobots = async () => {
    setRobotsSaving(true);
    setRobotsMsg(null);
    const res = await updateRobotsTxt(robotsText);
    setRobotsSaving(false);
    if (res.success) {
      setRobotsMsg({ type: 'success', text: 'robots.txt saved — live at /robots.txt' });
      router.refresh();
    } else {
      setRobotsMsg({ type: 'error', text: res.error || 'Failed to save' });
    }
  };

  const resetRobots = async () => {
    setRobotsResetting(true);
    const fresh = await getDefaultRobotsTxt();
    setRobotsText(fresh);
    setRobotsResetting(false);
    setRobotsMsg({ type: 'success', text: 'Reset to the auto-generated default below — click Save to publish it.' });
  };

  const saveLlms = async () => {
    setLlmsSaving(true);
    setLlmsMsg(null);
    const res = await updateLlmsTxt(llmsText);
    setLlmsSaving(false);
    if (res.success) {
      setLlmsMsg({ type: 'success', text: 'llms.txt saved — live at /llms.txt' });
      router.refresh();
    } else {
      setLlmsMsg({ type: 'error', text: res.error || 'Failed to save' });
    }
  };

  const generateLlms = async () => {
    setLlmsGenerating(true);
    setLlmsMsg(null);
    const res = await generateLlmsTxtDraftAction();
    setLlmsGenerating(false);
    if (res.success && res.draft) {
      setLlmsText(res.draft);
      setLlmsMsg({ type: 'success', text: 'Fresh draft generated from live site content below — review and click Save to publish it.' });
    } else {
      setLlmsMsg({ type: 'error', text: res.error || 'Failed to generate draft' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 font-body">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
          <Bot size={16} /> AI SEO
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">
          Sitemap, Robots.txt &amp; LLMs.txt
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Controls how search engines and AI crawlers discover and index this site.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px cursor-pointer ${
                isActive ? 'text-green-700 border-green-700' : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- Sitemap tab --- */}
      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight">Sitemap.xml</h2>
                <p className="text-gray-500 text-xs mt-1 max-w-xl leading-relaxed">
                  Regenerated automatically from live content (at most once an hour) — vehicles, tours and blog posts are pulled straight from the database, so it never drifts out of sync. Pages marked &quot;Hide from Search Engines&quot; in <span className="font-mono">/admin/seo</span> are automatically excluded.
                </p>
              </div>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl whitespace-nowrap"
              >
                View Live <ExternalLink size={13} />
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Static & Legal', value: sitemapStats.static },
                { label: 'Vehicles', value: sitemapStats.cars },
                { label: 'Tours', value: sitemapStats.tours },
                { label: 'Blog Posts', value: sitemapStats.blogs },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Total URLs in sitemap</span>
              <span className="text-xl font-black text-green-700">{totalUrls}</span>
            </div>
          </div>

          {noIndexPages.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                <EyeOff size={15} className="text-amber-600" /> Excluded from Sitemap ({noIndexPages.length})
              </h3>
              <p className="text-gray-500 text-xs mb-4">
                These pages are marked NoIndex in <span className="font-mono">/admin/seo</span>, so they&apos;re left out of the sitemap.
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
      )}

      {/* --- Robots.txt tab --- */}
      {activeTab === 'robots' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight">Robots.txt</h2>
              <p className="text-gray-500 text-xs mt-1">Tells search engine &amp; AI crawlers which paths they may access.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge customized={isRobotsCustomized} customLabel="Custom" defaultLabel="Auto-Generated" />
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

          {robotsMsg && (
            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              robotsMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {robotsMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {robotsMsg.text}
            </div>
          )}

          <textarea
            value={robotsText}
            onChange={(e) => setRobotsText(e.target.value)}
            spellCheck={false}
            className="w-full mt-6 bg-zinc-950 text-green-400 border border-zinc-800 rounded-2xl p-4 text-xs font-mono h-80 leading-relaxed outline-none focus:border-green-500 resize-y"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={resetRobots}
              disabled={robotsResetting}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw size={14} /> {robotsResetting ? 'Resetting…' : 'Reset to Generated Default'}
            </button>
            <button
              type="button"
              onClick={saveRobots}
              disabled={robotsSaving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-green-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} /> {robotsSaving ? 'Saving…' : 'Save robots.txt'}
            </button>
          </div>
        </div>
      )}

      {/* --- LLMs.txt tab --- */}
      {activeTab === 'llms' && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h2 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight">LLMs.txt</h2>
              <p className="text-gray-500 text-xs mt-1 max-w-xl leading-relaxed">
                A plain-language, structured summary of the site for AI assistants &amp; LLM crawlers to read (the <a href="https://llmstxt.org" target="_blank" rel="noreferrer" className="underline">llms.txt standard</a>) — services, vehicles, cities, tours and articles as markdown links.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge customized={isLlmsCustomized} customLabel="Custom" defaultLabel="Auto-Generated" />
              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl whitespace-nowrap"
              >
                View Live <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {llmsMsg && (
            <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              llmsMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {llmsMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {llmsMsg.text}
            </div>
          )}

          <textarea
            value={llmsText}
            onChange={(e) => setLlmsText(e.target.value)}
            spellCheck={false}
            className="w-full mt-6 bg-zinc-950 text-green-400 border border-zinc-800 rounded-2xl p-4 text-xs font-mono h-96 leading-relaxed outline-none focus:border-green-500 resize-y"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={generateLlms}
              disabled={llmsGenerating}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Wand2 size={14} /> {llmsGenerating ? 'Generating…' : 'Generate Draft from Site Content'}
            </button>
            <button
              type="button"
              onClick={saveLlms}
              disabled={llmsSaving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-green-600/20 disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} /> {llmsSaving ? 'Saving…' : 'Save llms.txt'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
