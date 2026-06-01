import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, BookOpen, ChevronRight, Car, Building, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Back navigation */}
        <Link 
          href="/blogs"
          className="inline-flex items-center gap-2 text-white/50 hover:text-brand-neon transition-colors text-xs font-black uppercase tracking-widest mb-10"
        >
          <ArrowLeft size={14} /> Back to Journal
        </Link>

        {/* Hero Header */}
        <div className="border-b border-white/10 pb-10 mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-[#C4F000]/30 text-[#C4F000]">
              {blog.category}
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
              <Calendar size={12} />
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
              <Clock size={12} />
              <span>{readingTime}</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-white mb-6">
            {blog.title}
          </h1>

          <div className="flex items-center gap-3 bg-[#111] border border-white/5 rounded-2xl p-4 w-fit">
            <div className="w-8 h-8 rounded-full bg-brand-neon/10 border border-brand-neon/20 flex items-center justify-center">
              <span className="text-brand-neon text-xs font-black">GR</span>
            </div>
            <div>
              <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">WRITTEN BY</div>
              <div className="text-xs font-bold text-white">GoRidez Editorial Team</div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="blog-content mb-16" dangerouslySetInnerHTML={{ __html: blog.content }} />

        {/* CTA Section (Premium integration) */}
        <div className="bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-white/5 rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-neon/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex-1">
            <div className="text-brand-neon text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5 justify-center md:justify-start">
              <Sparkles size={12} /> Mewar Heritage Awaits
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3">
              READY TO PLAN YOUR <span className="text-outline-neon">JOURNEY?</span>
            </h3>
            <p className="text-white/50 text-xs md:text-sm max-w-lg leading-relaxed">
              Rent a premium self-drive vehicle or secure a private heritage villa with custom airport transfers to mirror the destinations described in this journal.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full md:w-auto">
            <Link 
              href="/self-drive"
              className="bg-brand-neon hover:bg-brand-hover text-black font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl text-center transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] flex items-center justify-center gap-2"
            >
              <Car size={14} /> Cars Collection
            </Link>
            <Link 
              href="/villas"
              className="bg-[#1A1A1A] hover:bg-[#222] border border-white/10 text-white font-black uppercase text-[10px] tracking-widest px-8 py-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
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
          color: #ffffff;
          letter-spacing: -0.025em;
          border-left: 3px solid #C4F000;
          padding-left: 0.75rem;
        }
        .blog-content h3 {
          font-size: 1.35rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #ffffff;
          letter-spacing: -0.02em;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          line-height: 1.85;
          color: rgba(255, 255, 255, 0.7);
        }
        .blog-content a {
          color: #C4F000;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .blog-content a:hover {
          color: #ffffff;
        }
        .blog-content strong {
          color: #ffffff;
          font-weight: 800;
        }
        .blog-content em {
          font-style: italic;
          color: rgba(255, 255, 255, 0.85);
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
          color: rgba(255, 255, 255, 0.7);
        }
        .blog-content li::marker {
          color: #C4F000;
        }
      ` }} />
    </div>
  );
}
