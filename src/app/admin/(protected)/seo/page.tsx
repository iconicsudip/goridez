import { prisma } from '@/lib/prisma';
import SeoManager from '@/components/admin/SeoManager';
import { getCarSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminSeoPage() {
  const [seoSettings, siteSettings, cars, blogs, cities, tours] = await Promise.all([
    prisma.seoSetting.findMany({ orderBy: { pageName: 'asc' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.car.findMany({ select: { id: true, make: true, model: true } }),
    prisma.blog.findMany({ where: { isDraft: false }, select: { slug: true, title: true } }),
    prisma.city.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.tour.findMany({ select: { id: true, title: true } }),
  ]);

  const staticPages = [
    { group: 'Core Pages', path: '/', name: 'Home Page' },
    { group: 'Core Pages', path: '/about', name: 'About Us' },
    { group: 'Core Pages', path: '/self-drive', name: 'Self Drive Fleet' },
    { group: 'Core Pages', path: '/taxi', name: 'Taxi & Outstation' },
    { group: 'Core Pages', path: '/cities', name: 'Cities We Serve' },
    { group: 'Core Pages', path: '/blogs', name: 'Editorial Journal / Blogs' },
    { group: 'Core Pages', path: '/tours', name: 'Rajasthan Tours' },
    { group: 'Core Pages', path: '/villas', name: 'Villa Stays' },
    { group: 'Core Pages', path: '/contact', name: 'Contact Us' },
    { group: 'Legal Pages', path: '/terms', name: 'Terms of Service' },
    { group: 'Legal Pages', path: '/privacy', name: 'Privacy Policy' },
    { group: 'Legal Pages', path: '/cancellation-refund', name: 'Cancellation & Refund Policy' },
    { group: 'Legal Pages', path: '/shipping-policy', name: 'Shipping & Delivery Policy' },
  ];

  const carPages = cars.map((car) => {
    const slug = getCarSlug(car);
    return {
      group: 'Vehicles (Self-Drive / Taxi)',
      path: `/cars/${slug}`,
      name: `${car.make} ${car.model}`,
    };
  });

  const blogPages = blogs.map((blog) => ({
    group: 'Blog Posts',
    path: `/blogs/${blog.slug}`,
    name: blog.title,
  }));

  const cityPages = cities.map((city) => ({
    group: 'Cities',
    path: `/cities/${city.slug || city.name.toLowerCase()}`,
    name: `${city.name} City Page`,
  }));

  const tourPages = tours.map((tour) => ({
    group: 'Tours',
    path: `/tours/${tour.id}`,
    name: tour.title,
  }));

  const rawPages = [
    ...staticPages,
    ...carPages,
    ...blogPages,
    ...cityPages,
    ...tourPages,
  ];

  // Deduplicate by path to ensure unique keys and clean options
  const uniqueMap = new Map<string, { group: string; path: string; name: string }>();
  rawPages.forEach((item) => {
    if (!uniqueMap.has(item.path)) {
      uniqueMap.set(item.path, item);
    }
  });

  const allAvailablePages = Array.from(uniqueMap.values());

  return (
    <SeoManager
      initialSettings={seoSettings}
      initialFavicon={siteSettings?.favicon || '/favicon.ico'}
      availablePages={allAvailablePages}
    />
  );
}
