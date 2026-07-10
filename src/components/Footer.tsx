import Link from 'next/link';
import Image from 'next/image';

export default function Footer({ siteSettings }: { siteSettings?: any }) {
  const logoSrc = siteSettings?.logoRidez || '/logo-ridez.png';

  return (
    <footer className="bg-[#0A0A0A] border-t border-zinc-900 mt-20 py-12 text-gray-300">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="mb-4 inline-block">
            <div className="relative h-16 w-52">
              <Image
                src={logoSrc}
                alt="Go Ridez United Logo"
                fill
                className="object-cover object-left"
                unoptimized
              />
            </div>
          </Link>
          <p className="text-gray-400 leading-relaxed max-w-sm text-sm">
            Experience the ultimate luxury travel across Rajasthan with our premium fleet of self-drive cars, chauffeur services, and palace villa stays.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold font-heading mb-4 text-brand-gold">Services</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/self-drive" className="text-gray-400 hover:text-white transition-colors text-sm">Self-Drive Rentals</Link></li>
            <li><Link href="/chauffeur" className="text-gray-400 hover:text-white transition-colors text-sm">Chauffeur Driven</Link></li>
            <li><Link href="/taxi" className="text-gray-400 hover:text-white transition-colors text-sm">One-Way Taxi</Link></li>
            <li><Link href="/tours" className="text-gray-400 hover:text-white transition-colors text-sm">Tour Packages</Link></li>
            <li><Link href="/villas" className="text-gray-400 hover:text-white transition-colors text-sm">Villa + Car</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold font-heading mb-4 text-brand-gold">Legal</h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-zinc-900 text-center text-gray-500 text-sm">
        {siteSettings?.copyrightText || `© ${new Date().getFullYear()} GoRidez. All rights reserved.`}
      </div>
    </footer>
  );
}
