'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, BookOpen, ArrowUpRight } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80';
const PAGE_SIZE = 9;

export default function BlogsClient({ initialBlogs }: { initialBlogs: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSearch, setShowSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Extract unique categories dynamically from published blogs
  const categories = useMemo(() => {
    const cats = new Set(initialBlogs.map(b => b.category));
    return ['All', ...Array.from(cats)];
  }, [initialBlogs]);

  // Strip HTML tags for post summary
  const getExcerpt = (htmlContent: string, maxLength = 120) => {
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Filter blogs based on search and category
  const filteredBlogs = useMemo(() => {
    return initialBlogs.filter(blog => {
      const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
      const cleanContent = blog.content.replace(/<[^>]*>/g, ' ').toLowerCase();
      const matchesSearch =
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cleanContent.includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [initialBlogs, searchQuery, selectedCategory]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedCategory]);

  const visibleBlogs = filteredBlogs.slice(0, visibleCount);

  const hero = initialBlogs[0];
  const secondary = initialBlogs.slice(1, 3);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans pt-32 pb-24">
      <div className="container mx-auto">

        {/* Featured Section */}
        {hero && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
            <Link
              href={`/blogs/${hero.slug}`}
              className={`group relative rounded-3xl overflow-hidden h-[340px] sm:h-[440px] lg:h-[560px] block border border-[#E7DFD5] hover:border-[#C89D5C] shadow-2xl transition-all duration-500 border-classic-frame ${secondary.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
            >
              <Image
                src={hero.image || FALLBACK_IMAGE}
                alt={hero.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#250903] via-[#250903]/40 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-end">
                <span className="self-start text-[9px] font-bold font-mono uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full bg-[#250903]/80 backdrop-blur-md text-[#DFB574] border border-[#C89D5C]/40 mb-4">
                  ✦ {hero.category}
                </span>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-serif uppercase tracking-tight text-white leading-tight mb-6 max-w-2xl drop-shadow-md group-hover:text-[#DFB574] transition-colors">
                  {hero.title}
                </h2>
                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/15 pt-4">
                  <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest">
                    {hero.author && (
                      <div>
                        <span className="block text-[#DFB574]/60 mb-0.5">Curated By</span>
                        <span className="text-white font-bold">{hero.author}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-[#DFB574]/60 mb-0.5">Chronicle Date</span>
                      <span className="text-white font-bold">{formatDate(hero.createdAt)}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-[#DFB574] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                    Read Chronicle <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </Link>

            {secondary.length > 0 && (
              <div className="flex flex-col gap-6">
                {secondary.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blogs/${post.slug}`}
                    className="group relative rounded-3xl overflow-hidden flex-1 min-h-[170px] sm:min-h-[210px] block border border-[#E7DFD5] hover:border-[#C89D5C] shadow-lg transition-all duration-300 border-classic-frame"
                  >
                    <Image
                      src={post.image || FALLBACK_IMAGE}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#250903]/90 via-[#250903]/30 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <span className="self-start text-[9px] font-bold font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#250903]/80 backdrop-blur-md text-[#DFB574] border border-[#C89D5C]/30 mb-2">
                        {post.category}
                      </span>
                      <h3 className="text-white font-serif font-bold text-base sm:text-lg uppercase tracking-tight leading-snug group-hover:text-[#DFB574] transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Blog Header */}
        <div className="mb-10 border-b border-[#E7DFD5] pb-8">
          <div className="inline-flex items-center gap-2 border border-[#C89D5C]/30 rounded-full px-4 py-1.5 mb-3 bg-[#FEFBF8]">
            <span className="text-[#551A0C] text-[10px] font-bold font-mono tracking-widest uppercase">
              ✦ ROYAL JOURNAL & DISPATCHES
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-3">
            The Sovereign <span className="font-editorial italic font-normal text-[#C89D5C]">Gazette</span>
          </h2>
          <p className="text-[#6A5749] text-sm sm:text-base max-w-2xl leading-relaxed">
            Curated road trip itineraries, expert driving guides, and premium destination logs across Mewar and Rajasthan.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setShowSearch((s) => !s)}
            className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
              showSearch ? 'bg-[#551A0C] border-[#551A0C] text-[#DFB574]' : 'border-[#E7DFD5] text-[#8C6D53] bg-[#FEFBF8] hover:text-[#551A0C] hover:border-[#C89D5C]'
            }`}
          >
            <Search size={16} />
          </button>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold font-serif whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#551A0C] text-[#DFB574] border-[#C89D5C] shadow-md'
                    : 'bg-[#FEFBF8] border-[#E7DFD5] text-[#6A5749] hover:border-[#C89D5C] hover:text-[#551A0C]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {showSearch && (
          <div className="relative mb-10 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C6D53]" size={16} />
            <input
              type="text"
              autoFocus
              placeholder="Search chronicles and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl pl-12 pr-4 py-3.5 text-xs font-mono outline-none focus:border-[#C89D5C] text-[#250903] placeholder:text-[#8C6D53]/60 transition-colors shadow-inner"
            />
          </div>
        )}

        {/* Blogs Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-[#FEFBF8] rounded-3xl border border-[#E7DFD5] mt-6 border-classic-frame">
            <BookOpen className="mx-auto text-[#C89D5C] mb-4" size={40} />
            <h3 className="text-lg font-bold font-serif uppercase text-[#551A0C] mb-1">No Chronicles Found</h3>
            <p className="text-xs text-[#8C6D53] font-mono">Try adjusting your search query or select another category.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
              {visibleBlogs.map((blog) => (
                <Link
                  href={`/blogs/${blog.slug}`}
                  key={blog.id}
                  className="card-luxury group flex flex-col bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 border-classic-frame"
                >
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5 border border-[#E7DFD5]">
                    <Image
                      src={blog.image || FALLBACK_IMAGE}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    <span className="absolute top-4 left-4 text-[9px] font-bold font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#250903]/90 backdrop-blur-md text-[#DFB574] border border-[#C89D5C]/30 shadow-md">
                      {blog.category}
                    </span>
                  </div>

                  <h3 className="flex items-start justify-between gap-2 text-lg font-bold font-serif text-[#551A0C] leading-snug mb-2 group-hover:text-[#C89D5C] transition-colors">
                    <span className="line-clamp-2">{blog.title}</span>
                    <ArrowUpRight size={18} className="shrink-0 mt-1 text-[#8C6D53] group-hover:text-[#C89D5C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>

                  <p className="text-[#6A5749] text-sm leading-relaxed mb-5 line-clamp-2 font-light">
                    {getExcerpt(blog.content)}
                  </p>

                  <div className="flex items-center gap-2.5 mt-auto pt-4 border-t border-[#E7DFD5]">
                    <div className="w-7 h-7 rounded-full bg-[#551A0C]/10 text-[#551A0C] border border-[#C89D5C]/30 flex items-center justify-center text-[11px] font-bold uppercase shrink-0 font-serif">
                      {(blog.author || 'G').charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#551A0C]">{blog.author || 'GoRidez Team'}</span>
                    <span className="text-[#C89D5C]">•</span>
                    <span className="text-xs text-[#8C6D53] font-mono">{formatDate(blog.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < filteredBlogs.length && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="btn-luxury btn-luxury-shine px-8 py-3.5 rounded-full text-xs font-serif font-bold uppercase tracking-[0.2em] shadow-xl cursor-pointer"
                >
                  Load More Chronicles
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
