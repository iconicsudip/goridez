import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowLeft, BookOpen, ChevronRight, Car, Building, Sparkles } from 'lucide-react';

import { generateBlogMetadata, buildBlogJsonLd } from '@/lib/seo';

export const revalidate = 300;

export async function generateStaticParams() {
  const blogs = await prisma.blog.findMany({
    where: { isDraft: false },
    select: { slug: true }
  });
  return blogs.map(blog => ({
    slug: blog.slug
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return generateBlogMetadata(slug);
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80';

// Helper to estimate reading time
const getReadingTime = (htmlContent: string) => {
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 225));
  return `${minutes} min read`;
};

export default async function BlogDetails({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug: resolvedParams.slug }
  });

  // Enforce draft protection on the public route
  if (!blog || blog.isDraft) {
    notFound();
  }

  const readingTime = getReadingTime(blog.content);
  const publishedOn = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const blogJsonLd = buildBlogJsonLd(blog);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans pb-24">
      {blogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: blogJsonLd }}
        />
      )}

      {/* Hero Banner */}
      <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden bg-[#250903]">
        <Image
          src={blog.image || FALLBACK_IMAGE}
          alt={blog.title}
          fill
          className="object-cover opacity-60 scale-105"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#250903] via-[#250903]/40 to-transparent" />

        <div className="absolute top-28 left-0 right-0">
          <div className="mx-auto px-4 max-w-[1500px]">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-[#DFB574] hover:text-white transition-colors text-xs font-bold font-mono uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={14} /> Back to Journal
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-14">
          <div className="container mx-auto px-4 max-w-[1500px]">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-[9px] font-bold font-mono uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full bg-[#250903]/80 backdrop-blur-md text-[#DFB574] border border-[#C89D5C]/40">
                ✦ {blog.category}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono">
                <Calendar size={12} className="text-[#C89D5C]" /> {publishedOn}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono">
                <Clock size={12} className="text-[#C89D5C]" />
                <span>{readingTime}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-serif uppercase tracking-tight leading-[1.05] text-white max-w-4xl drop-shadow-lg">
              {blog.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-luxury flex items-center gap-3 bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl p-4 w-fit -mt-8 md:-mt-9 relative z-10 mb-12 shadow-xl border-classic-frame">
            <div className="w-9 h-9 rounded-full bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40 flex items-center justify-center font-serif text-sm font-bold shadow">
              {(blog.author || 'G').charAt(0)}
            </div>
            <div>
              <div className="text-[9px] text-[#8C6D53] uppercase font-bold font-mono tracking-[0.2em]">CURATED BY</div>
              <div className="text-xs font-bold font-serif text-[#551A0C]">{blog.author || 'GoRidez Editorial Team'}</div>
            </div>
          </div>

          {/* Article Body */}
          <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-8 sm:p-14 shadow-2xl border-classic-frame mb-16">
            <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
        </div>
      </div>

      {/* Styled markup for Rich Text Content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content {
          font-family: inherit;
          font-size: 1.05rem;
          color: #250903;
        }
        .blog-content h2 {
          font-family: var(--font-cinzel), serif;
          font-size: 1.85rem;
          font-weight: 900;
          text-transform: uppercase;
          margin-top: 3.5rem;
          margin-bottom: 1.5rem;
          color: #551A0C;
          letter-spacing: -0.01em;
          border-left: 3px solid #C89D5C;
          padding-left: 1rem;
        }
        .blog-content h3 {
          font-family: var(--font-cinzel), serif;
          font-size: 1.4rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          color: #551A0C;
        }
        .blog-content p {
          margin-bottom: 1.75rem;
          line-height: 1.95;
          color: #4A3A2C;
        }
        .blog-content a {
          color: #551A0C;
          text-decoration: underline;
          text-decoration-color: #C89D5C;
          font-weight: 700;
          transition: color 0.2s;
        }
        .blog-content a:hover {
          color: #C89D5C;
        }
        .blog-content strong {
          color: #250903;
          font-weight: 800;
        }
        .blog-content em {
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 1.15em;
          color: #6A5749;
        }
        .blog-content ul {
          list-style-type: square;
          margin-bottom: 1.75rem;
          padding-left: 1.5rem;
        }
        .blog-content ol {
          list-style-type: decimal;
          margin-bottom: 1.75rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.6rem;
          line-height: 1.8;
          color: #4A3A2C;
        }
        .blog-content li::marker {
          color: #C89D5C;
        }
        .blog-content blockquote {
          margin: 2.5rem 0;
          padding: 1.5rem 2rem;
          background-color: #FAF6F0;
          border-left: 4px solid #C89D5C;
          border-radius: 0.75rem;
          font-family: var(--font-cormorant), serif;
          font-style: italic;
          font-size: 1.25rem;
          color: #551A0C;
          box-shadow: inset 0 0 15px rgba(200, 157, 92, 0.08);
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1.25rem;
          margin: 2.5rem auto;
          border: 1px solid #E7DFD5;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
      ` }} />
    </div>
  );
}
