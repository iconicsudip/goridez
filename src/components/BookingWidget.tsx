'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Loader2, X } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { searchLocation, OSMLocation } from '@/lib/osm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type MainTab = 'CHAUFFEUR' | 'SELF DRIVE' | 'VILLAS' | 'TOURS';
type SubTab = 'LOCAL' | 'ONE WAY' | 'ROUND TRIP';

// ── Inline OSM Location Search Field ─────────────────────────────────────────
// Matches the same style as the booking widget card cells
function LocationField({
  label,
  value,
  onChange,
  placeholder = 'Search city or area...',
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (name: string, loc?: OSMLocation) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<OSMLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value → local query
  const prevValue = useRef(value);
  useEffect(() => {
    if (value !== prevValue.current) {
      setQuery(value);
      prevValue.current = value;
    }
  }, [value]);

  // Debounced OSM search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchLocation(query);
      setResults(data);
      setIsOpen(data.length > 0);
      setIsLoading(false);
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Click outside closes
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (loc: OSMLocation) => {
    const parts = loc.display_name.split(',');
    const name = parts.length > 1
      ? `${parts[0].trim()}, ${parts[1].trim()}`
      : parts[0].trim();
    setQuery(name);
    onChange(name, loc);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)] relative"
    >
      <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-2 text-gray-800">
        <MapPin size={16} className="text-green-600 shrink-0" />
        {readOnly ? (
          <span className="text-sm font-semibold text-gray-400 select-none">
            {value || placeholder}
          </span>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // If user clears the field, reset parent too
              if (!e.target.value) onChange('');
            }}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-semibold outline-none text-gray-900 placeholder-gray-400 min-w-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        )}
        {isLoading ? (
          <Loader2 size={14} className="text-gray-400 shrink-0 animate-spin" />
        ) : query && !readOnly ? (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
            className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {/* OSM Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((loc, idx) => (
            <button
              key={`${loc.place_id}-${idx}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(loc); }}
              className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors group"
            >
              <MapPin size={14} className="text-gray-400 group-hover:text-green-600 mt-0.5 shrink-0 transition-colors" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {loc.display_name.split(',')[0]}
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">
                  {loc.display_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Booking Widget ───────────────────────────────────────────────────────
export default function BookingWidget({
  cities = [],
  counts,
}: {
  cars?: any[];
  villas?: any[];
  tours?: any[];
  cities?: any[];
  counts?: { selfDrive: number; chauffeur: number; taxi: number; tours: number; villas: number };
}) {
  const [mainTab, setMainTab] = useState<MainTab>('CHAUFFEUR');
  const [subTab, setSubTab] = useState<SubTab>('ONE WAY');

  const router = useRouter();
  const { session, updateSession } = useBookingStore();

  const makeTomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; };
  const makePlus4 = () => { const d = new Date(); d.setDate(d.getDate() + 4); d.setHours(10, 0, 0, 0); return d; };

  const [pickupDate, setPickupDate] = useState<Date | null>(makeTomorrow);
  const [returnDate, setReturnDate] = useState<Date | null>(makePlus4);
  const [isMounted, setIsMounted] = useState(false);

  // Location state — stores both display name and OSM data
  const [sourceCity, setSourceCity] = useState('');
  const [sourceLoc, setSourceLoc] = useState<OSMLocation | undefined>(undefined);
  const [destCity, setDestCity] = useState('');
  const [destLoc, setDestLoc] = useState<OSMLocation | undefined>(undefined);
  const [isDifferentDropCity, setIsDifferentDropCity] = useState(false);
  const [destinations, setDestinations] = useState<string[]>(['']);

  useEffect(() => {
    setIsMounted(true);
    if (session?.pickupDate) setPickupDate(new Date(session.pickupDate));
    if (session?.returnDate) setReturnDate(new Date(session.returnDate));
    if (session?.pickupCity) setSourceCity(session.pickupCity);
    if (session?.dropCity) setDestCity(session.dropCity);
  }, []);

  const addDestination = () => {
    if (destinations.length < 3) setDestinations([...destinations, '']);
  };
  const removeDestination = (idx: number) => {
    const d = [...destinations]; d.splice(idx, 1); setDestinations(d);
  };
  const updateDestination = (idx: number, v: string) => {
    const d = [...destinations]; d[idx] = v; setDestinations(d);
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    let stype: any = 'withDriver';
    let route = '/chauffeur';
    let mode: any = 'ONE_WAY';

    if (mainTab === 'SELF DRIVE') { stype = 'selfDrive'; route = '/self-drive'; }
    else if (mainTab === 'VILLAS') { stype = 'villaCar'; route = '/villas'; }
    else if (mainTab === 'TOURS') { stype = 'tours'; route = '/tours'; }
    else {
      if (subTab === 'LOCAL') { stype = 'withDriver'; route = '/chauffeur'; mode = 'LOCAL'; }
      else if (subTab === 'ROUND TRIP') { stype = 'roundTripTaxi'; route = '/taxi'; mode = 'ROUND_TRIP'; }
      else { stype = 'oneWayTaxi'; route = '/taxi'; mode = 'ONE_WAY'; }
    }

    const isRoundTrip = mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP';
    const pickupCityVal = isRoundTrip ? 'Udaipur' : sourceCity;
    const finalDropCity = isRoundTrip
      ? destinations.filter(d => d.trim()).join(',')
      : ((mainTab === 'CHAUFFEUR' && subTab === 'ONE WAY') || (mainTab === 'SELF DRIVE' && isDifferentDropCity))
        ? destCity
        : sourceCity;

    updateSession({
      serviceType: stype,
      pickupDate: (pickupDate ?? makeTomorrow()).toISOString(),
      returnDate: (returnDate ?? makePlus4()).toISOString(),
      driverOption: mainTab === 'CHAUFFEUR',
      pickupCity: pickupCityVal,
      dropCity: finalDropCity,
      bookingMode: mode,
    });

    const params = new URLSearchParams();
    params.set('mode', mode);
    params.set('pickupCity', pickupCityVal);
    if (finalDropCity) params.set('dropCity', finalDropCity);
    if (pickupDate) params.set('pickupDate', pickupDate.toISOString());
    if (returnDate) params.set('returnDate', returnDate.toISOString());

    router.push(`${route}?${params.toString()}`);
  }, [mainTab, subTab, sourceCity, destCity, isDifferentDropCity, destinations, pickupDate, returnDate, updateSession, router]);

  if (!isMounted) return null;

  const showDropCity =
    (mainTab === 'CHAUFFEUR' && (subTab === 'ONE WAY' || subTab === 'ROUND TRIP')) ||
    (mainTab === 'SELF DRIVE' && isDifferentDropCity);

  return (
    <div className="w-full max-w-5xl mx-auto font-body mt-8 z-10 relative text-left">

      {/* ── Main Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex w-full sm:w-max max-w-full overflow-x-auto hide-scrollbar bg-brand-panel/95 backdrop-blur-xl rounded-t-3xl shadow-lg border border-brand-border border-b-0">
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
              onClick={() => { setMainTab(tab); setIsDifferentDropCity(false); }}
              className={`px-6 md:px-10 py-4 text-xs md:text-sm font-black tracking-widest transition-all whitespace-nowrap flex-shrink-0 cursor-pointer ${
                mainTab === tab
                  ? 'bg-brand-gold text-white shadow-md shadow-brand-gold/40'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Main Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-xl border border-brand-border rounded-3xl md:rounded-tl-none p-6 md:p-10 shadow-2xl relative text-gray-900">

        {/* Sub Tabs */}
        {mainTab === 'CHAUFFEUR' && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {(['LOCAL', 'ONE WAY', 'ROUND TRIP'] as SubTab[]).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubTab(sub)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                  subTab === sub
                    ? 'bg-brand-gold text-white border-brand-gold shadow-sm'
                    : 'bg-brand-panel text-gray-700 border-brand-border hover:bg-gray-100 hover:text-gray-950'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  subTab === sub ? 'border-black bg-black' : 'border-gray-400'
                }`}>
                  {subTab === sub && <div className="w-2 h-2 rounded-full bg-brand-gold" />}
                </div>
                {sub === 'LOCAL' && 'Local Rental'}
                {sub === 'ONE WAY' && 'One Way'}
                {sub === 'ROUND TRIP' && 'Round Trip'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSearch} className="w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ── Source / Pickup Location ──────────────────────────── */}
            {mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP' ? (
              <LocationField
                label="Source City"
                value="Udaipur, Rajasthan"
                onChange={() => {}}
                readOnly
              />
            ) : (
              <LocationField
                label={showDropCity ? 'Source City' : 'Your City / Location'}
                value={sourceCity}
                onChange={(name, loc) => { setSourceCity(name); setSourceLoc(loc); }}
                placeholder="Search city or area..."
              />
            )}

            {/* ── Destination / Drop Location ───────────────────────── */}
            {showDropCity && mainTab === 'CHAUFFEUR' && subTab === 'ROUND TRIP' ? (
              <>
                {destinations.map((dest, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative pr-12"
                  >
                    <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
                      Destination City
                    </label>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-600 shrink-0" />
                      <input
                        type="text"
                        value={dest}
                        onChange={(e) => updateDestination(idx, e.target.value)}
                        placeholder="E.g., Jaipur, Jodhpur..."
                        className="w-full bg-transparent text-sm font-semibold outline-none placeholder-gray-400 text-gray-900"
                        required
                      />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {idx === destinations.length - 1 && destinations.length < 3 ? (
                        <button type="button" onClick={addDestination} className="text-brand-gold hover:text-[#8dbb00] p-1">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
                          </svg>
                        </button>
                      ) : (idx > 0 || destinations.length > 1) ? (
                        <button type="button" onClick={() => removeDestination(idx)} className="text-red-400 hover:text-red-600 p-1">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/><path d="M8 12h8"/>
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </>
            ) : showDropCity ? (
              <LocationField
                label="Destination City"
                value={destCity}
                onChange={(name, loc) => { setDestCity(name); setDestLoc(loc); }}
                placeholder="Search destination..."
              />
            ) : null}

            {/* ── Pickup Date ───────────────────────────────────────── */}
            <div className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
                Pickup Date – Time
              </label>
              <div className="flex items-center gap-2 text-gray-800">
                <Calendar size={16} className="text-gray-400 shrink-0" />
                <DatePicker
                  selected={pickupDate}
                  onChange={(d: Date | null) => setPickupDate(d)}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={30}
                  dateFormat="dd MMM yyyy - h:mm aa"
                  placeholderText="Pick date & time"
                  className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer placeholder-gray-400 text-gray-900"
                  wrapperClassName="w-full"
                />
              </div>
            </div>

            {/* ── Return Date ───────────────────────────────────────── */}
            {!(mainTab === 'CHAUFFEUR' && subTab === 'ONE WAY') && (
              <div className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
                  Drop Date
                </label>
                <div className="flex items-center gap-2 text-gray-800">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <DatePicker
                    selected={returnDate}
                    onChange={(d: Date | null) => setReturnDate(d)}
                    showTimeSelect
                    timeFormat="h:mm aa"
                    timeIntervals={30}
                    dateFormat="dd MMM yyyy - h:mm aa"
                    placeholderText="Pick return date"
                    className="w-full bg-transparent text-sm font-semibold outline-none cursor-pointer placeholder-gray-400 text-gray-900"
                    wrapperClassName="w-full"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Search Button */}
          <div className="w-full flex justify-center mt-8">
            <button
              type="submit"
              className="w-full md:w-[320px] bg-brand-gold hover:bg-[#8dbb00] text-white font-bold tracking-widest uppercase text-base px-8 py-3.5 rounded-xl transition-all shadow-md shadow-brand-gold/30 border border-brand-gold cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Self Drive: drop in different city */}
        {mainTab === 'SELF DRIVE' && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setIsDifferentDropCity(!isDifferentDropCity)}
              className="text-sm font-semibold text-brand-gold hover:text-[#8dbb00] transition-colors cursor-pointer hover:underline underline-offset-2"
            >
              {isDifferentDropCity ? 'Same drop-off city?' : 'Drop in a different city?'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
