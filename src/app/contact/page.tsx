import { prisma } from '@/lib/prisma';
import ContactForm from '@/components/ContactForm';

export const revalidate = 300;

export default async function ContactPage() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'contact' } });

  const title = data?.title || 'Contact Us';
  const content = data?.content || '<p class="text-gray-600 mb-6 leading-relaxed">Have a question about a booking? Reach out to our team using the form below.</p>';

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-sans pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-14">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.25em] text-[#C89D5C] bg-[#FEFBF8] border border-[#C89D5C]/30 rounded-full px-5 py-1.5 mb-4 font-mono shadow-sm">
            ✦ ROYAL CONCIERGE DESK
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-serif uppercase tracking-tight leading-[1.1] text-[#551A0C]">
            {title}
          </h1>
          <p className="text-[#6A5749] text-sm md:text-base mt-3 max-w-xl mx-auto font-normal">
            Whether inquiring about our private fleet, tailored Rajasthan itineraries, or bespoke chauffeur bookings, our concierge is at your service.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 card-luxury bg-[#FEFBF8] border border-[#E7DFD5] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border-classic-frame">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C89D5C] to-transparent opacity-70" />
            <div
              className="prose prose-stone max-w-none prose-sm md:prose-base break-words
                prose-headings:font-serif prose-headings:font-black prose-headings:text-[#551A0C]
                prose-h2:text-2xl prose-h2:uppercase prose-h2:tracking-tight prose-h2:mb-4
                prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-[#C89D5C] prose-h3:mt-8 prose-h3:mb-3 prose-h3:pb-3 prose-h3:border-b prose-h3:border-[#E7DFD5]
                prose-p:text-[#6A5749] prose-p:leading-relaxed
                prose-strong:text-[#250903]
                prose-ul:mt-3 prose-ul:grid prose-ul:sm:grid-cols-2 prose-ul:gap-x-8 prose-ul:gap-y-0 prose-li:marker:text-[#C89D5C]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          <div className="lg:col-span-2 lg:sticky lg:top-32">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
