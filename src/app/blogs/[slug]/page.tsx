import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, ArrowLeft, ArrowUpRight, ChevronRight, Car, Plane, ListOrdered } from 'lucide-react';
import { getSiteUrl } from '@/lib/utils';
import FloatingBackdrop from '@/components/FloatingBackdrop';
import ReadingProgress from './ReadingProgress';
import ShareButtons from './ShareButtons';

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

const slugifyHeading = (text: string) =>
  text.toLowerCase().replace(/&[a-z#0-9]+;/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

/** Adds safe ids to <h2> tags and returns the heading list for the table of contents. */
function withHeadingIds(html: string) {
  const toc: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi, (match, attrs = '', inner) => {
    const text = inner.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (!text || /\sid\s*=/.test(attrs)) return match;
    let id = slugifyHeading(text) || 'section';
    let n = 2;
    while (used.has(id)) id = `${id}-${n++}`;
    used.add(id);
    toc.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}

export default async function BlogDetails({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug: resolvedParams.slug }
  });

  // Enforce draft protection on the public route
  if (!blog || blog.isDraft) {
    notFound();
  }

  // Suggested reads: same category first, topped up with the latest other posts
  const sameCategory = await prisma.blog.findMany({
    where: { isDraft: false, id: { not: blog.id }, category: blog.category },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
  const suggestions = sameCategory.length >= 3
    ? sameCategory
    : [
        ...sameCategory,
        ...(await prisma.blog.findMany({
          where: { isDraft: false, id: { notIn: [blog.id, ...sameCategory.map((b) => b.id)] } },
          orderBy: { createdAt: 'desc' },
          take: 3 - sameCategory.length,
        })),
      ];

  const { html: contentHtml, toc } = withHeadingIds(blog.content);
  const shareUrl = `${getSiteUrl()}/blogs/${blog.slug}`;
  const readingTime = getReadingTime(blog.content);
  const publishedOn = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const blogJsonLd = buildBlogJsonLd(blog);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans">
      {blogJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: blogJsonLd }}
        />
      )}
      <ReadingProgress targetId="article-body" />

      {/* Hero */}
      <section className="relative isolate h-[58vh] min-h-[420px] md:h-[68vh] w-full overflow-hidden bg-[#250903]">
        <Image
          src={blog.image || FALLBACK_IMAGE}
          alt={blog.title}
          fill
          className="object-cover opacity-60 scale-105 -z-20"
          unoptimized
          priority
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#250903] via-[#250903]/55 to-[#250903]/10" />
        <FloatingBackdrop tone="dark" variant="b" road={false} />

        <div className="absolute top-24 md:top-28 left-0 right-0">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <Link
              href="/blogs"
              className="inline-flex items-center gap-2 rounded-full border border-[#C89D5C]/40 bg-[#250903]/60 px-4 py-2 text-[#DFB574] backdrop-blur-md transition-colors hover:text-white text-[11px] font-bold uppercase tracking-[0.2em]"
            >
              <ArrowLeft size={14} /> Back to Journal
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-16">
          <div className="container mx-auto px-4 max-w-[1100px]">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full bg-[#DFB574] text-[#250903]">
                {blog.category}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-white/85">
                <Calendar size={13} className="text-[#DFB574]" /> {publishedOn}
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-white/85">
                <Clock size={13} className="text-[#DFB574]" /> {readingTime}
              </span>
            </div>

            <h1 className="max-w-4xl text-[28px] sm:text-4xl md:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.08] text-white drop-shadow-lg [text-wrap:balance]">
              {blog.title}
            </h1>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#C89D5C]/60 bg-[#551A0C] text-sm font-bold text-[#DFB574] shadow">
                {(blog.author || 'G').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#DFB574]/80">Curated by</div>
                <div className="text-sm font-bold text-white">{blog.author || 'GoRidez Editorial Team'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article */}
      <section className="relative isolate overflow-hidden py-14 md:py-20">
        <FloatingBackdrop tone="light" variant="a" />
        <div className="container mx-auto px-4 max-w-[1100px]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <article>
              <div id="article-body" className="rounded-3xl border border-[#E7DFD5] bg-[#FEFBF8] p-6 shadow-2xl sm:p-10 md:p-14 border-classic-frame">
                <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </div>

              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#E7DFD5] bg-[#FEFBF8] p-5 sm:flex-row sm:items-center sm:justify-between">
                <ShareButtons url={shareUrl} title={blog.title} />
                <Link href="/blogs" className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#551A0C] hover:text-[#C89D5C]">
                  All stories <ChevronRight size={14} />
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              {toc.length >= 3 && (
                <nav aria-label="Table of contents" className="rounded-2xl border border-[#E7DFD5] bg-[#FEFBF8] p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D53]">
                    <ListOrdered size={14} className="text-[#C89D5C]" /> In this article
                  </div>
                  <ol className="space-y-2.5 border-l border-[#E7DFD5] pl-4">
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`} className="block text-[13px] font-semibold leading-snug text-[#4A3A2C] transition-colors hover:text-[#551A0C]">
                          {t.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="relative isolate overflow-hidden rounded-2xl border border-[#C89D5C]/30 bg-[#250903] p-6 text-white shadow-xl">
                <FloatingBackdrop tone="dark" variant="c" road={false} />
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#DFB574]">Plan your ride</div>
                <h3 className="mt-2 font-heading text-xl font-extrabold leading-tight">Ready to explore Rajasthan?</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/70">Self-drive cars or a chauffeured taxi, vetted fleet, transparent fares.</p>
                <div className="mt-5 space-y-2.5">
                  <Link href="/self-drive" className="flex items-center justify-between rounded-xl bg-[#DFB574] px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[#250903] transition-transform hover:-translate-y-0.5">
                    <span className="flex items-center gap-2"><Car size={15} /> Self-drive</span> <ArrowUpRight size={15} />
                  </Link>
                  <Link href="/taxi" className="flex items-center justify-between rounded-xl border border-[#C89D5C]/50 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-[#DFB574] transition-colors hover:bg-white/5">
                    <span className="flex items-center gap-2"><Plane size={15} /> Taxi &amp; transfers</span> <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Suggested reads */}
      {suggestions.length > 0 && (
        <section className="relative isolate overflow-hidden border-t border-[#E7DFD5] bg-[#F0E9DF] py-16 md:py-20">
          <FloatingBackdrop tone="light" variant="c" />
          <div className="container mx-auto px-4 max-w-[1300px]">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="h-px w-8 bg-[#C89D5C]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C89D5C]">Keep reading</span>
                </div>
                <h2 className="font-heading text-3xl font-black tracking-tight text-[#250903] md:text-4xl">
                  Suggested <span className="text-[#551A0C]">reads</span>
                </h2>
              </div>
              <Link href="/blogs" className="hidden items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#551A0C] hover:text-[#C89D5C] sm:inline-flex">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="card-luxury group flex flex-col rounded-3xl border border-[#E7DFD5] bg-[#FEFBF8] p-5 shadow-lg transition-all duration-500 hover:border-[#C89D5C] hover:shadow-2xl border-classic-frame"
                >
                  <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E7DFD5]">
                    <Image
                      src={post.image || FALLBACK_IMAGE}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      unoptimized
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-[#C89D5C]/40 bg-[#250903]/85 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#DFB574] backdrop-blur-md">
                      {post.category}
                    </span>
                  </div>
                  <div className="mb-2 flex items-center gap-3 text-[11px] text-[#8C6D53]">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#C89D5C]" />
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#C89D5C]" /> {getReadingTime(post.content)}</span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-heading text-lg font-extrabold leading-snug text-[#250903] transition-colors group-hover:text-[#551A0C]">{post.title}</h3>
                    <ArrowUpRight size={18} className="mt-1 shrink-0 text-[#C89D5C] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Styled markup for Rich Text Content */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content {
          font-family: inherit;
          font-size: 1.05rem;
          color: #250903;
        }
        .blog-content h2 {
          scroll-margin-top: 7rem;
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
