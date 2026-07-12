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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pb-24">
      {/* Hero Banner */}
      <section className="relative h-[38vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl || DEFAULT_BANNER}
            alt={title}
            fill
            className="object-cover opacity-60 mix-blend-multiply"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-gray-50" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-16 max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight text-gray-900 drop-shadow-sm">
            {title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 -mt-10 relative z-10 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 transition-colors text-xs font-black uppercase tracking-widest mb-6"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-600 to-transparent opacity-50" />
          <div
            className="prose prose-gray max-w-none prose-sm md:prose-base break-words
              prose-headings:font-black prose-headings:text-gray-900
              prose-h1:text-3xl md:prose-h1:text-4xl prose-h1:uppercase prose-h1:tracking-tight prose-h1:mb-2
              prose-h2:text-2xl prose-h2:uppercase prose-h2:tracking-tight prose-h2:mb-4
              prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-green-700 prose-h3:mt-8 prose-h3:mb-3 prose-h3:pb-3 prose-h3:border-b prose-h3:border-gray-200
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-strong:text-gray-900
              prose-ul:mt-3 prose-li:marker:text-green-600"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </section>
    </div>
  );
}
