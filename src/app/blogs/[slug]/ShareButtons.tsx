'use client';

import { useState } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';

/** Copy-link / WhatsApp / X share row. `url` must be the absolute canonical URL. */
export default function ShareButtons({ url, title, className = '' }: { url: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const btn =
    'flex h-10 items-center gap-2 rounded-full border border-[#E7DFD5] bg-[#FEFBF8] px-4 text-[11px] font-bold uppercase tracking-wider text-[#551A0C] transition-all hover:border-[#C89D5C] hover:bg-white hover:shadow-md cursor-pointer';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="mr-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C6D53]">
        <Share2 size={13} className="text-[#C89D5C]" /> Share
      </span>
      <button type="button" onClick={copy} className={btn} aria-label="Copy link">
        {copied ? <Check size={14} className="text-emerald-600" /> : <Link2 size={14} className="text-[#C89D5C]" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a href={wa} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on WhatsApp">WhatsApp</a>
      <a href={x} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">X</a>
    </div>
  );
}
