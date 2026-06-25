import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Shield, Award, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const data = await prisma.aboutPage.findUnique({
    where: { id: 'singleton' }
  });

  const defaultContent = `
    <p class="text-gray-600 mb-6 leading-relaxed">
      Welcome to GoRidez, the leading premium transportation and luxury experience partner in Rajasthan. Headquartered in Udaipur, we provide travel solutions built specifically for international travelers and local connoisseurs.
    </p>
    <p class="text-gray-600 mb-6 leading-relaxed">
      Whether you are exploring the magnificent forts of Jaipur, traversing the blue streets of Jodhpur, or spending a peaceful weekend in the cool hills of Mount Abu, our vetted fleet of self-drive vehicles, professional chauffeur desk, and private villas are ready to elevate your journey.
    </p>
    <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 mt-8 mb-4">Our Vision</h2>
    <p class="text-gray-600 mb-6 leading-relaxed">
      To build a seamless, reliable, and premium transportation ecosystem across India, driven by elite hospitality and verified standards.
    </p>
  `;

  const title = data?.title || 'About GoRidez';
  const subtitle = data?.subtitle || 'Premium Car Rentals & Excursions in Rajasthan';
  const content = data?.content || defaultContent;
  const bannerImage = data?.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1800&q=80';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pb-24">
      {/* Hero Banner */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerImage}
            alt="About Banner"
            fill
            className="object-cover opacity-60 mix-blend-multiply"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-gray-50" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 border border-green-300 rounded-full px-4 py-1.5 mb-6 bg-white/60 backdrop-blur-md">
            <span className="text-green-700 text-[10px] md:text-xs font-black tracking-widest uppercase">
              ✦ ESTABLISHED 2024
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tight mb-4 leading-tight text-gray-900 drop-shadow-sm">
            {title}
          </h1>
          <p className="text-gray-700 text-sm md:text-base font-medium max-w-xl mx-auto leading-relaxed drop-shadow-sm">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Main Content & Features */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center: Story Content */}
          <div className="lg:col-span-2 bg-gray-100 border border-gray-200 p-8 md:p-12 rounded-3xl shadow-xl">
            <div
              className="prose prose-gray max-w-none prose-sm md:prose-base prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* Right Sidebar: Key Brand Pillars */}
          <div className="space-y-6">
            <div className="bg-gray-100 border border-gray-200 p-8 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-green-600/10 border border-green-600/20 flex items-center justify-center mb-6">
                <Shield className="text-green-700" size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                100% Vetted Fleet
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Every vehicle is thoroughly inspected, deep-cleaned, and GPS-tracked prior to handover.
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-200 p-8 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Award className="text-emerald-500" size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                Heritage Concierge
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                Exclusive access to private tours, local culinary experiences, and premier stays.
              </p>
            </div>

            <div className="bg-gray-100 border border-gray-200 p-8 rounded-3xl">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Sparkles className="text-purple-500" size={20} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                Elite Services
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                From self-drive sports cars to airport helicopter transfers, we deliver luxury at scale.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-2">
                  Plan Your Odyssey
                </h3>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-6 font-medium">
                  Book a premium drive or tour excursion now with our instant booking widget.
                </p>
              </div>
              <Link
                href="/"
                className="w-full bg-green-600 text-white text-center py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-hover transition-colors"
              >
                Go to Booking Desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
