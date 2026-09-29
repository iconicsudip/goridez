'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Loader2, X, Sparkles } from 'lucide-react';
import { useBookingStore } from '@/store/useBookingStore';
import { searchLocation, OSMLocation } from '@/lib/osm';
import AirportLocalitySearch, { AIRPORT_ZONE_ID } from '@/components/AirportLocalitySearch';
import LocationField from '@/components/LocationField';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';

type MainTab = 'SELF DRIVE' | 'TAXI';
type SubTab = 'ROUND TRIP' | 'AIRPORT TRANSFER';


export default function BookingWidget({
  cities = [],
  airportZones = [],
  airportName = 'the Airport',
  counts,
}: {
  cars?: any[];
  villas?: any[];
  tours?: any[];
  cities?: any[];
  airportZones?: any[];
  airportName?: string;
  counts?: { selfDrive: number; chauffeur: number; taxi: number; tours: number; villas: number };
}) {
  const [mainTab, setMainTab] = useState<MainTab>('SELF DRIVE');
  const [subTab, setSubTab] = useState<SubTab>('ROUND TRIP');

  const router = useRouter();
  const { session, updateSession } = useBookingStore();

  const makeTomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); return d; };
  const makePickupPlus12h = (pickup: Date) => new Date(pickup.getTime() + 12 * 60 * 60 * 1000);

  const [pickupDate, setPickupDate] = useState<Date | null>(makeTomorrow);
  const [returnDate, setReturnDate] = useState<Date | null>(() => makePickupPlus12h(makeTomorrow()));
  const [isMounted, setIsMounted] = useState(false);

  // Location state — stores both display name and OSM data
  const [sourceCity, setSourceCity] = useState('');
  const [sourceLoc, setSourceLoc] = useState<OSMLocation | undefined>(undefined);
  const [destCity, setDestCity] = useState('');
  const [destLoc, setDestLoc] = useState<OSMLocation | undefined>(undefined);
  const [isDifferentDropCity, setIsDifferentDropCity] = useState(false);
  const [destinations, setDestinations] = useState<string[]>(['']);

  // Airport Transfer: symmetric pickup/drop pair, mirrors /taxi exactly —
  // exactly one side must be the airport, the other a zone-constrained locality.
  const [atPickup, setAtPickup] = useState<{ name: string; zoneId: string }>({ name: '', zoneId: '' });
  const [atDrop, setAtDrop] = useState<{ name: string; zoneId: string }>({ name: '', zoneId: '' });
  const atPickupIsAirport = atPickup.zoneId === AIRPORT_ZONE_ID;
  const atDropIsAirport = atDrop.zoneId === AIRPORT_ZONE_ID;

  // Time filters are handled natively by Ant Design DatePicker's disabledTime prop

  const handlePickupDateChange = (d: Date | null) => {
    if (!d) {
      setPickupDate(null);
      return;
    }
    const now = new Date();
    const adjusted = d.getTime() < now.getTime() ? now : d;
    setPickupDate(adjusted);
    updateSession({ pickupDate: adjusted.toISOString() });

    const newReturn = new Date(adjusted.getTime() + 12 * 60 * 60 * 1000); // 12 hours range in IST
    setReturnDate(newReturn);
    updateSession({ returnDate: newReturn.toISOString() });
  };

  const handleReturnDateChange = (d: Date | null) => {
    if (!d) {
      setReturnDate(null);
      return;
    }
    const minTime = pickupDate ? pickupDate.getTime() : Date.now();
    const adjusted = d.getTime() <= minTime ? new Date(minTime + 2 * 60 * 60 * 1000) : d;
    setReturnDate(adjusted);
    updateSession({ returnDate: adjusted.toISOString() });
  };

  useEffect(() => {
    setIsMounted(true);
    let loadedPickup = session?.pickupDate ? new Date(session.pickupDate) : null;
    let loadedReturn = session?.returnDate ? new Date(session.returnDate) : null;
    const now = new Date();

    if (loadedPickup && loadedPickup.getTime() < now.getTime()) {
      loadedPickup = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    }
    if (loadedReturn && loadedPickup && loadedReturn.getTime() <= loadedPickup.getTime()) {
      loadedReturn = makePickupPlus12h(loadedPickup);
    }

    if (loadedPickup) setPickupDate(loadedPickup);
    if (loadedReturn) setReturnDate(loadedReturn);
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
    let mode: any = 'LOCAL';

    if (mainTab === 'SELF DRIVE') { stype = 'selfDrive'; route = '/self-drive'; }
    else {
      if (subTab === 'ROUND TRIP') { stype = 'roundTripTaxi'; route = '/taxi'; mode = 'ROUND_TRIP'; }
      else { stype = 'airportTransfer'; route = '/taxi'; mode = 'AIRPORT_TRANSFER'; }
    }

    const isAirportTransfer = mainTab === 'TAXI' && subTab === 'AIRPORT TRANSFER';
    const isRoundTrip = mainTab === 'TAXI' && subTab === 'ROUND TRIP';
    const pickupCityVal = isRoundTrip ? 'Udaipur' : sourceCity;
    const finalDropCity = isRoundTrip
      ? destinations.filter(d => d.trim()).join('|')
      : (mainTab === 'SELF DRIVE' && isDifferentDropCity)
        ? destCity
        : sourceCity;

    updateSession({
      serviceType: stype,
      pickupDate: (pickupDate ?? makeTomorrow()).toISOString(),
      returnDate: isAirportTransfer ? null : (returnDate ?? makePickupPlus12h(pickupDate ?? makeTomorrow())).toISOString(),
      driverOption: mainTab === 'TAXI',
      pickupCity: pickupCityVal,
      dropCity: finalDropCity,
      bookingMode: mode,
    });

    const params = new URLSearchParams();
    params.set('mode', mode);
    if (pickupDate) params.set('pickupDate', pickupDate.toISOString());

    if (isAirportTransfer) {
      // Carry the Pickup/Drop pair picked here straight through to /taxi,
      // which owns pricing for the selected zone/category.
      const bothValid = atPickup.zoneId && atDrop.zoneId && atPickupIsAirport !== atDropIsAirport;
      if (bothValid) {
        params.set('atPickupName', atPickup.name);
        params.set('atPickupZoneId', atPickup.zoneId);
        params.set('atDropName', atDrop.name);
        params.set('atDropZoneId', atDrop.zoneId);
      }
    } else {
      params.set('pickupCity', pickupCityVal);
      if (finalDropCity) params.set('dropCity', finalDropCity);
      if (returnDate) params.set('returnDate', returnDate.toISOString());
    }

    router.push(`${route}?${params.toString()}`);
  }, [mainTab, subTab, sourceCity, destCity, isDifferentDropCity, destinations, pickupDate, returnDate, atPickup, atDrop, atPickupIsAirport, atDropIsAirport, updateSession, router]);

  if (!isMounted) return null;

  const isAirportTransfer = mainTab === 'TAXI' && subTab === 'AIRPORT TRANSFER';
  const showDropCity =
    (mainTab === 'TAXI' && subTab === 'ROUND TRIP') ||
    (mainTab === 'SELF DRIVE' && isDifferentDropCity);
  // The 3-column grid only divides evenly when the date field's span matches
  // how many location fields sit ahead of it — 1 field (default self-drive)
  // needs a 2-column date to fill the row; 2 fields (round trip destination,
  // airport pickup/drop) need a 1-column date so all three tiles land evenly
  // in a single row instead of wrapping with empty gaps at wide viewports.
  const locationFieldCount = isAirportTransfer ? 2 : showDropCity ? 1 + destinations.length : 1;
  const dateSpansTwo = locationFieldCount === 1;

  return (
    <div className="w-full max-w-5xl mx-auto font-body z-10 relative text-left">

      {/* ── Floating Main Tabs Switcher ────────────────────────────────────── */}
      <div className="flex justify-center -mb-5 relative z-20">
        <div className="inline-flex p-1.5 bg-[#170501]/95 backdrop-blur-2xl border border-[#C89D5C]/50 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.5)] gap-1.5">
          {(['SELF DRIVE', 'TAXI'] as MainTab[]).map((tab) => {
            if (counts) {
              if (tab === 'SELF DRIVE' && counts.selfDrive === 0) return null;
              if (tab === 'TAXI' && counts.chauffeur === 0 && counts.taxi === 0) return null;
            }
            const isActive = mainTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => { 
                  setMainTab(tab); 
                  setIsDifferentDropCity(false);
                  if (tab === 'TAXI') setSubTab('ROUND TRIP');
                }}
                className={`px-8 sm:px-11 py-3 text-xs font-bold tracking-[0.2em] uppercase rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#551A0C] text-[#DFB574] border border-[#DFB574]/60 shadow-[0_4px_18px_rgba(200,157,92,0.35)]'
                    : 'text-[#FAF6F0]/75 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#DFB574]" />}
                <span>{tab}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Console Card ─────────────────────────────────────────────── */}
      <div className="card-luxury bg-[#FEFBF8]/98 backdrop-blur-2xl border border-[#E7DFD5] ring-1 ring-[#C89D5C]/20 rounded-3xl p-6 sm:p-9 pt-10 md:pt-11 shadow-[0_30px_90px_-20px_rgba(37,9,3,0.35)] relative text-[#250903]">
        {/* Decorative Top Accent Hairline */}
        <div className="absolute top-0 inset-x-12 h-[2px] bg-gradient-to-r from-transparent via-[#C89D5C]/50 to-transparent" />

        {/* Sub Tabs */}
        {mainTab === 'TAXI' && (
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-6 pt-1">
            {(['ROUND TRIP', 'AIRPORT TRANSFER'] as SubTab[]).map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSubTab(sub)}
                className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-wider transition-all flex items-center gap-2 border cursor-pointer ${
                  subTab === sub
                    ? 'bg-[#551A0C] text-[#DFB574] border-[#DFB574]/60 shadow-sm'
                    : 'bg-[#FAF6F0] text-[#551A0C]/80 border-[#E7DFD5] hover:border-[#C89D5C]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${subTab === sub ? 'bg-[#DFB574]' : 'bg-[#C89D5C]/50'}`} />
                {sub === 'ROUND TRIP' && 'Round Trip Journey'}
                {sub === 'AIRPORT TRANSFER' && 'Airport Chauffeur Transfer'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSearch} className="w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ── Source / Pickup Location ──────────────────────────── */}
            {isAirportTransfer ? null : mainTab === 'TAXI' && subTab === 'ROUND TRIP' ? (
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

            {isAirportTransfer && (
              <AirportLocalitySearch
                label="Pickup Location"
                zones={airportZones}
                value={atPickup.name}
                airportLabel={airportName}
                mode={atDropIsAirport ? 'LOCALITY_ONLY' : atDrop.zoneId ? 'AIRPORT_ONLY' : 'ANY'}
                onChange={(locality, zoneId) => {
                  setAtPickup({ name: locality, zoneId });
                  const pickupIsAirport = zoneId === AIRPORT_ZONE_ID;
                  if (atDrop.zoneId && (atDrop.zoneId === AIRPORT_ZONE_ID) === pickupIsAirport) {
                    setAtDrop({ name: '', zoneId: '' });
                  }
                }}
                placeholder={`Search ${airportName} or your area...`}
              />
            )}

            {isAirportTransfer && (
              <AirportLocalitySearch
                label="Drop Location"
                zones={airportZones}
                value={atDrop.name}
                airportLabel={airportName}
                mode={atPickupIsAirport ? 'LOCALITY_ONLY' : atPickup.zoneId ? 'AIRPORT_ONLY' : 'ANY'}
                onChange={(locality, zoneId) => {
                  setAtDrop({ name: locality, zoneId });
                  const dropIsAirport = zoneId === AIRPORT_ZONE_ID;
                  if (atPickup.zoneId && (atPickup.zoneId === AIRPORT_ZONE_ID) === dropIsAirport) {
                    setAtPickup({ name: '', zoneId: '' });
                  }
                }}
                placeholder={`Search ${airportName} or your area...`}
              />
            )}

            {/* ── Destination / Drop Location ───────────────────────── */}
            {showDropCity && mainTab === 'TAXI' && subTab === 'ROUND TRIP' ? (
              <>
                {destinations.map((dest, idx) => {
                  const rightBtn = (
                    <div className="flex items-center gap-1">
                      {idx === destinations.length - 1 && destinations.length < 3 ? (
                        <button type="button" onClick={addDestination} className="text-brand-gold hover:text-brand-gold-hover p-1 bg-white rounded-full transition-transform active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                      ) : (idx > 0 || destinations.length > 1) ? (
                        <button type="button" onClick={() => removeDestination(idx)} className="text-red-400 hover:text-red-600 p-1 bg-white rounded-full transition-transform active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                      ) : null}
                    </div>
                  );
                  return (
                    <LocationField
                      key={idx}
                      label={`Destination City ${idx > 0 ? idx + 1 : ''}`}
                      value={dest}
                      onChange={(name) => updateDestination(idx, name)}
                      placeholder="Search destination..."
                      searchAnywhere={true}
                      rightElement={rightBtn}
                    />
                  );
                })}
              </>
            ) : showDropCity ? (
              <LocationField
                label="Destination City"
                value={destCity}
                onChange={(name, loc) => { setDestCity(name); setDestLoc(loc); }}
                placeholder="Search destination..."
                searchAnywhere={true}
              />
            ) : null}

            {/* ── Travel Date(s) ───────────────────────────────────────── */}
            <div className={`bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] focus-within:border-[#C89D5C] focus-within:ring-2 focus-within:ring-[#C89D5C]/20 transition-all rounded-2xl flex flex-col shadow-xs group ${dateSpansTwo ? 'p-3.5 md:col-span-2' : 'p-3.5'}`}>
              <label className="text-[10px] text-[#8C6D53] mb-1.5 font-bold uppercase tracking-[0.2em] select-none">
                {isAirportTransfer ? 'Transfer Date & Time (Required)' : 'Travel Date Range (Required)'}
              </label>
              <div className="flex items-center gap-2.5 text-[#250903] w-full">
                <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shrink-0 group-focus-within:border-[#C89D5C]/70 group-focus-within:bg-[#551A0C]/5 transition-colors">
                  <Calendar size={15} />
                </div>
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#551A0C',
                      borderRadius: 10,
                      fontSize: 13,
                    },
                    components: {
                      DatePicker: {
                        cellWidth: 32,
                        cellHeight: 22,
                        timeColumnWidth: 50,
                        timeCellHeight: 22,
                      },
                    },
                  }}
                >
                  {isAirportTransfer ? (
                    <DatePicker
                      showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                      format="DD MMM, h:mm a"
                      value={pickupDate ? dayjs(pickupDate) : null}
                      onChange={(date) => handlePickupDateChange(date ? date.toDate() : null)}
                      placeholder="Transfer Date & Time"
                      variant="borderless"
                      className="w-full text-sm font-bold cursor-pointer text-[#250903] !p-0"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                      disabledTime={(current) => {
                        if (current && current.isSame(dayjs(), 'day')) {
                          const now = dayjs();
                          return {
                            disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
                            disabledMinutes: (selectedHour) => {
                              if (selectedHour === now.hour()) {
                                return Array.from({ length: now.minute() }, (_, i) => i);
                              }
                              return [];
                            }
                          };
                        }
                        return {};
                      }}
                    />
                  ) : (
                  <DatePicker.RangePicker
                    showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                    format="DD MMM, h:mm a"
                    value={[pickupDate ? dayjs(pickupDate) : null, returnDate ? dayjs(returnDate) : null]}
                    onChange={(dates) => {
                      if (dates && dates[0]) {
                        const start = dates[0].toDate();
                        let end = dates[1] ? dates[1].toDate() : new Date(start.getTime() + 12 * 60 * 60 * 1000);
                        if ((end.getTime() - start.getTime()) < 12 * 60 * 60 * 1000) {
                          end = new Date(start.getTime() + 12 * 60 * 60 * 1000);
                        }
                        handlePickupDateChange(start);
                        handleReturnDateChange(end);
                      } else {
                        handlePickupDateChange(null);
                        handleReturnDateChange(null);
                      }
                    }}
                    placeholder={['Pickup Date & Time', 'Return Date & Time']}
                    variant="borderless"
                    className="w-full text-sm font-bold cursor-pointer text-[#250903] !p-0"
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    disabledTime={(current, type) => {
                      if (type === 'start') {
                        if (current && current.isSame(dayjs(), 'day')) {
                          const now = dayjs();
                          return {
                            disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
                            disabledMinutes: (selectedHour) => {
                              if (selectedHour === now.hour()) {
                                return Array.from({ length: now.minute() }, (_, i) => i);
                              }
                              return [];
                            }
                          };
                        }
                      } else if (type === 'end') {
                        if (current && pickupDate && current.isSame(dayjs(pickupDate), 'day')) {
                          const p = dayjs(pickupDate);
                          return {
                            disabledHours: () => Array.from({ length: p.hour() }, (_, i) => i),
                            disabledMinutes: (selectedHour) => {
                              if (selectedHour === p.hour()) {
                                return Array.from({ length: p.minute() }, (_, i) => i);
                              }
                              return [];
                            }
                          };
                        }
                      }
                      return {};
                    }}
                  />
                  )}
                </ConfigProvider>
              </div>
            </div>

          </div>

          {/* Search Button */}
          <div className="w-full flex justify-center mt-9">
            <button
              type="submit"
              className="btn-luxury btn-luxury-shine w-full sm:w-auto sm:min-w-[340px] bg-[#551A0C] hover:bg-[#451408] text-[#DFB574] font-bold tracking-[0.22em] uppercase text-xs px-10 py-4.5 rounded-2xl transition-all shadow-[0_12px_35px_rgba(85,26,12,0.35)] hover:shadow-[0_18px_45px_rgba(85,26,12,0.5)] hover:scale-[1.02] active:scale-[0.98] border border-[#DFB574]/60 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <span>Discover Available Fleet</span>
              <Sparkles size={14} className="text-[#DFB574]" />
            </button>
          </div>
        </form>

        {/* Self Drive: drop in different city */}
        {mainTab === 'SELF DRIVE' && (
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => setIsDifferentDropCity(!isDifferentDropCity)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-[#551A0C] bg-[#FAF6F0] hover:bg-[#F3EDE2] border border-[#E7DFD5] hover:border-[#C89D5C] transition-all cursor-pointer shadow-xs"
            >
              <span className="text-[#C89D5C]">✦</span>
              <span>{isDifferentDropCity ? 'Return to same collection point' : 'Require drop-off in a different royal city?'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
