'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Plus, Trash2, Edit3, Save, Sparkles, AlertCircle, CheckCircle2, FileCode, Search, ExternalLink } from 'lucide-react';
import ImageUpload from '@/components/admin/ImageUpload';
import { upsertSeoSettingAction, deleteSeoSettingAction, updateSiteSettings } from '@/app/admin/actions';

interface SeoSetting {
  id: string;
  pagePath: string;
  pageName: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  structuredData?: string | null;
  noIndex: boolean;
}

interface PageOption {
  group: string;
  path: string;
  name: string;
}

const PRESET_PAGES = [
  { path: '/', name: 'Home Page' },
  { path: '/about', name: 'About Us Page' },
  { path: '/self-drive', name: 'Self Drive Fleet Page' },
  { path: '/taxi', name: 'Taxi & Outstation Page' },
  { path: '/cities', name: 'Cities We Serve Page' },
  { path: '/blogs', name: 'Editorial Journal / Blogs' },
  { path: '/contact', name: 'Contact Us Page' },
  { path: '/terms', name: 'Terms of Service' },
  { path: '/privacy', name: 'Privacy Policy' },
];

export default function SeoManager({
  initialSettings = [],
  initialFavicon = '/favicon.ico',
  availablePages = [],
}: {
  initialSettings: SeoSetting[];
  initialFavicon?: string;
  availablePages?: PageOption[];
}) {
  const router = useRouter();
  const [favicon, setFavicon] = useState(initialFavicon);
  const [settings, setSettings] = useState<SeoSetting[]>(initialSettings);
  const [selectedSetting, setSelectedSetting] = useState<SeoSetting | null>(
    initialSettings[0] || {
      id: '',
      pagePath: '/',
      pageName: 'Home Page',
      metaTitle: 'GoRidez — Self Drive Cars & Taxi Service in Rajasthan',
      metaDescription: 'Book premium self-drive cars, luxury taxis, airport transfers and guided Rajasthan tours with GoRidez. Zero hidden fees & 24/7 support.',
      metaKeywords: 'self drive cars udaipur, taxi service rajasthan, airport transfers udaipur',
      canonicalUrl: 'https://goridez.com/',
      ogTitle: 'GoRidez — Premium Self Drive Cars & Taxi Service',
      ogDescription: 'Experience Rajasthan travel freedom with GoRidez luxury self-drive fleet & chauffeur services.',
      ogImage: '/logo-full.png',
      structuredData: '{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "GoRidez",\n  "url": "https://goridez.com"\n}',
      noIndex: false,
    }
  );

  const [formData, setFormData] = useState<Partial<SeoSetting>>(selectedSetting || {});
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const selectPage = (setting: SeoSetting) => {
    setSelectedSetting(setting);
    setFormData(setting);
    setMsg(null);
    setJsonError(null);
  };

  const createNewPage = (path: string, name: string) => {
    const existing = settings.find((s) => s.pagePath === path);
    if (existing) {
      selectPage(existing);
      return;
    }

    const newSetting: SeoSetting = {
      id: '',
      pagePath: path,
      pageName: name,
      metaTitle: `${name} | GoRidez Rajasthan`,
      metaDescription: `Explore ${name} with GoRidez. Book 100% vetted self-drive cars and luxury taxi services across Rajasthan.`,
      metaKeywords: 'car rental, self drive, taxi service, rajasthan',
      canonicalUrl: `https://goridez.com${path}`,
      ogTitle: `${name} | GoRidez`,
      ogDescription: `Explore ${name} with GoRidez. 24/7 concierge support & zero hidden fees.`,
      ogImage: '',
      structuredData: '',
      noIndex: false,
    };

    setSelectedSetting(newSetting);
    setFormData(newSetting);
    setMsg(null);
  };

  const validateJson = (jsonStr?: string | null) => {
    if (!jsonStr || !jsonStr.trim()) {
      setJsonError(null);
      return true;
    }
    try {
      JSON.parse(jsonStr);
      setJsonError(null);
      return true;
    } catch (e: any) {
      setJsonError(e.message);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateJson(formData.structuredData)) return;

    setIsSaving(true);
    setMsg(null);

    const fd = new FormData();
    if (formData.id) fd.append('id', formData.id);
    fd.append('pagePath', formData.pagePath || '/');
    fd.append('pageName', formData.pageName || 'Page');
    fd.append('metaTitle', formData.metaTitle || '');
    fd.append('metaDescription', formData.metaDescription || '');
    fd.append('metaKeywords', formData.metaKeywords || '');
    fd.append('canonicalUrl', formData.canonicalUrl || '');
    fd.append('ogTitle', formData.ogTitle || '');
    fd.append('ogDescription', formData.ogDescription || '');
    fd.append('ogImage', formData.ogImage || '');
    fd.append('structuredData', formData.structuredData || '');
    fd.append('noIndex', formData.noIndex ? 'true' : 'false');

    const res = await upsertSeoSettingAction(fd);
    setIsSaving(false);

    if (res.success) {
      setMsg({ type: 'success', text: 'SEO Settings saved successfully!' });
      router.refresh();
    } else {
      setMsg({ type: 'error', text: res.error || 'Failed to save SEO settings' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete custom SEO settings for this page?')) return;
    const res = await deleteSeoSettingAction(id);
    if (res.success) {
      setSettings(settings.filter((s) => s.id !== id));
      router.refresh();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 font-body">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-green-700 font-mono text-xs font-bold uppercase tracking-wider mb-1">
            <Globe size={16} /> Search Engine Optimization
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase font-serif tracking-tight">
            SEO &amp; Schema Manager
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage browser favicons, meta tags, canonical URLs, OpenGraph social previews, and JSON-LD structured schemas for all individual pages.
          </p>
        </div>
      </div>

      {/* Global Favicon Uploader Card */}
      <div className="mb-8 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-md">
          <span className="text-[10px] font-mono text-green-700 font-bold uppercase tracking-widest">
            Browser Favicon Icon
          </span>
          <h3 className="text-lg font-black text-gray-900 uppercase font-serif tracking-tight mt-0.5">
            Website Browser Favicon
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Appears in browser tabs, bookmarks, and Google search engine results next to your site title.
          </p>
        </div>

        <div className="w-full md:w-64 shrink-0">
          <ImageUpload
            value={favicon}
            onChange={async (val) => {
              setFavicon(val);
              const fd = new FormData();
              fd.append('favicon', val);
              await updateSiteSettings(fd);
              setMsg({ type: 'success', text: 'Website Favicon updated successfully!' });
              router.refresh();
            }}
          />
        </div>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Page Selector List */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm h-fit">
          {/* Quick Page Picker Dropdown */}
          <div className="mb-6 bg-green-50/70 p-4 rounded-2xl border border-green-200">
            <label className="block text-[10px] font-bold text-green-800 uppercase tracking-widest mb-2 font-mono flex items-center gap-1.5">
              <Search size={12} /> Select Page (Static or Dynamic)
            </label>
            <select
              onChange={(e) => {
                const selectedPath = e.target.value;
                if (!selectedPath) return;
                const existing = settings.find((s) => s.pagePath === selectedPath);
                const foundOption = availablePages.find((p) => p.path === selectedPath);
                const pageName = foundOption?.name || selectedPath;

                if (existing) {
                  selectPage(existing);
                } else {
                  createNewPage(selectedPath, pageName);
                }
              }}
              value={selectedSetting?.pagePath || ''}
              className="w-full bg-white border border-green-300 rounded-xl px-3 py-2.5 text-xs font-medium focus:border-green-600 outline-none text-gray-900 shadow-sm cursor-pointer"
            >
              <option value="">-- Select Any Page from Dropdown --</option>
              {Array.from(new Set(availablePages.map((p) => p.group))).map((groupName) => (
                <optgroup key={groupName} label={`── ${groupName} ──`}>
                  {availablePages
                    .filter((p) => p.group === groupName)
                    .map((item, idx) => (
                      <option key={`${item.path}-${idx}`} value={item.path}>
                        {item.name} ({item.path})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 font-mono">
            Configured Page Metadata
          </h3>

          <div className="flex flex-col gap-2 mb-6">
            {PRESET_PAGES.map((preset) => {
              const matchedSetting = settings.find((s) => s.pagePath === preset.path);
              const isSelected = selectedSetting?.pagePath === preset.path;

              return (
                <button
                  key={preset.path}
                  type="button"
                  onClick={() => {
                    if (matchedSetting) {
                      selectPage(matchedSetting);
                    } else {
                      createNewPage(preset.path, preset.name);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all border flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600 shadow-md font-bold'
                      : matchedSetting
                      ? 'bg-green-50/60 text-green-900 border-green-200 hover:bg-green-100/60'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold tracking-tight">{preset.name}</div>
                    <div className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {preset.path}
                    </div>
                  </div>
                  {matchedSetting && !isSelected && (
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="SEO configured" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Path Adder */}
          <div className="border-t border-gray-100 pt-5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
              Add Custom Page Path
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const pathInput = (e.currentTarget.elements.namedItem('customPath') as HTMLInputElement).value;
                if (pathInput) {
                  const name = pathInput.replace('/', '').replace(/-/g, ' ').toUpperCase() || 'Page';
                  createNewPage(pathInput, name);
                  (e.currentTarget.elements.namedItem('customPath') as HTMLInputElement).value = '';
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                name="customPath"
                placeholder="/cars/toyota-fortuner"
                className="flex-grow bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono focus:border-green-600 outline-none text-gray-900"
              />
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: SEO Form Editor */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-mono text-green-700 uppercase tracking-widest font-bold">
                  Editing SEO Settings
                </span>
                <h2 className="text-xl font-black text-gray-900 uppercase font-serif tracking-tight mt-0.5">
                  {formData.pageName || 'Target Page'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {formData.id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(formData.id!)}
                    className="p-2.5 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                    title="Reset to default"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md shadow-green-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Meta Settings'}
                </button>
              </div>
            </div>

            {/* Target Path Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                  Page Display Name
                </label>
                <input
                  type="text"
                  value={formData.pageName || ''}
                  onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                  Page Path (URL Slug)
                </label>
                <input
                  type="text"
                  value={formData.pagePath || ''}
                  onChange={(e) => setFormData({ ...formData, pagePath: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Meta Title */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Meta Title Tag
                </label>
                <span className={`text-[10px] font-mono ${
                  (formData.metaTitle?.length || 0) > 60 ? 'text-amber-600 font-bold' : 'text-gray-400'
                }`}>
                  {formData.metaTitle?.length || 0} / 60 chars recommended
                </span>
              </div>
              <input
                type="text"
                value={formData.metaTitle || ''}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="e.g. GoRidez — Self Drive Cars in Udaipur"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:border-green-600 outline-none text-gray-900"
              />
            </div>

            {/* Meta Description */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">
                  Meta Description
                </label>
                <span className={`text-[10px] font-mono ${
                  (formData.metaDescription?.length || 0) > 160 ? 'text-amber-600 font-bold' : 'text-gray-400'
                }`}>
                  {formData.metaDescription?.length || 0} / 160 chars recommended
                </span>
              </div>
              <textarea
                value={formData.metaDescription || ''}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Brief summary shown in Google search results snippets..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 h-24 leading-relaxed"
              />
            </div>

            {/* Meta Keywords & Canonical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                  Meta Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords || ''}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="self drive car, taxi udaipur, airport transfer"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                  Canonical Tag URL
                </label>
                <input
                  type="url"
                  value={formData.canonicalUrl || ''}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  placeholder="https://goridez.com/self-drive"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono focus:border-green-600 outline-none text-gray-900"
                />
              </div>
            </div>

            {/* Social OG Tags */}
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 mb-6">
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles size={14} className="text-green-600" /> OpenGraph Social Media Previews (Facebook / WhatsApp / LinkedIn)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                    OG Title
                  </label>
                  <input
                    type="text"
                    value={formData.ogTitle || ''}
                    onChange={(e) => setFormData({ ...formData, ogTitle: e.target.value })}
                    placeholder="Defaults to Meta Title"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:border-green-600 outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                    OG Description
                  </label>
                  <input
                    type="text"
                    value={formData.ogDescription || ''}
                    onChange={(e) => setFormData({ ...formData, ogDescription: e.target.value })}
                    placeholder="Defaults to Meta Description"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs focus:border-green-600 outline-none text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">
                  Social Share Image (OG Image)
                </label>
                <ImageUpload
                  value={formData.ogImage || ''}
                  onChange={(val) => setFormData({ ...formData, ogImage: val })}
                />
              </div>
            </div>

            {/* Custom JSON-LD Structured Data Schema */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <FileCode size={14} className="text-green-600" /> JSON-LD Schema (Structured Data JSON)
                </label>
                {jsonError && (
                  <span className="text-xs text-red-600 font-bold font-mono">
                    Invalid JSON: {jsonError}
                  </span>
                )}
              </div>
              <textarea
                value={formData.structuredData || ''}
                onChange={(e) => {
                  setFormData({ ...formData, structuredData: e.target.value });
                  validateJson(e.target.value);
                }}
                placeholder='{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  "name": "GoRidez"\n}'
                className="w-full bg-zinc-950 text-green-400 border border-zinc-800 rounded-2xl p-4 text-xs font-mono h-36 leading-relaxed outline-none focus:border-green-500"
              />
            </div>

            {/* NoIndex Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
              <input
                type="checkbox"
                id="noIndexCheck"
                checked={formData.noIndex || false}
                onChange={(e) => setFormData({ ...formData, noIndex: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="noIndexCheck" className="text-xs font-bold text-amber-900 cursor-pointer">
                Hide from Search Engines (NoIndex / NoFollow tag)
              </label>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
