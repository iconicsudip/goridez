import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Shield, Award, Sparkles, Star, MapPin, Car, CalendarCheck, Rocket } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
  const [data, siteSettings, carCount, cities, happyCustomers] = await Promise.all([
    prisma.aboutPage.findUnique({ where: { id: 'singleton' } }),
    prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
    prisma.car.count(),
    prisma.city.findMany({ orderBy: { name: 'asc' } }),
    prisma.happyCustomer.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
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

      {/* Stats Strip */}
      <section className="container mx-auto px-4 -mt-10 relative z-10 mb-12">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-xl px-6 py-8 md:px-12 md:py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-6 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-black text-gray-900">{carCount}+</div>
            <div className="text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">Premium Vehicles</div>
          </div>
          <div className="sm:border-x border-gray-200">
            <div className="text-3xl md:text-4xl font-black text-gray-900">{cityCount}</div>
            <div className="text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">Cities Covered</div>
          </div>
          <div>
            {hasReviews ? (
              <>
                <div className="text-3xl md:text-4xl font-black text-gray-900 flex items-center justify-center gap-1.5">
                  {siteSettings!.googleAverageRating.toFixed(1)} <Star className="text-brand-gold fill-brand-gold" size={22} />
                </div>
                <div className="text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">
                  {siteSettings!.googleTotalReviews.toLocaleString()} Google Reviews
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl md:text-4xl font-black text-gray-900">24×7</div>
                <div className="text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1.5">Concierge Desk</div>
              </>
            )}
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

      {/* Brand Statement Band */}
      <section className="relative bg-gray-900 py-20 md:py-28 mt-20 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-green-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <Sparkles className="mx-auto text-green-500 mb-6" size={28} />
          <p className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            Every Journey Begins With <span className="text-green-500">Trust</span>. Every Trust Begins With <span className="text-green-500">GoRidez</span>.
          </p>
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
