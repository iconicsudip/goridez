import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Shield, Award, Sparkles, Star, MapPin, Car, CalendarCheck, Rocket, Clock } from 'lucide-react';

import { generatePageMetadata, getSeoForPath } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generatePageMetadata('/about');
}

const CITY_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';

const BOOKING_PROCESS = [
  {
    icon: MapPin,
    title: 'Choose Destination',
    description: 'Pick the city you\'re exploring, from the lakes of Udaipur to the forts of Jaipur.',
  },
  {
    icon: Car,
    title: 'Select Your Ride',
    description: 'Browse our vetted self-drive fleet, chauffeur desk, or villa + car bundles.',
  },
  {
    icon: CalendarCheck,
    title: 'Customize Your Trip',
    description: 'Set your dates, pickup/drop points, and any add-ons that fit your itinerary.',
  },
  {
    icon: Rocket,
    title: 'Book & Hit the Road',
    description: 'Confirm instantly with our booking widget and start exploring, no paperwork queues.',
  },
];

export default async function AboutPage() {
  const [data, siteSettings, carCount, cities, happyCustomers, hp, seoSetting] = await Promise.all([
    prisma.aboutPage.findUnique({ where: { id: 'singleton' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.car.count(),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.happyCustomer.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.homePage.findUnique({ where: { id: 'singleton' } }),
    getSeoForPath('/about'),
  ]);

  const cityCount = cities.length;

  const defaultContent = `
    <p class="text-gray-600 mb-6 leading-relaxed">
      Welcome to GoRidez, the leading premium transportation and luxury experience partner in Rajasthan. Headquartered in Udaipur, we provide travel solutions built specifically for international travelers and local connoisseurs.
    </p>
    <p class="text-gray-600 mb-6 leading-relaxed">
      Whether you are exploring the magnificent forts of Jaipur, traversing the blue streets of Jodhpur, or spending a peaceful weekend in the cool hills of Mount Abu, our vetted fleet of self-drive vehicles, professional chauffeur desk, and private villas are ready to elevate your journey.
    </p>
    <p class="text-gray-600 mb-6 leading-relaxed">
      Every reservation is backed by a dedicated concierge desk, transparent pricing with zero hidden fees, and a fleet that is inspected and sanitized before every handover. We built GoRidez around the belief that premium travel shouldn't mean compromising on reliability.
    </p>
    <h2 class="text-2xl font-black uppercase tracking-tight text-gray-900 mt-8 mb-4">Our Mission</h2>
    <p class="text-gray-600 mb-6 leading-relaxed">
      To make premium mobility across Rajasthan effortless — connecting travelers with vetted vehicles, professional chauffeurs, and heritage stays through a single, trustworthy platform.
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

  const hasReviews = (siteSettings?.googleTotalReviews || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pb-24">
      {seoSetting?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoSetting.structuredData }}
        />
      )}
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

      {/* Stats Strip - Premium Light Theme */}
      <section className="container mx-auto px-4 -mt-12 relative z-20 mb-16 font-body">
        <div className="bg-white border border-gray-200/80 rounded-3xl shadow-xl shadow-green-950/5 p-6 sm:p-8 md:p-10 relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-green-500/[0.04] blur-[80px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-150 relative z-10">
            {/* Stat 1: Vehicles */}
            <div className="flex flex-col items-center justify-center text-center pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200/60 flex items-center justify-center text-green-700 mb-3 shadow-sm">
                <Car size={22} />
              </div>
              <div className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-serif">
                {carCount}<span className="text-green-600 font-sans font-black">+</span>
              </div>
              <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 font-mono">
                Premium Vehicles
              </div>
            </div>

            {/* Stat 2: Cities */}
            <div className="flex flex-col items-center justify-center text-center pt-8 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200/60 flex items-center justify-center text-green-700 mb-3 shadow-sm">
                <MapPin size={22} />
              </div>
              <div className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-serif">
                {cityCount}
              </div>
              <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 font-mono">
                Cities Covered
              </div>
            </div>

            {/* Stat 3: Reviews */}
            <div className="flex flex-col items-center justify-center text-center pt-8 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200/60 flex items-center justify-center text-green-700 mb-3 shadow-sm">
                <Star size={22} className="fill-green-600 text-green-600" />
              </div>
              {hasReviews ? (
                <>
                  <div className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-1.5 font-serif">
                    {siteSettings!.googleAverageRating.toFixed(1)}
                    <span className="text-green-600 text-2xl font-sans font-black">★</span>
                  </div>
                  <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 font-mono">
                    {siteSettings!.googleTotalReviews.toLocaleString()} Google Reviews
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-serif">
                    24<span className="text-green-600 font-sans font-black">×</span>7
                  </div>
                  <div className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-2 font-mono">
                    Concierge Desk
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose GoRidez — horizontal pillars */}
      <section className="container mx-auto px-4 relative z-10 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-100 border border-gray-200 p-8 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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

          <div className="bg-gray-100 border border-gray-200 p-8 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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

          <div className="bg-gray-100 border border-gray-200 p-8 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
      </section>

      {/* Story Content */}
      <section className="container mx-auto px-4 relative z-10">
        <div className="mx-auto bg-gray-100 p-8 md:p-12 overflow-hidden">
          <div
            className="prose prose-gray max-w-none prose-sm md:prose-base break-words prose-headings:font-black prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </section>

      {/* Our Booking Process */}
      <section className="container mx-auto px-4 relative z-10 mt-20">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-green-300 rounded-full px-4 py-1.5 mb-4 bg-green-50">
            <span className="text-green-700 text-[10px] font-black tracking-widest uppercase">
              ✦ How Does It Work
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-3">
            Our Booking <span className="text-green-600">Process</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">
            Four steps between you and the open road.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 mx-auto">
          {BOOKING_PROCESS.map((step, idx) => (
            <div key={step.title} className="relative flex flex-col items-center text-center px-2">
              {idx < BOOKING_PROCESS.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-1/2 w-[calc(100%+1.5rem)] h-px bg-gradient-to-r from-green-300 to-green-100" />
              )}
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-green-600/20 shadow-sm flex items-center justify-center mb-5 relative z-10">
                <step.icon className="text-green-700" size={24} />
              </div>
              <div className="text-[10px] font-black text-green-600 tracking-widest uppercase mb-2">
                Step 0{idx + 1}
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-[200px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Cities We Serve */}
      {cities.length > 0 && (
        <section className="container mx-auto px-4 relative z-10 mt-20">
          <div className="text-center mb-12 mx-auto">
            <div className="inline-flex items-center gap-2 border border-green-300 rounded-full px-4 py-1.5 mb-4 bg-green-50">
              <span className="text-green-700 text-[10px] font-black tracking-widest uppercase">
                ✦ Where We Operate
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-3">
              Cities We <span className="text-green-600">Serve</span>
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">
              Our fleet and concierge desk are on the ground across Rajasthan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mx-auto">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/self-drive?city=${city.id}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Image
                  src={city.banner || CITY_FALLBACK_IMAGE}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between">
                  <span className="text-white font-black uppercase tracking-tight text-sm">{city.name}</span>
                  <ChevronRight size={16} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BRAND TRUST BANNER SECTION (Image Left, Text Right) */}
      <section className="py-24 bg-zinc-950 text-white relative overflow-hidden mt-20 font-body border-y border-brand-border">
        {/* Background Subtle Accent Glows */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-brand-gold/[0.03] blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#8dbb00]/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Image Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] md:aspect-[5/4] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                <Image
                  src={(hp as any)?.trustImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"}
                  alt="GoRidez Trust Statement"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold">
                      ✦
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold uppercase tracking-wider">100% Vetted Fleet</div>
                      <div className="text-gray-400 text-[10px]">Clean, Insured &amp; Verified Cars</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text Column */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
                <span className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                  {(hp as any)?.trustBadge || "✦ PROMISE OF EXCELLENCE"}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-tight font-serif">
                {(hp as any)?.trustTitle || "EVERY JOURNEY BEGINS WITH TRUST. EVERY TRUST BEGINS WITH GORIDEZ."}
              </h2>

              <p className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed font-light">
                {(hp as any)?.trustDescription || "We combine 100% vetted luxury vehicles, professional chauffeurs, transparent pricing, and 24/7 concierge support to make your Rajasthan travel completely seamless."}
              </p>

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8">
                <div className="flex items-center gap-3">
                  <Shield className="text-brand-gold shrink-0" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">Zero Hidden Fees</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="text-brand-gold shrink-0" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">5-Star Customer Rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-brand-gold shrink-0" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">24×7 Concierge Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GoRidez Happy Family — Photo Gallery */}
      {happyCustomers.length > 0 && (
        <section className="container mx-auto px-4 relative z-10 mt-20">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 mx-auto">
            <div className="break-inside-avoid mb-6">
              <div className="inline-flex items-center gap-2 border border-green-300 rounded-full px-4 py-1.5 mb-4 bg-green-50">
                <span className="text-green-700 text-[10px] font-black tracking-widest uppercase">
                  ✦ Real Stories, Real Smiles
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 mb-3">
                GoRidez <span className="text-green-600">Happy Family</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                A growing family of travelers who trusted us with their journey across Rajasthan.
              </p>
            </div>

            {happyCustomers.map((customer, idx) => {
              const aspect = idx % 3 === 0 ? 'aspect-[3/4]' : idx % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]';
              return (
                <div key={customer.id} className="break-inside-avoid mb-6 group">
                  <div className={`relative w-full ${aspect} rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300`}>
                    <Image
                      src={customer.imageUrl}
                      alt={customer.name || 'Happy GoRidez customer'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  </div>
                  {(customer.name || customer.location) && (
                    <div className="mt-3 text-center">
                      {customer.name && <p className="text-sm font-bold text-gray-900">{customer.name}</p>}
                      {customer.location && <p className="text-xs text-green-700 font-semibold">{customer.location}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
