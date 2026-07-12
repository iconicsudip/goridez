import { prisma } from '@/lib/prisma';
import LegalPageLayout from '@/components/LegalPageLayout';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'terms' } });
  return { title: `${data?.title || 'Terms of Service'} | GoRidez` };
}

export default async function TermsOfServicePage() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'terms' } });

  const title = data?.title || 'Terms of Service';
  const content = data?.content || '<p class="text-gray-600 mb-6 leading-relaxed">These Terms of Service govern your use of GoRidez\'s vehicles, tours, and villa booking services.</p>';

  return <LegalPageLayout title={title} imageUrl={data?.imageUrl} content={content} />;
}
