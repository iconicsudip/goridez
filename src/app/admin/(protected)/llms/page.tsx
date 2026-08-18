import { prisma } from '@/lib/prisma';
import LlmsTxtManager from '@/components/admin/LlmsTxtManager';
import { generateLlmsTxtDraft } from '@/lib/llms-txt';

export const dynamic = 'force-dynamic';

export default async function AdminLlmsPage() {
  const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } });
  const isCustomized = !!siteSettings?.llmsTxt?.trim();
  const effectiveLlmsTxt = siteSettings?.llmsTxt?.trim() || (await generateLlmsTxtDraft());

  return <LlmsTxtManager isCustomized={isCustomized} initialLlmsTxt={effectiveLlmsTxt} />;
}
