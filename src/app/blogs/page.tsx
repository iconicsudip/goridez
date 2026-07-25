import { prisma } from '@/lib/prisma';
import BlogsClient from './BlogsClient';

export const revalidate = 300;

export default async function BlogsPage() {
  const blogs = await prisma.blog.findMany({
    where: { isDraft: false },
    orderBy: { createdAt: 'desc' }
  });

  return <BlogsClient initialBlogs={blogs} />;
}
