import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronRight, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Star, 
  MapPin, 
  Car, 
  Clock, 
  Crown, 
  Compass, 
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Quote
} from 'lucide-react';

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

  const rawTitle = data?.title || 'About GoRidez';
  const subtitle = data?.subtitle || 'Architects of Sovereign Rajasthan Mobility & Private Excursions';
  const content = data?.content || '';
  const bannerImage = data?.imageUrl || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1800&q=80';

  const hasReviews = (siteSettings?.googleTotalReviews || 0) > 0;
  const avgRating = siteSettings?.googleAverageRating ? siteSettings.googleAverageRating.toFixed(1) : '4.9';
  const totalReviews = siteSettings?.googleTotalReviews || 1250;

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans pb-28 selection:bg-[#551A0C] selection:text-[#DFB574]">
      {seoSetting?.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seoSetting.structuredData }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. CINEMATIC LUXURY HERO
      ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] md:min-h-[82vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#180401] via-[#240A04] to-[#120301] text-white">
        
        {/* Background Visual with Ambient Glows */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bannerImage}
            alt="GoRidez Heritage Rajasthan Mobility"
            fill
            className="object-cover opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000 ease-out"
            priority
            unoptimized
          />
          {/* Radial Spotlight Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#140301_75%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#180401]/90 via-[#240A04]/40 to-[#FAF6F0]" />
        </div>

        {/* Ambient Warm Golden Halos */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#C89D5C]/15 blur-[140px] rounded-full pointer-events-none -z-0" />

        {/* Content Container */}
        <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl pt-28 pb-20">
          
          {/* Breadcrumb Capsule */}
          <div className="inline-flex items-center gap-2.5 border border-[#C89D5C]/40 rounded-full px-5 py-1.5 mb-7 bg-[#250903]/80 backdrop-blur-md shadow-lg shadow-black/40">
            <Link href="/" className="text-[#DFB574]/80 hover:text-[#DFB574] text-[10px] font-mono uppercase tracking-[0.2em] transition-colors">
              Home
            </Link>
            <span className="text-[#C89D5C]/40 text-xs">/</span>
            <span className="text-[#DFB574] text-[10px] font-bold font-mono uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Crown size={12} className="text-[#DFB574]" /> The Sovereign Chronicle
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-serif uppercase tracking-tight mb-6 leading-[0.96] text-white drop-shadow-xl">
            Architects of <br className="hidden sm:inline" />
            <span className="font-editorial italic font-normal text-[#DFB574] lowercase tracking-normal">
              royal rajasthan
            </span>{' '}
            journeys
          </h1>

          {/* Subtitle */}
          <p className="text-[#DFB574] text-base sm:text-lg md:text-xl font-editorial italic max-w-2xl mx-auto leading-relaxed drop-shadow mb-9">
            “{subtitle}”
          </p>

          {/* Quick CTA Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-heading font-bold uppercase tracking-[0.18em]">
            <Link
              href="/self-drive"
              className="btn-luxury btn-luxury-shine bg-[#551A0C] hover:bg-[#431307] text-[#DFB574] border border-[#C89D5C]/60 hover:border-[#DFB574] px-8 py-3.5 rounded-full transition-all shadow-xl shadow-[#551A0C]/40 inline-flex items-center gap-2 group cursor-pointer"
            >
              Explore Fleet <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/taxi"
              className="bg-white/10 hover:bg-white/20 text-[#FAF6F0] hover:text-white border border-[#D4C3B2]/30 hover:border-[#C89D5C] px-8 py-3.5 rounded-full backdrop-blur-md transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              Taxi &amp; Chauffeur
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. STATS STRIP — ROYAL PARCHMENT MEDALLION BAR
      ───────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 -mt-14 relative z-20 mb-24 max-w-6xl">
        <div className="card-luxury bg-white border border-[#D4C3B2] rounded-3xl shadow-[0_20px_50px_rgba(42,14,7,0.12),0_2px_8px_rgba(42,14,7,0.04)] p-6 sm:p-8 md:p-10 relative overflow-hidden">
          
          {/* Subtle Corner Vignette */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#C89D5C]/10 via-transparent to-transparent pointer-events-none rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#551A0C]/5 via-transparent to-transparent pointer-events-none rounded-bl-3xl" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E7DFD5] relative z-10">
            
            {/* Stat 1: Fleet */}
            <div className="flex flex-col items-center justify-center text-center p-3 sm:p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/35 flex items-center justify-center text-[#551A0C] mb-3 shadow-2xs">
                <Car size={22} className="text-[#551A0C]" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#551A0C] tracking-tight font-serif">
                {carCount}<span className="text-[#C89D5C] font-sans font-black">+</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                Sovereign Fleet
              </div>
              <span className="text-[11px] text-[#6A5749] font-editorial italic mt-0.5">
                Vetted SUVs &amp; Sedans
              </span>
            </div>

            {/* Stat 2: Gateways */}
            <div className="flex flex-col items-center justify-center text-center p-3 sm:p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/35 flex items-center justify-center text-[#551A0C] mb-3 shadow-2xs">
                <MapPin size={22} className="text-[#551A0C]" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#551A0C] tracking-tight font-serif">
                {cityCount > 0 ? cityCount : 5}
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                Rajasthan Gateways
              </div>
              <span className="text-[11px] text-[#6A5749] font-editorial italic mt-0.5">
                On-Ground Concierge
              </span>
            </div>

            {/* Stat 3: Google Rating */}
            <div className="flex flex-col items-center justify-center text-center p-3 sm:p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/35 flex items-center justify-center text-[#551A0C] mb-3 shadow-2xs">
                <Star size={22} className="fill-[#C89D5C] text-[#C89D5C]" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#551A0C] tracking-tight flex items-center justify-center gap-1 font-serif">
                {avgRating}
                <span className="text-[#C89D5C] text-2xl font-sans font-black">★</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                Google Verified
              </div>
              <span className="text-[11px] text-[#6A5749] font-editorial italic mt-0.5">
                {totalReviews.toLocaleString()} Patron Reviews
              </span>
            </div>

            {/* Stat 4: Standards */}
            <div className="flex flex-col items-center justify-center text-center p-3 sm:p-4">
              <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/35 flex items-center justify-center text-[#551A0C] mb-3 shadow-2xs">
                <ShieldCheck size={22} className="text-[#551A0C]" />
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[#551A0C] tracking-tight font-serif">
                100<span className="text-[#C89D5C] font-sans font-black">%</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-[#8C6D53] uppercase tracking-[0.2em] mt-2 font-mono">
                Insured &amp; Verified
              </div>
              <span className="text-[11px] text-[#6A5749] font-editorial italic mt-0.5">
                White-Glove Sanitized
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. EDITORIAL NARRATIVE — THE GORIDEZ HERITAGE MANIFEST
      ───────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 relative z-10 mb-28 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Philosophical Credo */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#C89D5C]/40 rounded-full px-4 py-1.5 mb-4 bg-white shadow-2xs">
                <Sparkles size={13} className="text-[#C89D5C]" />
                <span className="text-[#551A0C] text-[10px] font-bold font-mono tracking-[0.25em] uppercase">
                  THE SOVEREIGN PURPOSE
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black uppercase tracking-tight text-[#250903] leading-[1.05] mb-6">
                Born in Udaipur. <br />
                <span className="font-editorial italic font-normal text-[#551A0C]">Crafted for</span> <br />
                Discerning Patrons.
              </h2>

              <div className="relative pl-6 border-l-2 border-[#C89D5C] my-6">
                <Quote size={20} className="text-[#C89D5C]/40 absolute -top-2 left-2" />
                <p className="text-lg md:text-xl font-editorial italic text-[#551A0C] leading-relaxed pt-2">
                  “Traversing the royal expanses of Rajasthan should never feel like mere transit. It should feel like an extension of the palace halls—poised, private, punctual, and uncompromising in luxury.”
                </p>
              </div>

              <p className="text-[#6A5749] text-sm md:text-base leading-relaxed font-normal mb-8">
                GoRidez was founded with a singular conviction: to liberate travelers from the uncertainty of unreliable cabs, ambiguous pricing, and poorly maintained cars. We engineered an immaculate fleet, paired it with Rajasthani hospitality, and backed it with 24/7 royal concierge precision.
              </p>
            </div>

            {/* Prestige Seal Pod */}
            <div className="p-5 rounded-2xl bg-[#FEFBF8] border border-[#D4C3B2] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/50 flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
                ✦
              </div>
              <div className="min-w-0">
                <div className="font-heading font-bold text-xs uppercase tracking-wider text-[#250903]">
                  The GoRidez Quality Seal
                </div>
                <div className="text-[11px] text-[#8C6D53] font-mono mt-0.5">
                  Hand-inspected before every departure &bull; 0 Hidden Tariffs
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom DB Content or The 3 Core Pillars */}
          <div className="lg:col-span-7">
            {content && content.trim() !== '' ? (
              <div className="card-luxury bg-white border border-[#D4C3B2] p-8 md:p-12 rounded-3xl shadow-[0_16px_40px_rgba(42,14,7,0.08)]">
                <div
                  className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-black prose-headings:text-[#551A0C] prose-headings:uppercase prose-p:text-[#6A5749] prose-p:leading-relaxed prose-p:text-base prose-strong:text-[#250903] prose-strong:font-bold prose-li:text-[#6A5749]"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Pillar 1 */}
                <div className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] rounded-3xl p-7 shadow-[0_12px_32px_rgba(42,14,7,0.06)] transition-all duration-300 group">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40 flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      01
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-[#250903] uppercase tracking-tight mb-2 group-hover:text-[#551A0C] transition-colors">
                        Pristine Automotive Collection
                      </h3>
                      <p className="text-sm text-[#6A5749] leading-relaxed font-normal">
                        Every vehicle in our sovereign fleet undergoes a multi-point mechanical inspection, complete cabin deep-cleaning, and sanitization before being released for your journey.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pillar 2 */}
                <div className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] rounded-3xl p-7 shadow-[0_12px_32px_rgba(42,14,7,0.06)] transition-all duration-300 group">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40 flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      02
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-[#250903] uppercase tracking-tight mb-2 group-hover:text-[#551A0C] transition-colors">
                        Chauffeured Etiquette &amp; Route Mastery
                      </h3>
                      <p className="text-sm text-[#6A5749] leading-relaxed font-normal">
                        Our seasoned royal chauffeurs are adept at navigating both winding old-city palace lanes and high-speed express corridors, providing discreet, courteous, and timely service.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pillar 3 */}
                <div className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] rounded-3xl p-7 shadow-[0_12px_32px_rgba(42,14,7,0.06)] transition-all duration-300 group">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40 flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      03
                    </div>
                    <div>
                      <h3 className="font-serif font-black text-lg text-[#250903] uppercase tracking-tight mb-2 group-hover:text-[#551A0C] transition-colors">
                        Unwavering Transparency
                      </h3>
                      <p className="text-sm text-[#6A5749] leading-relaxed font-normal">
                        No ambiguous fuel clauses, unexpected terminal fees, or hidden kilometer calculations. Every agreement is clear, documented, and delivered upfront with sovereign honor.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. PILLARS OF DISTINCTION (4 GRID CARDS)
      ───────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 relative z-10 mb-28 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 border border-[#D4C3B2] rounded-full px-4 py-1.5 mb-4 bg-white shadow-2xs">
            <Crown size={13} className="text-[#C89D5C]" />
            <span className="text-[#551A0C] text-[10px] font-bold font-mono tracking-[0.25em] uppercase">
              THE HALLMARKS OF LUXURY
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-black uppercase tracking-tight text-[#250903] leading-none mb-4">
            Crafted for <span className="font-editorial italic font-normal text-[#551A0C]">Connoisseurs</span>
          </h2>
          <p className="text-[#6A5749] text-sm md:text-base font-normal leading-relaxed">
            The four foundational pillars defining every mile traveled under the GoRidez emblem.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] p-8 rounded-3xl hover:shadow-[0_20px_45px_rgba(42,14,7,0.12)] transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center group-hover:bg-[#551A0C] transition-colors">
                  <ShieldCheck className="text-[#551A0C] group-hover:text-[#DFB574] transition-colors" size={22} />
                </div>
                <span className="font-mono text-xs font-bold text-[#8C6D53]">01</span>
              </div>
              <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#250903] mb-2.5 group-hover:text-[#551A0C] transition-colors">
                100% Vetted Fleet
              </h3>
              <p className="text-xs text-[#6A5749] leading-relaxed font-normal">
                Every vehicle is thoroughly inspected, deep-cleaned, and GPS-secured prior to handover or dispatch.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0E9DF] flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#551A0C] uppercase tracking-wider">
              <CheckCircle2 size={12} className="text-[#C89D5C]" /> Verified Standard
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] p-8 rounded-3xl hover:shadow-[0_20px_45px_rgba(42,14,7,0.12)] transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center group-hover:bg-[#551A0C] transition-colors">
                  <Compass className="text-[#551A0C] group-hover:text-[#DFB574] transition-colors" size={22} />
                </div>
                <span className="font-mono text-xs font-bold text-[#8C6D53]">02</span>
              </div>
              <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#250903] mb-2.5 group-hover:text-[#551A0C] transition-colors">
                Heritage Concierge
              </h3>
              <p className="text-xs text-[#6A5749] leading-relaxed font-normal">
                Curated route advisories, palace access assistance, and bespoke royal itineraries across Rajasthan.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0E9DF] flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#551A0C] uppercase tracking-wider">
              <CheckCircle2 size={12} className="text-[#C89D5C]" /> 24/7 Desk Care
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="card-luxury bg-white border border-[#D4C3B2] hover:border-[#C89D5C] p-8 rounded-3xl hover:shadow-[0_20px_45px_rgba(42,14,7,0.12)] transition-all duration-500 group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#551A0C]/10 border border-[#C89D5C]/30 flex items-center justify-center group-hover:bg-[#551A0C] transition-colors">
                  <Sparkles className="text-[#551A0C] group-hover:text-[#DFB574] transition-colors" size={22} />
                </div>
                <span className="font-mono text-xs font-bold text-[#8C6D53]">03</span>
              </div>
              <h3 className="text-sm font-bold font-serif uppercase tracking-widest text-[#250903] mb-2.5 group-hover:text-[#551A0C] transition-colors">
                Bespoke Mobility
              </h3>
              <p className="text-xs text-[#6A5749] leading-relaxed font-normal">
                From self-drive freedom to airport transfers and multi-day royal tours, we calibrate each journey.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#F0E9DF] flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#551A0C] uppercase tracking-wider">
              <CheckCircle2 size={12} className="text-[#C89D5C]" /> Tailored Fares
            </div>
          </div>

          {/* Pillar 4: Executive Invitation Card */}
          <div className="bg-gradient-to-b from-[#2E0B04] via-[#240A04] to-[#180401] text-white border border-[#C89D5C]/40 p-8 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C89D5C]/20 via-transparent to-transparent pointer-events-none rounded-tr-3xl" />
            <div className="relative z-10">
              <span className="text-[#DFB574] text-[9px] font-mono font-bold tracking-[0.25em] uppercase mb-2 block">
                ✦ ROYAL ODYSSEY
              </span>
              <h3 className="text-base font-serif font-black uppercase tracking-tight text-white mb-2 leading-tight">
                Plan Your Journey Today
              </h3>
              <p className="text-[11px] text-[#FAF6F0]/75 leading-relaxed mb-6 font-normal">
                Reserve your sovereign self-drive or executive chauffeur carriage in less than two minutes.
              </p>
            </div>
            <Link
              href="/"
              className="btn-luxury btn-luxury-shine w-full text-center py-3.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-[0.18em] shadow-lg bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/60 hover:border-[#DFB574] block cursor-pointer transition-all"
            >
              Access Booking Desk
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. BRAND TRUST BANNER — THE SOVEREIGN VOW
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#250903] text-white relative overflow-hidden mb-28 border-y border-[#C89D5C]/30">
        
        {/* Ambient Dark-Gold Halos */}
        <div className="absolute top-1/2 left-10 -translate-y-1/2 w-[500px] h-[500px] bg-[#C89D5C]/[0.08] blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[450px] bg-[#551A0C]/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Image Column */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] md:aspect-[5/4] rounded-3xl overflow-hidden border border-[#C89D5C]/40 shadow-2xl group">
                <Image
                  src={(hp as any)?.trustImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80"}
                  alt="GoRidez Trust Statement"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                
                {/* Floating Medallion Tag */}
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#250903]/90 backdrop-blur-md border border-[#C89D5C]/40 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/50 flex items-center justify-center font-bold text-sm shrink-0">
                      ✦
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-xs font-serif font-bold uppercase tracking-wider truncate">
                        Sovereign Fleet Standard
                      </div>
                      <div className="text-[#DFB574] text-[10px] font-mono">
                        Fully Sanitized, Insured &amp; GPS-Secured
                      </div>
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

              <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed font-editorial italic text-xl">
                {(hp as any)?.trustDescription || "We combine 100% vetted luxury vehicles, professional chauffeurs, transparent pricing, and 24/7 concierge support to make your Rajasthan travel completely seamless."}
              </p>

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#C89D5C]/25 pt-8 font-mono">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-[#DFB574] shrink-0" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">Zero Hidden Tariffs</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="text-[#DFB574] shrink-0 fill-[#DFB574]" size={20} />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-200">5-Star Google Rating</span>
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

      {/* ─────────────────────────────────────────────────────────────
          6. CITIES WE SERVE — ROYAL RAJASTHAN GATEWAYS
      ───────────────────────────────────────────────────────────── */}
      {cities.length > 0 && (
        <section className="container mx-auto px-4 relative z-10 mb-28 max-w-6xl">
          <div className="text-center mb-14 mx-auto max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-[#D4C3B2] rounded-full px-4 py-1.5 mb-4 bg-white shadow-2xs">
              <MapPin size={13} className="text-[#C89D5C]" />
              <span className="text-[#551A0C] text-[10px] font-bold font-mono tracking-[0.25em] uppercase">
                ✦ ROYAL TERRITORIES &amp; CORRIDORS
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black font-serif uppercase tracking-tight text-[#250903] leading-none mb-3">
              Gateways We <span className="font-editorial italic font-normal text-[#551A0C]">Serve</span>
            </h2>
            <p className="text-[#6A5749] text-sm md:text-base font-normal leading-relaxed">
              Our sovereign fleet and localized concierge teams are positioned across Rajasthan&apos;s historic corridors.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/self-drive?city=${city.id}`}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#D4C3B2] hover:border-[#C89D5C] block"
              >
                <Image
                  src={city.banner || CITY_FALLBACK_IMAGE}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#250903]/95 via-[#250903]/30 to-transparent" />
                
                <div className="absolute inset-x-0 bottom-0 p-5 flex items-center justify-between z-10">
                  <div>
                    <span className="text-white font-serif font-bold uppercase tracking-wide text-base block group-hover:text-[#DFB574] transition-colors">
                      {city.name}
                    </span>
                    <span className="text-[10px] text-[#DFB574]/80 font-mono uppercase tracking-widest">
                      Explore Fleet &rarr;
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#551A0C] border border-[#DFB574]/30 flex items-center justify-center text-[#DFB574] transition-colors shrink-0">
                    <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. DISTINGUISHED PATRONS — HAPPY CUSTOMER PORTFOLIO
      ───────────────────────────────────────────────────────────── */}
      {happyCustomers.length > 0 && (
        <section className="container mx-auto px-4 relative z-10 mb-28 max-w-6xl">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 border border-[#D4C3B2] rounded-full px-4 py-1.5 mb-4 bg-white shadow-2xs">
              <Award size={13} className="text-[#C89D5C]" />
              <span className="text-[#551A0C] text-[10px] font-bold font-mono tracking-[0.25em] uppercase">
                ✦ PATRON GALLERY &amp; MOMENTS
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-black uppercase tracking-tight text-[#250903] leading-none mb-3">
              Distinguished <span className="font-editorial italic font-normal text-[#551A0C]">Patrons</span>
            </h2>
            <p className="text-[#6A5749] text-sm md:text-base leading-relaxed font-normal">
              A growing family of discerning voyagers who entrusted their Rajasthan passage to GoRidez.
            </p>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {happyCustomers.map((customer, idx) => {
              const aspect = idx % 3 === 0 ? 'aspect-[3/4]' : idx % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]';
              return (
                <div key={customer.id} className="break-inside-avoid mb-6 group">
                  <div className={`relative w-full ${aspect} rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-[#D4C3B2] hover:border-[#C89D5C] bg-white`}>
                    <Image
                      src={customer.imageUrl}
                      alt={customer.name || 'Happy GoRidez customer'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {(customer.name || customer.location) && (
                    <div className="mt-3.5 px-2 flex items-center justify-between">
                      <div>
                        {customer.name && (
                          <p className="text-sm font-bold font-serif text-[#250903] uppercase tracking-wide">
                            {customer.name}
                          </p>
                        )}
                        {customer.location && (
                          <p className="text-[11px] text-[#8C6D53] font-mono uppercase tracking-wider">
                            {customer.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-[#C89D5C]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="fill-[#C89D5C]" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. GRAND INVITATION BANNER — FINAL CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 relative z-10 max-w-6xl">
        <div className="bg-gradient-to-br from-[#2E0B04] via-[#200702] to-[#120301] text-white rounded-3xl p-8 sm:p-12 md:p-16 border border-[#C89D5C]/40 shadow-2xl relative overflow-hidden text-center">
          
          {/* Subtle Ambient Orbs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#C89D5C]/15 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#551A0C]/40 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 border border-[#C89D5C]/40 rounded-full px-5 py-1.5 mb-6 bg-[#250903]/80 backdrop-blur-md">
              <Sparkles size={13} className="text-[#DFB574]" />
              <span className="text-[#DFB574] text-[10px] font-bold font-mono tracking-[0.25em] uppercase">
                YOUR RAJASTHAN EXPEDITION AWAITS
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black uppercase tracking-tight text-white mb-6 leading-tight">
              Begin Your Journey in <br />
              <span className="font-editorial italic font-normal text-[#DFB574] lowercase tracking-normal">
                sovereign comfort
              </span>
            </h2>

            <p className="text-[#FAF6F0]/80 text-sm sm:text-base leading-relaxed mb-9 max-w-xl mx-auto font-light">
              Connect directly with our 24/7 royal concierge desk or reserve your desired marque online with zero hidden costs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-heading font-bold uppercase tracking-[0.18em]">
              <Link
                href="/self-drive"
                className="btn-luxury btn-luxury-shine bg-[#551A0C] hover:bg-[#431307] text-[#DFB574] border border-[#C89D5C]/60 hover:border-[#DFB574] px-9 py-4 rounded-full transition-all shadow-xl shadow-[#551A0C]/40 inline-flex items-center gap-2 cursor-pointer"
              >
                Browse Fleet &amp; Reserve Online
              </Link>
              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-[#FAF6F0] hover:text-white border border-[#D4C3B2]/30 hover:border-[#C89D5C] px-8 py-4 rounded-full backdrop-blur-md transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall size={14} className="text-[#DFB574]" /> Contact Royal Concierge
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
