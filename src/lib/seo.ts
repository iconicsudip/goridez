import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { getCarSlug } from '@/lib/utils';

export interface DefaultSeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Fetch SEO settings from Database for a specific path
 */
export async function getSeoForPath(pagePath: string) {
  try {
    const seo = await prisma.seoSetting.findUnique({
      where: { pagePath },
    });
    return seo;
  } catch (error) {
    console.error(`Error fetching SEO setting for ${pagePath}:`, error);
    return null;
  }
}

/**
 * Generate Next.js Metadata for static or custom admin configured pages
 */
export async function generatePageMetadata(
  pagePath: string,
  defaults: DefaultSeoProps = {}
): Promise<Metadata> {
  const seo = await getSeoForPath(pagePath);

  const title = seo?.metaTitle || defaults.title || 'GoRidez — Self Drive Cars & Taxi Service in Rajasthan';
  const description = seo?.metaDescription || defaults.description || 'Book top self-drive cars, luxury taxis, airport transfers and guided Rajasthan tours with GoRidez. Zero hidden fees & 24/7 support.';
  const keywords = seo?.metaKeywords || defaults.keywords || 'self drive cars udaipur, taxi service rajasthan, airport transfers udaipur, car rental jaipur';
  const canonical = seo?.canonicalUrl || defaults.canonicalUrl || (pagePath !== '/' ? `https://goridez.com${pagePath}` : 'https://goridez.com');
  const ogImage = seo?.ogImage || defaults.ogImage || '/logo-full.png';
  const noIndex = seo?.noIndex ?? (defaults.noIndex || false);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

/**
 * Dynamic SEO & Schema Generator for Car Details Page
 */
export async function generateCarMetadata(carIdOrSlug: string): Promise<Metadata> {
  const customPath = `/cars/${carIdOrSlug}`;
  const customSeo = await getSeoForPath(customPath);
  if (customSeo) {
    return generatePageMetadata(customPath);
  }

  let car: any = await prisma.car.findUnique({
    where: { id: carIdOrSlug },
    include: { city: true, packages: { orderBy: { basePrice: 'asc' } } },
  });

  if (!car) {
    const allCars = await prisma.car.findMany({ include: { city: true } });
    car = allCars.find((c) => getCarSlug(c) === carIdOrSlug) || null;
  }

  if (!car) {
    return generatePageMetadata('/self-drive', { title: 'Car Rental Details | GoRidez' });
  }

  const carSlug = getCarSlug(car);
  const title = `${car.make} ${car.model} Self Drive & Taxi Hire | GoRidez ${car.city?.name || 'Udaipur'}`;
  const description = `Book ${car.make} ${car.model} (${car.transmission || 'Manual'}, ${car.fuelType || 'Petrol'}, ${car.seatingCapacity} Seater) in ${car.city?.name || 'Rajasthan'}. Zero deposit, unlimited km options & 24/7 support.`;
  const keywords = `${car.make} ${car.model}, ${car.make} self drive udaipur, rent ${car.model} rajasthan, ${car.make} rental`;
  const canonicalUrl = `https://goridez.com/cars/${carSlug}`;
  const ogImage = car.image || '/logo-full.png';

  return {
    title,
    description,
    keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
  };
}

/**
 * Helper to build JSON-LD Schema for Car Details Page
 */
export function buildCarJsonLd(car: any) {
  if (!car) return null;

  const carSlug = getCarSlug(car);
  const lowestPackagePrice = car.packages && car.packages.length > 0 ? car.packages[0].basePrice : 2500;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Vehicle',
    'name': `${car.make} ${car.model}`,
    'url': `https://goridez.com/cars/${carSlug}`,
    'image': [car.image],
    'description': car.content || `${car.make} ${car.model} available for self-drive and chauffeur rentals in Rajasthan.`,
    'brand': {
      '@type': 'Brand',
      'name': car.make,
    },
    'model': car.model,
    'vehicleSeatingCapacity': car.seatingCapacity,
    'fuelType': car.fuelType,
    'vehicleTransmission': car.transmission,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': lowestPackagePrice,
      'availability': car.availability ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'LocalBusiness',
        'name': 'GoRidez',
      },
    },
  });
}

/**
 * Dynamic SEO & Schema Generator for Blog Details Page
 */
export async function generateBlogMetadata(slug: string): Promise<Metadata> {
  const customPath = `/blogs/${slug}`;
  const customSeo = await getSeoForPath(customPath);
  if (customSeo) {
    return generatePageMetadata(customPath);
  }

  const blog = await prisma.blog.findUnique({ where: { slug } });
  if (!blog || blog.isDraft) {
    return generatePageMetadata('/blogs', { title: 'GoRidez Editorial Journal' });
  }

  const plainExcerpt = blog.content ? blog.content.replace(/<[^>]*>/g, ' ').slice(0, 160).trim() : `Read ${blog.title} on GoRidez travel blog.`;
  const title = `${blog.title} | GoRidez Journal`;
  const description = plainExcerpt;
  const canonicalUrl = `https://goridez.com/blogs/${blog.slug}`;
  const ogImage = blog.image || '/logo-full.png';

  return {
    title,
    description,
    keywords: `${blog.category || 'travel'}, rajasthan travel guide, ${blog.title}`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
  };
}

/**
 * Helper to build JSON-LD Schema for Blog Details Page
 */
export function buildBlogJsonLd(blog: any) {
  if (!blog) return null;

  const plainExcerpt = blog.content ? blog.content.replace(/<[^>]*>/g, ' ').slice(0, 160).trim() : blog.title;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': blog.title,
    'description': plainExcerpt,
    'image': blog.image ? [blog.image] : ['/logo-full.png'],
    'datePublished': blog.createdAt,
    'dateModified': blog.updatedAt,
    'author': {
      '@type': 'Organization',
      'name': 'GoRidez Editorial Desk',
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'GoRidez',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://goridez.com/logo-full.png',
      },
    },
  });
}
