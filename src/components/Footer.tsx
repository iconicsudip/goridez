import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, ChevronRight } from 'lucide-react';

export default function Footer({ siteSettings, cities }: { siteSettings?: any, cities?: any[] }) {
  const logoSrc = siteSettings?.logoRidez || '/logo-ridez.png';

  const displayCities = cities && cities.length > 0
    ? cities
    : [
        { id: 'udaipur', name: 'Udaipur' },
        { id: 'jaipur', name: 'Jaipur' },
        { id: 'jodhpur', name: 'Jodhpur' },
        { id: 'mount-abu', name: 'Mount Abu' },
        { id: 'jaisalmer', name: 'Jaisalmer' },
      ];

  return (
    <footer className="bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white border-t border-white/10 py-16">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Column 1: Brand & Logo */}
        <div className="flex flex-col gap-5">
          <Link href="/" className="inline-block">
            <div className="relative h-16 w-52 flex items-center justify-center">
              <Image
                src={logoSrc}
                alt="Go Ridez United Logo"
                fill
                className="object-cover p-1"
                unoptimized
              />
            </div>
          </Link>
          <p className="text-white/80 leading-relaxed text-sm font-medium">
            Experience the ultimate luxury travel across Rajasthan with our premium fleet of self-drive cars and chauffeur services.
          </p>
          
          {/* Social Icons — only rendered when a URL is configured in admin settings */}
          {(siteSettings?.facebookUrl || siteSettings?.instagramUrl || siteSettings?.twitterUrl || siteSettings?.youtubeUrl) && (
            <div className="flex items-center gap-3 mt-2">
              {siteSettings?.facebookUrl && (
                <a
                  href={siteSettings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="bg-white hover:bg-black text-green-700 hover:text-white p-2.5 rounded-full transition-all duration-300 shadow-md hover:scale-110 hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}
              {siteSettings?.instagramUrl && (
                <a
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="bg-white hover:bg-black text-green-700 hover:text-white p-2.5 rounded-full transition-all duration-300 shadow-md hover:scale-110 hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {siteSettings?.twitterUrl && (
                <a
                  href={siteSettings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="bg-white hover:bg-black text-green-700 hover:text-white p-2.5 rounded-full transition-all duration-300 shadow-md hover:scale-110 hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <svg className="w-[16px] h-[16px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {siteSettings?.youtubeUrl && (
                <a
                  href={siteSettings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="bg-white hover:bg-black text-green-700 hover:text-white p-2.5 rounded-full transition-all duration-300 shadow-md hover:scale-110 hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Services */}
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/20 pb-2 mb-5">Services</h4>
          <ul className="flex flex-col gap-3.5">
            <li>
              <Link href="/self-drive" className="text-white/85 hover:text-white font-semibold transition-all hover:translate-x-1 flex items-center gap-1.5 text-sm group">
                <ChevronRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" /> Self-Drive
              </Link>
            </li>
            <li>
              <Link href="/taxi" className="text-white/85 hover:text-white font-semibold transition-all hover:translate-x-1 flex items-center gap-1.5 text-sm group">
                <ChevronRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" /> Taxi / Round Trip
              </Link>
            </li>
            <li>
              <Link href="/taxi?mode=AIRPORT_TRANSFER" className="text-white/85 hover:text-white font-semibold transition-all hover:translate-x-1 flex items-center gap-1.5 text-sm group">
                <ChevronRight size={14} className="opacity-70 group-hover:translate-x-0.5 transition-transform" /> Airport Transfers
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Operated Cities */}
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/20 pb-2 mb-5">Operated Cities</h4>
          <ul className="flex flex-col gap-3.5">
            {displayCities.map((city) => {
              const formattedName = city.name.charAt(0).toUpperCase() + city.name.slice(1).toLowerCase();
              return (
                <li key={city.id}>
                  <Link 
                    href={`/self-drive?pickupCity=${formattedName}`} 
                    className="text-white/85 hover:text-white font-semibold transition-all hover:translate-x-1 flex items-center gap-1.5 text-sm group"
                  >
                    <MapPin size={14} className="opacity-70 group-hover:scale-110 transition-transform text-white" /> {formattedName}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-white border-b border-white/20 pb-2 mb-5">Contact Info</h4>
          <ul className="flex flex-col gap-4 text-sm font-medium">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="shrink-0 text-white mt-0.5" />
              <span className="text-white/85 leading-relaxed">
                S-9, 100 Ft Road, Wakal Mata Road, Near D Glanz Hotel, Udaipur, Rajasthan – 313001
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} className="shrink-0 text-white" />
              <a href="tel:+917877634178" className="text-white/85 hover:text-white font-semibold transition-colors">
                +91 78776 34178
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="shrink-0 text-white" />
              <a href="mailto:goridezrental@gmail.com" className="text-white/85 hover:text-white font-semibold transition-colors break-all">
                goridezrental@gmail.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-white/60 text-xs font-medium">
        {siteSettings?.copyrightText || `© ${new Date().getFullYear()} GoRidez. All rights reserved.`}
      </div>
    </footer>
  );
}
