import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1800&q=80';

export default function LegalPageLayout({
  title,
  imageUrl,
  content,
}: {
  title: string;
  imageUrl?: string | null;
  content: string;
}) {
  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans pb-24">
      {/* Hero Banner */}
      <section className="relative h-[42vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-[#250903]">
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl || DEFAULT_BANNER}
            alt={title}
            fill
            className="object-cover opacity-40 mix-blend-luminosity scale-105"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#250903]/70 via-[#250903]/40 to-[#FAF6F0]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-[#C89D5C]/40 rounded-full px-4 py-1.5 mb-4 bg-[#250903]/60 backdrop-blur-md">
            <span className="text-[#DFB574] text-[10px] font-bold tracking-[0.25em] uppercase font-mono">
              ✦ GO RIDEZ OFFICIAL POLICY
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-serif uppercase tracking-tight leading-tight text-white drop-shadow-md">
            {title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 -mt-12 relative z-10 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#8C6D53] hover:text-[#551A0C] transition-colors text-xs font-bold uppercase tracking-[0.2em] mb-6 font-mono"
        >
          <ArrowLeft size={14} /> Back to Concierge
        </Link>

        <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden border-classic-frame">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C89D5C] to-transparent opacity-70" />
          <div
            className="prose prose-stone max-w-none prose-sm md:prose-base break-words
              prose-headings:font-serif prose-headings:font-black prose-headings:text-[#551A0C]
              prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:uppercase prose-h1:tracking-tight prose-h1:mb-4
              prose-h2:text-2xl prose-h2:uppercase prose-h2:tracking-tight prose-h2:mb-4 prose-h2:text-[#551A0C]
              prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-[#C89D5C] prose-h3:mt-8 prose-h3:mb-3 prose-h3:pb-3 prose-h3:border-b prose-h3:border-[#E7DFD5]
              prose-p:text-[#6A5749] prose-p:leading-relaxed
              prose-strong:text-[#250903]
              prose-ul:mt-3 prose-li:marker:text-[#C89D5C]"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </section>
    </div>
  );
}
