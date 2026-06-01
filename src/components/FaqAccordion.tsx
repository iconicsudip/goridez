'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-neon/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-brand-neon/30 rounded-full px-4 py-1.5 mb-6 bg-brand-neon/5 backdrop-blur-md">
            <span className="text-brand-neon text-[10px] md:text-xs font-black tracking-widest uppercase flex items-center gap-2">
              <HelpCircle size={12} /> Curated Help Desk
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            FREQUENTLY ASKED <span className="text-outline-neon">QUESTIONS</span>
          </h2>
          <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about our premium self-drive cars, luxury villas, and bespoke tour experiences.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'bg-[#111111] border-brand-neon/30 shadow-[0_0_20px_rgba(196,240,0,0.05)]'
                    : 'bg-[#0A0A0A] border-white/5 hover:border-white/10 hover:bg-[#111111]/50'
                }`}
              >
                {/* Header / Question button */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left transition-colors duration-200"
                >
                  <span className="text-sm md:text-base font-bold text-white pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'border-brand-neon text-brand-neon bg-brand-neon/5 rotate-180'
                        : 'border-white/10 text-white/40 group-hover:border-white/20 group-hover:text-white'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {/* Answer container */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[500px] opacity-100 border-t border-white/5' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 md:p-8 text-xs md:text-sm text-white/50 leading-relaxed font-mono whitespace-pre-line bg-[#0E0E0E]/40">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
