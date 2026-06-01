import BlogManager from '@/components/admin/BlogManager';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <BlogManager blogs={blogs} />;
}
