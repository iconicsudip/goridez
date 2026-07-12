'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Plus, Trash2, ArrowUp, ArrowDown, X, ExternalLink } from 'lucide-react';
import { createInstagramReel, updateInstagramReel, reorderInstagramReel, deleteInstagramReel } from '@/app/admin/actions';
import InstagramEmbed, { InstagramEmbedScript, useInstagramEmbedProcess } from '@/components/InstagramEmbed';

interface Reel {
  id: string;
  url: string;
  caption: string | null;
  isActive: boolean;
  order: number;
}

export default function InstagramReelsManager({ reels }: { reels: Reel[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useInstagramEmbedProcess([reels]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    const data = new FormData();
    data.append('url', url);
    data.append('caption', caption);

    const res = await createInstagramReel(data);
    setAdding(false);

    if (res.success) {
      setUrl('');
      setCaption('');
      router.refresh();
    } else {
      setError(res.error || 'Failed to add reel.');
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    startTransition(async () => {
      await updateInstagramReel(id, { isActive: !isActive });
      router.refresh();
    });
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    startTransition(async () => {
      await reorderInstagramReel(id, direction);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this reel?')) return;
    startTransition(async () => {
      await deleteInstagramReel(id);
      router.refresh();
    });
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2 text-gray-900 flex items-center gap-3">
            <Camera className="text-green-700" size={32} /> Instagram Reels
          </h1>
          <p className="text-gray-500 text-[13px]">
            Paste public Instagram reel or post URLs below. Toggle a reel active to show it in the "Latest Reels" section on the home page.
          </p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="max-w-2xl bg-gray-100 border border-gray-200 rounded-3xl p-8 space-y-4 mb-10">
        {error && (
          <div className="p-3 rounded-xl text-xs font-mono border bg-red-500/5 border-red-500/20 text-red-400 flex justify-between items-center">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')} className="opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
            Instagram Reel URL
          </label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/XXXXXXXXXXX/"
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold font-mono">
            Caption (Optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Shown as fallback link text"
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-green-600 outline-none text-gray-900 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="bg-green-600 hover:bg-brand-hover text-black px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={14} /> {adding ? 'Adding...' : 'Add Reel'}
        </button>
      </form>

      {reels.length === 0 && (
        <div className="p-10 text-center text-gray-400 text-xs font-mono uppercase border border-dashed border-gray-300 rounded-3xl">
          No reels added yet
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reels.map((reel, idx) => (
          <div key={reel.id} className="bg-gray-100 border border-gray-200 rounded-2xl p-5 flex flex-col">
            {/* Header row: link, status, actions — always visible regardless of embed height */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="min-w-0">
                <a
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-600 hover:text-green-700 font-mono flex items-center gap-1.5 mb-1.5 break-all"
                >
                  <ExternalLink size={12} className="shrink-0" /> {reel.url}
                </a>
                {reel.caption && <p className="text-xs text-gray-500 mb-1.5">{reel.caption}</p>}
                <span
                  className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                    reel.isActive
                      ? 'bg-green-600/10 text-green-700 border-green-600/20'
                      : 'bg-gray-200 text-gray-500 border-gray-300'
                  }`}
                >
                  {reel.isActive ? 'Visible on Home Page' : 'Hidden'}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <button
                  disabled={isPending}
                  onClick={() => handleToggleActive(reel.id, reel.isActive)}
                  className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-50"
                >
                  {reel.isActive ? 'Hide' : 'Show'}
                </button>
                <button
                  disabled={isPending || idx === 0}
                  onClick={() => handleMove(reel.id, 'up')}
                  className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-30"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  disabled={isPending || idx === reels.length - 1}
                  onClick={() => handleMove(reel.id, 'down')}
                  className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors disabled:opacity-30"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleDelete(reel.id)}
                  className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-colors disabled:opacity-50 ml-auto"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Embed preview — scrollable so a tall reel doesn't dominate the card */}
            <div className="w-full flex justify-center bg-white rounded-xl border border-gray-200 max-h-[520px] overflow-y-auto overflow-x-hidden custom-scrollbar">
              <div className="w-full min-w-[326px]">
                <InstagramEmbed url={reel.url} caption={reel.caption} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <InstagramEmbedScript />
    </div>
  );
}
