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
    if (typeof window !== 'undefined') {
      window.instgrm?.Embeds.process();
      const t = setTimeout(() => {
        window.instgrm?.Embeds.process();
      }, 100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function InstagramEmbed({ url, caption }: { url: string; caption?: string | null }) {
  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: '#FEFBF8',
        border: 0,
        borderRadius: 14,
        margin: '0 auto',
        maxWidth: '100%',
        minWidth: 0,
        width: '100%',
      }}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        {caption || 'View on Instagram'}
      </a>
    </blockquote>
  );
}
