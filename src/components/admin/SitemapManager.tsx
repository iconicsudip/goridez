'use client';

import { Map, ExternalLink, EyeOff } from 'lucide-react';

interface Props {
  noIndexPages: { pagePath: string; pageName: string }[];
  sitemapStats: { static: number; cars: number; tours: number; blogs: number };
}

export default function SitemapManager({ noIndexPages, sitemapStats }: Props) {
  const totalUrls = sitemapStats.static + sitemapStats.cars + sitemapStats.tours + sitemapStats.blogs - noIndexPages.length;

  return (
    <div className="max-w-6xl mx-auto py-6 font-body">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
          <Map size={16} /> AI SEO
        </div>
        <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">Sitemap.xml</h1>
        <p className="text-gray-500 text-sm mt-1">Controls which pages search engines discover and crawl.</p>
      </div>

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
    </div>
  );
}
