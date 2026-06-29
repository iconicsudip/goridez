'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type MainTab = 'CHAUFFEUR' | 'SELF DRIVE' | 'VILLAS' | 'TOURS';
type SubTab = 'LOCAL' | 'ONE WAY' | 'ROUND TRIP';

export default function BookingWidget({ cities = [], counts }: { cars?: any[], villas?: any[], tours?: any[], cities?: any[], counts?: { selfDrive: number, chauffeur: number, taxi: number, tours: number, villas: number } }) {
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
  const [destinations, setDestinations] = useState<string[]>(['']);

  useMemo(() => {
    if (cities.length > 0) {
      if (!selectedCity) setSelectedCity(cities[0].name);
      if (!dropCity && cities.length > 1) setDropCity(cities[1].name);
    }
  }, [cities, selectedCity, dropCity]);

  const addDestination = () => {
    if (destinations.length < 3) {
      setDestinations([...destinations, '']);
    }
  };

  const removeDestination = (idx: number) => {
    const newDests = [...destinations];
    newDests.splice(idx, 1);
    setDestinations(newDests);
  };

  const updateDestination = (idx: number, value: string) => {
    const newDests = [...destinations];
    newDests[idx] = value;
    setDestinations(newDests);
  };

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
    const finalDropCity = (mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP') 
      ? destinations.filter(d => d.trim() !== '').join(',')
      : ((mainTab === 'CHAUFFEUR' && subTab === 'ONE WAY') || (mainTab === 'SELF DRIVE' && isDifferentDropCity)) 
        ? dropCity 
        : selectedCity;

    if (pickupDate && returnDate) {
      updateSession({
        serviceType: stype,
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate.toISOString(),
        driverOption: mainTab === 'CHAUFFEUR',
        pickupCity: (mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP') ? 'Udaipur, Rajasthan' : selectedCity,
        dropCity: finalDropCity,
        bookingMode: mode
      });
    }

    const params = new URLSearchParams();
    if (mode) params.set('mode', mode);
    if (mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP') {
      params.set('pickupCity', 'Udaipur, Rajasthan');
    } else if (selectedCity) {
      params.set('pickupCity', selectedCity);
    }
    if (finalDropCity) params.set('dropCity', finalDropCity);
    
    if (pickupDate) params.set('pickupDate', pickupDate.toISOString());
    if (returnDate) params.set('returnDate', returnDate.toISOString());

    router.push(`${route}?${params.toString()}`);
  };

  if (!isMounted) return null;

  const showDropCity = (mainTab === 'CHAUFFEUR' && (subTab === 'ONE WAY' || subTab === 'ROUND TRIP')) || (mainTab === 'SELF DRIVE' && isDifferentDropCity);

  return (
    <div className="w-full max-w-5xl mx-auto font-body mt-8 z-10 relative text-left">

      {/* Floating Main Tabs */}
      <div className="flex w-full sm:w-max max-w-full overflow-x-auto hide-scrollbar bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-lg border border-gray-300 border-b-0">
        {(['CHAUFFEUR', 'SELF DRIVE', 'VILLAS', 'TOURS'] as MainTab[]).map((tab) => {
          if (counts) {
            if (tab === 'SELF DRIVE' && counts.selfDrive === 0) return null;
            if (tab === 'VILLAS' && counts.villas === 0) return null;
            if (tab === 'TOURS' && counts.tours === 0) return null;
            if (tab === 'CHAUFFEUR' && counts.chauffeur === 0 && counts.taxi === 0) return null;
          }
          return (
            <button
              key={tab}
              onClick={() => {
                setMainTab(tab);
                setIsDifferentDropCity(false); // Reset when switching tabs
              }}
              className={`px-6 md:px-10 py-4 text-xs md:text-sm font-black tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${mainTab === tab
                ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Card */}
      <div className="bg-white/95 backdrop-blur-xl border border-gray-300 rounded-3xl md:rounded-tl-none p-6 md:p-10 shadow-2xl relative">

        {/* Sub Tabs Pill */}
        {mainTab === 'CHAUFFEUR' && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {(['LOCAL', 'ONE WAY', 'ROUND TRIP'] as SubTab[]).map(sub => (
              <button
                key={sub}
                onClick={() => setSubTab(sub)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 border ${subTab === sub
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-[#f0f4f8] text-green-700 border-transparent hover:bg-[#e2e8f0]'
                  }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${subTab === sub ? 'border-white' : 'border-green-600 bg-white'}`}>
                  {subTab === sub && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                {sub === 'LOCAL' && 'Local Rental'}
                {sub === 'ONE WAY' && 'One Way'}
                {sub === 'ROUND TRIP' && 'Round Trip'}
              </button>
            ))}
          </div>
        )}

        {/* Grid Form Layout */}
        <form onSubmit={handleSearch} className="w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Location Field 1 */}
            <div className="bg-white border border-gray-200 hover:border-green-400 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <label className="text-xs text-gray-500 mb-2">{showDropCity ? 'Source City' : 'Select your city'}</label>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={16} className="text-gray-400" />
                {mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP' ? (
                  <input
                    type="text"
                    readOnly
                    value="Udaipur, Rajasthan"
                    className="w-full bg-transparent text-sm font-semibold outline-none cursor-not-allowed truncate text-gray-500"
                  />
                ) : (
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none appearance-none cursor-pointer truncate"
                  >
                    {cities && cities.map((city: any) => (
                      <option key={city.id} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Location Field 2 (Drop City / Destinations) */}
            {showDropCity && mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP' ? (
              <>
                {destinations.map((dest, idx) => (
                  <div key={idx} className="bg-white border border-gray-200 hover:border-green-400 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative pr-12">
                    <label className="text-xs text-gray-500 mb-2">Destination city</label>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin size={16} className="text-gray-400" />
                      <input
                        type="text"
                        value={dest}
                        onChange={(e) => updateDestination(idx, e.target.value)}
                        placeholder="E.g., Jaipur, Mumbai, Delhi..."
                        className="w-full bg-transparent text-sm font-semibold outline-none truncate placeholder-gray-400"
                        required
                      />
                    </div>
                    {/* Add / Remove buttons */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {idx === destinations.length - 1 && destinations.length < 3 ? (
                        <button type="button" onClick={addDestination} className="text-green-600 hover:text-green-700 p-1 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                        </button>
                      ) : idx > 0 || destinations.length > 1 ? (
                        <button type="button" onClick={() => removeDestination(idx)} className="text-red-500 hover:text-red-600 p-1 flex items-center justify-center">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </>
            ) : showDropCity ? (
              <div className="bg-white border border-gray-200 hover:border-green-400 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <label className="text-xs text-gray-500 mb-2">Destination city</label>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  <select
                    value={dropCity}
                    onChange={(e) => setDropCity(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold outline-none appearance-none cursor-pointer truncate"
                  >
                    {cities && cities.map((city: any) => (
                      <option key={city.id} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {/* Pick Up Date */}
            <div className="bg-white border border-gray-200 hover:border-green-400 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <label className="text-xs text-gray-500 mb-2">Pickup Date - Time</label>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                <DatePicker
                  selected={pickupDate}
                  onChange={(date: Date | null) => setPickupDate(date)}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={30}
                  dateFormat="dd MMM yyyy - h:mm aa"
                  placeholderText="Enter Date & Time"
                  className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer placeholder-gray-400 truncate"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            {/* Drop-off Date */}
            {!(mainTab === 'CHAUFFEUR' && subTab === 'ONE WAY') && (
              <div className="bg-white border border-gray-200 hover:border-green-400 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <label className="text-xs text-gray-500 mb-2">Drop Date</label>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-gray-400" />
                  <DatePicker
                    selected={returnDate}
                    onChange={(date: Date | null) => setReturnDate(date)}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={30}
                    dateFormat="dd MMM yyyy"
                    placeholderText="Enter Date"
                    className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer placeholder-gray-400 truncate"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            )}

          </div> {/* End Grid */}

          {/* Search Button */}
          <div className="w-full flex justify-center mt-8">
            <button type="submit" className="w-full md:w-[320px] bg-green-600 hover:bg-green-700 text-white font-bold tracking-widest uppercase text-[16px] px-8 py-3.5 rounded-xl transition-all shadow-md">
              Search
            </button>
          </div>

        </form>

        {/* Drop in different city toggle for SELF DRIVE */}
        {mainTab === 'SELF DRIVE' && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setIsDifferentDropCity(!isDifferentDropCity)}
              className="text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
            >
              {isDifferentDropCity ? "Same drop off city?" : "Drop in different city?"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
