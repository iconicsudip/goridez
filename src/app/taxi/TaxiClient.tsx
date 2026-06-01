'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import { ArrowDownUp, MapPin, Calendar, Users, Send } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function TaxiClient({ initialCars, initialCities }: { initialCars: any[], initialCities: any[] }) {
  const router = useRouter();
  const { session, updateSession, addToCart } = useBookingStore();
  
  const [pickup, setPickup] = useState(initialCities[0]?.name || 'Udaipur');
  const [dropoff, setDropoff] = useState(initialCities.length > 1 ? initialCities[1]?.name : 'Ahmedabad');
  const [distance, setDistance] = useState(260);
  const [duration, setDuration] = useState('4.5 Hrs');
  
  const [pickupDate, setPickupDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (session?.pickupDate) {
      setPickupDate(new Date(session.pickupDate));
    }
    if (session?.returnDate) {
      setReturnDate(new Date(session.returnDate));
    }
  }, [session?.pickupDate, session?.returnDate]);

  const handleDateRangeChange = (update: [Date | null, Date | null]) => {
    const [start, end] = update;
    let nextStart = pickupDate;
    let nextEnd = returnDate;

    if (start) {
      nextStart = new Date(start);
      nextStart.setHours(pickupDate.getHours(), pickupDate.getMinutes());
      setPickupDate(nextStart);
    }
    if (end) {
      nextEnd = new Date(end);
      nextEnd.setHours(returnDate ? returnDate.getHours() : 12, returnDate ? returnDate.getMinutes() : 0);
      setReturnDate(nextEnd);
    } else {
      nextEnd = null;
      setReturnDate(null);
    }

    updateSession({
      pickupDate: nextStart.toISOString(),
      returnDate: nextEnd ? nextEnd.toISOString() : null
    });
  };

  const handlePickupTimeChange = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(pickupDate);
    newDate.setHours(h, m);
    setPickupDate(newDate);
    updateSession({
      pickupDate: newDate.toISOString()
    });
  };

  const handleReturnTimeChange = (timeStr: string) => {
    if (!returnDate) return;
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(returnDate);
    newDate.setHours(h, m);
    setReturnDate(newDate);
    updateSession({
      returnDate: newDate.toISOString()
    });
  };

  const handleBook = (car: any, price: number) => {
    let extra = `${pickup} ➔ ${dropoff} (${distance} KM)`;
    if (pickupDate) {
      extra += ` • Departs: ${pickupDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
      if (returnDate) extra += ` • Returns: ${returnDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
    }

    addToCart({
      serviceType: 'oneWayTaxi',
      referenceId: car.id,
      title: `${car.make} ${car.model} (Taxi)`,
      image: car.image || '',
      price: price,
      deposit: 0,
      extraInfo: extra
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-10 bg-gradient-to-br from-[#0A0A0A] to-[#0A1A0A]">
          <div className="text-brand-neon text-[10px] font-black tracking-widest uppercase mb-4">
            Intercity One Way Fares
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            ONE WAY TAXI & <span className="text-outline-neon">EXPRESS ROUTES</span>
          </h1>
          <p className="text-white/60 max-w-2xl text-sm leading-relaxed">
            Premium door-to-door direct pick-ups. Skip the round-trip surcharge. Secure private vehicles for Ahmedabad, Jaipur, Jodhpur, and Mount Abu.
          </p>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6">
            
            {/* Route Configurator */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
              <h2 className="font-black text-sm uppercase tracking-widest mb-8">Route Configurator</h2>
              
              <div className="space-y-4 relative">
                <div>
                  <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Pick-Up Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon" size={16} />
                    <select value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                      {initialCities.map((c: any) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="absolute top-[35%] left-12 w-8 h-8 bg-[#1A1A0A] border border-brand-neon/30 text-brand-neon rounded-full flex items-center justify-center z-10 cursor-pointer">
                  <ArrowDownUp size={14} />
                </div>

                <div>
                  <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Drop-Off Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon" size={16} />
                    <select value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                      {initialCities.map((c: any) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Travel Date Range</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon pointer-events-none" size={14} />
                      <DatePicker 
                        selectsRange={true}
                        startDate={pickupDate}
                        endDate={returnDate}
                        onChange={handleDateRangeChange} 
                        dateFormat="dd/MM/yyyy" 
                        placeholderText="One Way (or Select Return)"
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-10 pr-4 py-4 text-xs outline-none cursor-pointer font-medium" 
                        wrapperClassName="w-full" portalId="datepicker-root"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1">Pickup Time</label>
                      <input 
                        type="time" 
                        value={`${String(pickupDate.getHours()).padStart(2, '0')}:${String(pickupDate.getMinutes()).padStart(2, '0')}`}
                        onChange={(e) => handlePickupTimeChange(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-neon font-mono"
                      />
                    </div>
                    {returnDate && (
                      <div>
                        <label className="block text-[8px] text-white/40 font-bold uppercase tracking-widest mb-1 font-bold">Return Time</label>
                        <input 
                          type="time" 
                          value={`${String(returnDate.getHours()).padStart(2, '0')}:${String(returnDate.getMinutes()).padStart(2, '0')}`}
                          onChange={(e) => handleReturnTimeChange(e.target.value)}
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-neon font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon" size={14} />
                    <select className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-10 pr-4 py-4 text-xs outline-none appearance-none cursor-pointer">
                      <option>Up to 4 Pax</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-[#1A1A0A] border border-[#2A2A0A] rounded-xl p-5 mt-6 space-y-3 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-white/50 font-bold tracking-widest">EST. ROUTE DISTANCE</span>
                  <span className="text-brand-neon font-bold">{distance} KM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-bold tracking-widest">EST. TRAVEL DURATION</span>
                  <span className="text-white font-bold">{duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 font-bold tracking-widest">ROAD TOLL STATUS</span>
                  <span className="text-white font-bold">All Prepaid</span>
                </div>
              </div>

            </div>

            {/* Quick Select Corridors */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
              <h2 className="font-bold text-[10px] text-white/50 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Sparkles size={14} className="text-brand-neon" /> QUICK SELECT POPULAR CORRIDORS
              </h2>

              <div className="space-y-3">
                {[
                  { r: 'Udaipur ➔ Ahmedabad', d: '260 KM • 4.5 Hrs average', p: 'Udaipur', dr: 'Ahmedabad', dist: 260, dur: '4.5 Hrs' },
                  { r: 'Udaipur ➔ Jaipur', d: '390 KM • 6.5 Hrs average', p: 'Udaipur', dr: 'Jaipur', dist: 390, dur: '6.5 Hrs' },
                  { r: 'Udaipur ➔ Jodhpur', d: '250 KM • 4.8 Hrs average', p: 'Udaipur', dr: 'Jodhpur', dist: 250, dur: '4.8 Hrs' },
                  { r: 'Udaipur ➔ Mount Abu', d: '165 KM • 3.2 Hrs average', p: 'Udaipur', dr: 'Mount Abu', dist: 165, dur: '3.2 Hrs' }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setPickup(item.p);
                      setDropoff(item.dr);
                      setDistance(item.dist);
                      setDuration(item.dur);
                    }}
                    className="w-full bg-[#0A0A0A] border border-white/5 hover:border-brand-neon/50 rounded-xl p-4 flex justify-between items-center group transition-colors text-left"
                  >
                    <div className="flex gap-4 items-center">
                      <Send className="text-brand-neon" size={14} />
                      <div>
                        <div className="font-bold text-xs mb-1">{item.r}</div>
                        <div className="text-[9px] text-white/40 font-mono">{item.d}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-brand-neon font-bold opacity-0 group-hover:opacity-100 transition-opacity">Select ➔</div>
                  </button>
                ))}
              </div>
            </div>

          </aside>

          {/* Main Classes List */}
          <div className="flex-1">
            <h2 className="font-black text-xl uppercase tracking-tight mb-6">Choose Private Cab Class</h2>
            
            <div className="space-y-6">
              
              {initialCars.map((car) => {
                // Dynamic fare calculation based on selected distance and car's per km rate
                // Assuming a minimum base price, and adding distance-based cost
                const durationHours = pickupDate && returnDate 
                  ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
                  : 24;
                const durationDays = Math.ceil(durationHours / 24);
                const extraDayAllowance = durationDays > 1 ? (durationDays - 1) * 1500 : 0;

                const ratePerKm = car.packages?.[0]?.extraChargePerUnit || 15;
                // Add a base flat fee + distance rate for one-way transfer
                const baseFlatFare = Math.round(2000 + (distance * ratePerKm * 1.2));
                const isRoundTrip = returnDate !== null;
                const flatFare = isRoundTrip ? Math.round(baseFlatFare * 1.8) + extraDayAllowance : baseFlatFare;

                const isAlreadyBooked = car.bookings && car.bookings.length > 0 && car.bookings.some((booking: any) => {
                  if (booking.status === 'CANCELLED') return false;
                  const bStart = new Date(booking.startDate);
                  const bEnd = new Date(booking.endDate);
                  const currentStart = pickupDate;
                  const currentEnd = returnDate || pickupDate;
                  return currentStart <= bEnd && currentEnd >= bStart;
                });

                return (
                  <div key={car.id} className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-white/10 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#1A1A1A] text-white/60 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border border-white/5">{car.category} Class</span>
                        <span className="text-[10px] text-white/40 font-mono">{car.seatingCapacity} Seats • {car.transmission}</span>
                      </div>
                      <h3 className="text-xl font-black mb-1">{car.make} {car.model}</h3>
                      <p className="text-[10px] text-white/50 font-mono mb-6">{car.fuelType} Engine • Fully Air-Conditioned</p>
                      <div className="flex items-center gap-2 text-[10px] text-white/60 font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-neon"></div> Guaranteed private. No ridesharing. No multiple stops.
                      </div>
                    </div>
                    <div className="text-right shrink-0 bg-transparent">
                      <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">Flat Invoice Fare</div>
                      <div className="text-3xl font-black text-brand-neon mb-4">₹{flatFare.toLocaleString()} <span className="text-white/40 text-[10px] font-medium lowercase">{isRoundTrip ? 'round trip' : 'one way'}</span></div>
                      <button 
                        onClick={() => !isAlreadyBooked && handleBook(car, flatFare)} 
                        disabled={isAlreadyBooked}
                        className={`w-full font-black text-[10px] tracking-widest uppercase py-3 px-8 rounded-xl transition-all ${
                          isAlreadyBooked 
                            ? 'bg-zinc-800 text-white/30 cursor-not-allowed border border-white/5 shadow-none' 
                            : 'bg-brand-neon text-black hover:bg-brand-hover shadow-[0_0_15px_rgba(196,240,0,0.15)]'
                        }`}
                      >
                        {isAlreadyBooked ? 'Booked / Unavailable' : 'Book Cab Now'}
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Inline component for Sparkles icon
function Sparkles({ size, className }: { size: number, className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3v18M3 12h18" />
    </svg>
  );
}
