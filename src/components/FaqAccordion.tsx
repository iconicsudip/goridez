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
    <section className="py-24 bg-[#0A0A0A] border-t border-zinc-900 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold/5 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
            <div className="text-brand-gold text-[10px] md:text-xs font-black tracking-widest uppercase">
              Curated Help Desk
            </div>
            <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4 text-white">
            FREQUENTLY ASKED <span className="text-outline-neon">QUESTIONS</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about our premium self-drive cars, luxury villas, and bespoke tour experiences.
          </p>
          <div className="w-20 h-1 bg-brand-gold mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`border rounded-3xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'bg-[#1F1F1F] border-brand-gold shadow-md shadow-brand-gold/10'
                    : 'bg-[#1F1F1F]/40 border-zinc-800 hover:border-zinc-700 hover:bg-[#1F1F1F]/60'
                }`}
              >
                {/* Header / Question button */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left transition-colors duration-200 cursor-pointer"
                >
                  <span className="text-sm md:text-base font-bold text-white pr-4">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                      isOpen
                        ? 'border-brand-gold text-brand-gold bg-brand-gold/5 rotate-180'
                        : 'border-zinc-750 text-gray-400 group-hover:border-zinc-550 group-hover:text-white'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {/* Answer container */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[500px] opacity-100 border-t border-zinc-800' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 md:p-8 text-xs md:text-sm text-gray-300 leading-relaxed whitespace-pre-line bg-black/20">
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
