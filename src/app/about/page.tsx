import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Shield, Award, Sparkles, Star, MapPin, Car, CalendarCheck, Rocket, Clock } from 'lucide-react';

import { generatePageMetadata, getSeoForPath } from '@/lib/seo';

export const revalidate = 300;

export async function generateMetadata() {
  return generatePageMetadata('/about');
}

const CITY_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';



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

  const title = data?.title || 'About GoRidez';
  const subtitle = data?.subtitle || 'Premium Car Rentals & Excursions in Rajasthan';
  const content = data?.content || '';
  const bannerImage = data?.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1800&q=80';

  const hasReviews = (siteSettings?.googleTotalReviews || 0) > 0;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans pb-24">
      {seoSetting?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoSetting.structuredData }}
        />
      )}
      {/* Hero Banner */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden bg-[#250903]">
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerImage}
            alt="About Banner"
            fill
            className="object-cover opacity-35 mix-blend-luminosity scale-105"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#250903]/80 via-[#250903]/40 to-[#FAF6F0]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center mt-20 max-w-4xl">
          <div className="inline-flex items-center gap-2 border border-[#C89D5C]/40 rounded-full px-5 py-1.5 mb-6 bg-[#250903]/70 backdrop-blur-md">
            <span className="text-[#DFB574] text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase font-mono">
              ✦ ESTABLISHED 2024 &bull; ROYAL HERITAGE MOBILITY
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black font-serif uppercase tracking-tight mb-4 leading-tight text-white drop-shadow-md">
            {title}
          </h1>
          <p className="text-[#DFB574] text-base md:text-xl font-editorial italic max-w-2xl mx-auto leading-relaxed drop-shadow">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Stats Strip - Royal Parchment Medallion Strip */}
      <section className="container mx-auto px-4 -mt-14 relative z-20 mb-20">
        <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden border-classic-frame">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7DFD5] relative z-10">
            {/* Stat 1: Vehicles */}
            <div className="flex flex-col items-center justify-center text-center pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center text-[#551A0C] mb-3 shadow-sm">
                <Car size={22} className="text-[#C89D5C]" />
              </div>
              <div className="text-3xl md:text-5xl font-black text-[#551A0C] tracking-tight font-serif">
                {carCount}<span className="text-[#C89D5C] font-sans font-black">+</span>
              </div>
              <div className="text-[10px] md:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                Sovereign Fleet Marque
              </div>
            </div>

            {/* Stat 2: Cities */}
            <div className="flex flex-col items-center justify-center text-center pt-8 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center text-[#551A0C] mb-3 shadow-sm">
                <MapPin size={22} className="text-[#C89D5C]" />
              </div>
              <div className="text-3xl md:text-5xl font-black text-[#551A0C] tracking-tight font-serif">
                {cityCount}
              </div>
              <div className="text-[10px] md:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                Rajasthan Gateways
              </div>
            </div>

            {/* Stat 3: Reviews */}
            <div className="flex flex-col items-center justify-center text-center pt-8 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center text-[#551A0C] mb-3 shadow-sm">
                <Star size={22} className="fill-[#C89D5C] text-[#C89D5C]" />
              </div>
              {hasReviews ? (
                <>
                  <div className="text-3xl md:text-5xl font-black text-[#551A0C] tracking-tight flex items-center justify-center gap-1.5 font-serif">
                    {siteSettings!.googleAverageRating.toFixed(1)}
                    <span className="text-[#C89D5C] text-2xl font-sans font-black">★</span>
                  </div>
                  <div className="text-[10px] md:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                    {siteSettings!.googleTotalReviews.toLocaleString()} Patron Reviews
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl md:text-5xl font-black text-[#551A0C] tracking-tight font-serif">
                    24<span className="text-[#C89D5C] font-sans font-black">×</span>7
                  </div>
                  <div className="text-[10px] md:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                    Royal Concierge Desk
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Distinction */}
      <section className="container mx-auto px-4 relative z-10 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[10px] font-bold font-mono tracking-[0.25em] text-[#C89D5C] uppercase mb-2 block">
            ✦ PILLARS OF DISTINCTION
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tight text-[#551A0C]">
            Crafted for <span className="font-editorial italic font-normal text-[#C89D5C]">Connoisseurs</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] p-8 rounded-3xl hover:border-[#C89D5C] hover:shadow-xl transition-all duration-300 border-classic-frame">
            <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center mb-6">
              <Shield className="text-[#C89D5C]" size={22} />
            </div>
            <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#551A0C] mb-2">
              100% Vetted Fleet
            </h3>
            <p className="text-xs text-[#6A5749] leading-relaxed">
              Every vehicle is thoroughly inspected, deep-cleaned, and GPS-tracked prior to handover.
            </p>
          </div>

          <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] p-8 rounded-3xl hover:border-[#C89D5C] hover:shadow-xl transition-all duration-300 border-classic-frame">
            <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center mb-6">
              <Award className="text-[#C89D5C]" size={22} />
            </div>
            <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#551A0C] mb-2">
              Heritage Concierge
            </h3>
            <p className="text-xs text-[#6A5749] leading-relaxed">
              Exclusive access to private tours, local culinary experiences, and premier stays across Rajasthan.
            </p>
          </div>

          <div className="card-luxury bg-[#FEFBF8] border border-[#E7DFD5] p-8 rounded-3xl hover:border-[#C89D5C] hover:shadow-xl transition-all duration-300 border-classic-frame">
            <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center mb-6">
              <Sparkles className="text-[#C89D5C]" size={22} />
            </div>
            <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#551A0C] mb-2">
              Bespoke Mobility
            </h3>
            <p className="text-xs text-[#6A5749] leading-relaxed">
              From grand tourers to airport luxury transfers, we tailor every mile to perfection.
            </p>
          </div>

          {/* CTA Box */}
          <div className="bg-[#250903] text-white border border-[#C89D5C]/30 p-8 rounded-3xl flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-[#DFB574] text-[9px] font-mono font-bold tracking-[0.2em] uppercase mb-1 block">✦ INSTANT ACCESS</span>
              <h3 className="text-base font-serif font-black uppercase tracking-tight text-white mb-2">
                Plan Your Royal Odyssey
              </h3>
              <p className="text-[11px] text-white/70 leading-relaxed mb-6 font-normal">
                Book a sovereign drive or chauffeur service now with our instant booking desk.
              </p>
            </div>
            <Link
              href="/"
              className="btn-luxury btn-luxury-shine w-full text-center py-3.5 rounded-xl text-[10px] font-serif font-bold uppercase tracking-[0.16em] shadow-lg"
            >
              Access Booking Desk
            </Link>
          </div>
        </div>
      </section>

      {/* Story Content */}
      {content && content !== "" && (
        <section className="container mx-auto px-4 relative z-10 mb-20">
          <div className="mx-auto card-luxury bg-[#FEFBF8] border border-[#E7DFD5] p-8 md:p-14 rounded-3xl shadow-xl border-classic-frame">
            <div
              className="prose prose-stone max-w-none prose-sm md:prose-base break-words prose-headings:font-serif prose-headings:font-black prose-headings:text-[#551A0C] prose-p:text-[#6A5749] prose-p:leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </section>
      )}

      {/* BRAND TRUST BANNER SECTION (Mahogany & Gold Theme) */}
      <section className="py-24 bg-[#250903] text-white relative overflow-hidden mt-20 border-y border-[#C89D5C]/25">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Image Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] md:aspect-[5/4] rounded-3xl overflow-hidden border border-[#C89D5C]/30 shadow-2xl group border-classic-frame">
                <Image
                  src={(hp as any)?.trustImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"}
                  alt="GoRidez Trust Statement"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#250903]/90 backdrop-blur-md border border-[#C89D5C]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40 flex items-center justify-center font-bold">
                      ✦
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold font-serif uppercase tracking-wider">100% Vetted Fleet</div>
                      <div className="text-[#DFB574] text-[10px] font-mono">Clean, Insured &amp; Verified Luxury</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Text Column */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[2px] w-8 bg-[#C89D5C] rounded-full"></span>
                <span className="text-[#DFB574] text-xs font-bold font-mono tracking-[0.2em] uppercase">
                  {(hp as any)?.trustBadge || "✦ PROMISE OF ROYAL EXCELLENCE"}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-tight font-serif">
                {(hp as any)?.trustTitle || "EVERY JOURNEY BEGINS WITH TRUST. EVERY TRUST BEGINS WITH GORIDEZ."}
              </h2>

              <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed font-light font-editorial italic text-xl">
                {(hp as any)?.trustDescription || "We combine 100% vetted luxury vehicles, professional chauffeurs, transparent pricing, and 24/7 concierge support to make your Rajasthan travel completely seamless."}
              </p>

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#C89D5C]/20 pt-8 font-mono">
                <div className="flex items-center gap-3">
                  <Shield className="text-[#DFB574] shrink-0" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">Zero Hidden Fees</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="text-[#DFB574] shrink-0" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">5-Star Patron Rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-[#DFB574] shrink-0" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">24×7 Concierge Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities We Serve */}
      {cities.length > 0 && (
        <section className="container mx-auto px-4 relative z-10 mt-20">
          <div className="text-center mb-12 mx-auto">
            <div className="inline-flex items-center gap-2 border border-[#C89D5C]/30 rounded-full px-4 py-1.5 mb-4 bg-[#FEFBF8]">
              <span className="text-[#551A0C] text-[10px] font-bold font-mono tracking-widest uppercase">
                ✦ ROYAL TERRITORIES
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-serif uppercase tracking-tight text-[#551A0C] mb-3">
              Gateways We <span className="font-editorial italic font-normal text-[#C89D5C]">Serve</span>
            </h2>
            <p className="text-[#6A5749] text-sm md:text-base font-normal leading-relaxed">
              Our fleet and dedicated concierge desk are on the ground across Rajasthan.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/self-drive?city=${city.id}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#E7DFD5] hover:border-[#C89D5C] border-classic-frame"
              >
                <Image
                  src={city.banner || CITY_FALLBACK_IMAGE}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#250903]/90 via-[#250903]/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between">
                  <span className="text-white font-serif font-bold uppercase tracking-wide text-sm">{city.name}</span>
                  <ChevronRight size={16} className="text-[#DFB574] group-hover:translate-x-1.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* GoRidez Happy Family — Photo Gallery */}
      {happyCustomers.length > 0 && (
        <section className="container mx-auto px-4 relative z-10 mt-20">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 mx-auto">
            <div className="break-inside-avoid mb-6">
              <div className="inline-flex items-center gap-2 border border-[#C89D5C]/30 rounded-full px-4 py-1.5 mb-4 bg-[#FEFBF8]">
                <span className="text-[#551A0C] text-[10px] font-bold font-mono tracking-widest uppercase">
                  ✦ CLIENT PORTFOLIO
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-black uppercase tracking-tight text-[#551A0C] mb-3">
                Distinguished <span className="font-editorial italic font-normal text-[#C89D5C]">Patrons</span>
              </h2>
              <p className="text-[#6A5749] text-sm leading-relaxed font-normal">
                A growing family of travelers who trusted us with their journey across Rajasthan.
              </p>
            </div>

            {happyCustomers.map((customer, idx) => {
              const aspect = idx % 3 === 0 ? 'aspect-[3/4]' : idx % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]';
              return (
                <div key={customer.id} className="break-inside-avoid mb-6 group">
                  <div className={`relative w-full ${aspect} rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-[#E7DFD5] hover:border-[#C89D5C] border-classic-frame`}>
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
                      {customer.name && <p className="text-sm font-bold font-serif text-[#551A0C]">{customer.name}</p>}
                      {customer.location && <p className="text-xs text-[#C89D5C] font-mono font-semibold uppercase">{customer.location}</p>}
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
