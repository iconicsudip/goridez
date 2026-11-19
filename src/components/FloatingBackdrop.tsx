import {
  Car, CarFront, KeyRound, Compass, MapPin, Plane, Route, Gauge, Fuel, Sparkles, Castle, Sun, Navigation, Luggage,
} from 'lucide-react';

/**
 * Decorative floating background for a section. Purely visual (aria-hidden, no pointer events).
 * Usage: put `isolate` on the section (it must be `relative overflow-hidden`) and render this as a child;
 * it sits at -z-10, i.e. above the section background and behind its content.
 *
 * tone:    'light' (cream sections) | 'dark' (espresso sections)
 * variant: 'a' | 'b' | 'c'  — different compositions so sections don't look identical
 * road:    draws a dotted road with a small car slowly driving along it
 */

type Item = { Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; pos: string; size: string; anim: string; dim?: boolean };

const LAYOUTS: Record<'a' | 'b' | 'c', Item[]> = {
  a: [
    { Icon: Compass, pos: 'left-[3%] top-[8%]', size: 'h-14 w-14', anim: 'animate-float' },
    { Icon: KeyRound, pos: 'right-[5%] top-[10%]', size: 'h-12 w-12', anim: 'animate-float-reverse' },
    { Icon: Castle, pos: 'right-[8%] bottom-[10%]', size: 'h-16 w-16', anim: 'animate-float-slow' },
    { Icon: MapPin, pos: 'left-[7%] bottom-[14%]', size: 'h-11 w-11', anim: 'animate-float-gentle' },
    { Icon: Gauge, pos: 'left-[44%] top-[5%]', size: 'h-10 w-10', anim: 'animate-float-slow', dim: true },
    { Icon: Sparkles, pos: 'left-[28%] bottom-[8%]', size: 'h-7 w-7', anim: 'animate-gold-breathe' },
    { Icon: Sparkles, pos: 'right-[26%] top-[36%]', size: 'h-6 w-6', anim: 'animate-gold-breathe' },
  ],
  b: [
    { Icon: Plane, pos: 'right-[6%] top-[9%]', size: 'h-14 w-14', anim: 'animate-float-reverse' },
    { Icon: Route, pos: 'left-[4%] top-[14%]', size: 'h-12 w-12', anim: 'animate-float-slow' },
    { Icon: Fuel, pos: 'left-[9%] bottom-[10%]', size: 'h-11 w-11', anim: 'animate-float-gentle' },
    { Icon: Navigation, pos: 'right-[10%] bottom-[14%]', size: 'h-12 w-12', anim: 'animate-float' },
    { Icon: CarFront, pos: 'left-[46%] bottom-[5%]', size: 'h-12 w-12', anim: 'animate-float-slow', dim: true },
    { Icon: Sparkles, pos: 'left-[22%] top-[7%]', size: 'h-7 w-7', anim: 'animate-gold-breathe' },
    { Icon: Sparkles, pos: 'right-[30%] top-[40%]', size: 'h-6 w-6', anim: 'animate-gold-breathe' },
  ],
  c: [
    { Icon: Sun, pos: 'left-[5%] top-[10%]', size: 'h-14 w-14', anim: 'animate-float-slow' },
    { Icon: Luggage, pos: 'right-[6%] top-[12%]', size: 'h-12 w-12', anim: 'animate-float' },
    { Icon: Car, pos: 'left-[8%] bottom-[12%]', size: 'h-14 w-14', anim: 'animate-float-reverse' },
    { Icon: Compass, pos: 'right-[9%] bottom-[10%]', size: 'h-12 w-12', anim: 'animate-float-gentle' },
    { Icon: KeyRound, pos: 'left-[48%] top-[6%]', size: 'h-9 w-9', anim: 'animate-float', dim: true },
    { Icon: Sparkles, pos: 'left-[30%] bottom-[7%]', size: 'h-7 w-7', anim: 'animate-gold-breathe' },
    { Icon: Sparkles, pos: 'right-[24%] top-[44%]', size: 'h-6 w-6', anim: 'animate-gold-breathe' },
  ],
};

export default function FloatingBackdrop({
  tone = 'light',
  variant = 'a',
  road = true,
  subtle = false,
}: {
  tone?: 'light' | 'dark';
  variant?: 'a' | 'b' | 'c';
  road?: boolean;
  /** Calmer layer for text-heavy areas: icons are much fainter and pushed to the edges. */
  subtle?: boolean;
}) {
  const dark = tone === 'dark';
  const iconCls = dark ? 'text-[#DFB574]' : 'text-[#B98443]';
  const iconAlt = dark ? 'text-[#DFB574]/70' : 'text-[#551A0C]';
  const roadStroke = dark ? '#DFB574' : '#C89D5C';
  const orbA = dark ? 'bg-[#DFB574]/40' : 'bg-[#C89D5C]/40';
  const orbB = dark ? 'bg-[#C89D5C]/30' : 'bg-[#551A0C]/30';
  const ring = dark ? 'border-[#DFB574]/25' : 'border-[#C89D5C]/35';
  const glowA = dark ? 'bg-[#C89D5C]/[0.10]' : 'bg-[#C89D5C]/[0.10]';
  const glowB = dark ? 'bg-[#782511]/[0.25]' : 'bg-[#551A0C]/[0.06]';

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* soft colour blooms */}
      <span className={`absolute -left-24 top-[12%] h-[420px] w-[420px] rounded-full blur-[110px] animate-float-slow motion-reduce:animate-none ${glowA}`} />
      <span className={`absolute -right-24 bottom-[8%] h-[460px] w-[460px] rounded-full blur-[120px] animate-float-reverse motion-reduce:animate-none ${glowB}`} />

      {/* dotted road with a slowly driving car */}
      {road && (
        <>
          <svg
            className={`absolute left-0 top-[46%] w-full ${dark ? 'opacity-40' : 'opacity-45'}`}
            height="140" viewBox="0 0 1440 140" preserveAspectRatio="none" fill="none"
          >
            <path d="M-20 100 C 260 10, 520 150, 800 70 S 1240 10, 1460 80" stroke={roadStroke} strokeWidth="2" strokeDasharray="2 14" strokeLinecap="round" />
          </svg>
          <Car
            className={`absolute left-0 top-[46%] h-7 w-7 animate-drive motion-reduce:hidden ${dark ? 'text-[#DFB574]/60' : 'text-[#551A0C]/35'}`}
            strokeWidth={1.4}
          />
        </>
      )}

      {/* icons */}
      <div className={subtle ? 'opacity-40' : undefined}>
      {LAYOUTS[variant].map(({ Icon, pos, size, anim, dim }, i) => (
        <Icon
          key={i}
          strokeWidth={1.2}
          className={`absolute ${pos} ${size} ${anim} motion-reduce:animate-none ${dim ? iconAlt : iconCls} ${dim ? 'opacity-40' : dark ? 'opacity-40' : 'opacity-60'}`}
        />
      ))}
      </div>

      {/* orbs, diamonds & rings */}
      <span className={`absolute left-[20%] top-[26%] h-3 w-3 rounded-full animate-float motion-reduce:animate-none ${orbA}`} />
      <span className={`absolute right-[16%] top-[58%] h-2 w-2 rounded-full animate-float-reverse motion-reduce:animate-none ${orbB}`} />
      <span className={`absolute left-[62%] bottom-[20%] h-4 w-4 rounded-full border animate-float-slow motion-reduce:animate-none ${ring}`} />
      <span className={`absolute right-[34%] top-[16%] h-2.5 w-2.5 rotate-45 animate-float-gentle motion-reduce:animate-none ${orbA}`} />
      <span className={`absolute left-[14%] top-[62%] h-2 w-2 rotate-45 animate-float motion-reduce:animate-none ${orbB}`} />
      <span className={`absolute -right-6 top-[34%] h-28 w-28 rounded-full border border-dashed animate-[spin_45s_linear_infinite] motion-reduce:animate-none ${ring}`} />
      <span className={`absolute -left-8 bottom-[26%] h-20 w-20 rounded-full border animate-float-gentle motion-reduce:animate-none ${ring}`} />
    </div>
  );
}
