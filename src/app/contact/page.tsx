import { prisma } from '@/lib/prisma';
import ContactForm from '@/components/ContactForm';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const data = await prisma.legalPage.findUnique({ where: { id: 'contact' } });

  const title = data?.title || 'Contact Us';
  const content = data?.content || '<p class="text-gray-600 mb-6 leading-relaxed">Have a question about a booking? Reach out to our team using the form below.</p>';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-32 pb-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-14">
          <span className="inline-block text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-600/10 border border-green-600/20 rounded-full px-4 py-1.5 mb-5">
            We&apos;d love to hear from you
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.1] text-gray-900">
            {title}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 bg-gray-100 border border-gray-200 rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-green-600 to-transparent opacity-50" />
            <div
              className="prose prose-gray max-w-none prose-sm md:prose-base break-words
                prose-headings:font-black prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:uppercase prose-h2:tracking-tight prose-h2:mb-4
                prose-h3:text-sm prose-h3:uppercase prose-h3:tracking-widest prose-h3:text-green-700 prose-h3:mt-8 prose-h3:mb-3 prose-h3:pb-3 prose-h3:border-b prose-h3:border-gray-200
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-strong:text-gray-900
                prose-ul:mt-3 prose-ul:grid prose-ul:sm:grid-cols-2 prose-ul:gap-x-8 prose-ul:gap-y-0 prose-li:marker:text-green-600"
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
