import { prisma } from '@/lib/prisma';
import { generateLlmsTxtDraft } from '@/lib/llms-txt';

// Regenerated at most once an hour, same as sitemap.ts / robots.txt.
export const revalidate = 3600;

// Serves the admin-saved llms.txt (SiteSettings.llmsTxt) verbatim, or falls back to a live
// auto-generated draft — see generateLlmsTxtDraft — until an admin saves one on /admin/llms.
export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const body = settings?.llmsTxt?.trim() ? settings.llmsTxt : await generateLlmsTxtDraft();

  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
