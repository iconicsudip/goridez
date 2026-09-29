'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, Sparkles, MessageCircle, PhoneCall, ShieldCheck, ArrowRight } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  // First item open by default for immediate visual feedback
  const [openId, setOpenId] = useState<string | null>(() => faqs[0]?.id || null);

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-24 bg-[#170501] border-t border-[#C89D5C]/20 relative overflow-hidden">
      {/* Ambient Royal Gold Glows */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-[#C89D5C]/[0.06] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#551A0C]/[0.15] blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* ── Left Column: FAQs (col-span-7) ── */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Header */}
            <div className="mb-10 text-left">
              <div className="inline-flex items-center gap-2 text-[#DFB574] text-[10px] md:text-xs font-bold tracking-[0.25em] uppercase mb-3">
                <Sparkles size={14} className="text-[#C89D5C]" />
                <span>CURATED HELP DESK</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight mb-4">
                FREQUENTLY ASKED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89D5C] via-[#DFB574] to-[#C89D5C]">QUESTIONS</span>
              </h2>

              <p className="text-[#FAF6F0]/70 text-sm md:text-base leading-relaxed max-w-xl">
                Clear answers regarding our self-drive fleet, chauffeur guidelines, 100% refundable security deposit escrow, and doorstep delivery across Rajasthan.
              </p>
            </div>

            {/* Accordion Stack */}
            <div className="flex flex-col gap-3.5">
              {faqs.map((faq, index) => {
                const isOpen = openId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'bg-[#350E05] border-[#C89D5C] shadow-lg shadow-[#170501]/80 ring-1 ring-[#C89D5C]/40'
                        : 'bg-[#250903]/70 border-[#C89D5C]/20 hover:border-[#C89D5C]/50 hover:bg-[#350E05]/40'
                    }`}
                  >
                    {/* Header / Question button */}
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors duration-200 cursor-pointer gap-4 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="text-[11px] font-bold text-[#C89D5C]/70 shrink-0">
                          {String(index + 1).padStart(2, '0')}.
                        </span>
                        <span className={`text-sm md:text-base font-bold transition-colors ${isOpen ? 'text-[#DFB574]' : 'text-white group-hover:text-[#DFB574]'}`}>
                          {faq.question}
                        </span>
                      </div>

                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isOpen
                            ? 'border-[#C89D5C] text-[#DFB574] bg-[#551A0C] rotate-180 shadow-[0_0_12px_rgba(200,157,92,0.4)]'
                            : 'border-[#C89D5C]/30 text-[#DFB574]/60 group-hover:border-[#C89D5C] group-hover:text-[#DFB574]'
                        }`}
                      >
                        <ChevronDown size={15} />
                      </div>
                    </button>

                    {/* Answer container */}
                    <div
                      className={`transition-all duration-300 ease-in-out overflow-hidden ${
                        isOpen ? 'max-h-[500px] opacity-100 border-t border-[#C89D5C]/20' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="p-5 md:p-6 text-xs md:text-sm text-[#FAF6F0]/85 leading-relaxed whitespace-pre-line bg-[#170501]/70">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right Column: Image & Concierge Card (col-span-5) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="card-luxury border-classic-frame relative rounded-3xl overflow-hidden border border-[#C89D5C]/30 bg-[#250903] shadow-2xl">
              
              {/* Feature Image with Gradient Overlay */}
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
                  alt="Royal Rajasthan Mobility Experience"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  priority={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#170501] via-[#170501]/40 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#170501]/90 backdrop-blur-md border border-[#C89D5C]/40 text-[#DFB574] text-[9px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-[#C89D5C]" /> 100% Escrow Protected
                  </span>
                </div>

                {/* Bottom Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10 flex flex-col">
                  <div className="inline-flex items-center gap-2 text-[#DFB574] text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                    <Sparkles size={12} className="text-[#C89D5C]" />
                    <span>STILL HAVE QUESTIONS?</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight leading-snug mb-3">
                    TALK TO OUR ROYAL <span className="text-[#DFB574]">CONCIERGE</span>
                  </h3>

                  <p className="text-xs text-[#FAF6F0]/80 leading-relaxed mb-6">
                    Our Rajasthan mobility officers are available 24/7 to customize dates, arrange doorstep delivery, or coordinate VIP airport escorts.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/contact"
                      className="btn-luxury btn-luxury-shine flex-1 bg-[#551A0C] text-[#DFB574] py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider text-center border border-[#C89D5C]/50 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle size={15} /> Concierge Desk
                    </Link>

                    <a
                      href="tel:+917877634178"
                      className="flex-1 bg-[#170501]/80 hover:bg-[#170501] text-white py-3.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider text-center border border-[#C89D5C]/30 hover:border-[#C89D5C] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PhoneCall size={14} className="text-[#C89D5C]" /> Call Direct
                    </a>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Feature Strip */}
              <div className="p-4 bg-[#170501] border-t border-[#C89D5C]/20 grid grid-cols-2 gap-3 text-center">
                <div className="py-1">
                  <div className="text-[10px] text-[#C89D5C] font-bold uppercase tracking-wider">Instant Reply</div>
                  <div className="text-xs font-bold text-white mt-0.5">&lt; 5 Minutes</div>
                </div>
                <div className="py-1 border-l border-[#C89D5C]/20">
                  <div className="text-[10px] text-[#C89D5C] font-bold uppercase tracking-wider">Doorstep Reach</div>
                  <div className="text-xs font-bold text-white mt-0.5">All Major Hubs</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
