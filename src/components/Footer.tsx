import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ArrowRight, ArrowUp, Crown, ShieldCheck, Coins, Clock } from 'lucide-react';
import { LEGAL_PAGES } from '@/lib/legal-pages';
import FloatingBackdrop from '@/components/FloatingBackdrop';

const TRUST = [
  { Icon: Crown, title: 'Rajputana Excellence', text: 'Bespoke luxury for elite travelers' },
  { Icon: ShieldCheck, title: '100% Vetted Fleet', text: 'Immaculate maintenance & hygiene' },
  { Icon: Coins, title: '₹0 Deposit Options', text: 'Transparent, zero hidden fees' },
  { Icon: Clock, title: '24/7 Royal Concierge', text: 'Instant on-road roadside assistance' },
];

const SERVICE_LINKS = [
  { href: '/self-drive', label: 'Self-Drive Fleet' },
  { href: '/taxi', label: 'Taxi & Round Trip' },
  { href: '/taxi?mode=AIRPORT_TRANSFER', label: 'Luxury Airport Transfers' },
  { href: '/chauffeur', label: 'Chauffeur Service' },
  { href: '/tours', label: 'Tours & Expeditions' },
  { href: '/villas', label: 'Villa Stays' },
];

const COMPANY_LINKS = [
  { href: '/cities', label: 'Explore Cities' },
  { href: '/blogs', label: 'Travel Journal' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

const SOCIALS = [
  {
    key: 'facebookUrl', label: 'Facebook', size: 16,
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    key: 'instagramUrl', label: 'Instagram', size: 16,
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    key: 'twitterUrl', label: 'Twitter / X', size: 15,
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    key: 'youtubeUrl', label: 'YouTube', size: 16,
    path: 'M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
] as const;

const linkCls =
  'group flex items-center gap-2 text-sm font-medium text-[#FAF6F0]/80 transition-all hover:translate-x-1 hover:text-[#DFB574] focus-visible:text-[#DFB574] focus-visible:outline-none';
const headingCls =
  'mb-5 flex items-center gap-3 font-heading text-xs font-black uppercase tracking-[0.22em] text-[#DFB574]';

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className={headingCls}>
      <span className="h-px w-6 bg-[#C89D5C]" />
      {children}
    </h4>
  );
}

export default function Footer({ siteSettings, cities, legalLinks }: { siteSettings?: any, cities?: any[], legalLinks?: { path: string; title: string }[] }) {
  const logoSrc = siteSettings?.logoRidez || '/logo-ridez.png';
  // Falls back to the static defaults if the caller didn't fetch DB-driven titles (shouldn't
  // normally happen — the root layout always passes these — but keeps Footer safe standalone).
  const displayLegalLinks = legalLinks && legalLinks.length > 0
    ? legalLinks
    : LEGAL_PAGES.map((p) => ({ path: p.path, title: p.defaultTitle }));

  const displayCities = cities && cities.length > 0
    ? cities
    : [
        { id: 'udaipur', name: 'Udaipur' },
        { id: 'jaipur', name: 'Jaipur' },
        { id: 'jodhpur', name: 'Jodhpur' },
        { id: 'mount-abu', name: 'Mount Abu' },
        { id: 'jaisalmer', name: 'Jaisalmer' },
      ];

  const socials = SOCIALS.filter((s) => siteSettings?.[s.key]);

  return (
    <footer className="relative isolate overflow-hidden border-t border-[#C89D5C]/25 bg-gradient-to-b from-[#250903] via-[#1A0602] to-[#100301] pt-16 pb-8 font-body text-white">
      <FloatingBackdrop tone="dark" variant="b" road={false} subtle />

      <div className="container relative mx-auto px-4">
        {/* Trust ribbon */}
        <ul className="mb-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ Icon, title, text }) => (
            <li
              key={title}
              className="group flex items-center gap-4 rounded-2xl border border-[#C89D5C]/20 bg-[#350E05]/40 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#DFB574]/60 hover:bg-[#350E05]/70"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#C89D5C]/50 bg-gradient-to-br from-[#551A0C] to-[#350E05] text-[#DFB574] shadow-md transition-shadow group-hover:shadow-[0_0_20px_rgba(200,157,92,0.4)]">
                <Icon size={20} />
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-[#DFB574]">{title}</span>
                <span className="mt-0.5 block text-xs italic text-[#FAF6F0]/65">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* CTA band */}
        <div className="relative mb-14 overflow-hidden rounded-3xl border border-[#C89D5C]/30 bg-gradient-to-r from-[#551A0C] via-[#6B2210] to-[#551A0C] p-6 sm:p-8">
          <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-dashed border-[#DFB574]/30 animate-[spin_45s_linear_infinite] motion-reduce:animate-none" />
          <span aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-[#DFB574]/10 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#DFB574]/80">✦ Ready when you are</p>
              <h3 className="font-heading text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                Your Rajasthan journey starts here.
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/self-drive"
                className="btn-luxury btn-luxury-shine inline-flex items-center gap-2 rounded-xl border border-[#C89D5C]/60 bg-[#DFB574] px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#250903] shadow-lg transition-all hover:bg-[#F0C98A]"
              >
                Book a Ride <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-[#DFB574]/50 px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#DFB574] transition-colors hover:bg-[#DFB574]/10"
              >
                Talk to Concierge
              </Link>
            </div>
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-12">
          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-5 md:col-span-3 lg:col-span-4">
            <Link href="/" aria-label="GoRidez home" className="group inline-block">
              <div className="relative h-14 w-48 transition-transform group-hover:scale-105">
                <Image src={logoSrc} alt="GoRidez Logo" fill className="object-cover" unoptimized />
              </div>
            </Link>
            <p className="max-w-sm text-sm font-medium leading-relaxed text-[#FAF6F0]/75">
              Rajasthan’s foremost premier luxury mobility desk. Curating impeccable self-drive journeys, private chauffeur fleets, and airport transfers.
            </p>

            {socials.length > 0 && (
              <ul className="flex items-center gap-3" aria-label="Social media">
                {socials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={siteSettings[s.key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex items-center justify-center rounded-full border border-[#C89D5C]/30 bg-[#350E05] p-2.5 text-[#DFB574] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:bg-[#C89D5C] hover:text-[#250903]"
                    >
                      <svg className="fill-current" style={{ width: s.size, height: s.size }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d={s.path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Services */}
          <nav aria-label="Services" className="lg:col-span-2">
            <Heading>Services</Heading>
            <ul className="flex flex-col gap-3.5">
              {SERVICE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkCls}>
                    <ArrowRight size={13} className="shrink-0 text-[#C89D5C] transition-transform group-hover:translate-x-0.5" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company + cities */}
          <div className="lg:col-span-2">
            <nav aria-label="Company">
              <Heading>Explore</Heading>
              <ul className="mb-8 flex flex-col gap-3.5">
                {COMPANY_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      <ArrowRight size={13} className="shrink-0 text-[#C89D5C] transition-transform group-hover:translate-x-0.5" /> {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Cities */}
          <nav aria-label="Operated cities" className="lg:col-span-2">
            <Heading>Operated Cities</Heading>
            <ul className="flex flex-col gap-3.5">
              {displayCities.map((city) => {
                const formattedName = city.name.charAt(0).toUpperCase() + city.name.slice(1).toLowerCase();
                return (
                  <li key={city.id}>
                    <Link href={`/self-drive?pickupCity=${formattedName}`} className={linkCls}>
                      <MapPin size={14} className="shrink-0 text-[#C89D5C] transition-transform group-hover:scale-110" /> {formattedName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Concierge desk */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Heading>Concierge Desk</Heading>
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#C89D5C]" />
                <address className="text-xs not-italic leading-relaxed text-[#FAF6F0]/80">
                  S-9, 100 Ft Road, Wakal Mata Road, Near D Glanz Hotel, Udaipur, Rajasthan – 313001
                </address>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-[#C89D5C]" />
                <a href="tel:+917877634178" className="font-semibold text-[#FAF6F0]/85 transition-colors hover:text-[#DFB574]">
                  +91 78776 34178
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-[#C89D5C]" />
                <a href="mailto:goridezrental@gmail.com" className="break-all font-semibold text-[#FAF6F0]/85 transition-colors hover:text-[#DFB574]">
                  goridezrental@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#C89D5C]/15 pt-6 text-xs font-medium text-[#FAF6F0]/60 md:flex-row">
          <p className="text-center md:text-left">{siteSettings?.copyrightText || `© ${new Date().getFullYear()} GoRidez. All rights reserved.`}</p>

          <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {displayLegalLinks.map((link) => (
              <Link key={link.path} href={link.path} className="transition-colors hover:text-[#DFB574]">
                {link.title}
              </Link>
            ))}
          </nav>

          <a
            href="#"
            aria-label="Back to top"
            className="flex items-center gap-2 rounded-full border border-[#C89D5C]/30 px-3.5 py-2 font-bold uppercase tracking-widest text-[#DFB574] transition-colors hover:bg-[#C89D5C] hover:text-[#250903]"
          >
            Top <ArrowUp size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
