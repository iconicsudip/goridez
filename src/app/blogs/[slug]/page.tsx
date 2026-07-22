import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowLeft, BookOpen, ChevronRight, Car, Building, Sparkles } from 'lucide-react';

import { generateBlogMetadata, buildBlogJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pb-24">
      {blogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: blogJsonLd }}
        />
      )}

      {/* Hero Banner */}
      <section className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden bg-gray-900">
        <Image
          src={blog.image || FALLBACK_IMAGE}
          alt={blog.title}
          fill
          className="object-cover opacity-80"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

        <div className="absolute top-28 left-0 right-0">
          <div className="mx-auto px-4 max-w-[1500px]">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Back to Journal
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-14">
          <div className="container mx-auto px-4 max-w-[1500px]">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20">
                {blog.category}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-mono">
                <Calendar size={12} /> {publishedOn}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/70 font-mono">
                <Clock size={12} />
                <span>{readingTime}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-white max-w-4xl drop-shadow-lg">
              {blog.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-[1500px]">

        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 bg-gray-100 border border-gray-200 rounded-2xl p-4 w-fit -mt-8 md:-mt-9 relative z-10 mb-10 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center">
              <span className="text-green-700 text-xs font-black">{(blog.author || 'GoRidez').charAt(0)}</span>
            </div>
            <div>
              <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest">WRITTEN BY</div>
              <div className="text-xs font-bold text-gray-900">{blog.author || 'GoRidez Editorial Team'}</div>
            </div>
          </div>

          {/* Article Body */}
          <div className="blog-content mb-16" dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* CTA Section (Premium integration) */}
        <div className="bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-gray-800 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex-1">
            <div className="text-green-500 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center md:justify-start">
              <Sparkles size={12} /> Mewar Heritage Awaits
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 text-white">
              READY TO PLAN YOUR <span className="text-outline-neon">JOURNEY?</span>
            </h3>
            <p className="text-gray-400 text-xs md:text-sm max-w-lg leading-relaxed">
              Rent a premium self-drive vehicle or secure a private heritage villa with custom airport transfers to mirror the destinations described in this journal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link
              href="/self-drive"
              className="bg-green-600 hover:bg-brand-hover text-black font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl text-center transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Car size={14} /> Cars Collection
            </Link>
            <Link
              href="/villas"
              className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
            >
              <Building size={14} /> Villa Stays
            </Link>
          </div>
        </div>

      </div>

      {/* Styled markup for Rich Text Content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content {
          font-family: var(--font-inter), sans-serif;
          font-size: 0.95rem;
        }
        .blog-content h2 {
          font-size: 1.75rem;
          font-weight: 900;
          text-transform: uppercase;
          margin-top: 3rem;
          margin-bottom: 1.25rem;
          color: #111827;
          letter-spacing: -0.025em;
          border-left: 3px solid #16a34a;
          padding-left: 0.75rem;
        }
        .blog-content h3 {
          font-size: 1.35rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1f2937;
          letter-spacing: -0.02em;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          line-height: 1.85;
          color: #374151;
        }
        .blog-content a {
          color: #16a34a;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .blog-content a:hover {
          color: #15803d;
        }
        .blog-content strong {
          color: #111827;
          font-weight: 800;
        }
        .blog-content em {
          font-style: italic;
          color: #4b5563;
        }
        .blog-content ul {
          list-style-type: square;
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .blog-content ol {
          list-style-type: decimal;
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
          color: #374151;
        }
        .blog-content li::marker {
          color: #16a34a;
        }
        .blog-content blockquote {
          margin: 2rem 0;
          padding: 1rem 1.5rem;
          background-color: #f3f4f6;
          border-left: 4px solid #16a34a;
          border-radius: 0.5rem;
          font-style: italic;
          color: #4b5563;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 2rem auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
      ` }} />
    </div>
  );
}
