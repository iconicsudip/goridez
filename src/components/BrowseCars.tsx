'use client';

import Link from 'next/link';
import { Car, Compass, Navigation, Users, Trophy } from 'lucide-react';

export default function BrowseCars() {
  const categories = [
    {
      name: 'SUV',
      title: 'Adventure SUVs',
      desc: 'Spacious, rugged, and built for all terrains.',
      icon: Compass,
      count: '12 Cars'
    },
    {
      name: 'Sedan',
      title: 'Premium Sedans',
      desc: 'Elegant, smooth, and perfect for business or city trips.',
      icon: Navigation,
      count: '8 Cars'
    },
    {
      name: 'Hatchback',
      title: 'City Hatchbacks',
      desc: 'Compact, efficient, and easy to park anywhere.',
      icon: Car,
      count: '6 Cars'
    },
    {
      name: 'MUV',
      title: 'Family MUVs',
      desc: 'Multi-utility vehicles for larger groups and families.',
      icon: Users,
      count: '5 Cars'
    },
    {
      name: 'Luxury',
      title: 'Luxury Fleet',
      desc: 'Elite comfort, prestige, and state-of-the-art specs.',
      icon: Trophy,
      count: '4 Cars'
    }
  ];

  const brands = [
    'Tata',
    'Maruti Suzuki',
    'Hyundai',
    'Mahindra',
    'Toyota',
    'Honda',
    'Kia',
    'BMW',
    'Mercedes-Benz',
    'Audi'
  ];

  return (
    <section id="browse-cars" className="py-24 bg-brand-bg border-t border-brand-border relative overflow-hidden">
      {/* Decorative BG Accents */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-gold/[0.015] blur-[110px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-[#8dbb00]/[0.01] blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Heading */}
        <div className="mb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[2px] w-8 bg-brand-gold rounded-full"></span>
            <div className="text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">Find Your Match</div>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-none mb-4 text-gray-900 font-serif">
            BROWSE <span className="text-[#8dbb00] font-sans font-black">CARS</span>
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto">
            Explore our curated self-drive collection by your preferred category or favorite vehicle brand.
          </p>
        </div>

        {/* Categories Section */}
        <div className="mb-20">
          <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 mb-8 flex items-center gap-3 justify-center md:justify-start">
            <span className="h-1.5 w-4 bg-[#8dbb00] rounded-full"></span>
            Browse By Category
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  href={`/self-drive?category=${cat.name}`}
                  key={cat.name}
                  className="bg-white border border-gray-200 hover:border-brand-gold hover:shadow-2xl rounded-3xl p-8 flex flex-col justify-between group transition-all duration-300 h-full active:scale-95 shadow-md"
                >
                  <div>
                    {/* Icon wrapper */}
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-brand-gold/10 group-hover:text-brand-gold group-hover:border-brand-gold/20 transition-colors mb-6">
                      <IconComp size={24} />
                    </div>

                    <h4 className="text-lg font-black uppercase tracking-tight text-gray-900 group-hover:text-brand-gold transition-colors mb-3">
                      {cat.title}
                    </h4>
                    
                    <p className="text-gray-500 text-xs leading-relaxed mb-6">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-4 flex justify-between items-center group-hover:text-brand-gold transition-colors">
                    <span>{cat.count}</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Brands Section */}
        <div>
          <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 mb-8 flex items-center gap-3 justify-center md:justify-start">
            <span className="h-1.5 w-4 bg-[#8dbb00] rounded-full"></span>
            Browse By Brand
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <Link
                href={`/self-drive?search=${encodeURIComponent(brand)}`}
                key={brand}
                className="bg-white border border-gray-200 hover:border-brand-gold hover:shadow-xl rounded-2xl py-6 px-4 text-center transition-all duration-300 cursor-pointer group active:scale-95 shadow-sm"
              >
                <span className="font-bold text-sm tracking-widest text-gray-700 group-hover:text-brand-gold transition-colors font-mono uppercase">
                  {brand}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
