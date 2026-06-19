'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type MainTab = 'CHAUFFEUR' | 'SELF DRIVE' | 'VILLAS' | 'TOURS';
type SubTab = 'LOCAL' | 'ONE WAY' | 'ROUND TRIP';

export default function BookingWidget({ cities = [] }: { cars?: any[], villas?: any[], tours?: any[], cities?: any[] }) {
  const [mainTab, setMainTab] = useState<MainTab>('CHAUFFEUR');
  const [subTab, setSubTab] = useState<SubTab>('LOCAL');

  // Shared state
  const router = useRouter();
  const { session, updateSession } = useBookingStore();
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() + 1))); // Tomorrow
  const [returnDate, setReturnDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() + 4))); // 3 days after tomorrow
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (session?.pickupDate) setPickupDate(new Date(session.pickupDate));
    if (session?.returnDate) setReturnDate(new Date(session.returnDate));
  }, [session?.pickupDate, session?.returnDate]);

  // Location State
  const [selectedCity, setSelectedCity] = useState('');
  const [dropCity, setDropCity] = useState('');
  const [isDifferentDropCity, setIsDifferentDropCity] = useState(false);

  useMemo(() => {
    if (cities.length > 0) {
      if (!selectedCity) setSelectedCity(cities[0].name);
      if (!dropCity && cities.length > 1) setDropCity(cities[1].name);
    }
  }, [cities, selectedCity, dropCity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let stype: any = 'withDriver';
    let route = `/chauffeur`;
    let mode: any = 'ONE_WAY';

    if (mainTab === 'SELF DRIVE') {
      stype = 'selfDrive';
      route = `/self-drive`;
    } else if (mainTab === 'VILLAS') {
      stype = 'villaCar';
      route = '/villas';
    } else if (mainTab === 'TOURS') {
      stype = 'tours';
      route = '/tours';
    } else if (mainTab === 'CHAUFFEUR') {
      if (subTab === 'LOCAL') {
        stype = 'withDriver';
        route = `/chauffeur`;
      } else if (subTab === 'ROUND TRIP') {
        stype = 'oneWayTaxi';
        route = '/taxi';
        mode = 'ROUND_TRIP';
      } else {
        stype = 'oneWayTaxi';
        route = '/taxi';
        mode = 'ONE_WAY';
      }
    }

    // Save the search preferences
    if (pickupDate && returnDate) {
      updateSession({
        serviceType: stype,
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate.toISOString(),
        driverOption: mainTab === 'CHAUFFEUR',
        pickupCity: selectedCity,
        dropCity: ((mainTab === 'CHAUFFEUR' && (subTab === 'ONE WAY' || subTab === 'ROUND TRIP')) || (mainTab === 'SELF DRIVE' && isDifferentDropCity)) ? dropCity : selectedCity,
        bookingMode: mode
      });
    }

    router.push(route);
  };

  if (!isMounted) return null;

  const showDropCity = (mainTab === 'CHAUFFEUR' && (subTab === 'ONE WAY' || subTab === 'ROUND TRIP')) || (mainTab === 'SELF DRIVE' && isDifferentDropCity);

  return (
    <div className="w-full max-w-5xl mx-auto font-body mt-8 z-10 relative">

      {/* Floating Main Tabs */}
      <div className="flex justify-center md:justify-start mx-auto w-max bg-white/5 backdrop-blur-md rounded-t-2xl overflow-hidden shadow-lg border border-white/10 border-b-0">
        {(['CHAUFFEUR', 'SELF DRIVE', 'VILLAS', 'TOURS'] as MainTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setMainTab(tab);
              setIsDifferentDropCity(false); // Reset when switching tabs
            }}
            className={`px-6 md:px-10 py-4 text-xs md:text-sm font-black tracking-widest transition-all ${mainTab === tab
              ? 'bg-brand-neon text-black shadow-[0_0_20px_rgba(196,240,0,0.2)]'
              : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-3xl md:rounded-tl-none p-6 md:p-10 shadow-2xl relative">

        {/* Sub Tabs Pill (Only for CHAUFFEUR) */}
        {mainTab === 'CHAUFFEUR' && (
          <div className="flex justify-center mb-10">
            <div className="bg-[#161616] rounded-full p-1.5 flex gap-1 border border-white/5">
              {(['ONE WAY', 'ROUND TRIP', 'LOCAL'] as SubTab[]).map(sub => (
                <button
                  key={sub}
                  onClick={() => setSubTab(sub)}
                  className={`px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black tracking-widest transition-all flex items-center gap-2 ${subTab === sub
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/50 hover:text-white'
                    }`}
                >
                  {sub === 'ONE WAY' && <ArrowRightLeft size={14} className={subTab === sub ? 'text-brand-neon' : ''} />}
                  {sub === 'ROUND TRIP' && <ArrowRightLeft size={14} className={subTab === sub ? 'text-brand-neon' : ''} />}
                  {sub === 'LOCAL' && <MapPin size={14} className={subTab === sub ? 'text-brand-neon' : ''} />}
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal Form Layout */}
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-4 bg-[#111111] p-3 md:p-4 rounded-2xl md:rounded-full border border-white/5 w-full relative">

          {/* Location Field 1 */}
          <div className="flex-1 w-full flex flex-col px-4 py-2 lg:border-r border-white/10">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1">
              <MapPin size={12} className="text-brand-neon" />
              {showDropCity ? 'Pickup City' : 'Select your city'}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-white text-sm font-bold outline-none appearance-none cursor-pointer truncate"
            >
              {cities && cities.length > 0 ? (
                cities.map((city: any) => (
                  <option key={city.id} value={city.name} className="bg-[#111111]">{city.name}</option>
                ))
              ) : (
                <option value="Udaipur" className="bg-[#111111]">Udaipur</option>
              )}
            </select>
          </div>

          {/* Location Field 2 (Drop City) */}
          {showDropCity && (
            <div className="flex-1 w-full flex flex-col px-4 py-2 lg:border-r border-white/10">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1">
                <MapPin size={12} className="text-brand-neon" /> Drop City
              </label>
              <select
                value={dropCity}
                onChange={(e) => setDropCity(e.target.value)}
                className="w-full bg-transparent text-white text-sm font-bold outline-none appearance-none cursor-pointer truncate"
              >
                {cities && cities.length > 0 ? (
                  cities.map((city: any) => (
                    <option key={city.id} value={city.name} className="bg-[#111111]">{city.name}</option>
                  ))
                ) : (
                  <option value="Jaipur" className="bg-[#111111]">Jaipur</option>
                )}
              </select>
            </div>
          )}

          {/* Pick Up Date */}
          <div className="flex-1 w-full flex flex-col px-4 py-2 lg:border-r border-white/10">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1">
              <Calendar size={12} className="text-brand-neon" /> Pick Up Date
            </label>
            <DatePicker
              selected={pickupDate}
              onChange={(date: Date | null) => setPickupDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={30}
              dateFormat="MMM d, yyyy h:mm aa"
              placeholderText="Enter Date & Time"
              className="w-full bg-transparent text-white text-sm font-bold outline-none cursor-pointer placeholder-white/30 truncate"
              wrapperClassName="w-full"
            />
          </div>

          {/* Drop-off Date */}
          {!(mainTab === 'CHAUFFEUR' && subTab === 'ONE WAY') && (
            <div className="flex-1 w-full flex flex-col px-4 py-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-brand-neon" /> Drop-off Date
              </label>
              <DatePicker
                selected={returnDate}
                onChange={(date: Date | null) => setReturnDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="MMM d, yyyy h:mm aa"
                placeholderText="Enter Date & Time"
                className="w-full bg-transparent text-white text-sm font-bold outline-none cursor-pointer placeholder-white/30 truncate"
                wrapperClassName="w-full"
              />
            </div>
          )}

          {/* Search Button */}
          <div className="px-2 w-full lg:w-auto mt-4 lg:mt-0">
            <button type="submit" className="w-full lg:w-auto bg-brand-neon hover:bg-brand-hover text-black font-black text-xs tracking-widest px-8 py-4 rounded-xl md:rounded-full transition-all shadow-[0_0_20px_rgba(196,240,0,0.2)] flex items-center justify-center gap-2 uppercase">
              <Search size={16} strokeWidth={3} /> Search
            </button>
          </div>

        </form>

        {/* Drop in different city toggle for SELF DRIVE */}
        {mainTab === 'SELF DRIVE' && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setIsDifferentDropCity(!isDifferentDropCity)}
              className="text-sm font-black text-brand-neon hover:text-white transition-colors"
            >
              {isDifferentDropCity ? "Same drop off city?" : "Drop in different city?"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
