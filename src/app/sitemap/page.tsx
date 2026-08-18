import Link from 'next/link';
import { getSitemapEntries, type SitemapEntry } from '@/lib/sitemap-entries';

export const revalidate = 3600;

export const metadata = {
  title: 'Sitemap | GoRidez',
  description: 'Every page on GoRidez, grouped by section.',
};

const GROUP_ORDER: SitemapEntry['group'][] = ['Core Pages', 'Vehicles', 'Tours', 'Blog Posts', 'Legal Pages', 'Custom'];

export default async function HtmlSitemapPage() {
  const entries = await getSitemapEntries();

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: entries.filter((e) => e.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-28 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Sitemap</h1>
        <p className="text-gray-500 text-sm mb-10">
          Every page on GoRidez. Looking for the machine-readable version? See{' '}
          <a href="/sitemap.xml" className="text-green-700 underline">sitemap.xml</a>.
        </p>

        <div className="space-y-10">
          {grouped.map(({ group, items }) => (
            <div key={group}>
              <h2 className="text-sm font-black uppercase tracking-widest text-green-700 border-b border-gray-200 pb-2 mb-4">
                {group} <span className="text-gray-400 font-normal">({items.length})</span>
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {items.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path} className="text-sm text-gray-700 hover:text-green-700 hover:underline">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
