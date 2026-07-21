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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-[1500px] md:px-10 lg:px-16">

        {/* Featured Section */}
        {hero && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
            <Link
              href={`/blogs/${hero.slug}`}
              className={`group relative rounded-3xl overflow-hidden h-[340px] sm:h-[440px] lg:h-[560px] block ${secondary.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
            >
              <Image
                src={hero.image || FALLBACK_IMAGE}
                alt={hero.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                unoptimized
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-6 max-w-2xl">
                  {hero.title}
                </h2>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest">
                    {hero.author && (
                      <div>
                        <span className="block text-white/50 mb-1">Written By</span>
                        <span className="text-white font-bold">{hero.author}</span>
                      </div>
                    )}
                    <div>
                      <span className="block text-white/50 mb-1">Published On</span>
                      <span className="text-white font-bold">{formatDate(hero.createdAt)}</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20">
                    {hero.category}
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
                    className="group relative rounded-3xl overflow-hidden flex-1 min-h-[170px] sm:min-h-[210px] block"
                  >
                    <Image
                      src={post.image || FALLBACK_IMAGE}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                      <span className="self-start text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 mb-3">
                        {post.category}
                      </span>
                      <h3 className="text-white font-black text-base sm:text-lg uppercase tracking-tight leading-snug">
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
        <div className="mb-10">
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 mb-4">
            Blog
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Curated road trip itineraries, expert driving guides, and premium destination logs across Mewar and Rajasthan.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => setShowSearch((s) => !s)}
            className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
              showSearch ? 'bg-gray-900 border-gray-900 text-white' : 'border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-900'
            }`}
          >
            <Search size={16} />
          </button>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {showSearch && (
          <div className="relative mb-10 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              autoFocus
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-2xl pl-12 pr-4 py-3.5 text-xs outline-none focus:border-green-600 text-gray-900 placeholder:text-gray-400 transition-colors"
            />
          </div>
        )}

        {/* Blogs Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-gray-100 rounded-3xl border border-gray-200 mt-6">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={40} />
            <h3 className="text-lg font-bold mb-1">No Articles Found</h3>
            <p className="text-xs text-gray-500 font-mono">Try adjusting your search filters or browse other tags.</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 mt-10">
              {visibleBlogs.map((blog) => (
                <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group flex flex-col">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                    <Image
                      src={blog.image || FALLBACK_IMAGE}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-gray-900">
                      {blog.category}
                    </span>
                  </div>

                  <h3 className="flex items-start justify-between gap-2 text-lg font-black text-gray-900 leading-snug mb-2 group-hover:text-green-700 transition-colors">
                    <span className="line-clamp-2">{blog.title}</span>
                    <ArrowUpRight size={18} className="shrink-0 mt-1 text-gray-400 group-hover:text-green-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </h3>

                  <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
                    {getExcerpt(blog.content)}
                  </p>

                  <div className="flex items-center gap-2.5 mt-auto">
                    <div className="w-7 h-7 rounded-full bg-green-600/10 text-green-700 flex items-center justify-center text-[11px] font-black uppercase shrink-0">
                      {(blog.author || 'G').charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-700">{blog.author || 'GoRidez Team'}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{formatDate(blog.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < filteredBlogs.length && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
