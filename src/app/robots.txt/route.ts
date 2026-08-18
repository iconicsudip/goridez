import { prisma } from '@/lib/prisma';
import { buildDefaultRobotsTxt } from '@/lib/robots-txt';

// Regenerated at most once an hour, same as sitemap.ts.
export const revalidate = 3600;

// A plain Route Handler (rather than the app/robots.ts typed-object convention) so admins can
// fully hand-edit the file in /admin/robots, including directives the typed Robots API doesn't
// model — the raw text saved there (SiteSettings.customRobotsTxt) is served back verbatim.
export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const body = settings?.customRobotsTxt?.trim() ? settings.customRobotsTxt : buildDefaultRobotsTxt();

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
