'use client';

import { MapPin, Car, CalendarCheck, Rocket } from 'lucide-react';

const BOOKING_PROCESS = [
  {
    icon: MapPin,
    title: 'Choose Destination',
    description: 'Pick the city you\'re exploring, from the lakes of Udaipur to the forts of Jaipur.',
  },
  {
    icon: Car,
    title: 'Select Your Ride',
    description: 'Browse our vetted self-drive fleet, chauffeur desk, or villa + car bundles.',
  },
  {
    icon: CalendarCheck,
    title: 'Customize Your Trip',
    description: 'Set your dates, pickup/drop points, and any add-ons that fit your itinerary.',
  },
  {
    icon: Rocket,
    title: 'Book & Hit the Road',
    description: 'Confirm instantly with our booking widget and start exploring, no paperwork queues.',
  },
];

export default function BookingProcessSection({ className = '' }: { className?: string }) {
  return (
    <section className={`py-24 bg-white border-t border-brand-border relative overflow-hidden font-body ${className}`}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-[#8dbb00]/30 rounded-full px-4 py-1.5 mb-4 bg-green-50/60">
            <span className="text-[#8dbb00] text-[10px] font-black tracking-widest uppercase">
              ✦ How Does It Work
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-3 font-serif">
            OUR BOOKING <span className="text-[#8dbb00] font-sans font-black">PROCESS</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">
            Four steps between you and the open road.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 mx-auto">
          {BOOKING_PROCESS.map((step, idx) => (
            <div key={step.title} className="relative flex flex-col items-center text-center px-2">
              {idx < BOOKING_PROCESS.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-1/2 w-[calc(100%+1.5rem)] h-px bg-gradient-to-r from-green-300 to-green-100" />
              )}
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-green-600/20 shadow-sm flex items-center justify-center mb-5 relative z-10 group hover:border-[#8dbb00] hover:scale-105 transition-all">
                <step.icon className="text-green-700" size={24} />
              </div>
              <div className="text-[10px] font-black text-[#8dbb00] tracking-widest uppercase mb-2 font-mono">
                Step 0{idx + 1}
              </div>
              <h3 className="text-base font-black uppercase tracking-tight text-gray-900 mb-2 font-serif">
                {step.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium max-w-[220px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
