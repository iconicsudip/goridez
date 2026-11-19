'use client';

/**
 * Shared vehicle card used across Browse, Self-Drive, Chauffeur, Collections and Cities.
 * - layout: 'vertical' (grid / carousel) | 'horizontal' (wide list row)
 * - theme:  'light' | 'dark' (dark body for the dark "Collections" section)
 * Each page keeps its own pricing + booking logic and passes the result in via props.
 */

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Fuel, Users, Settings2, ArrowRight, KeyRound, Gauge, Route, Check, UserRound, Wallet, MapPin,
} from 'lucide-react';
import { getCarDisplay } from '@/lib/utils';

export const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80';

export type Perk = { icon: React.ReactNode; text: string };

/** Starting price + the package that price belongs to (used for "included" info). */
export function getCarPricing(car: any, fallback = 2200) {
  const pkgs: any[] = [...(car.packages || [])].sort((a, b) => a.basePrice - b.basePrice);
  const startingPrice: number = car.perDayPrice || car.price || (pkgs[0] ? pkgs[0].basePrice : fallback);
  const refPkg = pkgs.find((p) => p.basePrice === startingPrice) ?? pkgs[0];
  return { startingPrice, refPkg };
}

/** Real, data-backed perks for a car (km included, extra km rate, deposit). */
export function getCarPerks(car: any, pkg?: any): Perk[] {
  const perks: Perk[] = [];
  if (pkg?.limitValue) {
    perks.push({ icon: <Route size={12} />, text: `${pkg.limitValue} ${pkg.type === 'KM' || !pkg.type ? 'km' : 'hrs'} included` });
  }
  if (pkg?.extraChargePerUnit) perks.push({ icon: <Gauge size={12} />, text: `${inr(pkg.extraChargePerUnit)}/km extra` });
  if (pkg?.deposit > 0) perks.push({ icon: <Wallet size={12} />, text: `${inr(pkg.deposit)} refundable deposit` });
  if (!perks.length && car.extraHourCharge) perks.push({ icon: <Gauge size={12} />, text: `${inr(car.extraHourCharge)}/extra hr` });
  return perks;
}

/* ───────────────────────── Stage (image area) ───────────────────────── */

interface StageProps {
  car: any;
  /** Replace the default <Image> (e.g. with <CarImageSlider/>). */
  imageSlot?: React.ReactNode;
  /** Override the category pill text. */
  badge?: string;
  /** Show self-drive / driver chips (from car.serviceTypes). */
  showServiceChips?: boolean;
  /** Overrides service chips, e.g. a single "Royal Chauffeur" chip. */
  chips?: React.ReactNode;
  availableLabel?: string;
  unavailableLabel?: string;
  cityName?: string;
  className?: string;
  imageClassName?: string;
}

export function VehicleStage({
  car, imageSlot, badge, showServiceChips = true, chips, availableLabel = 'Available', unavailableLabel = 'Booked out',
  cityName, className = 'h-[225px]', imageClassName = '',
}: StageProps) {
  const display = getCarDisplay(car);
  const available = car.availability !== false;
  const services: string[] = car.serviceTypes?.length ? car.serviceTypes : ['SELF_DRIVE'];
  const hasSelfDrive = services.includes('SELF_DRIVE');
  const hasChauffeur = services.some((t) => t !== 'SELF_DRIVE');
  const category = badge ?? (car.category ? car.category.replace(/\bClass\b/gi, '').trim() : 'Royal Tier');

  const chipCls =
    'flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#551A0C] ring-1 ring-[#E7DFD5] backdrop-blur';

  return (
    <div className={`relative z-10 overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_at_50%_35%,#FFFFFF_0%,#F6EEE1_55%,#EBDDC8_100%)] ring-1 ring-[#E7DFD5] ${className}`}>
      {/* Floating decor */}
      <span aria-hidden className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-[#C89D5C]/25 blur-2xl animate-float-slow motion-reduce:animate-none" />
      <span aria-hidden className="absolute -bottom-8 -right-4 h-28 w-28 rounded-full bg-[#551A0C]/15 blur-2xl animate-float-reverse motion-reduce:animate-none" />
      <span aria-hidden className="absolute right-6 top-12 h-2 w-2 rotate-45 bg-[#C89D5C]/70 animate-float motion-reduce:animate-none" />
      <span aria-hidden className="absolute left-8 bottom-14 h-1.5 w-1.5 rounded-full bg-[#551A0C]/40 animate-float-gentle motion-reduce:animate-none" />

      {/* Halo rings */}
      <span aria-hidden className="absolute left-1/2 top-[46%] h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(223,181,116,0.38)_0%,rgba(223,181,116,0.10)_60%,transparent_72%)] transition-transform duration-700 group-hover:scale-125" />
      <span aria-hidden className="absolute left-1/2 top-[46%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[#C89D5C]/40 animate-[spin_50s_linear_infinite] motion-reduce:animate-none" />
      <span aria-hidden className="absolute left-1/2 top-[46%] h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C89D5C]/15" />

      {/* Platform + ground shadow */}
      <span aria-hidden className="absolute bottom-7 left-1/2 h-6 w-[72%] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#EBDDC8] to-transparent ring-1 ring-[#C89D5C]/20" />
      <span aria-hidden className="absolute bottom-8 left-1/2 h-3 w-[56%] -translate-x-1/2 rounded-[50%] bg-[#250903]/30 blur-md transition-all duration-500 group-hover:w-[46%] group-hover:opacity-60" />

      {/* Vehicle image */}
      <div className="absolute inset-0 px-3 pt-6 pb-10">
        {imageSlot ?? (
          <Image
            src={car.image || FALLBACK_IMG}
            alt={display.full}
            fill
            sizes="(max-width: 768px) 88vw, 25vw"
            className={`object-contain px-3 pt-6 pb-10 mix-blend-multiply transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:scale-[1.07] group-hover:-rotate-1 ${imageClassName}`}
            unoptimized
          />
        )}
      </div>

      {/* Badges */}
      <span className="absolute left-3 top-3 z-10 rounded-full border border-[#C89D5C]/40 bg-[#551A0C]/90 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#DFB574] shadow-sm backdrop-blur-md">
        {category}
      </span>
      <span
        className={`absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
          available ? 'border-emerald-700/20 bg-white/80 text-emerald-800' : 'border-amber-700/20 bg-white/80 text-amber-800'
        }`}
      >
        <span className="relative flex h-1.5 w-1.5">
          {available && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70 motion-reduce:animate-none" />}
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${available ? 'bg-emerald-600' : 'bg-amber-600'}`} />
        </span>
        {available ? availableLabel : unavailableLabel}
      </span>

      {/* Bottom chips */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
        {chips ??
          (showServiceChips && (
            <>
              {hasSelfDrive && (
                <span className={chipCls}><KeyRound size={10} className="text-[#C89D5C]" /> Self-drive</span>
              )}
              {hasChauffeur && (
                <span className={chipCls}><UserRound size={10} className="text-[#C89D5C]" /> Driver</span>
              )}
            </>
          ))}
        {cityName && (
          <span className={chipCls}><MapPin size={10} className="text-[#C89D5C]" /> {cityName}</span>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Card ───────────────────────── */

export interface VehicleCta {
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface VehicleCardProps {
  car: any;
  layout?: 'vertical' | 'horizontal';
  theme?: 'light' | 'dark';
  /** Detail page link (used for the title when no href on CTA, and the optional secondary link). */
  href?: string;
  stage?: Omit<StageProps, 'car'>;
  perks?: Perk[];
  maxFeatures?: number;
  /** Price block */
  priceLabel?: string;
  /** Omit to hide the price (e.g. when it depends on the booking flow). */
  price?: number;
  priceSuffix?: string;
  priceNote?: React.ReactNode;
  /** Optional ledger rows shown under the price (e.g. base fare / GST / deposit). */
  breakdown?: { label: string; value: string; strong?: boolean }[];
  cta: VehicleCta;
  secondary?: { label: string; href: string };
  /** Extra node rendered between details and price (e.g. trust badges). */
  extra?: React.ReactNode;
}

const THEMES = {
  light: {
    inner: 'bg-[#FFFDFA]',
    title: 'text-[#250903] group-hover:text-[#551A0C]',
    pod: 'bg-[#FAF6F0] ring-1 ring-[#EFE6D8] group-hover:bg-white group-hover:ring-[#DFB574]/60',
    podText: 'text-[#350E05]',
    perks: 'border border-dashed border-[#DCCBB3] bg-[#FFFBF3]',
    perkText: 'text-[#350E05]',
    chip: 'bg-[#F3EBE1] text-[#551A0C]',
    more: 'bg-[#551A0C]/[0.07] text-[#551A0C]',
    divider: 'border-[#E7DFD5]/70',
    priceLabel: 'text-[#7A6A65]',
    price: 'text-[#250903]',
    suffix: 'text-[#551A0C]/70',
    ledger: 'text-[#6A5749]',
    ledgerStrong: 'text-[#250903]',
    secondary: 'border-[#E7DFD5] bg-[#FEFBF8] text-[#551A0C] hover:border-[#C89D5C]',
  },
  dark: {
    inner: 'bg-[#240C06]',
    title: 'text-white group-hover:text-[#DFB574]',
    pod: 'bg-[#170501]/60 ring-1 ring-[#551A0C]/60 group-hover:ring-[#C89D5C]/50',
    podText: 'text-[#FAF6F0]/85',
    perks: 'border border-dashed border-[#551A0C] bg-[#170501]/50',
    perkText: 'text-[#FAF6F0]/85',
    chip: 'bg-[#551A0C]/50 text-[#DFB574]',
    more: 'bg-white/10 text-[#DFB574]',
    divider: 'border-[#551A0C]/60',
    priceLabel: 'text-white/50',
    price: 'text-white',
    suffix: 'text-white/55',
    ledger: 'text-white/60',
    ledgerStrong: 'text-white',
    secondary: 'border-[#551A0C] bg-transparent text-[#DFB574] hover:border-[#C89D5C]',
  },
} as const;

export default function VehicleCard({
  car, layout = 'vertical', theme = 'light', href, stage, perks, maxFeatures = 3,
  priceLabel = 'Tariff begins at', price, priceSuffix = 'per 24-hr cycle', priceNote, breakdown,
  cta, secondary, extra,
}: VehicleCardProps) {
  const t = THEMES[theme];
  const horizontal = layout === 'horizontal';
  const ref = useRef<HTMLDivElement>(null);
  const display = getCarDisplay(car);
  const eyebrow = display.brand || (car.category ? car.category.replace(/\bClass\b/gi, '').trim() : 'Self Drive');
  const features: string[] = (car.features || []).filter(Boolean);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const specs = [
    { icon: <Fuel size={14} />, label: car.fuelType || 'Petrol' },
    { icon: <Users size={14} />, label: `${car.seatingCapacity || 5} Seats` },
    { icon: <Settings2 size={14} />, label: car.transmission ? car.transmission.replace(' Gearbox', '') : 'Auto / Man' },
  ];

  const ctaCls =
    'btn-luxury btn-luxury-shine group/cta relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-[#C89D5C]/50 py-1.5 pl-5 pr-1.5 font-heading text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#551A0C]/25 transition-all hover:shadow-xl ' +
    (cta.disabled
      ? 'cursor-not-allowed bg-[#E7DFD5] text-[#8C6D53] shadow-none'
      : 'cursor-pointer bg-gradient-to-r from-[#551A0C] via-[#6B2210] to-[#551A0C] text-[#DFB574]');

  const ctaInner = (
    <>
      {cta.label}
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 ${cta.disabled ? 'bg-[#D8CDBE] text-[#8C6D53]' : 'bg-[#DFB574] text-[#551A0C] group-hover/cta:translate-x-0.5 group-hover/cta:rotate-[-45deg]'}`}>
        <ArrowRight size={15} />
      </span>
    </>
  );

  const ctaEl = cta.href && !cta.disabled ? (
    <Link href={cta.href} className={ctaCls}>{ctaInner}</Link>
  ) : (
    <button type="button" onClick={cta.disabled ? undefined : cta.onClick} disabled={cta.disabled} className={ctaCls}>{ctaInner}</button>
  );

  const titleEl = href ? (
    <Link href={href} className="after:absolute after:inset-0 after:content-none">{display.name}</Link>
  ) : (
    display.name
  );

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className="group relative h-full rounded-[28px] bg-gradient-to-b from-[#E2D3BF] via-[#EADFCF] to-[#D9C6AC] p-[1.5px] shadow-[0_18px_45px_-12px_rgba(42,14,7,0.22)] transition-all duration-500 ease-out hover:-translate-y-2 hover:from-[#DFB574] hover:via-[#C89D5C] hover:to-[#551A0C]/70 hover:shadow-[0_32px_70px_-14px_rgba(85,26,12,0.40)]"
    >
      <div className={`relative flex h-full overflow-hidden rounded-[26.5px] p-4 ${t.inner} ${horizontal ? 'flex-col lg:flex-row lg:gap-5' : 'flex-col'}`}>
        {/* Cursor spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: 'radial-gradient(320px circle at var(--mx,50%) var(--my,30%), rgba(223,181,116,0.20), transparent 60%)' }}
        />

        {/* Stage */}
        <div className={horizontal ? 'mb-4 lg:mb-0 lg:w-[320px] lg:shrink-0 xl:w-[340px]' : 'mb-4'}>
          <VehicleStage car={car} {...stage} className={horizontal ? 'h-[225px] lg:h-full lg:min-h-[250px]' : 'h-[225px]'} />
        </div>

        {/* Body */}
        <div className={`relative z-10 flex flex-grow ${horizontal ? 'flex-col lg:flex-row lg:gap-5' : 'flex-col'}`}>
          {/* Details */}
          <div className="flex flex-1 flex-col">
            <div className="mb-3">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89D5C]">
                <span className="h-px w-5 bg-[#C89D5C] transition-all duration-500 group-hover:w-8" />
                {eyebrow}
              </div>
              <h3 className={`font-heading text-[22px] font-extrabold leading-tight tracking-tight transition-colors ${t.title}`}>{titleEl}</h3>
            </div>

            <div className="mb-3 grid grid-cols-3 gap-2">
              {specs.map((sp, i) => (
                <div key={i} className={`flex flex-col items-center gap-1.5 rounded-2xl px-1 py-2.5 transition-all duration-300 ${t.pod}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF4DF] to-[#F0DDB8] text-[#8A5A1F] shadow-inner">{sp.icon}</span>
                  <span className={`text-center text-[10px] font-semibold capitalize leading-tight ${t.podText}`}>{sp.label}</span>
                </div>
              ))}
            </div>

            {perks && perks.length > 0 && (
              <ul className={`mb-3 space-y-1.5 rounded-2xl px-3 py-2.5 ${t.perks}`}>
                {perks.map((pk, i) => (
                  <li key={i} className={`flex items-center gap-2 text-[11px] font-medium ${t.perkText}`}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#551A0C] text-[#DFB574] ring-1 ring-[#C89D5C]/30">{pk.icon}</span>
                    {pk.text}
                  </li>
                ))}
              </ul>
            )}

            {features.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {features.slice(0, maxFeatures).map((f) => (
                  <span key={f} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${t.chip}`}>
                    <Check size={10} className="text-[#C89D5C]" /> {f}
                  </span>
                ))}
                {features.length > maxFeatures && (
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${t.more}`}>+{features.length - maxFeatures} more</span>
                )}
              </div>
            )}

            {extra}
          </div>

          {/* Price + CTA */}
          <div className={`mt-auto pt-3 ${horizontal ? `lg:mt-0 lg:w-[250px] lg:shrink-0 lg:border-l lg:pl-5 lg:pt-0 xl:w-[270px] ${t.divider} border-t lg:border-t-0` : `border-t ${t.divider}`}`}>
            <div className={`${horizontal ? 'lg:flex lg:h-full lg:flex-col lg:justify-between' : ''}`}>
              <div>
                {price !== undefined && (
                <div className="mb-3 flex items-end justify-between gap-2">
                  <div>
                    <div className={`mb-0.5 text-[9px] font-bold uppercase tracking-widest ${t.priceLabel}`}>{priceLabel}</div>
                    <div className={`font-heading text-[26px] font-black leading-none ${t.price}`}>{inr(price as number)}</div>
                  </div>
                  <span className={`text-right text-[11px] italic ${t.suffix}`}>{priceSuffix}</span>
                </div>
                )}
                {priceNote && <div className={`mb-3 text-[11px] ${t.suffix}`}>{priceNote}</div>}
                {breakdown && breakdown.length > 0 && (
                  <dl className={`mb-3 space-y-1.5 border-t pt-3 text-[11px] ${t.divider} ${t.ledger}`}>
                    {breakdown.map((r) => (
                      <div key={r.label} className="flex justify-between gap-2">
                        <dt>{r.label}</dt>
                        <dd className={`font-bold ${r.strong ? 'text-[#C89D5C]' : t.ledgerStrong}`}>{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <div className="space-y-2">
                {ctaEl}
                {secondary && (
                  <Link href={secondary.href} className={`flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${t.secondary}`}>
                    {secondary.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
