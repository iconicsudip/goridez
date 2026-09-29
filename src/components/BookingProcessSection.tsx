'use client';

import { Compass, Car, CalendarCheck, KeyRound, Sparkles, ArrowRight, ShieldCheck, MapPin, Sliders, CheckCircle } from 'lucide-react';

const BOOKING_PROCESS = [
  {
    roman: 'I',
    stepNumber: '01',
    phase: 'Phase 01 • Territory',
    icon: Compass,
    title: 'Choose Destination',
    description: 'Select your imperial gateway across Rajasthan — from the regal lake palaces of Udaipur to the golden fortresses of Jaisalmer and Jaipur.',
    perk: '8+ Historic City Hubs',
  },
  {
    roman: 'II',
    stepNumber: '02',
    phase: 'Phase 02 • Fleet Curation',
    icon: Car,
    title: 'Select Your Carriage',
    description: 'Explore our vetted collection of high-performance SUVs, luxury sedans, and convertibles. Every vehicle undergoes a 45-point royal safety audit.',
    perk: '100% RC Verified & Insured',
  },
  {
    roman: 'III',
    stepNumber: '03',
    phase: 'Phase 03 • Personalization',
    icon: CalendarCheck,
    title: 'Tailor Your Schedule',
    description: 'Select your preferred dates, pickup hubs, and mileage packages. Choose doorstep white-glove delivery directly to your hotel or airport terminal.',
    perk: 'Flexible Mileage & Zero Lock-in',
  },
  {
    roman: 'IV',
    stepNumber: '04',
    phase: 'Phase 04 • Handover',
    icon: KeyRound,
    title: 'Confirm & Embark',
    description: 'Instant reservation with only 30% advance hold. Zero paperwork queues upon arrival — your royal keys and pristine carriage await your command.',
    perk: 'VIP Key Handover in 60 Mins',
  },
];

export default function BookingProcessSection({ className = '' }: { className?: string }) {
  return (
    <section className={`py-28 bg-[#170501] border-t border-[#C89D5C]/25 relative overflow-hidden text-white ${className}`}>
      {/* ── Ambient Radial Atmosphere ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-radial from-[#C89D5C]/12 via-[#551A0C]/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] bg-[#551A0C]/20 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto relative z-10">

        {/* ── Section Title & Eyebrow ── */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-[#C89D5C]/50 rounded-full px-5 py-2 mb-5 bg-[#250903]/80 backdrop-blur-md shadow-xl">
            <Sparkles size={13} className="text-[#DFB574]" />
            <span className="text-[#DFB574] text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase">
              BESPOKE CONCIERGE PROTOCOL
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight mb-4">
            HOW TO EMBARK WITH <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89D5C] via-[#DFB574] to-[#C89D5C]">ROYAL EASE</span>
          </h2>

          <p className="text-[#FAF6F0]/80 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-normal">
            Four frictionless milestones between your travel aspiration and the majestic open avenues of Rajasthan.
          </p>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C89D5C] to-transparent mx-auto mt-6" />
        </div>

        {/* ── 4 Royal Architectural Step Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {BOOKING_PROCESS.map((step, idx) => (
            <div
              key={step.title}
              className="card-luxury relative rounded-3xl border border-[#C89D5C]/30 bg-gradient-to-b from-[#2A0A04]/90 via-[#220703]/90 to-[#170501]/95 backdrop-blur-xl p-8 md:p-9 flex flex-col justify-between hover:-translate-y-2 hover:border-[#DFB574] hover:shadow-[0_24px_50px_-10px_rgba(200,157,92,0.25)] transition-all duration-500 overflow-hidden group"
            >
              {/* Giant Roman Numeral Watermark in Background */}
              <span className="absolute -bottom-4 -right-2 text-8xl xl:text-9xl font-black text-white/[0.04] group-hover:text-[#DFB574]/[0.08] transition-all duration-700 pointer-events-none select-none font-serif">
                {step.roman}
              </span>

              {/* Top Row: Medal & Step Number */}
              <div>
                <div className="flex items-center justify-between mb-7">
                  {/* Luxury Medallion */}
                  <div className="w-14 h-14 rounded-2xl bg-[#551A0C] border border-[#C89D5C]/60 flex items-center justify-center text-[#DFB574] shadow-lg shadow-[#100301]/80 group-hover:scale-110 group-hover:rotate-3 group-hover:border-[#DFB574] group-hover:shadow-[0_0_25px_rgba(200,157,92,0.4)] transition-all duration-500">
                    <step.icon size={26} className="text-[#DFB574]" />
                  </div>

                  {/* Step Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#170501]/80 border border-[#C89D5C]/30 text-[#DFB574] text-[10px] font-bold tracking-widest uppercase">
                    <span>STEP</span>
                    <span className="text-white font-mono">{step.stepNumber}</span>
                  </div>
                </div>

                {/* Phase Eyebrow */}
                <div className="text-[10px] font-bold text-[#C89D5C] tracking-[0.2em] uppercase mb-2">
                  {step.phase}
                </div>

                {/* Title */}
                <h3 className="text-xl xl:text-2xl font-black uppercase tracking-tight text-white mb-3 group-hover:text-[#DFB574] transition-colors">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-xs xl:text-sm text-[#FAF6F0]/75 leading-relaxed font-normal mb-8">
                  {step.description}
                </p>
              </div>

              {/* Bottom Hallmark Badge */}
              <div className="pt-4 border-t border-[#C89D5C]/20 flex items-center justify-between text-[#DFB574] text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-[#DFB574]">
                  <CheckCircle size={13} className="text-[#C89D5C]" />
                  <span>{step.perk}</span>
                </span>
                <ArrowRight size={14} className="text-[#C89D5C] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom Protocol Reassurance Strip ── */}
        <div className="mt-16 pt-8 border-t border-[#C89D5C]/20 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">Guaranteed Standards:</span>
            <span className="text-xs text-[#FAF6F0]/70 flex items-center gap-1.5">
              <span className="text-[#C89D5C]">✦</span> 100% Refundable Security Escrow
            </span>
            <span className="text-[#C89D5C]/40 hidden sm:inline">•</span>
            <span className="text-xs text-[#FAF6F0]/70 flex items-center gap-1.5">
              <span className="text-[#C89D5C]">✦</span> Zero Paperwork Delays
            </span>
            <span className="text-[#C89D5C]/40 hidden sm:inline">•</span>
            <span className="text-xs text-[#FAF6F0]/70 flex items-center gap-1.5">
              <span className="text-[#C89D5C]">✦</span> 24/7 Dedicated Journey Butler
            </span>
          </div>

          <div className="text-[11px] font-bold text-[#DFB574] tracking-widest uppercase flex items-center gap-2">
            <span>READY TO EXPERIENCE?</span>
            <span className="w-8 h-px bg-[#DFB574]" />
          </div>
        </div>

      </div>
    </section>
  );
}
