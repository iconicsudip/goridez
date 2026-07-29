import Link from 'next/link';
import { Compass, Home, Car, ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Page Not Found | GoRidez',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-bg pt-24 pb-16">
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-brand-gold/[0.03] blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-gold-hover/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 border border-brand-border rounded-full px-4 py-1.5 mb-8 bg-brand-panel">
          <Compass size={14} className="text-brand-gold" />
          <span className="text-brand-gold text-xs font-bold tracking-widest uppercase">
            Lost Your Way?
          </span>
        </div>

        <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter leading-none mb-4 text-brand-gold">
          404
        </h1>

        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4 text-gray-900">
          PAGE <span className="text-outline-neon">NOT FOUND</span>
        </h2>

        <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
          The road you're looking for doesn't exist, or it may have been moved. Let's get you back on route.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto justify-center bg-brand-gold hover:bg-brand-gold-hover text-white font-bold px-8 py-4 rounded-xl transition-all tracking-wide flex items-center gap-2 border border-brand-gold cursor-pointer"
          >
            <Home size={16} /> Back to Homepage
          </Link>
          <Link
            href="/self-drive"
            className="w-full sm:w-auto justify-center bg-white hover:bg-gray-50 text-gray-900 font-bold px-8 py-4 rounded-xl transition-all tracking-wide flex items-center gap-2 border border-gray-200 cursor-pointer"
          >
            <Car size={16} /> Browse Self Drive Cars <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
