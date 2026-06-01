'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calendar, Clock, BookOpen, ChevronRight } from 'lucide-react';

export default function BlogsClient({ initialBlogs }: { initialBlogs: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Extract unique categories dynamically from published blogs
  const categories = useMemo(() => {
    const cats = new Set(initialBlogs.map(b => b.category));
    return ['All', ...Array.from(cats)];
  }, [initialBlogs]);

  // Strip HTML tags for post summary
  const getExcerpt = (htmlContent: string) => {
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ');
    if (plainText.length <= 150) return plainText;
    return plainText.substring(0, 150).trim() + '...';
  };

  // Estimate reading time
  const getReadingTime = (htmlContent: string) => {
    const plainText = htmlContent.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 225));
    return `${minutes} min read`;
  };

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

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-brand-neon/30 rounded-full px-4 py-1.5 mb-6 bg-brand-neon/5 backdrop-blur-md">
            <span className="text-brand-neon text-[10px] md:text-xs font-black tracking-widest uppercase">
              ✦ GO RIDEZ JOURNAL
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            STORIES & <span className="text-outline-neon">ROAD LOGS</span>
          </h1>
          <p className="text-white/50 text-sm md:text-base leading-relaxed">
            Fuel your organic acquisition. Curated road trip itineraries, expert driving guides, and premium destination logs across Mewar and Rajasthan.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-[#111111] border border-white/5 p-6 rounded-3xl mb-12">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-3 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-brand-neon text-black border-brand-neon shadow-[0_0_15px_rgba(196,240,0,0.2)]'
                    : 'bg-[#1A1A1A] border-white/5 text-white/50 hover:text-white hover:bg-[#222]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs outline-none focus:border-brand-neon text-white placeholder:text-white/20 transition-colors"
            />
          </div>
        </div>

        {/* Blogs Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-[#111111] rounded-3xl border border-white/5">
            <BookOpen className="mx-auto text-white/20 mb-4" size={40} />
            <h3 className="text-lg font-bold mb-1">No Articles Found</h3>
            <p className="text-xs text-white/40 font-mono">Try adjusting your search filters or browse other tags.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <Link 
                href={`/blogs/${blog.slug}`} 
                key={blog.id}
                className="group flex flex-col bg-[#111111] border border-white/5 hover:border-white/10 rounded-3xl overflow-hidden transition-all duration-300"
              >
                {/* Header Highlight (Placeholder or Stylized Top border) */}
                <div className="h-2 w-full bg-gradient-to-r from-brand-neon to-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-8 flex flex-col flex-1">
                  {/* Category & Date Row */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-[#C4F000]/30 text-[#C4F000]">
                      {blog.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-mono">
                      <Calendar size={12} />
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-brand-neon transition-colors leading-tight line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-white/50 text-xs leading-relaxed mb-6 font-mono line-clamp-3">
                    {getExcerpt(blog.content)}
                  </p>

                  {/* Action Link & Reading Time */}
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-neon group-hover:translate-x-1 transition-transform">
                      Read Article <ChevronRight size={12} />
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono">
                      <Clock size={12} />
                      <span>{getReadingTime(blog.content)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
