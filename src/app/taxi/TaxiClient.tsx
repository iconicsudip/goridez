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
import CarImageSlider from '@/components/CarImageSlider';
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

export default function TaxiClient({ initialCars, initialCities, taxiSettings, airportZones = [], airportName = 'the Airport', siteSettings }: { initialCars: any[], initialCities: any[], taxiSettings: any[], airportZones?: any[], airportName?: string, siteSettings?: any }) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, updateSession, addToCart } = useBookingStore();

  const [bookingMode, setBookingMode] = useState<'ROUND_TRIP'|'AIRPORT_TRANSFER'>('ROUND_TRIP');

  const exclusionsList = useMemo(() => {
    if (siteSettings?.taxiExclusions) {
      return siteSettings.taxiExclusions.split('\n').map((item: string) => item.trim()).filter(Boolean);
    }
    return [
      "Toll Tax and Parking charges are not included in the above fare.",
      "State Tax (if applicable crossing borders) is extra.",
      "Any extra km or hours driven beyond the package limit will be charged additionally."
    ];
  }, [siteSettings]);

  const termsList = useMemo(() => {
    if (siteSettings?.taxiTerms) {
      return siteSettings.taxiTerms.split('\n').map((item: string) => item.trim()).filter(Boolean);
    }
    return [
      "A/C will be switched off in hilly areas.",
      "Night allowance applies if the driver drives between 10 PM and 6 AM.",
      "Kilometers are calculated from garage to garage."
    ];
  }, [siteSettings]);

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

  // Filter cars by booking mode
  const modeFilteredCars = useMemo(() => {
    if (bookingMode === 'AIRPORT_TRANSFER') {
      return initialCars.filter((c: any) => c.serviceTypes?.includes('AIRPORT_TRANSFER'));
    }
    return initialCars.filter((c: any) => c.serviceTypes?.includes('TAXI'));
  }, [bookingMode, initialCars]);

  const [currentPage, setCurrentPage] = useState(1);
  const CARS_PER_PAGE = 5;

  const totalPages = Math.ceil(modeFilteredCars.length / CARS_PER_PAGE);
  const paginatedCars = modeFilteredCars.slice((currentPage - 1) * CARS_PER_PAGE, currentPage * CARS_PER_PAGE);

  // Reset to page 1 whenever booking mode or filtered cars list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [bookingMode, modeFilteredCars.length]);

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
            TAXI <span className="text-outline-neon">SERVICES & TRANSFERS</span>
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
              
              {paginatedCars.map((car) => {
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
                  const destStr = destLocations.map(d => d.name).filter(Boolean).join(' -> ');
                  
                  return (
                    <div key={car.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-green-200 transition-all mb-5 overflow-hidden font-sans">
                      <div className="flex flex-col md:flex-row">

                        {/* ── Left: Image ── */}
                        <div className="relative md:w-64 shrink-0 bg-gray-50 min-h-[180px]">
                          {/* Image container with its own overflow-hidden so badges aren't clipped */}
                          <div className="absolute inset-0 overflow-hidden">
                            <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full">
                              <CarImageSlider mainImage={car.image} galleryJson={car.gallery} alt={`${car.make} ${car.model}`} imageClassName="object-contain hover:scale-105 transition-transform duration-500 w-full h-full" />
                            </Link>
                          </div>
                          {/* Category badge – top left */}
                          <span className="absolute top-3 left-3 z-10 bg-white/95 border border-gray-200 text-gray-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                            {car.category.replace(/\bClass\b/gi, '').trim()}
                          </span>
                          {/* Availability badge – top right */}
                          <span className={`absolute top-3 right-3 z-10 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${car.availability ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-white' : 'bg-red-500'}`}></span>
                            {car.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </div>

                        {/* ── Center: Info ── */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex-1 p-5 border-b border-gray-100">
                            {/* Title */}
                            <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">
                              <Link href={`/cars/${getCarSlug(car)}`} className="hover:text-green-600 transition-colors">
                                {car.make} {car.model}
                              </Link>
                            </h3>
                            {/* Specs subtitle */}
                            <p className="text-[11px] text-gray-400 font-mono mb-3">
                              {car.seatingCapacity} Seats &nbsp;•&nbsp; {car.transmission.replace(' Gearbox', '')} &nbsp;•&nbsp; {car.fuelType}
                            </p>
                            {/* Feature pills */}
                            {car.features && car.features.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {car.features.map((feat: string, idx: number) => (
                                  <span key={idx} className="bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Package details table */}
                            <div className="w-full text-xs font-mono text-gray-700 space-y-2">
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-400">Package</span>
                                <span className="font-medium">Outstation (Round Trip)</span>
                              </div>
                              {destStr && (
                                <div className="flex justify-between border-b border-gray-100 pb-2">
                                  <span className="text-gray-400">Route</span>
                                  <span className="font-medium font-sans text-right">Udaipur → {destStr} → Udaipur</span>
                                </div>
                              )}
                              <div className="flex justify-between border-b border-gray-100 pb-2">
                                <span className="text-gray-400">Charged Distance</span>
                                <span className="font-medium">{bd.chargedDistance} Km</span>
                              </div>
                              <div className="flex justify-between pb-1">
                                <span className="text-gray-400">Extra Charge</span>
                                <span className="font-medium">₹{bd.ratePerKm}/Km (Beyond {bd.chargedDistance}Km)</span>
                              </div>
                            </div>
                          </div>

                          {/* Inclusions strip */}
                          <div className="px-5 py-3 flex flex-wrap items-center gap-4 bg-gray-50">
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                              Inc. GST &amp; Driver Allowance
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Exc. Toll Tax &amp; Parking
                            </span>
                            <button onClick={() => toggleTab("fare")} className="ml-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-700 hover:text-green-800 transition-colors">
                              View Breakdown &amp; Terms <ArrowDownUp size={12} />
                            </button>
                          </div>
                        </div>

                        {/* ── Right: Fare Panel ── */}
                        <div className="shrink-0 md:w-52 bg-green-50 border-l border-green-100 p-5 flex flex-col items-center justify-between">
                          <div className="text-center w-full">
                            <div className="text-[9px] font-black uppercase tracking-widest text-green-700/60 mb-2">Package Fare ({bd.days}D)</div>
                            <div className="text-4xl font-black text-green-700 leading-none">
                              ₹{flatFare.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-green-600/70 font-mono mt-1 mb-3">all inclusive</div>
                          </div>
                          <button
                            onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)}
                            disabled={isAlreadyBooked || !returnDate || calculatedDistance === 0}
                            className={`w-full mt-4 font-black text-[10px] tracking-widest uppercase py-3.5 px-4 rounded-xl transition-all ${
                              isAlreadyBooked || !returnDate || calculatedDistance === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/30'
                            }`}
                          >
                            {isAlreadyBooked ? 'Already Booked' : !returnDate ? 'Select Dates First' : calculatedDistance === 0 ? 'Select Valid Route' : 'Book Now'}
                          </button>
                        </div>

                      </div>

                      {/* Expandable breakdown tabs */}
                      {activeTab?.startsWith(`${car.id}-`) && (
                        <div className="border-t border-gray-100 px-6 py-6">
                          <div className="flex flex-wrap gap-3 mb-6">
                            <button onClick={() => toggleTab("fare")} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${isTabActive("fare") ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>Fare Details</button>
                            <button onClick={() => toggleTab("exclusion")} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${isTabActive("exclusion") ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>Exclusions</button>
                            <button onClick={() => toggleTab("terms")} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${isTabActive("terms") ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"}`}>Terms &amp; Conditions</button>
                          </div>

                          {isTabActive("fare") && (
                            <div className="flex flex-col md:flex-row gap-8 text-xs font-mono">
                              <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center"><span className="text-gray-400">Basic Fare</span><span className="font-bold text-gray-900">₹{bd.basicFare}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Driver Allowances</span><span className="font-bold text-gray-900">₹{bd.driverAllowance}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">GST (18%)</span><span className="font-bold text-gray-900">₹{bd.gstAmount}</span></div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200"><span className="text-green-700 font-bold">Total Amount</span><span className="font-bold text-green-700 text-lg">₹{flatFare}</span></div>
                              </div>
                              <div className="flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
                                <div className="flex justify-between items-center"><span className="text-gray-400">Rate/Km</span><span className="font-bold text-gray-900">₹{bd.ratePerKm}/Km</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">No. of Days</span><span className="font-bold text-gray-900">{bd.days} Days</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Min Km/Day ({bd.minKmPerDay}*{bd.days})</span><span className="font-bold text-gray-900">{bd.chargedDistance} Km</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Running Distance</span><span className="font-bold text-gray-900">{bd.runningDistance} Km</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Charged Distance</span><span className="font-bold text-gray-900">{bd.chargedDistance} Km</span></div>
                              </div>
                            </div>
                          )}

                          {isTabActive("exclusion") && (
                            <div className="text-xs font-mono text-gray-600 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                              <ul className="list-disc pl-5 space-y-3">
                                {exclusionsList.map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {isTabActive("terms") && (
                            <div className="text-xs font-mono text-gray-600 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                              <ul className="list-disc pl-5 space-y-3">
                                {termsList.map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={car.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-green-200 transition-all mb-5 overflow-hidden">
                    <div className="flex flex-col md:flex-row">

                      {/* ── Left: Image ── */}
                      <div className="relative md:w-64 shrink-0 bg-gray-50 flex items-center justify-center min-h-[180px]">
                        {/* Image with its own overflow-hidden so badges aren't clipped */}
                        <div className="absolute inset-0 overflow-hidden">
                          <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full">
                            <CarImageSlider mainImage={car.image || '/placeholder-car.png'} galleryJson={car.gallery} alt={`${car.make} ${car.model}`} imageClassName="object-contain hover:scale-105 transition-transform duration-500 w-full h-full" />
                          </Link>
                        </div>
                        {/* Category badge – top left */}
                        <span className="absolute top-3 left-3 z-10 bg-white/95 border border-gray-200 text-gray-700 text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                          {car.category.replace(/\bClass\b/gi, '').trim()}
                        </span>
                        {/* Available badge – top right */}
                        <span className={`absolute top-3 right-3 z-10 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg flex items-center gap-1 ${car.availability ? 'bg-green-500 text-white' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-white' : 'bg-red-500'}`}></span>
                          {car.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>

                      {/* ── Center: Info + Inclusions ── */}
                      <div className="flex-1 flex flex-col">
                        {/* Top: Name + specs + features + description */}
                        <div className="flex-1 p-5 border-b border-gray-100">
                          {/* Title row */}
                          <h3 className="text-xl font-black text-gray-900 leading-tight mb-1">
                            <Link href={`/cars/${getCarSlug(car)}`} className="hover:text-green-600 transition-colors">
                              {car.make} {car.model}
                            </Link>
                          </h3>
                          {/* Specs subtitle */}
                          <p className="text-[11px] text-gray-400 font-mono mb-3">
                            {car.seatingCapacity} Seats &nbsp;•&nbsp; {car.transmission.replace(' Gearbox','')} &nbsp;•&nbsp; {car.fuelType}
                          </p>
                          {/* Feature pills */}
                          {car.features && car.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {car.features.map((feat: string, idx: number) => (
                                <span key={idx} className="bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                                  {feat}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Description */}
                          {car.content && car.content.replace(/<[^>]*>/g, '').trim() ? (
                            <div className="text-xs text-gray-500 leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: car.content }} />
                          ) : (
                            <p className="text-xs text-gray-400">Guaranteed private ride. No ridesharing. No multiple stops.</p>
                          )}
                        </div>

                        {/* Bottom: Inclusions strip */}
                        <div className="px-5 py-3 flex flex-wrap items-center gap-4 bg-gray-50">
                          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                            30 min free wait
                          </span>
                          {car._airportBreakdown?.meetAndGreet && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                              Meet &amp; Greet
                            </span>
                          )}
                          {car._airportBreakdown?.nightFee > 0 && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                              Night charge: ₹{car._airportBreakdown.nightFee.toLocaleString()}
                            </span>
                          )}
                          {car._airportBreakdown?.waitChargePer30Min > 0 && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400">
                              <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              +₹{car._airportBreakdown.waitChargePer30Min}/30min extra wait
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Right: Fare Panel ── */}
                      <div className="shrink-0 md:w-52 bg-green-50 border-l border-green-100 p-5 flex flex-col items-center justify-between">
                        <div className="text-center w-full">
                          <div className="text-[9px] font-black uppercase tracking-widest text-green-700/60 mb-2">Flat Fare</div>
                          {car._airportBreakdown?.hasFare ? (
                            <>
                              <div className="text-4xl font-black text-green-700 leading-none">
                                ₹{flatFare.toLocaleString()}
                              </div>
                              <div className="text-[10px] text-green-600/70 font-mono mt-1 mb-3">all inclusive</div>
                              {car._airportBreakdown.nightApplies && car._airportBreakdown.nightFee > 0 && (
                                <div className="text-[9px] text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1.5 font-mono">
                                  Night fee included
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="text-3xl font-black text-gray-300 leading-none">—</div>
                              <div className="text-[9px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5 mt-2 font-mono leading-relaxed">
                                No fare configured for this zone
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)}
                          disabled={isAlreadyBooked || !atZoneId || !car._airportBreakdown?.hasFare}
                          className={`w-full mt-4 font-black text-[10px] tracking-widest uppercase py-3.5 px-4 rounded-xl transition-all ${
                            isAlreadyBooked || !atZoneId || !car._airportBreakdown?.hasFare
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/30'
                          }`}
                        >
                          {isAlreadyBooked ? 'Already Booked'
                            : !atZoneId ? 'Select Area First'
                            : !car._airportBreakdown?.hasFare ? 'Not Available'
                            : 'Book Transfer'}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}



              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 border-t border-gray-200 pt-8">
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:border-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
                  >
                    &larr;
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-green-600 border-green-600 text-white shadow-md'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-green-600 hover:text-green-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:border-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
                  >
                    &rarr;
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
