'use client';

import { useState, useEffect } from 'react';
import { createBlog, updateBlog, deleteBlog } from '@/app/admin/actions';
import { Edit2, Trash2, X } from 'lucide-react';

export default function BlogManager({ blogs }: { blogs: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    category: 'Travel Guide',
    content: '',
    isDraft: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = document.getElementById('content-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = openTag + selected + closeTag;
    const newValue = text.substring(0, start) + replacement + text.substring(end);

    setFormData({ ...formData, content: newValue });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + openTag.length, start + openTag.length + selected.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Auto-generate slug from title
    const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (isEditing) {
      await updateBlog(formData.id, {
        title: formData.title,
        slug,
        category: formData.category,
        content: formData.content,
        isDraft: formData.isDraft
      });
    } else {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('slug', slug);
      data.append('category', formData.category);
      data.append('content', formData.content);
      data.append('isDraft', String(formData.isDraft));
      await createBlog(data);
    }

    setFormData({ id: '', title: '', category: 'Travel Guide', content: '', isDraft: true });
    setIsEditing(false);
    setIsDrawerOpen(false);
    setLoading(false);
  };

  const handleEdit = (blog: any) => {
    setFormData({
      id: blog.id,
      title: blog.title,
      category: blog.category,
      content: blog.content,
      isDraft: blog.isDraft
    });
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleNewArticle = () => {
    setFormData({
      id: '',
      title: '',
      category: 'Travel Guide',
      content: '',
      isDraft: true
    });
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      await deleteBlog(id);
    }
  };

  const togglePublish = async (id: string, currentDraftStatus: boolean) => {
    await updateBlog(id, { isDraft: !currentDraftStatus });
  };

  return (
    <div className="container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-white">
            Featured Stories & Blogs
          </h1>
          <p className="text-white/50 text-[13px]">
            Manage editorial items, update tags, publish drafts, and coordinate visual logs.
          </p>
        </div>
        <button
          onClick={handleNewArticle}
          className="bg-brand-neon hover:bg-brand-hover text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] flex items-center gap-2 shrink-0"
        >
          Draft New Article
        </button>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-3xl p-8 mb-8">
        <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-4">
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Story Title</div>
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Parameters</div>
        </div>

        <div className="space-y-4">
          {blogs.length === 0 ? (
            <div className="text-[11px] text-white/30 italic text-center py-6 font-mono">
              No stories found.
            </div>
          ) : (
            blogs.map((blog) => (
              <div key={blog.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group">
                <div>
                  <h3 className="font-bold text-sm mb-1 text-white">{blog.title}</h3>
                  <div className="text-[10px] text-white/40 font-mono">Slug: /blogs/{blog.slug}</div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded border border-[#C4F000]/30 text-[#C4F000]">
                      {blog.category}
                    </span>
                    <button
                      onClick={() => togglePublish(blog.id, blog.isDraft)}
                      className={`text-[9px] font-black uppercase tracking-widest transition-colors ${blog.isDraft ? 'text-white/30 hover:text-white/60' : 'text-[#00FF66] hover:text-[#00CC55]'}`}
                    >
                      [{blog.isDraft ? 'Draft' : 'Published'}]
                    </button>
                  </div>

                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(blog)} className="text-white/40 hover:text-white transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(blog.id)} className="text-white/40 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-2xl bg-[#111111] border-l border-white/10 h-full p-8 overflow-y-auto shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] text-brand-neon font-black tracking-widest uppercase mb-1 block">Content Management</span>
                    <h2 className="text-xl font-black uppercase tracking-tight text-white">
                      {isEditing ? 'Edit Article' : 'Draft New Article'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                      Article Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Navigating Kumbalgarh Fort via Scenic Mountain Passes in Brezza"
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors placeholder:text-white/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                        Category Tag
                      </label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors cursor-pointer"
                      >
                        <option value="Travel Guide">Travel Guide</option>
                        <option value="Heritage Roadtrips">Heritage Roadtrips</option>
                        <option value="Technical Driving">Technical Driving</option>
                        <option value="Luxury Stays">Luxury Stays</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                        Publish Status
                      </label>
                      <select
                        value={formData.isDraft ? 'draft' : 'publish'}
                        onChange={e => setFormData({ ...formData, isDraft: e.target.value === 'draft' })}
                        className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-brand-neon outline-none text-white transition-colors cursor-pointer"
                      >
                        <option value="draft">Save as Draft</option>
                        <option value="publish">Publish Immediately</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold">
                      Content Editor (HTML Supported)
                    </label>
                    <div className="bg-[#050505] rounded-xl border border-white/10 overflow-hidden focus-within:border-brand-neon transition-colors">
                      {/* Toolbar */}
                      <div className="bg-[#111111] border-b border-white/10 p-2 flex flex-wrap gap-1">
                        {[
                          { label: 'Bold', open: '<strong>', close: '</strong>' },
                          { label: 'Italic', open: '<em>', close: '</em>' },
                          { label: 'H2', open: '<h2>', close: '</h2>' },
                          { label: 'H3', open: '<h3>', close: '</h3>' },
                          { label: 'Link', open: '<a href="#" class="text-brand-neon underline">', close: '</a>' },
                          { label: 'Bullet Point', open: '<li>', close: '</li>' },
                          { label: 'Paragraph', open: '<p>', close: '</p>' },
                        ].map((btn) => (
                          <button
                            key={btn.label}
                            type="button"
                            onClick={() => insertTag(btn.open, btn.close)}
                            className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222] border border-white/5 text-[9px] font-bold uppercase tracking-widest text-white/70 hover:text-white rounded-lg transition-colors"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                      <textarea
                        id="content-editor-textarea"
                        required
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your article content here (HTML tags are supported)..."
                        className="w-full bg-transparent p-4 min-h-[300px] font-mono text-xs text-white outline-none border-0 resize-y"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/5 mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-brand-neon hover:bg-[#aacc00] text-black py-4 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : isEditing ? 'Update Article →' : 'Publish Article →'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDrawerOpen(false)}
                      className="px-6 py-4 rounded-xl text-[11px] font-black tracking-widest uppercase border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
