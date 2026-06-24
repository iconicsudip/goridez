'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import { ArrowDownUp, MapPin, Calendar, Users, Send, Route } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Info, Briefcase, Settings2, Fuel } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function TaxiClient({ initialCars, initialCities, initialRoutes = [], initialAirportRoutes = [] }: { initialCars: any[], initialCities: any[], initialRoutes?: any[], initialAirportRoutes?: any[] }) {
  const [activeTab, setActiveTab] = useState<string | null>(null); // State for round trip breakdown tabs
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, updateSession, addToCart } = useBookingStore();
  
  const [bookingMode, setBookingMode] = useState<'ONE_WAY'|'ROUND_TRIP'|'AIRPORT_TRANSFER'>('ONE_WAY');
  const [selectedRouteId, setSelectedRouteId] = useState(initialRoutes[0]?.id || '');

  // Airport Transfer State
  const [selectedAtRouteId, setSelectedAtRouteId] = useState(initialAirportRoutes[0]?.id || '');
  const [atDirection, setAtDirection] = useState<'PICKUP'|'DROP'>('PICKUP');

  const [pickup, setPickup] = useState<string>(initialCities[0]?.name || 'Udaipur');
  const [dropoff, setDropoff] = useState<string>(initialCities.length > 1 ? initialCities[1]?.name : 'Ahmedabad');
  const calculatedOneWayDistance = useMemo(() => {
    if (!pickup || !dropoff) return 260;
    const route = initialRoutes.find((r: any) => 
      r.routeTitle.toLowerCase().includes(pickup.toLowerCase()) && 
      r.routeTitle.toLowerCase().includes(dropoff.toLowerCase())
    );
    return route ? route.distanceKm : 260;
  }, [pickup, dropoff, initialRoutes]);

  const distance = calculatedOneWayDistance;
  const duration = `${(distance / 55).toFixed(1)} Hrs`;
  
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
  }, [session?.pickupDate, session?.returnDate, session?.pickupCity, session?.dropCity, session?.bookingMode]); // Remove searchParams to avoid infinite loop on mount

  // Sync state changes to URL
  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (bookingMode && params.get('mode') !== bookingMode) {
      params.set('mode', bookingMode);
      changed = true;
    }
    if (pickup && params.get('pickupCity') !== pickup) {
      params.set('pickupCity', pickup);
      changed = true;
    }
    if (dropoff && params.get('dropCity') !== dropoff) {
      params.set('dropCity', dropoff);
      changed = true;
    }
    if (pickupDate) {
      const dateStr = pickupDate.toISOString();
      if (params.get('pickupDate') !== dateStr) {
        params.set('pickupDate', dateStr);
        changed = true;
      }
    }
    if (returnDate) {
      const dateStr = returnDate.toISOString();
      if (params.get('returnDate') !== dateStr) {
        params.set('returnDate', dateStr);
        changed = true;
      }
    }

    if (changed) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [bookingMode, pickup, dropoff, pickupDate, returnDate, isMounted, router, searchParams]);

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

  const destArray = dropoff ? dropoff.split(',') : [''];
  const updateDestination = (index: number, val: string) => {
    const newDests = [...destArray];
    newDests[index] = val;
    setDropoff(newDests.join(','));
  };
  const addDestination = () => {
    if (destArray.length < 3) {
      setDropoff([...destArray, ''].join(','));
    }
  };
  const removeDestination = (index: number) => {
    const newDests = [...destArray];
    newDests.splice(index, 1);
    setDropoff(newDests.join(','));
  };

  const calculatedOwDistance = useMemo(() => {
    if (bookingMode !== 'ROUND_TRIP') return 0;
    let totalKm = 0;
    let currentCity = pickup;
    
    for (const dest of destArray) {
      if (!dest) continue;
      // Find a matching route where the title contains both the start and end city of this segment
      const route = initialRoutes.find((r: any) => 
        r.routeTitle.toLowerCase().includes(currentCity.toLowerCase()) && 
        r.routeTitle.toLowerCase().includes(dest.toLowerCase())
      );
      
      if (route) {
        totalKm += route.distanceKm;
      }
      currentCity = dest;
    }
    return totalKm;
  }, [pickup, destArray, initialRoutes, bookingMode]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 mb-10 bg-gradient-to-br from-white to-green-50">
          <div className="text-green-700 text-[10px] font-black tracking-widest uppercase mb-4">
            Intercity Fares & Packages
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            INTERCITY <span className="text-outline-neon">TAXI & ROUTES</span>
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">
            Premium door-to-door direct pick-ups. Choose One Way express transfers or full Round Trip scenic routes around Rajasthan.
          </p>
        </div>

        {/* Booking Mode Tabs */}
        <div className="flex gap-4 mb-8 bg-gray-100 p-2 rounded-2xl w-fit">
          <button 
            onClick={() => setBookingMode('ONE_WAY')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              bookingMode === 'ONE_WAY' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            One Way Express
          </button>
          <button 
            onClick={() => setBookingMode('ROUND_TRIP')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              bookingMode === 'ROUND_TRIP' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Round Trip Packages
          </button>
          <button 
            onClick={() => setBookingMode('AIRPORT_TRANSFER')}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              bookingMode === 'AIRPORT_TRANSFER' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Airport Transfers
          </button>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6 lg:sticky lg:top-24 h-fit z-10">
            
            {/* Route Configurator */}
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8">
              <h2 className="font-black text-sm uppercase tracking-widest mb-8">Route Configurator</h2>
              
              <div className="space-y-4 relative">
                
                {bookingMode === 'ONE_WAY' ? (
                  <>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Pick-Up Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" size={16} />
                        <select value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                          {initialCities.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="absolute top-[28%] left-12 w-8 h-8 bg-gray-50 border border-green-300 text-green-700 rounded-full flex items-center justify-center z-10 cursor-pointer">
                      <ArrowDownUp size={14} />
                    </div>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Drop-Off Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" size={16} />
                        <select value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                          {initialCities.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                ) : bookingMode === 'ROUND_TRIP' ? (
                  <>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Pick-Up Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" size={16} />
                        <select value={pickup} onChange={(e) => setPickup(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                          {initialCities.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest">Destinations</label>
                        {destArray.length < 3 && (
                          <button type="button" onClick={addDestination} className="text-green-700 hover:text-gray-900 transition-colors flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded text-[9px]">
                            <span className="text-[14px] leading-none">+</span> ADD
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {destArray.map((dest: string, idx: number) => (
                          <div key={idx} className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" size={16} />
                              <select 
                                value={dest} 
                                onChange={(e) => updateDestination(idx, e.target.value)} 
                                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer"
                              >
                                <option value="" disabled className="text-gray-400">Select Destination</option>
                                {initialCities.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                              </select>
                            </div>
                            {destArray.length > 1 && (
                              <button type="button" onClick={() => removeDestination(idx)} className="text-red-400 hover:text-red-300 w-8 flex justify-center">
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {calculatedOwDistance > 0 ? (
                        <p className="text-[10px] text-green-700 mt-4 font-mono font-bold tracking-widest uppercase">
                          Est. Distance (OW): {calculatedOwDistance} KM
                        </p>
                      ) : (
                        <p className="text-[10px] text-gray-400 mt-4 font-mono">Distance calculated based on minimum package.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Airport Direction</label>
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={() => setAtDirection('PICKUP')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${atDirection === 'PICKUP' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                      >
                        Pickup from Airport
                      </button>
                      <button 
                        onClick={() => setAtDirection('DROP')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${atDirection === 'DROP' ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                      >
                        Drop to Airport
                      </button>
                    </div>

                    <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">City Zone / Locality</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" size={16} />
                      <select value={selectedAtRouteId} onChange={(e) => setSelectedAtRouteId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm outline-none appearance-none font-medium cursor-pointer">
                        {initialAirportRoutes.map((r: any) => <option key={r.id} value={r.id}>{r.zone} - {r.areaLocality}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                      {bookingMode === 'ROUND_TRIP' ? 'Travel Date Range (Required)' : bookingMode === 'AIRPORT_TRANSFER' ? 'Transfer Date' : 'Travel Date Range'}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700 pointer-events-none" size={14} />
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
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-4 text-xs outline-none cursor-pointer font-medium" 
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
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-4 text-xs outline-none cursor-pointer font-medium" 
                          wrapperClassName="w-full" portalId="datepicker-root"
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1">Pickup Time</label>
                      <input 
                        type="time" 
                        value={`${String(pickupDate.getHours()).padStart(2, '0')}:${String(pickupDate.getMinutes()).padStart(2, '0')}`}
                        onChange={(e) => handlePickupTimeChange(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-brand-neon font-mono"
                      />
                    </div>
                    {returnDate && bookingMode !== 'AIRPORT_TRANSFER' && (
                      <div>
                        <label className="block text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-1 font-bold">Return Time</label>
                        <input 
                          type="time" 
                          value={`${String(returnDate.getHours()).padStart(2, '0')}:${String(returnDate.getMinutes()).padStart(2, '0')}`}
                          onChange={(e) => handleReturnTimeChange(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 outline-none focus:border-brand-neon font-mono"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {bookingMode === 'ONE_WAY' && (
                <div className="bg-gray-50 border border-[#2A2A0A] rounded-xl p-5 mt-6 space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold tracking-widest">EST. ROUTE DISTANCE</span>
                    <span className="text-green-700 font-bold">{distance} KM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold tracking-widest">EST. TRAVEL DURATION</span>
                    <span className="text-gray-900 font-bold">{duration}</span>
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
                  const runningDistance = calculatedOwDistance > 0 ? calculatedOwDistance * 2 : 0; // Dynamic custom route, fallback to package minimums if no match
                  const minKmPerDay = 250;
                  const billableKm = Math.max(runningDistance, minKmPerDay * durationDays);
                  const ratePerKm = car.packages?.[0]?.extraChargePerUnit || 13;
                  const driverAllowancePerDay = car.driverAllowanceOut || 350;
                  
                  const basicFare = Math.round(billableKm * ratePerKm);
                  const driverAllowance = driverAllowancePerDay * durationDays;
                  const gstAmount = Math.round(basicFare * 0.05); // 5% GST
                  
                  flatFare = basicFare + driverAllowance + gstAmount;

                  car._breakdown = {
                    basicFare,
                    driverAllowance,
                    gstAmount,
                    ratePerKm,
                    minKmPerDay,
                    runningDistance,
                    chargedDistance: billableKm,
                    days: durationDays
                  };
                  
                  const destStr = dropoff ? dropoff.split(',').join(' -> ') : '';
                  extraText = `Round Trip: ${pickup} -> ${destStr} (${durationDays} Days)`;
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

                if (bookingMode === 'ROUND_TRIP' && car._breakdown) {
                  const bd = car._breakdown;
                  const isTabActive = (tab: string) => activeTab === `${car.id}-${tab}`;
                  const toggleTab = (tab: string) => setActiveTab(prev => prev === `${car.id}-${tab}` ? null : `${car.id}-${tab}`);
                  
                  return (
                    <div key={car.id} className="bg-gray-100 border border-gray-200 rounded-3xl p-6 md:p-8 flex flex-col hover:border-gray-300 transition-colors mb-6 font-sans">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="shrink-0 w-full md:w-48 relative h-40 flex items-center justify-center">
                          <Link href={`/cars/${car.id}`} className="block w-full h-full relative">
                            <Image src={car.image || '/placeholder-car.png'} alt={`${car.make} ${car.model}`} fill className="object-contain hover:scale-105 transition-transform" unoptimized />
                          </Link>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between w-full">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-green-700 text-[10px] font-black tracking-[0.2em] uppercase">{car.category} AC</span>
                              </div>
                            </div>
                            
                            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                              <Link href={`/cars/${car.id}`} className="hover:text-green-700 transition-colors">
                                {car.make} {car.model} <span className="text-gray-500 text-xl">{car.seatingCapacity} SEATER</span>
                              </Link>
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-6">
                              <span className="bg-gray-100 px-3 py-1 rounded border border-gray-200">{car.transmission}</span>
                              <span className="bg-gray-100 px-3 py-1 rounded border border-gray-200">{car.fuelType}</span>
                              {car.features && car.features.length > 0 ? car.features.slice(0, 2).map((feat: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 px-3 py-1 rounded border border-gray-200 flex items-center gap-1">
                                  {feat}
                                </span>
                              )) : (
                                <span className="bg-gray-100 px-3 py-1 rounded border border-gray-200 flex items-center gap-1">
                                  <Briefcase size={12} className="text-green-700"/> LUGGAGE ALLOWED
                                </span>
                              )}
                            </div>
                            
                            <div className="w-full max-w-lg text-xs font-mono text-gray-900/70 mb-6">
                              <div className="space-y-3">
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                  <span className="text-gray-400">Package</span>
                                  <span className="text-gray-900 font-medium">Outstation (Round Trip)</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-2">
                                  <span className="text-gray-400">Charged Distance</span>
                                  <span className="text-gray-900 font-medium">{bd.chargedDistance} Km</span>
                                </div>
                                <div className="flex justify-between pb-2">
                                  <span className="text-gray-400">Extra Charge</span>
                                  <span className="text-gray-900 font-medium">₹{bd.ratePerKm}/Km (Beyond {bd.chargedDistance}Km)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <button onClick={() => toggleTab("fare")} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-700 hover:text-gray-900 transition-colors">
                              View Breakdown & Terms {isTabActive("fare") ? <ArrowDownUp size={14} /> : <ArrowDownUp size={14} />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="shrink-0 w-full md:w-56 flex flex-col justify-center items-end text-right md:border-l border-gray-200 md:pl-8 mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0">
                          <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                            Package Fare ({bd.days}D)
                          </div>
                          <p className="text-4xl font-black text-green-700 mb-2">₹{flatFare.toLocaleString()}</p>
                          <p className="text-[10px] text-gray-400 font-mono mb-1">Inc. GST & Driver Allowance</p>
                          <p className="text-[10px] text-gray-400 font-mono mb-6">Exc. Toll Tax & Parking</p>
                          
                          <button onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)} disabled={isAlreadyBooked || !returnDate} className={`w-full font-black text-[10px] tracking-widest uppercase py-4 px-6 rounded-xl transition-all ${
                            isAlreadyBooked || !returnDate
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                              : 'bg-green-500 text-white hover:bg-brand-hover shadow-[0_0_15px_rgba(196,240,0,0.15)]'
                          }`}>
                            {isAlreadyBooked ? 'Booked' : !returnDate ? 'Select Dates First' : 'Book Now'}
                          </button>
                        </div>
                      </div>
                      
                      {activeTab?.startsWith(`${car.id}-`) && (
                        <div className="mt-8 border-t border-gray-200 pt-8">
                          <div className="flex flex-wrap gap-3 mb-6">
                            <button onClick={() => toggleTab("fare")} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${isTabActive("fare") ? "bg-green-500 text-white" : "bg-white/5 text-gray-600 hover:bg-white/10 border border-gray-200"}`}>Fare Details</button>
                            <button onClick={() => toggleTab("exclusion")} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${isTabActive("exclusion") ? "bg-green-500 text-white" : "bg-white/5 text-gray-600 hover:bg-white/10 border border-gray-200"}`}>Exclusions</button>
                            <button onClick={() => toggleTab("terms")} className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${isTabActive("terms") ? "bg-green-500 text-white" : "bg-white/5 text-gray-600 hover:bg-white/10 border border-gray-200"}`}>Terms & Conditions</button>
                          </div>
                          
                          {isTabActive("fare") && (
                            <div className="flex flex-col md:flex-row gap-8 text-xs font-mono">
                              <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center"><span className="text-gray-400">Basic Fare</span><span className="font-bold text-gray-900">₹{bd.basicFare}</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Driver Allowances</span><span className="font-bold text-gray-900">₹{bd.driverAllowance}</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">GST (5%)</span><span className="font-bold text-gray-900">₹{bd.gstAmount}</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center mt-4"><span className="text-green-700 font-bold">Total Amount</span><span className="font-bold text-green-700 text-lg">₹{flatFare}</span></div>
                              </div>
                              <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center"><span className="text-gray-400">Rate/Km</span><span className="font-bold text-gray-900">₹{bd.ratePerKm}/Km</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">No. of Days</span><span className="font-bold text-gray-900">{bd.days} Days</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Min Km/Day ({bd.minKmPerDay}*{bd.days})</span><span className="font-bold text-gray-900">{bd.chargedDistance} Km</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Running Distance</span><span className="font-bold text-gray-900">{bd.runningDistance} Km</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Charged Distance</span><span className="font-bold text-gray-900">{bd.chargedDistance} Km</span></div>
                              </div>
                            </div>
                          )}
                          
                          {isTabActive("exclusion") && (
                            <div className="text-xs font-mono text-gray-600 p-6 bg-white rounded-2xl border border-gray-200">
                              <ul className="list-disc pl-5 space-y-3">
                                <li>Toll Tax and Parking charges are not included in the above fare.</li>
                                <li>State Tax (if applicable crossing borders) is extra.</li>
                                <li>Any extra km or hours driven beyond the package limit will be charged additionally.</li>
                              </ul>
                            </div>
                          )}
                          
                          {isTabActive("terms") && (
                            <div className="text-xs font-mono text-gray-600 p-6 bg-white rounded-2xl border border-gray-200">
                              <ul className="list-disc pl-5 space-y-3">
                                <li>A/C will be switched off in hilly areas.</li>
                                <li>Night allowance applies if the driver drives between 10 PM and 6 AM.</li>
                                <li>Kilometers are calculated from garage to garage.</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={car.id} className="bg-gray-100 border border-gray-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-gray-300 transition-colors mb-6">
                    <div className="shrink-0 w-full md:w-48 relative h-40 flex items-center justify-center">
                      <Link href={`/cars/${car.id}`} className="block w-full h-full relative">
                        <Image src={car.image || '/placeholder-car.png'} alt={`${car.make} ${car.model}`} fill className="object-contain hover:scale-105 transition-transform" unoptimized />
                      </Link>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border border-gray-200">{car.category} Class</span>
                        <span className="text-[10px] text-gray-400 font-mono">{car.seatingCapacity} Seats • {car.transmission}</span>
                      </div>
                      <h3 className="text-xl font-black mb-1">
                        <Link href={`/cars/${car.id}`} className="hover:text-green-700 transition-colors">
                          {car.make} {car.model}
                        </Link>
                      </h3>
                      <p className="text-[10px] text-gray-500 font-mono mb-6">{car.fuelType} Engine {car.features && car.features.length > 0 ? `• ${car.features.join(' • ')}` : '• Fully Air-Conditioned'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {car.content || 'Guaranteed private. No ridesharing. No multiple stops.'}
                      </div>
                    </div>
                    <div className="text-right shrink-0 bg-transparent flex flex-col items-end">
                      <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                        {bookingMode === 'ROUND_TRIP' ? `Package Fare (${durationDays}D)` : 'Flat Invoice Fare'}
                      </div>
                      <div className="text-3xl font-black text-green-700 mb-4">
                        ₹{flatFare.toLocaleString()} 
                        <span className="text-gray-400 text-[10px] font-medium lowercase ml-2">
                          {bookingMode === 'ROUND_TRIP' ? 'total' : (returnDate ? 'round trip' : 'one way')}
                        </span>
                      </div>
                      <button 
                        onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)} 
                        disabled={isAlreadyBooked || (bookingMode === 'ROUND_TRIP' && !returnDate)}
                        className={`font-black text-[10px] tracking-widest uppercase py-4 px-8 rounded-xl transition-all ${
                          isAlreadyBooked || (bookingMode === 'ROUND_TRIP' && !returnDate)
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                            : 'bg-green-500 text-white hover:bg-brand-hover shadow-[0_0_20px_rgba(196,240,0,0.2)]'
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
