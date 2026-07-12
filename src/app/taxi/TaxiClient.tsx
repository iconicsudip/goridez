'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import { ArrowDownUp, MapPin, Calendar, Briefcase, Loader2, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false, loading: () => <div className="w-full h-64 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">Loading Map...</div> });
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import AirportLocalitySearch, { AIRPORT_ZONE_ID } from '@/components/AirportLocalitySearch';
import { calculateRoute, OSMLocation } from '@/lib/osm';
import { getCarSlug } from '@/lib/utils';

function normalizeVehicleCategory(raw: string): string {
  const c = (raw || '').trim().toLowerCase();
  if (c.includes('innova') || c.includes('crysta')) return 'crysta';
  if (c.includes('luxury')) return 'luxury';
  if (c.includes('suv')) return 'suv';
  if (c.includes('sedan')) return 'sedan';
  return c;
}

const NIGHT_START_HOUR = 22;
const NIGHT_END_HOUR = 6;
function isNightTime(date: Date) {
  const h = date.getHours();
  return h >= NIGHT_START_HOUR || h < NIGHT_END_HOUR;
}

const UDAIPUR_CITY: OSMLocation = {
  place_id: -2,
  display_name: 'Udaipur, Rajasthan, India',
  lat: '24.5854',
  lon: '73.7125',
  type: 'city'
};

const mapToRouteLocation = (loc: OSMLocation) => ({
  lat: parseFloat(loc.lat) || 0,
  lon: parseFloat(loc.lon) || 0,
  name: loc.display_name
});

export default function TaxiClient({ initialCars, initialCities, taxiSettings, airportZones = [], airportName = 'the Airport' }: { initialCars: any[], initialCities: any[], taxiSettings: any[], airportZones?: any[], airportName?: string }) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, updateSession, addToCart } = useBookingStore();

  const [bookingMode, setBookingMode] = useState<'ROUND_TRIP'|'AIRPORT_TRANSFER'>('ROUND_TRIP');

  // Locations
  const [pickupLocation, setPickupLocation] = useState<{name: string, data?: OSMLocation}>({ name: 'Udaipur, Rajasthan', data: UDAIPUR_CITY });
  const [dropoffLocation, setDropoffLocation] = useState<{name: string, data?: OSMLocation}>({ name: '' });
  const [destLocations, setDestLocations] = useState<{name: string, data?: OSMLocation}[]>([{ name: '' }]);

  const [atPickup, setAtPickup] = useState<{name: string, zoneId: string}>({ name: '', zoneId: '' });
  const [atDrop, setAtDrop] = useState<{name: string, zoneId: string}>({ name: '', zoneId: '' });

  const atPickupIsAirport = atPickup.zoneId === AIRPORT_ZONE_ID;
  const atDropIsAirport = atDrop.zoneId === AIRPORT_ZONE_ID;
  // Exactly one side must be the airport — the other resolves to a serviceable zone.
  const atDirectionValid = !!atPickup.zoneId && !!atDrop.zoneId && (atPickupIsAirport !== atDropIsAirport);
  const atZoneId = atDirectionValid ? (atPickupIsAirport ? atDrop.zoneId : atPickup.zoneId) : '';

  const atZone = airportZones.find(z => z.id === atZoneId) || null;

  // Distance calculations
  const [calculatedDistance, setCalculatedDistance] = useState<number>(0);
  const [calculatedDuration, setCalculatedDuration] = useState<number>(0); // in seconds
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchRoute = async () => {
      if (bookingMode === 'ROUND_TRIP') {
        // Source is always Udaipur
        setIsCalculating(true);
        let totalKm = 0;
        let totalDur = 0;
        let currentLoc = UDAIPUR_CITY;
        let validDests = destLocations.filter(d => d.data);
        
        for (const dest of validDests) {
          const route = await calculateRoute(currentLoc.lon, currentLoc.lat, dest.data!.lon, dest.data!.lat);
          if (route) {
            totalKm += Math.ceil(route.distance / 1000);
            totalDur += route.duration;
          }
          currentLoc = dest.data!;
        }
        
        // Return trip to Udaipur
        if (validDests.length > 0) {
          const returnRoute = await calculateRoute(currentLoc.lon, currentLoc.lat, UDAIPUR_CITY.lon, UDAIPUR_CITY.lat);
          if (returnRoute) {
            totalKm += Math.ceil(returnRoute.distance / 1000);
            totalDur += returnRoute.duration;
            // Optionally, we just keep the geometry of the first leg or null for round trips
            if (validDests.length === 1 && returnRoute.geometry) {
               // Only 1 destination round trip
               setRouteGeometry(returnRoute.geometry);
            } else {
               setRouteGeometry(null);
            }
          }
        }
        
        if (active) {
          setCalculatedDistance(Math.ceil(totalKm / 2)); // Return OW distance for base calculations if needed
          setCalculatedDuration(totalDur);
          setIsCalculating(false);
        }
      } else if (bookingMode === 'AIRPORT_TRANSFER') {
        // Airport transfer pricing is zone-based (fixed rate per zone/category/direction),
        // not distance-based, so no route calculation is needed here.
        setCalculatedDistance(0);
        setRouteGeometry(null);
      }
    };
    
    fetchRoute();
    return () => { active = false; };
  }, [pickupLocation.data, destLocations, bookingMode]);

  // Dates
  const [pickupDate, setPickupDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Time filters are handled natively by Ant Design DatePicker

  useEffect(() => {
    setIsMounted(true);
    const qPickupDate = searchParams.get('pickupDate');
    const qReturnDate = searchParams.get('returnDate');
    const qPickupCity = searchParams.get('pickupCity');
    const qDropCity = searchParams.get('dropCity');
    const qMode = searchParams.get('mode') as any;
    const qAtPickupName = searchParams.get('atPickupName');
    const qAtPickupZoneId = searchParams.get('atPickupZoneId');
    const qAtDropName = searchParams.get('atDropName');
    const qAtDropZoneId = searchParams.get('atDropZoneId');

    let loadedPickup = null;
    if (qPickupDate) loadedPickup = new Date(qPickupDate);
    else if (session?.pickupDate) loadedPickup = new Date(session.pickupDate);

    let loadedReturn = null;
    if (qReturnDate) loadedReturn = new Date(qReturnDate);
    else if (session?.returnDate) loadedReturn = new Date(session.returnDate);

    const now = new Date();
    if (loadedPickup && loadedPickup.getTime() < now.getTime()) {
      loadedPickup = new Date(now.getTime() + 60 * 60 * 1000);
    }
    if (loadedReturn && loadedPickup && loadedReturn.getTime() <= loadedPickup.getTime()) {
      loadedReturn = new Date(loadedPickup.getTime() + 2 * 60 * 60 * 1000);
    }

    if (loadedPickup) setPickupDate(loadedPickup);
    if (loadedReturn) setReturnDate(loadedReturn);

    if (qPickupCity && pickupLocation.name !== qPickupCity) setPickupLocation({ name: qPickupCity });
    if (qDropCity && dropoffLocation.name !== qDropCity) setDropoffLocation({ name: qDropCity });

    if (qAtPickupName && qAtPickupZoneId) setAtPickup({ name: qAtPickupName, zoneId: qAtPickupZoneId });
    if (qAtDropName && qAtDropZoneId) setAtDrop({ name: qAtDropName, zoneId: qAtDropZoneId });
    const resolvedMode =
      qMode && qMode !== 'ONE_WAY' && qMode !== 'LOCAL' ? qMode :
      session?.bookingMode && session.bookingMode !== 'ONE_WAY' && session.bookingMode !== 'LOCAL' ? session.bookingMode :
      'ROUND_TRIP';
    setBookingMode(resolvedMode as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state changes to URL
  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (bookingMode && params.get('mode') !== bookingMode) {
      params.set('mode', bookingMode);
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
  }, [bookingMode, pickupDate, returnDate, isMounted, router, searchParams]);

  const handleDateRangeChange = (update: [Date | null, Date | null]) => {
    const [start, end] = update;
    let nextStart = pickupDate;
    let nextEnd = returnDate;

    if (start) {
      nextStart = new Date(start);
      nextStart.setHours(pickupDate.getHours(), pickupDate.getMinutes());
      const now = new Date();
      if (nextStart.getTime() < now.getTime()) {
        nextStart.setTime(now.getTime());
      }
      setPickupDate(nextStart);
    }
    if (end) {
      nextEnd = new Date(end);
      nextEnd.setHours(returnDate ? returnDate.getHours() : 12, returnDate ? returnDate.getMinutes() : 0);
      const minTime = nextStart.getTime();
      if (nextEnd.getTime() <= minTime) {
        nextEnd.setTime(minTime + 2 * 60 * 60 * 1000);
      }
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
    const now = new Date();
    if (newDate.getTime() < now.getTime()) {
      newDate.setTime(now.getTime());
    }
    setPickupDate(newDate);
    updateSession({ pickupDate: newDate.toISOString() });

    if (returnDate && returnDate.getTime() <= newDate.getTime()) {
      const nextReturn = new Date(newDate.getTime() + 2 * 60 * 60 * 1000);
      setReturnDate(nextReturn);
      updateSession({ returnDate: nextReturn.toISOString() });
    }
  };

  const handleReturnTimeChange = (timeStr: string) => {
    if (!returnDate) return;
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(returnDate);
    newDate.setHours(h, m);
    const minTime = pickupDate.getTime();
    if (newDate.getTime() <= minTime) {
      newDate.setTime(minTime + 2 * 60 * 60 * 1000);
    }
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
      serviceType: bookingMode === 'ROUND_TRIP'
        ? 'roundTripTaxi'
        : bookingMode === 'AIRPORT_TRANSFER'
          ? 'airportTransfer'
          : 'oneWayTaxi',
      referenceId: car.id,
      title: `${car.make} ${car.model} (${bookingMode === 'ROUND_TRIP' ? 'Round Trip' : bookingMode === 'AIRPORT_TRANSFER' ? 'Airport Transfer' : 'One Way'})`,
      image: car.image || '',
      price: price,
      deposit: 0,
      extraInfo: extra,
      ...(bookingMode === 'ROUND_TRIP' && {
        pickupStation: pickupLocation.name,
        dropStation: destLocations[0]?.name || '',
      }),
      ...(bookingMode === 'AIRPORT_TRANSFER' && {
        pickupStation: atPickup.name,
        dropStation: atDrop.name,
      }),
    });

    router.push('/cart');
  };

  const updateDestination = (index: number, val: string, data?: OSMLocation) => {
    const newDests = [...destLocations];
    newDests[index] = { name: val, data };
    setDestLocations(newDests);
  };
  const addDestination = () => {
    if (destLocations.length < 3) {
      setDestLocations([...destLocations, { name: '' }]);
    }
  };
  const removeDestination = (index: number) => {
    const newDests = [...destLocations];
    newDests.splice(index, 1);
    setDestLocations(newDests);
  };

  const displayDuration = `${Math.floor(calculatedDuration / 3600)}h ${Math.floor((calculatedDuration % 3600) / 60)}m`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-24 pb-20">
      <div className="container mx-auto px-4 mt-8">
        
        {/* Header Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 mb-10 bg-gradient-to-br from-white to-green-50">
          <div className="text-green-700 text-[10px] font-black tracking-widest uppercase mb-4">
            Premium Driver Services
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            CHAUFFEUR <span className="text-outline-neon">SERVICES & TRANSFERS</span>
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">
            Premium door-to-door luxury journeys. Powered by professional drivers and accurate routing.
          </p>
        </div>

        {/* Booking Mode Tabs */}
        <div className="flex overflow-x-auto lg:flex-wrap gap-4 mb-8 bg-gray-100 p-2 rounded-2xl w-full lg:w-fit">
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
          <aside className="w-full lg:w-[380px] shrink-0 space-y-6 lg:sticky lg:top-32 h-fit z-10">
            
            {/* Route Configurator */}
            <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8">
              <h2 className="font-black text-sm uppercase tracking-widest mb-8">Route Configurator</h2>
              
              <div className="space-y-4 relative">
                
                {bookingMode === 'ROUND_TRIP' ? (
                  <>
                    <div>
                      <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Pick-Up Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-green-700" size={16} />
                        <input 
                          type="text" 
                          readOnly 
                          value="Udaipur, Rajasthan" 
                          className="w-full bg-gray-200 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-sm outline-none font-medium text-gray-600 cursor-not-allowed" 
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest">Destinations</label>
                        {destLocations.length < 3 && (
                          <button type="button" onClick={addDestination} className="text-green-700 hover:text-gray-900 transition-colors flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded text-[9px]">
                            <span className="text-[14px] leading-none">+</span> ADD
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {destLocations.map((dest, idx) => (
                          <div key={idx} className="relative flex items-center gap-2">
                            <div className="relative flex-1">
                              <LocationAutocomplete
                                value={dest.name}
                                onChange={(val, loc) => updateDestination(idx, val, loc)}
                                placeholder={`Destination ${idx + 1}...`}
                              />
                            </div>
                            {destLocations.length > 1 && (
                              <button type="button" onClick={() => removeDestination(idx)} className="text-red-400 hover:text-red-300 w-8 flex justify-center">
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Pickup Location</label>
                      <AirportLocalitySearch
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
                    </div>

                    <div>
                      <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Drop Location</label>
                      <AirportLocalitySearch
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
                    </div>

                    <p className="text-[9px] text-gray-400 font-mono">
                      One side must be {airportName}; the other, your locality within the zones we cover.
                    </p>
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                      {bookingMode === 'ROUND_TRIP' ? 'Travel Date Range (Required)' : bookingMode === 'AIRPORT_TRANSFER' ? 'Transfer Date' : 'Travel Date Range'}
                    </label>
                    <div className="relative w-full">
                      <ConfigProvider
                        theme={{
                          token: {
                            colorPrimary: '#15803d',
                            borderRadius: 12,
                            fontSize: 11,
                            controlHeight: 52,
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
                        {bookingMode === 'AIRPORT_TRANSFER' ? (
                          <DatePicker
                            showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                            format="DD/MM/YYYY - h:mm a"
                            value={pickupDate ? dayjs(pickupDate) : null}
                            onChange={(date) => {
                              if (date) {
                                const start = date.toDate();
                                setPickupDate(start);
                                setReturnDate(null);
                                updateSession({ pickupDate: start.toISOString(), returnDate: null });
                              }
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-5 text-[11px] outline-none cursor-pointer font-medium"
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
                          format="DD/MM/YYYY - h:mm a"
                          value={[pickupDate ? dayjs(pickupDate) : null, returnDate ? dayjs(returnDate) : null]}
                          onChange={(dates) => {
                             if (dates && dates[0]) {
                               const start = dates[0].toDate();
                               let end = dates[1] ? dates[1].toDate() : null;
                               if (end && (end.getTime() - start.getTime()) < 12 * 60 * 60 * 1000) {
                                 end = new Date(start.getTime() + 12 * 60 * 60 * 1000);
                               }
                               setPickupDate(start);
                               setReturnDate(end);
                               updateSession({
                                 pickupDate: start.toISOString(),
                                 returnDate: end ? end.toISOString() : null
                               });
                             } else {
                               setReturnDate(null);
                               updateSession({ returnDate: null });
                             }
                           }}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-5 text-[11px] outline-none cursor-pointer font-medium"
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
              </div>

              {calculatedDistance > 0 && (
                <>
                <div className="bg-gray-50 border border-[#2A2A0A] rounded-xl p-5 mt-6 space-y-3 font-mono text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold tracking-widest">EST. ROUTE DISTANCE</span>
                    <span className="text-green-700 font-bold text-sm">{isCalculating ? <Loader2 size={12} className="animate-spin" /> : `${bookingMode === 'ROUND_TRIP' ? calculatedDistance * 2 : calculatedDistance} KM`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold tracking-widest">EST. TRAVEL DURATION</span>
                    <span className="text-gray-900 font-bold text-sm">{isCalculating ? <Loader2 size={12} className="animate-spin" /> : displayDuration}</span>
                  </div>
                </div>
                
                {!isCalculating && (
                  <div className="mt-6 h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                    <RouteMap
                      sourceLocation={mapToRouteLocation(
                        bookingMode === 'ROUND_TRIP' ? UDAIPUR_CITY : pickupLocation.data || UDAIPUR_CITY
                      )}
                      destLocation={mapToRouteLocation(
                        bookingMode === 'ROUND_TRIP' ? (destLocations[0]?.data || UDAIPUR_CITY) : dropoffLocation.data || UDAIPUR_CITY
                      )}
                      routeGeometry={routeGeometry}
                    />
                  </div>
                )}
                </>
              )}

              {bookingMode === 'AIRPORT_TRANSFER' && atZone && (
                <div className="bg-green-600/5 border border-green-600/20 rounded-xl p-5 mt-6 font-mono text-[10px] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold tracking-widest">SERVICE ZONE</span>
                    <span className="text-green-700 font-bold text-sm">{atZone.name}</span>
                  </div>
                  <p className="text-gray-500 leading-relaxed normal-case font-sans text-[11px]">
                    Fares below already reflect your selected direction and area. Wait time, night hours, and meet &amp; greet charges (if any) are shown per vehicle.
                  </p>
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

                if (bookingMode === 'ROUND_TRIP') {
                  // Use TaxiFareSetting based on car category (fallback to defaults)
                  const setting = taxiSettings.find(s => s.vehicleCategory.toLowerCase() === car.category.toLowerCase()) || {
                    roundTripRatePerKm: car.packages?.[0]?.extraChargePerUnit || 13,
                    roundTripMinKmPerDay: 250,
                    driverAllowancePerDay: car.driverAllowanceOut || 350
                  };

                  const minKmPerDay = setting.roundTripMinKmPerDay;
                  const runningDistance = calculatedDistance * 2;
                  const billableKm = Math.max(runningDistance, minKmPerDay * durationDays);
                  const ratePerKm = setting.roundTripRatePerKm;
                  const driverAllowancePerDay = setting.driverAllowancePerDay;
                  
                  const basicFare = Math.round(billableKm * ratePerKm);
                  const driverAllowance = driverAllowancePerDay * durationDays;
                  const gstAmount = Math.round(basicFare * 0.18); // 18% GST
                  
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
                  
                  const destStr = destLocations.map(d => d.name).filter(Boolean).join(' -> ');
                  extraText = `Round Trip: Udaipur -> ${destStr} (${durationDays} Days)`;
                } else if (bookingMode === 'AIRPORT_TRANSFER') {
                  // AIRPORT TRANSFER logic:
                  // Zone-based flat fare — looked up by service zone + vehicle category + direction.
                  const zoneFare = atZone?.fares?.find((f: any) => normalizeVehicleCategory(f.vehicleCategory) === normalizeVehicleCategory(car.category));

                  const nightApplies = isNightTime(pickupDate);
                  const meetAndGreet = zoneFare?.meetAndGreet || false;
                  const nightFee = nightApplies ? (zoneFare?.nightFee || 0) : 0;
                  const waitChargePer30Min = zoneFare?.waitChargePer30Min || 0;

                  const basePrice = zoneFare ? (atPickupIsAirport ? zoneFare.pickupPrice : zoneFare.dropPrice) : 0;
                  flatFare = basePrice + nightFee;

                  car._airportBreakdown = { basePrice, nightApplies, nightFee, waitChargePer30Min, meetAndGreet, hasFare: !!zoneFare };

                  extraText = `Airport Transfer — ${atZone?.name || 'Zone'}: ${atPickup.name} → ${atDrop.name}`;
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
                          <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full relative">
                            <Image src={car.image || '/placeholder-car.png'} alt={`${car.make} ${car.model}`} fill className="object-contain p-2 bg-white rounded-2xl hover:scale-105 transition-transform" unoptimized />
                          </Link>
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between w-full">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-green-700 text-xs font-black tracking-widest uppercase">{car.category} AC</span>
                              </div>
                            </div>
                            
                            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                              <Link href={`/cars/${getCarSlug(car)}`} className="hover:text-green-700 transition-colors">
                                {car.make} {car.model} <span className="text-gray-500 text-xl">{car.seatingCapacity} SEATER</span>
                              </Link>
                            </h3>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-700 mb-6">
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
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                            Package Fare ({bd.days}D)
                          </div>
                          <p className="text-4xl font-black text-green-700 mb-2">₹{flatFare.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 mb-1">Inc. GST & Driver Allowance</p>
                          <p className="text-xs text-gray-500 mb-6">Exc. Toll Tax & Parking</p>
                          
                          <button onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)} disabled={isAlreadyBooked || !returnDate || calculatedDistance === 0} className={`w-full font-medium text-base py-4 px-6 rounded-2xl transition-all ${
                            isAlreadyBooked || !returnDate || calculatedDistance === 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                              : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                          }`}>
                            {isAlreadyBooked ? 'Booked' : !returnDate ? 'Select Dates First' : calculatedDistance === 0 ? 'Select Valid Route' : 'Book Now'}
                          </button>
                        </div>
                      </div>
                      
                      {activeTab?.startsWith(`${car.id}-`) && (
                        <div className="mt-8 border-t border-gray-200 pt-8">
                          <div className="flex flex-wrap gap-3 mb-6">
                            <button onClick={() => toggleTab("fare")} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${isTabActive("fare") ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>Fare Details</button>
                            <button onClick={() => toggleTab("exclusion")} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${isTabActive("exclusion") ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>Exclusions</button>
                            <button onClick={() => toggleTab("terms")} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${isTabActive("terms") ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>Terms & Conditions</button>
                          </div>
                          
                          {isTabActive("fare") && (
                            <div className="flex flex-col md:flex-row gap-8 text-xs font-mono">
                              <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center"><span className="text-gray-400">Basic Fare</span><span className="font-bold text-gray-900">₹{bd.basicFare}</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Driver Allowances</span><span className="font-bold text-gray-900">₹{bd.driverAllowance}</span></div><div className="w-full h-px bg-white/5"></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">GST (18%)</span><span className="font-bold text-gray-900">₹{bd.gstAmount}</span></div><div className="w-full h-px bg-white/5"></div>
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
                      <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full relative">
                        <Image src={car.image || '/placeholder-car.png'} alt={`${car.make} ${car.model}`} fill className="object-contain p-2 bg-white rounded-2xl hover:scale-105 transition-transform" unoptimized />
                      </Link>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest border border-gray-200">{car.category} Class</span>
                        <span className="text-[10px] text-gray-400 font-mono">{car.seatingCapacity} Seats • {car.transmission}</span>
                      </div>
                      <h3 className="text-xl font-black mb-1">
                        <Link href={`/cars/${getCarSlug(car)}`} className="hover:text-green-700 transition-colors">
                          {car.make} {car.model}
                        </Link>
                      </h3>
                      <p className="text-[10px] text-gray-500 font-mono mb-6">{car.fuelType} Engine {car.features && car.features.length > 0 ? `• ${car.features.join(' • ')}` : '• Fully Air-Conditioned'}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-600 font-mono">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {car.content || 'Guaranteed private. No ridesharing. No multiple stops.'}
                      </div>
                    </div>
                    <div className="text-right shrink-0 bg-transparent flex flex-col items-end">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {bookingMode === 'ROUND_TRIP' ? `Package Fare (${durationDays}D)` : bookingMode === 'AIRPORT_TRANSFER' ? 'Flat Transfer Fare' : 'Flat Invoice Fare'}
                      </div>
                      <div className="text-3xl font-black text-green-700 mb-1">
                        ₹{flatFare.toLocaleString()}
                        <span className="text-gray-400 text-[10px] font-medium lowercase ml-2">
                          {bookingMode === 'ROUND_TRIP' ? 'total' : bookingMode === 'AIRPORT_TRANSFER' ? 'flat rate' : (returnDate ? 'round trip' : 'one way')}
                        </span>
                      </div>
                      {bookingMode === 'AIRPORT_TRANSFER' && car._airportBreakdown?.hasFare && (
                        <div className="text-[9px] text-gray-500 font-mono mb-4 space-y-0.5 text-right">
                          {car._airportBreakdown.nightApplies && car._airportBreakdown.nightFee > 0 && (
                            <div>Incl. Night Fee ₹{car._airportBreakdown.nightFee.toLocaleString()} (10PM–6AM)</div>
                          )}
                          {car._airportBreakdown.waitChargePer30Min > 0 && (
                            <div>Free 30 min wait, then ₹{car._airportBreakdown.waitChargePer30Min.toLocaleString()}/30min</div>
                          )}
                          {car._airportBreakdown.meetAndGreet && <div>Meet &amp; Greet included</div>}
                        </div>
                      )}
                      {bookingMode === 'AIRPORT_TRANSFER' && !car._airportBreakdown?.hasFare && (
                        <div className="text-[9px] text-red-500 font-mono mb-4">No fare configured for this vehicle in this zone</div>
                      )}
                      <button
                        onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)}
                        disabled={isAlreadyBooked || (bookingMode === 'ROUND_TRIP' && !returnDate) || (bookingMode === 'ROUND_TRIP' && calculatedDistance === 0) || (bookingMode === 'AIRPORT_TRANSFER' && (!atZoneId || !car._airportBreakdown?.hasFare))}
                        className={`font-black text-[10px] tracking-widest uppercase py-4 px-8 rounded-xl transition-all ${
                          isAlreadyBooked || (bookingMode === 'ROUND_TRIP' && (!returnDate || calculatedDistance === 0)) || (bookingMode === 'AIRPORT_TRANSFER' && (!atZoneId || !car._airportBreakdown?.hasFare))
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'
                        }`}
                      >
                        {isAlreadyBooked ? 'Booked / Unavailable'
                          : bookingMode === 'ROUND_TRIP' ? (!returnDate ? 'Select Dates First' : calculatedDistance === 0 ? 'Select Valid Route' : 'Book Cab Now')
                          : bookingMode === 'AIRPORT_TRANSFER' ? (!atZoneId ? 'Select Your Area First' : !car._airportBreakdown?.hasFare ? 'Unavailable For This Vehicle' : 'Book Cab Now')
                          : 'Book Cab Now'}
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
