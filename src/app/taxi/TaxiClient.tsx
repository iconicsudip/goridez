'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import { ArrowDownUp, MapPin, Calendar, Users, Send, Route } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function TaxiClient({ initialCars, initialCities, initialRoutes = [], initialAirportRoutes = [] }: { initialCars: any[], initialCities: any[], initialRoutes?: any[], initialAirportRoutes?: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, updateSession, addToCart } = useBookingStore();
  
  const [bookingMode, setBookingMode] = useState<'ONE_WAY'|'ROUND_TRIP'|'AIRPORT_TRANSFER'>('ONE_WAY');
  const [selectedRouteId, setSelectedRouteId] = useState(initialRoutes[0]?.id || '');

  // Airport Transfer State
  const [selectedAtRouteId, setSelectedAtRouteId] = useState(initialAirportRoutes[0]?.id || '');
  const [atDirection, setAtDirection] = useState<'PICKUP'|'DROP'>('PICKUP');

  const [pickup, setPickup] = useState(initialCities[0]?.name || 'Udaipur');
  const [dropoff, setDropoff] = useState(initialCities.length > 1 ? initialCities[1]?.name : 'Ahmedabad');
  const [distance, setDistance] = useState(260);
  const [duration, setDuration] = useState('4.5 Hrs');
  
  const [pickupDate, setPickupDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const qPickupDate = searchParams.get('pickupDate');
    const qReturnDate = searchParams.get('returnDate');
    const qPickupCity = searchParams.get('pickupCity');
    const qDropCity = searchParams.get('dropCity');
    const qMode = searchParams.get('mode') as any;

    if (qPickupDate) setPickupDate(new Date(qPickupDate));
    else if (session?.pickupDate) setPickupDate(new Date(session.pickupDate));

    if (qReturnDate) setReturnDate(new Date(qReturnDate));
    else if (session?.returnDate) setReturnDate(new Date(session.returnDate));

    if (qPickupCity) setPickup(qPickupCity);
    else if (session?.pickupCity) setPickup(session.pickupCity);

    if (qDropCity) setDropoff(qDropCity);
    else if (session?.dropCity) setDropoff(session.dropCity);

    if (qMode) setBookingMode(qMode);
    else if (session?.bookingMode) setBookingMode(session.bookingMode);
  }, [session?.pickupDate, session?.returnDate, session?.pickupCity, session?.dropCity, session?.bookingMode, searchParams]);

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
    updateSession({ pickupDate: newDate.toISOString() });
  };

  const handleReturnTimeChange = (timeStr: string) => {
    if (!returnDate) return;
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(returnDate);
    newDate.setHours(h, m);
    setReturnDate(newDate);
    updateSession({ returnDate: newDate.toISOString() });
  };

  const handleBook = (car: any, price: number, extraText: string) => {
    let extra = extraText;
    if (pickupDate) {
      extra += ` • Departs: ${pickupDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
      if (returnDate && bookingMode !== 'AIRPORT_TRANSFER') extra += ` • Returns: ${returnDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
    }

    addToCart({
      serviceType: bookingMode === 'ROUND_TRIP' ? 'tours' : bookingMode === 'AIRPORT_TRANSFER' ? 'oneWayTaxi' : 'oneWayTaxi',
      referenceId: car.id,
      title: `${car.make} ${car.model} (${bookingMode === 'ROUND_TRIP' ? 'Round Trip' : bookingMode === 'AIRPORT_TRANSFER' ? 'Airport Transfer' : 'One Way'})`,
      image: car.image || '',
      price: price,
      deposit: 0,
      extraInfo: extra
    });
  };

  const selectedRoute = initialRoutes.find(r => r.id === selectedRouteId) || initialRoutes[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-10 bg-gradient-to-br from-[#0A0A0A] to-[#0A1A0A]">
          <div className="text-brand-neon text-[10px] font-black tracking-widest uppercase mb-4">
            Intercity Fares & Packages
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            INTERCITY <span className="text-outline-neon">TAXI & ROUTES</span>
          </h1>
          <p className="text-white/60 max-w-2xl text-sm leading-relaxed">
            Premium door-to-door direct pick-ups. Choose One Way express transfers or full Round Trip scenic routes around Rajasthan.
          </p>
        </div>

        {/* Booking Mode Tabs */}
        <div className="flex gap-4 mb-8 bg-[#111] p-2 rounded-2xl w-fit">
          <button 
            onClick={() => setBookingMode('ONE_WAY')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              bookingMode === 'ONE_WAY' ? 'bg-brand-neon text-black shadow-lg shadow-brand-neon/20' : 'text-white/50 hover:text-white'
            }`}
          >
            One Way Express
          </button>
          <button 
            onClick={() => setBookingMode('ROUND_TRIP')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              bookingMode === 'ROUND_TRIP' ? 'bg-brand-neon text-black shadow-lg shadow-brand-neon/20' : 'text-white/50 hover:text-white'
            }`}
          >
            Round Trip Packages
          </button>
          <button 
            onClick={() => setBookingMode('AIRPORT_TRANSFER')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              bookingMode === 'AIRPORT_TRANSFER' ? 'bg-brand-neon text-black shadow-lg shadow-brand-neon/20' : 'text-white/50 hover:text-white'
            }`}
          >
            Airport Transfers
          </button>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6">
            
            {/* Route Configurator */}
            <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
              <h2 className="font-black text-sm uppercase tracking-widest mb-8">Route Configurator</h2>
              
              <div className="space-y-4 relative">
                
                {bookingMode === 'ONE_WAY' ? (
                  <>
                    <div>
                      <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Pick-Up Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon" size={16} />
                        <select value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                          {initialCities.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="absolute top-[28%] left-12 w-8 h-8 bg-[#1A1A0A] border border-brand-neon/30 text-brand-neon rounded-full flex items-center justify-center z-10 cursor-pointer">
                      <ArrowDownUp size={14} />
                    </div>
                    <div>
                      <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Drop-Off Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon" size={16} />
                        <select value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                          {initialCities.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                ) : bookingMode === 'ROUND_TRIP' ? (
                  <div>
                    <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Predefined Round Trip Route</label>
                    <div className="relative">
                      <Route className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon" size={16} />
                      <select value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                        {initialRoutes.map((r: any) => <option key={r.id} value={r.id}>{r.routeTitle}</option>)}
                      </select>
                    </div>
                    <p className="text-[10px] text-brand-neon mt-2 font-mono">Distance (OW): {selectedRoute?.distanceKm} KM</p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">Airport Direction</label>
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => setAtDirection('PICKUP')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${atDirection === 'PICKUP' ? 'bg-brand-neon text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                      >
                        Pickup from Airport
                      </button>
                      <button 
                        onClick={() => setAtDirection('DROP')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${atDirection === 'DROP' ? 'bg-brand-neon text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                      >
                        Drop to Airport
                      </button>
                    </div>

                    <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">City Zone / Locality</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon" size={16} />
                      <select value={selectedAtRouteId} onChange={(e) => setSelectedAtRouteId(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                        {initialAirportRoutes.map((r: any) => <option key={r.id} value={r.id}>{r.zone} - {r.areaLocality}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[9px] text-white/50 font-bold uppercase tracking-widest mb-2">
                      {bookingMode === 'ROUND_TRIP' ? 'Travel Date Range (Required)' : bookingMode === 'AIRPORT_TRANSFER' ? 'Transfer Date' : 'Travel Date Range'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-neon pointer-events-none" size={14} />
                      {bookingMode === 'AIRPORT_TRANSFER' ? (
                        <DatePicker 
                          selectsRange={false}
                          selected={pickupDate}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const nextStart = new Date(date);
                              nextStart.setHours(pickupDate.getHours(), pickupDate.getMinutes());
                              setPickupDate(nextStart);
                              updateSession({ pickupDate: nextStart.toISOString() });
                            }
                          }}
                          dateFormat="dd/MM/yyyy" 
                          placeholderText="Transfer Date"
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-10 pr-4 py-4 text-xs outline-none cursor-pointer font-medium" 
                          wrapperClassName="w-full" portalId="datepicker-root"
                        />
                      ) : (
                        <DatePicker 
                          selectsRange={true}
                          startDate={pickupDate}
                          endDate={returnDate}
                          onChange={handleDateRangeChange as any} 
                          dateFormat="dd/MM/yyyy" 
                          placeholderText={bookingMode === 'ROUND_TRIP' ? 'Select Start & End Date' : 'One Way (or Select Return)'}
                          className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-10 pr-4 py-4 text-xs outline-none cursor-pointer font-medium" 
                          wrapperClassName="w-full" portalId="datepicker-root"
                        />
                      )}
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
                    {returnDate && bookingMode !== 'AIRPORT_TRANSFER' && (
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
              </div>

              {bookingMode === 'ONE_WAY' && (
                <div className="bg-[#1A1A0A] border border-[#2A2A0A] rounded-xl p-5 mt-6 space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-white/50 font-bold tracking-widest">EST. ROUTE DISTANCE</span>
                    <span className="text-brand-neon font-bold">{distance} KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50 font-bold tracking-widest">EST. TRAVEL DURATION</span>
                    <span className="text-white font-bold">{duration}</span>
                  </div>
                </div>
              )}

            </div>

          </aside>

          {/* Main Classes List */}
          <div className="flex-1">
            <h2 className="font-black text-xl uppercase tracking-tight mb-6">Choose Private Cab Class</h2>
            
            <div className="space-y-6">
              
              {initialCars.map((car) => {
                const durationDays = returnDate 
                  ? Math.max(1, Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)))
                  : 1;

                let flatFare = 0;
                let extraText = '';

                if (bookingMode === 'ONE_WAY') {
                  const ratePerKm = car.packages?.[0]?.extraChargePerUnit || 15;
                  const baseFlatFare = Math.round(2000 + (distance * ratePerKm * 1.2));
                  const isRoundTrip = returnDate !== null;
                  const extraDayAllowance = durationDays > 1 ? (durationDays - 1) * 1500 : 0;
                  flatFare = isRoundTrip ? Math.round(baseFlatFare * 1.8) + extraDayAllowance : baseFlatFare;
                  extraText = `${pickup} ➔ ${dropoff} (${distance} KM)`;
                } else if (bookingMode === 'ROUND_TRIP') {
                  // ROUND TRIP
                  if (!selectedRoute) return null;
                  
                  let prefix = 'sedan';
                  if (car.category.toUpperCase() === 'SUV') prefix = 'suv';
                  else if (car.model.toLowerCase().includes('crysta')) prefix = 'crysta';
                  else if (car.category.toUpperCase() === 'LUXURY') prefix = 'luxury';

                  const price1D = selectedRoute[`${prefix}1D`] || 5000;
                  const price2D = selectedRoute[`${prefix}2D`] || (price1D * 2);
                  const price3D = selectedRoute[`${prefix}3D`] || (price1D * 3);

                  if (durationDays === 1) flatFare = price1D;
                  else if (durationDays === 2) flatFare = price2D;
                  else if (durationDays === 3) flatFare = price3D;
                  else {
                    // Cap extra days using the diff between 3D and 2D
                    const extraDayPrice = price3D - price2D;
                    flatFare = price3D + (extraDayPrice * (durationDays - 3));
                  }

                  flatFare += (selectedRoute.nightAllowance || 0) * durationDays;

                  extraText = `Round Trip: ${selectedRoute.routeTitle} (${durationDays} Days)`;
                } else if (bookingMode === 'AIRPORT_TRANSFER') {
                  const selectedAt = initialAirportRoutes.find(r => r.id === selectedAtRouteId) || initialAirportRoutes[0];
                  if (!selectedAt) return null;
                  
                  let prefix = 'sedan';
                  if (car.category.toUpperCase() === 'SUV') prefix = 'suv';
                  else if (car.model.toLowerCase().includes('crysta')) prefix = 'crysta';
                  else if (car.category.toUpperCase() === 'LUXURY') prefix = 'luxury';

                  const priceKey = `${prefix}${atDirection === 'PICKUP' ? 'Pickup' : 'Drop'}`;
                  flatFare = selectedAt[priceKey] || 1000;
                  
                  extraText = `Airport Transfer (${atDirection === 'PICKUP' ? 'Pickup from Airport' : 'Drop to Airport'}): ${selectedAt.airport} ↔ ${selectedAt.areaLocality} | Wait Fee: ₹${selectedAt.waitCharge}/30min | Night Fee: ₹${selectedAt.nightFee}`;
                }

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
                      <div className="text-[9px] text-white/40 uppercase tracking-widest font-bold mb-1">
                        {bookingMode === 'ROUND_TRIP' ? `Package Fare (${durationDays}D)` : 'Flat Invoice Fare'}
                      </div>
                      <div className="text-3xl font-black text-brand-neon mb-4">₹{flatFare.toLocaleString()} <span className="text-white/40 text-[10px] font-medium lowercase">
                        {bookingMode === 'ROUND_TRIP' ? 'total' : (returnDate ? 'round trip' : 'one way')}
                      </span></div>
                      <button 
                        onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)} 
                        disabled={isAlreadyBooked || (bookingMode === 'ROUND_TRIP' && !returnDate)}
                        className={`w-full font-black text-[10px] tracking-widest uppercase py-3 px-8 rounded-xl transition-all ${
                          isAlreadyBooked || (bookingMode === 'ROUND_TRIP' && !returnDate)
                            ? 'bg-zinc-800 text-white/30 cursor-not-allowed border border-white/5 shadow-none' 
                            : 'bg-brand-neon text-black hover:bg-brand-hover shadow-[0_0_15px_rgba(196,240,0,0.15)]'
                        }`}
                      >
                        {isAlreadyBooked ? 'Booked / Unavailable' : (bookingMode === 'ROUND_TRIP' && !returnDate ? 'Select Dates First' : 'Book Cab Now')}
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
