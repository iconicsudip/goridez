'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Loader2, X } from 'lucide-react';
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

    if (returnDate && returnDate.getTime() <= adjusted.getTime()) {
      const newReturn = new Date(adjusted.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      setReturnDate(newReturn);
      updateSession({ returnDate: newReturn.toISOString() });
    }
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
      loadedReturn = new Date(loadedPickup.getTime() + 4 * 24 * 60 * 60 * 1000);
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
      ? destinations.filter(d => d.trim()).join(',')
      : (mainTab === 'SELF DRIVE' && isDifferentDropCity)
        ? destCity
        : sourceCity;

    updateSession({
      serviceType: stype,
      pickupDate: (pickupDate ?? makeTomorrow()).toISOString(),
      returnDate: isAirportTransfer ? null : (returnDate ?? makePlus4()).toISOString(),
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
    <div className="w-full max-w-5xl mx-auto font-body mt-8 z-10 relative text-left">

      {/* ── Main Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex w-full sm:w-max max-w-full overflow-x-auto hide-scrollbar bg-brand-panel/95 backdrop-blur-xl rounded-t-3xl shadow-lg border border-brand-border border-b-0">
        {(['SELF DRIVE', 'TAXI'] as MainTab[]).map((tab) => {
          if (counts) {
            if (tab === 'SELF DRIVE' && counts.selfDrive === 0) return null;
            if (tab === 'TAXI' && counts.chauffeur === 0 && counts.taxi === 0) return null;
          }
          return (
            <button
              key={tab}
              onClick={() => { 
                setMainTab(tab); 
                setIsDifferentDropCity(false);
                if (tab === 'TAXI') setSubTab('ROUND TRIP');
              }}
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
        {mainTab === 'TAXI' && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {(['ROUND TRIP', 'AIRPORT TRANSFER'] as SubTab[]).map((sub) => (
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
                {sub === 'ROUND TRIP' && 'Round Trip'}
                {sub === 'AIRPORT TRANSFER' && 'Airport Transfer'}
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
                        <button type="button" onClick={addDestination} className="text-brand-gold hover:text-[#8dbb00] p-1 bg-white rounded-full transition-transform active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100">
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
            <div className={`bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)] ${dateSpansTwo ? 'p-4 md:col-span-2' : 'p-4 md:px-2.5'}`}>
              <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
                {isAirportTransfer ? 'Transfer Date (Required)' : 'Travel Date Range (Required)'}
              </label>
              <div className="flex items-center gap-2 text-gray-800 w-full">
                <Calendar size={16} className="text-gray-400 shrink-0" />
                <ConfigProvider
                  theme={{
                    token: {
                      colorPrimary: '#15803d',
                      borderRadius: 8,
                      fontSize: 11,
                    },
                    components: {
                      DatePicker: {
                        cellWidth: 28,
                        cellHeight: 20,
                        timeColumnWidth: 48,
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
                      className="w-full text-xs font-semibold cursor-pointer text-gray-900 !p-0"
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
                    format="DD MMM, h:mma"
                    value={[pickupDate ? dayjs(pickupDate) : null, returnDate ? dayjs(returnDate) : null]}
                    onChange={(dates) => {
                      if (dates && dates[0]) {
                        const start = dates[0].toDate();
                        let end = dates[1] ? dates[1].toDate() : null;
                        if (end && (end.getTime() - start.getTime()) < 12 * 60 * 60 * 1000) {
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
                    className="w-full text-xs font-semibold cursor-pointer text-gray-900 !p-0"
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
          <div className="w-full flex justify-center mt-8">
            <button
              type="submit"
              className="w-full md:w-[320px] bg-brand-gold hover:bg-[#8dbb00] text-white font-bold tracking-widest uppercase text-base px-8 py-3.5 rounded-xl transition-all shadow-md shadow-brand-gold/30 border border-brand-gold cursor-pointer"
            >
              Search Cars
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
