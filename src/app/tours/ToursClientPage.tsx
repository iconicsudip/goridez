'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Compass, Calendar, MapPin, Users } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';

export default function ToursClientPage({ initialTours, cities }: { initialTours: any[], cities: any[] }) {
  const router = useRouter();
  const { session, updateSession, addToCart } = useBookingStore();
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);

  const filteredTours = initialTours.filter(t =>
    selectedCityIds.length === 0 || (t.cityId && selectedCityIds.includes(t.cityId))
  );

  const [activeTourId, setActiveTourId] = useState<string | null>(
    filteredTours[0]?.id || null
  );

  const activeTour =
    filteredTours.find(t => t.id === activeTourId) ||
    filteredTours[0];

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [pickupDate, setPickupDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [returnDate, setReturnDate] = useState<Date | null>(new Date(Date.now() + 4 * 86400000));
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
      updateSession({
        pickupDate: nextStart.toISOString(),
        returnDate: nextEnd.toISOString()
      });
    } else {
      setReturnDate(null);
    }
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

  function toggleCity(id: string) {
    setSelectedCityIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  function handleBook(tour: any) {
    const tourDurationHours = (pickupDate && returnDate)
      ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
      : tour.duration * 24;
    const tourDurationDays = tourDurationHours / 24;
    const scaledAdultPrice = Math.round(tour.adultPrice * (tourDurationDays / tour.duration));
    const scaledChildPrice = Math.round(tour.childPrice * (tourDurationDays / tour.duration));

    let extra = `${adults} Adults, ${children} Children • ${tourDurationDays.toFixed(1)} Days`;
    if (pickupDate) {
      extra += ` • From: ${pickupDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
      if (returnDate) extra += ` To: ${returnDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
    }

    addToCart({
      serviceType: 'tours',
      referenceId: tour.id,
      title: `${tour.title} (Tour Package)`,
      image: tour.image || '',
      price: adults * scaledAdultPrice + children * scaledChildPrice,
      deposit: 0,
      extraInfo: extra
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-24 pb-20">
      <div className="container mx-auto px-4">

        {/* Header Section */}
        <div className="bg-gray-100 border border-gray-200 rounded-3xl p-10 mb-8">
          <div className="text-green-700 text-[10px] font-black tracking-widest uppercase mb-4">
            Luxury Tours
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            RAJASTHAN CURATED <span className="text-outline-neon">EXPERIENCES</span>
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm leading-relaxed mb-10">
            Traverse majestic fortresses, sacred shrines, and serene high-altitude hill stations. Guided by local historians with seamless private transport upgrades.
          </p>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 mt-8">
            <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Filters & Dates</h3>
            <div className="flex flex-col md:flex-row gap-6">

              {/* Date Selection */}
              <div className="flex flex-col gap-2 min-w-[280px]">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700 pointer-events-none" size={14} />
                  <DatePicker
                    selectsRange={true}
                    startDate={pickupDate}
                    endDate={returnDate}
                    onChange={handleDateRangeChange}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select Tour Dates"
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl pl-9 pr-3 py-3 text-xs outline-none focus:border-green-600 transition-colors cursor-pointer font-medium"
                    wrapperClassName="w-full" portalId="datepicker-root"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="time"
                    value={`${String(pickupDate.getHours()).padStart(2, '0')}:${String(pickupDate.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => handlePickupTimeChange(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-2 py-1 text-[10px] text-gray-900 outline-none focus:border-green-600 font-mono"
                  />
                  {returnDate && (
                    <input
                      type="time"
                      value={`${String(returnDate.getHours()).padStart(2, '0')}:${String(returnDate.getMinutes()).padStart(2, '0')}`}
                      onChange={(e) => handleReturnTimeChange(e.target.value)}
                      className="w-full bg-gray-100 border border-gray-200 rounded-xl px-2 py-1 text-[10px] text-gray-900 outline-none focus:border-green-600 font-mono"
                    />
                  )}
                </div>
              </div>

              {/* City Filter */}
              <div className="flex-1 flex flex-wrap gap-2 items-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                <button
                  onClick={() => setSelectedCityIds([])}
                  className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all ${selectedCityIds.length === 0
                    ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(196,240,0,0.2)]'
                    : 'bg-gray-100 border border-gray-300 text-gray-500 hover:text-gray-900'
                    }`}
                >
                  All Tours
                </button>
                {cities?.map((c: any) => {
                  const selected = selectedCityIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCity(c.id)}
                      className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-xl transition-all ${selected
                        ? 'bg-green-600/10 border border-green-600 text-green-700 shadow-sm'
                        : 'bg-gray-100 border border-gray-300 text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Panel: Expeditions */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-2 text-green-700 font-black text-[10px] uppercase tracking-widest mb-2">
              <Compass size={14} /> Select Curated Expedition
            </div>

            {filteredTours.map((tour, index) => {
              const isSelected = activeTourId === tour.id;

              // Dynamic data parsing
              const itinerary = tour.itinerary ? JSON.parse(tour.itinerary) : [];
              const inclusions = tour.included ? JSON.parse(tour.included) : [];

              const tourDurationHours = (pickupDate && returnDate)
                ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
                : tour.duration * 24;
              const tourDurationDays = tourDurationHours / 24;
              const scaledAdultPrice = Math.round(tour.adultPrice * (tourDurationDays / tour.duration));

              const isAlreadyBooked = tour.bookings && tour.bookings.length > 0 && tour.bookings.some((booking: any) => {
                if (booking.status === 'CANCELLED') return false;
                const bStart = new Date(booking.startDate);
                const bEnd = new Date(booking.endDate);
                const currentStart = pickupDate;
                const currentEnd = returnDate || pickupDate;
                return currentStart <= bEnd && currentEnd >= bStart;
              });

              const durationText = `${tourDurationDays.toFixed(1)} Day${tourDurationDays !== 1 ? 's' : ''}`;
              const stopsText = `${itinerary.length} Stops planned`;
              const category = tour.duration <= 1 ? "Local" : "Extended";
              const stops = itinerary.map((item: any) => item.title);

              return (
                <div
                  key={tour.id}
                  className={`bg-gray-100 border rounded-3xl p-6 transition-all ${isSelected ? 'border-green-600/50 shadow-[0_0_30px_rgba(196,240,0,0.05)]' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image */}
                    <div className="relative w-full md:w-[280px] h-[180px] rounded-2xl overflow-hidden shrink-0 border border-gray-200">
                      <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-md text-green-700 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest border border-gray-300">
                        {durationText}
                      </div>
                      <Image src={tour.image} alt={tour.title} fill className="object-cover" unoptimized />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Category: {category}</div>
                        <div className="text-green-700 text-[10px] font-mono tracking-widest">{stopsText}</div>
                      </div>

                      <h3 className="text-xl font-black uppercase tracking-tight mb-4">{tour.title}</h3>

                      {/* Stops Pins */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {stops.map((s: string) => (
                          <div key={s} className="bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[9px] text-gray-600 font-mono">
                            <MapPin size={10} className="text-red-500" /> {s}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 mt-auto">
                        <div>
                          <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-3">Package Inclusions</div>
                          <ul className="space-y-2 text-[10px] font-mono text-gray-600">
                            {inclusions.slice(0, 3).map((inc: string, i: number) => (
                              <li key={i} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></div>
                                <span className="truncate">{inc}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-3">Expedition Upgrades</div>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded text-[9px] font-bold">+ SUV Car</span>
                            <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded text-[9px] font-bold">+ Villa Stay</span>
                            <span className="bg-gray-100 text-gray-500 border border-gray-200 px-2 py-1 rounded text-[9px] font-bold">+ Guide/Valet</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-6 mt-6 border-t border-gray-200">
                    <div>
                      <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-1">Interactive Combined Cost</div>
                      <div className="text-green-700 text-3xl font-black">₹{scaledAdultPrice.toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => setActiveTourId(tour.id)}
                        className="text-[10px] text-gray-600 font-mono tracking-widest underline underline-offset-4 hover:text-green-700 transition-colors"
                      >
                        Itinerary Open
                      </button>
                      <button
                        onClick={() => !isAlreadyBooked && handleBook(tour)}
                        disabled={isAlreadyBooked}
                        className={`w-full font-black uppercase tracking-widest py-5 px-6 rounded-xl transition-all ${isAlreadyBooked
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                          : 'bg-green-600 hover:bg-brand-hover text-black shadow-[0_0_20px_rgba(196,240,0,0.2)]'
                          }`}
                      >
                        {isAlreadyBooked ? 'Booked / Unavailable' : 'Book This Experience'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Panel: Itinerary Ledger */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 sticky top-28">

              <div className="flex items-center gap-2 text-green-700 font-black text-[10px] uppercase tracking-widest mb-4">
                <Compass size={14} /> Active Itinerary Plan
              </div>

              <h2 className="text-xl font-black uppercase tracking-tight mb-2">{activeTour?.title}</h2>
              <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono mb-8 border-b border-gray-200 pb-6">
                <Calendar size={12} /> Duration: {activeTour?.duration} Day{activeTour?.duration > 1 ? 's' : ''} • Guided Private Excursion
              </div>

              <div className="mb-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {(activeTour?.itinerary ? JSON.parse(activeTour.itinerary) : []).map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 mb-6 last:mb-0">
                    <div className="w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center text-[8px] font-black shrink-0 mt-0.5">{item.day}</div>
                    <div>
                      <div className="text-green-700 text-[9px] font-black uppercase tracking-widest mb-1">Day {item.day}: Curated Route</div>
                      <div className="font-bold text-sm mb-3">{item.title}</div>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {activeTour && (() => {
                const tourDurationHours = (pickupDate && returnDate)
                  ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
                  : activeTour.duration * 24;
                const tourDurationDays = tourDurationHours / 24;
                const scaledAdultPrice = Math.round(activeTour.adultPrice * (tourDurationDays / activeTour.duration));
                const scaledChildPrice = Math.round(activeTour.childPrice * (tourDurationDays / activeTour.duration));

                const adultTotal = scaledAdultPrice * adults;
                const childTotal = scaledChildPrice * children;
                const grossTotal = adultTotal + childTotal;

                return (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 font-mono text-[10px] mb-6">
                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2">Tour Cost Breakdown ({tourDurationDays.toFixed(1)} Days)</div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Adults (₹{scaledAdultPrice.toLocaleString()})</label>
                        <select
                          value={adults}
                          onChange={e => setAdults(parseInt(e.target.value))}
                          className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none appearance-none"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Children (₹{scaledChildPrice.toLocaleString()})</label>
                        <select
                          value={children}
                          onChange={e => setChildren(parseInt(e.target.value))}
                          className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none appearance-none"
                        >
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {adults > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{adults} Adult{adults > 1 ? 's' : ''}</span>
                          <span className="text-gray-900 font-bold">₹{adultTotal.toLocaleString()}</span>
                        </div>
                      )}
                      {children > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{children} Child{children > 1 ? 'ren' : ''}</span>
                          <span className="text-gray-900 font-bold">₹{childTotal.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                      <span className="text-gray-900 font-black tracking-widest">Consolidated Booking Price</span>
                      <span className="text-green-700 font-bold text-lg">₹{grossTotal.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-start gap-2 text-[9px] text-gray-500 font-mono">
                <Users size={12} className="shrink-0 text-green-700 mt-0.5" />
                We can customize itineraries for up to 30 people corporate groups.
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
