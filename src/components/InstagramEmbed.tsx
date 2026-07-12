'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramEmbedScript() {
  return (
    <Script
      src="https://www.instagram.com/embed.js"
      strategy="lazyOnload"
      onLoad={() => window.instgrm?.Embeds.process()}
      onReady={() => window.instgrm?.Embeds.process()}
    />
  );
}

export function useInstagramEmbedProcess(deps: React.DependencyList) {
  useEffect(() => {
    window.instgrm?.Embeds.process();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function InstagramEmbed({ url, caption }: { url: string; caption?: string | null }) {
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{ background: '#FFF', border: 0, borderRadius: 3, margin: '1px auto', maxWidth: 540, minWidth: 326, width: 'calc(100% - 2px)' }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        {caption || 'View on Instagram'}
      </a>
    </blockquote>
  );
}
