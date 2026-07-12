import { prisma } from '@/lib/prisma';
import InstagramReelsManager from '@/components/admin/InstagramReelsManager';

export const dynamic = 'force-dynamic';

export default async function AdminReelsPage() {
  const reels = await prisma.instagramReel.findMany({ orderBy: { order: 'asc' } });

  return <InstagramReelsManager reels={reels} />;
}
