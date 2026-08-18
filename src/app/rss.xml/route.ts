import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/utils';

export const revalidate = 3600;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function plainExcerpt(html: string, length = 300): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, length);
}

/** RSS 2.0 feed of published blog posts, newest first — the standard feed clients & AI
 * crawlers alike look for at the conventional /rss.xml path. */
export async function GET() {
  const base = getSiteUrl();
  const blogs = await prisma.blog.findMany({
    where: { isDraft: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { title: true, slug: true, content: true, author: true, createdAt: true },
  });

  const items = blogs
    .map((blog) => {
      const link = `${base}/blogs/${blog.slug}`;
      return `    <item>
      <title>${escapeXml(blog.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(plainExcerpt(blog.content))}</description>
      ${blog.author ? `<author>${escapeXml(blog.author)}</author>` : ''}
      <pubDate>${blog.createdAt.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>GoRidez Editorial Journal</title>
    <link>${base}/blogs</link>
    <description>Rajasthan travel guides, driving routes and destination tips from GoRidez.</description>
    <language>en-in</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
