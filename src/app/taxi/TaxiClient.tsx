'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import { ArrowDownUp, MapPin, Calendar, Briefcase, Loader2, Map as MapIcon, SlidersHorizontal, X, Navigation } from 'lucide-react';
import dynamic from 'next/dynamic';

const RouteMap = dynamic(() => import('@/components/RouteMap'), { ssr: false, loading: () => <div className="w-full h-64 bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">Loading Map...</div> });
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import CarImageSlider from '@/components/CarImageSlider';
import AirportLocalitySearch, { AIRPORT_ZONE_ID } from '@/components/AirportLocalitySearch';
import { calculateRoute, resolveLocationData, getFallbackDistanceKm, OSMLocation } from '@/lib/osm';
import { getCarSlug } from '@/lib/utils';
import { ROUNDTRIP_PACKAGES } from '../../../taxiData';

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

  const [bookingMode, setBookingMode] = useState<'ROUND_TRIP' | 'AIRPORT_TRANSFER'>('ROUND_TRIP');
  const [selectedRtPackage, setSelectedRtPackage] = useState<string>('300-km');
  const [isRouteConfigOpen, setIsRouteConfigOpen] = useState(false);

  // Prevent background scrolling while the mobile route configurator drawer is open
  useEffect(() => {
    document.body.style.overflow = isRouteConfigOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isRouteConfigOpen]);

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
  const [pickupLocation, setPickupLocation] = useState<{ name: string, data?: OSMLocation }>({ name: 'Udaipur, Rajasthan', data: UDAIPUR_CITY });
  const [dropoffLocation, setDropoffLocation] = useState<{ name: string, data?: OSMLocation }>({ name: '' });
  const [destLocations, setDestLocations] = useState<{ name: string, data?: OSMLocation }[]>([{ name: '' }]);

  const [atPickup, setAtPickup] = useState<{ name: string, zoneId: string }>({ name: '', zoneId: '' });
  const [atDrop, setAtDrop] = useState<{ name: string, zoneId: string }>({ name: '', zoneId: '' });

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

  const [carPackages, setCarPackages] = useState<Record<string, string>>({});

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
        setIsCalculating(true);
        let totalKm = 0;
        let totalDur = 0;
        let currentLoc = UDAIPUR_CITY;
        let allCoordinates: [number, number][] = [];

        // Auto-resolve missing coordinates for destination names
        const resolvedDests = await Promise.all(
          destLocations.map(async (dest) => {
            if (dest.data) return dest;
            if (!dest.name.trim()) return dest;
            const resolvedData = await resolveLocationData(dest.name);
            return { ...dest, data: resolvedData || undefined };
          })
        );

        const validDests = resolvedDests.filter(d => d.name.trim() && d.data);

        let oneWayDur = 0;

        for (const dest of validDests) {
          const route = await calculateRoute(currentLoc.lon, currentLoc.lat, dest.data!.lon, dest.data!.lat);
          const distanceKm = route ? Math.ceil(route.distance / 1000) : getFallbackDistanceKm(currentLoc, dest.data!);
          const durationSec = route ? route.duration : Math.round((distanceKm / 45) * 3600);

          totalKm += distanceKm;
          oneWayDur += durationSec;
          if (route?.geometry?.coordinates) {
            allCoordinates = [...allCoordinates, ...route.geometry.coordinates];
          }
          currentLoc = dest.data!;
        }

        // Return trip back to Udaipur
        if (validDests.length > 0) {
          const returnRoute = await calculateRoute(currentLoc.lon, currentLoc.lat, UDAIPUR_CITY.lon, UDAIPUR_CITY.lat);
          const returnKm = returnRoute ? Math.ceil(returnRoute.distance / 1000) : getFallbackDistanceKm(currentLoc, UDAIPUR_CITY);

          totalKm += returnKm;
          if (returnRoute?.geometry?.coordinates) {
            allCoordinates = [...allCoordinates, ...returnRoute.geometry.coordinates];
          }
        }

        if (active) {
          setCalculatedDistance(Math.ceil(totalKm / 2)); // Return one-way base KM
          setCalculatedDuration(oneWayDur); // One-way drive time
          if (allCoordinates.length > 0) {
            setRouteGeometry({
              type: 'LineString',
              coordinates: allCoordinates
            });
          } else {
            setRouteGeometry(null);
          }
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
    const qPkg = searchParams.get('package');
    if (qPkg && ROUNDTRIP_PACKAGES.some(p => p.value === qPkg)) {
      setSelectedRtPackage(qPkg);
    }

    // Only an explicit date in the URL (e.g. a shared/deep link) overrides the
    // "now + 1 hour" default set in useState above — a fresh visit should
    // never fall back to a stale date left over from a previous session.
    let loadedPickup = qPickupDate ? new Date(qPickupDate) : null;
    let loadedReturn = qReturnDate ? new Date(qReturnDate) : null;

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

    if (resolvedMode === 'ROUND_TRIP' && qDropCity) {
      const parts = qDropCity.includes('|')
        ? qDropCity.split('|').map(d => d.trim()).filter(Boolean)
        : [qDropCity.trim()];
      if (parts.length > 0) {
        setDestLocations(parts.map(p => ({ name: p })));
      }
    }
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

    if (bookingMode === 'ROUND_TRIP' && selectedRtPackage) {
      if (params.get('package') !== selectedRtPackage) {
        params.set('package', selectedRtPackage);
        changed = true;
      }
    }

    if (changed) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingMode, selectedRtPackage, pickupDate, returnDate, isMounted, router]);

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

  const routeConfiguratorBody = (
    <>
      <div className="space-y-4 relative">

        {bookingMode === 'ROUND_TRIP' ? (
          <>
            <div>
              <label className="block text-[9px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2 font-serif">Pick-Up Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C89D5C]" size={16} />
                <input
                  type="text"
                  readOnly
                  value="Udaipur, Rajasthan"
                  className="w-full bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl pl-12 pr-4 py-4 text-sm outline-none font-serif font-medium text-[#250903] cursor-not-allowed shadow-xs"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[9px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] font-serif">Destinations</label>
                {destLocations.length < 3 && (
                  <button type="button" onClick={addDestination} className="text-[#C89D5C] hover:text-[#551A0C] transition-colors flex items-center gap-1 bg-[#FAF6F0] border border-[#C89D5C]/30 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider font-serif">
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
                        searchAnywhere={true}
                      />
                    </div>
                    {destLocations.length > 1 && (
                      <button type="button" onClick={() => removeDestination(idx)} className="text-red-400 hover:text-red-600 w-8 flex justify-center text-sm font-bold">
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
              <label className="block text-[9px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2 font-serif">Pickup Location</label>
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
              <label className="block text-[9px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2 font-serif">Drop Location</label>
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

            <p className="text-[10px] text-[#8C6D53] font-serif">
              One side must be {airportName}; the other, your locality within the zones we cover.
            </p>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-[9px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2 font-serif">
              {bookingMode === 'ROUND_TRIP' ? 'Travel Date Range (Required)' : bookingMode === 'AIRPORT_TRANSFER' ? 'Transfer Date' : 'Travel Date Range'}
            </label>
            <div className="relative w-full">
              <ConfigProvider
                theme={{
                  token: {
                    colorPrimary: '#551A0C',
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
          <div className="bg-[#250903] text-white border border-[#C89D5C]/40 rounded-2xl p-5 mt-6 shadow-xl relative overflow-hidden font-serif">
            <div className="flex items-center justify-between pb-3 border-b border-[#C89D5C]/20 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C89D5C]/20 border border-[#C89D5C]/30 flex items-center justify-center text-[#DFB574]">
                  <Navigation size={14} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#DFB574]">Route Summary</span>
              </div>
              {isCalculating && <Loader2 size={14} className="animate-spin text-[#DFB574]" />}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Distance Card */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-[#C89D5C]/20">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#E7DFD5]/70 block mb-1">
                  {bookingMode === 'ROUND_TRIP' ? 'Round Trip Distance' : 'One-Way Distance'}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-[#DFB574]">
                    {bookingMode === 'ROUND_TRIP' ? calculatedDistance * 2 : calculatedDistance}
                  </span>
                  <span className="text-xs font-bold text-[#E7DFD5]">KM</span>
                </div>
                {bookingMode === 'ROUND_TRIP' && (
                  <span className="text-[10px] font-mono text-[#E7DFD5]/70 block mt-1">
                    ({calculatedDistance} KM one-way)
                  </span>
                )}
              </div>

              {/* Duration Card */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-[#C89D5C]/20">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#E7DFD5]/70 block mb-1">
                  Est. Drive Time
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white">{displayDuration}</span>
                </div>
                <span className="text-[10px] font-mono text-[#E7DFD5]/70 block mt-1">
                  via shortest route
                </span>
              </div>
            </div>
          </div>

          {!isCalculating && (
            <div className="mt-6 h-[300px] rounded-2xl overflow-hidden shadow-lg border border-[#E7DFD5]">
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
        <div className="bg-[#FEFBF8] border border-[#C89D5C]/40 rounded-xl p-5 mt-6 font-serif text-[10px] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[#8C6D53] font-bold tracking-widest uppercase">SERVICE ZONE</span>
            <span className="text-[#551A0C] font-bold text-sm">{atZone.name}</span>
          </div>
          <p className="text-[#6A5749] leading-relaxed normal-case text-[11px]">
            Fares below already reflect your selected direction and area. Wait time, night hours, and meet &amp; greet charges (if any) are shown per vehicle.
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#250903] font-body pt-28 pb-20 border-t border-[#E7DFD5]">
      <div className="container mx-auto mt-4">

        {/* Header Section */}
        <div className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-8 md:p-12 mb-10 text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#C89D5C]/10 via-[#551A0C]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 text-[#C89D5C] text-[11px] font-bold tracking-[0.25em] uppercase mb-4 font-serif">
            <span>✦ CHAUFFEURED LUXURY JOURNEYS ✦</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-serif font-black uppercase tracking-tight mb-4 text-[#551A0C]">
            ROYAL CHAUFFEUR <span className="font-editorial italic font-normal text-[#C89D5C] lowercase">&amp; transfers</span>
          </h1>
          
          <p className="text-[#6A5749] max-w-2xl text-sm leading-relaxed font-serif">
            Impeccable door-to-door luxury journeys. Commanded by distinguished chauffeurs, GPS monitored, and transparently priced.
          </p>
        </div>

        {/* Booking Mode Tabs */}
        <div className="flex overflow-x-auto lg:flex-wrap gap-3 mb-8 bg-[#FEFBF8] border border-[#E7DFD5] p-2 rounded-2xl w-full lg:w-fit shadow-xs font-serif">
          <button
            onClick={() => setBookingMode('ROUND_TRIP')}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${bookingMode === 'ROUND_TRIP' ? 'bg-[#551A0C] text-[#DFB574] shadow-md' : 'text-[#551A0C]/70 hover:text-[#551A0C]'
              }`}
          >
            Round Trip Packages
          </button>
          <button
            onClick={() => setBookingMode('AIRPORT_TRANSFER')}
            className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${bookingMode === 'AIRPORT_TRANSFER' ? 'bg-[#551A0C] text-[#DFB574] shadow-md' : 'text-[#551A0C]/70 hover:text-[#551A0C]'
              }`}
          >
            Airport Transfers
          </button>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row items-start gap-8">

          {/* Sidebar — desktop only, mobile uses the drawer below */}
          <aside className="hidden lg:block lg:w-[380px] shrink-0 space-y-6 lg:sticky lg:top-32 h-fit z-10">
            <div className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-7 shadow-sm">
              <h2 className="font-serif font-bold text-base text-[#551A0C] uppercase tracking-wide mb-6 pb-4 border-b border-[#E7DFD5]">Route Configurator</h2>
              {!isRouteConfigOpen && routeConfiguratorBody}
            </div>
          </aside>

          {/* Main Classes List */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="font-serif font-bold text-xl text-[#551A0C] uppercase tracking-tight">Choose Private Cab Class</h2>
              <button
                type="button"
                onClick={() => setIsRouteConfigOpen(true)}
                className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 bg-[#FEFBF8] border border-[#E7DFD5] rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#551A0C] shadow-xs transition-colors hover:border-[#C89D5C] active:bg-[#FAF6F0] cursor-pointer font-serif"
              >
                <SlidersHorizontal size={14} className="text-[#C89D5C]" /> Route
              </button>
            </div>

            {bookingMode === 'ROUND_TRIP' && ROUNDTRIP_PACKAGES.length > 1 && (
              <div className="mb-6 card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-serif">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#551A0C] block">Round Trip Price Package</span>
                  <span className="text-xs text-[#8C6D53]">Select your desired daily limit &amp; rate package</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROUNDTRIP_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.value}
                      type="button"
                      onClick={() => setSelectedRtPackage(pkg.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        selectedRtPackage === pkg.value
                          ? 'bg-[#551A0C] text-[#DFB574] shadow-md border border-[#551A0C]'
                          : 'bg-[#FAF6F0] text-[#551A0C] hover:border-[#C89D5C] border border-[#E7DFD5]'
                      }`}
                      title={pkg.hint}
                    >
                      {pkg.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

                  const currentPkgVal = carPackages[car.id] || selectedRtPackage || '300-km';
                  const rtPkgObj = ROUNDTRIP_PACKAGES.find(p => p.value === currentPkgVal) || ROUNDTRIP_PACKAGES[0];
                  const minKmPerDay = rtPkgObj.minKmPerDay;
                  const runningDistance = calculatedDistance * 2;

                  let ratePerKm = setting.roundTripRatePerKm;
                  if (rtPkgObj.discountPercent > 0) {
                    ratePerKm = Math.round(setting.roundTripRatePerKm * (1 - rtPkgObj.discountPercent / 100) * 100) / 100;
                  }

                  let billableKm: number;
                  let basicFare: number;

                  if (rtPkgObj.isUnlimited) {
                    billableKm = Math.max(runningDistance, 400 * durationDays);
                    basicFare = Math.round(400 * ratePerKm * durationDays);
                  } else {
                    billableKm = Math.max(runningDistance, minKmPerDay * durationDays);
                    basicFare = Math.round(billableKm * ratePerKm);
                  }

                  const driverAllowancePerDay = setting.driverAllowancePerDay;
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
                    days: durationDays,
                    packageName: rtPkgObj.label,
                    packageValue: rtPkgObj.value,
                    isUnlimited: rtPkgObj.isUnlimited
                  };

                  const destStr = destLocations.map(d => d.name).filter(Boolean).join(' -> ');
                  extraText = `Round Trip: Udaipur -> ${destStr} (${durationDays} Days) • ${rtPkgObj.label}`;
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
                    <div key={car.id} className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] hover:border-[#C89D5C] rounded-2xl shadow-sm hover:shadow-lg transition-all mb-5 overflow-hidden font-serif">
                      <div className="flex flex-col md:flex-row">

                        {/* ── Left: Image ── */}
                        <div className="relative md:w-64 shrink-0 bg-[#FAF6F0] min-h-[180px]">
                          {/* Image container with its own overflow-hidden so badges aren't clipped */}
                          <div className="absolute inset-0 overflow-hidden">
                            <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full">
                              <CarImageSlider mainImage={car.image} galleryJson={car.gallery} alt={`${car.make} ${car.model}`} imageClassName="object-cover group-hover:scale-105 transition-transform duration-500 w-full h-full" />
                            </Link>
                          </div>
                          {/* Category badge – top left */}
                          <span className="absolute top-3 left-3 z-10 bg-[#FAF6F0]/95 border border-[#C89D5C]/40 text-[#551A0C] text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                            {car.category.replace(/\bClass\b/gi, '').trim()}
                          </span>
                          {/* Availability badge – top right */}
                          <span className={`absolute top-3 right-3 z-10 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs ${car.availability ? 'bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-[#DFB574]' : 'bg-red-500'}`}></span>
                            {car.availability ? 'Available' : 'Unavailable'}
                          </span>
                        </div>

                        {/* ── Center: Info ── */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="p-6 border-b border-[#E7DFD5]">
                            {/* Title */}
                            <h3 className="text-xl font-bold text-[#551A0C] leading-tight mb-1 group-hover:text-[#8C6D53] transition-colors">
                              <Link href={`/cars/${getCarSlug(car)}`}>
                                {car.make} {car.model}
                              </Link>
                            </h3>
                            {/* Specs subtitle */}
                            <p className="text-[11px] text-[#8C6D53] uppercase tracking-wider mb-3">
                              {car.seatingCapacity} Seats &nbsp;•&nbsp; {car.transmission.replace(' Gearbox', '')} &nbsp;•&nbsp; {car.fuelType}
                            </p>
                            {/* Feature pills */}
                            {car.features && car.features.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {car.features.map((feat: string, idx: number) => (
                                  <span key={idx} className="bg-[#551A0C] text-[#DFB574] text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#C89D5C]/30">
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Per-Car Dynamic Round Trip Package Selector */}
                            {ROUNDTRIP_PACKAGES.length > 1 && (
                              <div className="mb-4 bg-[#FAF6F0] border border-[#E7DFD5] p-3.5 rounded-xl">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-[#551A0C] mb-2 flex items-center justify-between">
                                  <span>Round Trip Price Package</span>
                                  <span className="text-[#551A0C] bg-[#FEFBF8] border border-[#C89D5C]/40 px-2 py-0.5 rounded text-[8px] font-bold">{bd.packageName}</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {ROUNDTRIP_PACKAGES.map(pkg => {
                                    const isSelected = (carPackages[car.id] || selectedRtPackage || '300-km') === pkg.value;
                                    return (
                                      <button
                                        key={pkg.value}
                                        type="button"
                                        onClick={() => setCarPackages(prev => ({ ...prev, [car.id]: pkg.value }))}
                                        className={`text-[8.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                          isSelected
                                            ? 'bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-xs'
                                            : 'bg-[#FEFBF8] border-[#E7DFD5] text-[#551A0C] hover:border-[#C89D5C]'
                                        }`}
                                      >
                                        {pkg.minKmPerDay > 0 ? `${pkg.minKmPerDay} KM / Day (${pkg.label.split('(')[1] || ''}`.replace(')', '') : 'Unlimited KM'}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Package details table */}
                            <div className="w-full text-xs text-[#6A5749] space-y-2">
                              <div className="flex justify-between border-b border-[#E7DFD5] pb-2">
                                <span className="text-[#8C6D53]">Package</span>
                                <span className="font-bold text-[#551A0C]">{bd.packageName || 'Outstation (Round Trip)'}</span>
                              </div>
                              {destStr && (
                                <div className="flex justify-between border-b border-[#E7DFD5] pb-2">
                                  <span className="text-[#8C6D53]">Route</span>
                                  <span className="font-medium text-right text-[#250903]">Udaipur → {destStr} → Udaipur</span>
                                </div>
                              )}
                              <div className="flex justify-between border-b border-[#E7DFD5] pb-2">
                                <span className="text-[#8C6D53]">Charged Distance</span>
                                <span className="font-medium text-[#250903]">{bd.chargedDistance} Km</span>
                              </div>
                              <div className="flex justify-between pb-1">
                                <span className="text-[#8C6D53]">Extra Charge</span>
                                <span className="font-medium text-[#250903]">₹{bd.ratePerKm}/Km (Beyond {bd.chargedDistance}Km)</span>
                              </div>
                            </div>
                          </div>

                          {/* Inclusions strip */}
                          <div className="px-6 py-3 flex flex-wrap items-center gap-4 bg-[#FAF6F0] border-t border-[#E7DFD5]">
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6A5749]">
                              <svg className="w-3.5 h-3.5 text-[#C89D5C]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              Inc. GST &amp; Driver Allowance
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#8C6D53]">
                              <span className="text-[#C89D5C]">✦</span>
                              Exc. Toll Tax &amp; Parking
                            </span>
                            <button onClick={() => toggleTab("fare")} className="ml-auto flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#551A0C] hover:text-[#C89D5C] transition-colors cursor-pointer">
                              View Breakdown &amp; Terms <ArrowDownUp size={12} className="text-[#C89D5C]" />
                            </button>
                          </div>
                        </div>

                        {/* ── Right: Fare Panel ── */}
                        <div className="shrink-0 md:w-56 bg-[#FAF6F0] border-t md:border-t-0 md:border-l border-[#E7DFD5] p-6 flex flex-col items-center justify-between">
                          <div className="text-center w-full">
                            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C6D53] mb-2">Package Fare ({bd.days}D)</div>
                            <div className="text-3xl font-black text-[#551A0C] leading-none tracking-tight">
                              ₹{flatFare.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-[#8C6D53] italic mt-1 mb-3">all inclusive</div>
                          </div>
                          <button
                            onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)}
                            disabled={isAlreadyBooked || !returnDate || calculatedDistance === 0}
                            className={`w-full mt-4 font-bold text-[10px] tracking-[0.2em] uppercase py-3.5 px-4 rounded-xl transition-all ${isAlreadyBooked || !returnDate || calculatedDistance === 0
                              ? 'bg-[#E7DFD5] text-[#8C6D53] cursor-not-allowed'
                              : 'btn-luxury btn-luxury-shine text-[#DFB574] shadow-md'
                              }`}
                          >
                            {isAlreadyBooked ? 'Already Booked' : !returnDate ? 'Select Dates First' : calculatedDistance === 0 ? 'Select Valid Route' : 'Reserve Carriage'}
                          </button>
                        </div>

                      </div>

                      {/* Expandable breakdown tabs */}
                      {activeTab?.startsWith(`${car.id}-`) && (
                        <div className="border-t border-[#E7DFD5] px-6 py-6 bg-[#FEFBF8]">
                          <div className="flex flex-wrap gap-2.5 mb-6">
                            <button onClick={() => toggleTab("fare")} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${isTabActive("fare") ? "bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-xs" : "bg-[#FAF6F0] text-[#551A0C] border-[#E7DFD5] hover:border-[#C89D5C]"}`}>Fare Details</button>
                            <button onClick={() => toggleTab("exclusion")} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${isTabActive("exclusion") ? "bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-xs" : "bg-[#FAF6F0] text-[#551A0C] border-[#E7DFD5] hover:border-[#C89D5C]"}`}>Exclusions</button>
                            <button onClick={() => toggleTab("terms")} className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${isTabActive("terms") ? "bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-xs" : "bg-[#FAF6F0] text-[#551A0C] border-[#E7DFD5] hover:border-[#C89D5C]"}`}>Terms &amp; Conditions</button>
                          </div>

                          {isTabActive("fare") && (
                            <div className="flex flex-col md:flex-row gap-6 text-xs">
                              <div className="flex-1 bg-[#FAF6F0] p-5 rounded-2xl border border-[#E7DFD5] space-y-3">
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">Basic Fare</span><span className="font-bold text-[#250903]">₹{bd.basicFare}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">Driver Allowances</span><span className="font-bold text-[#250903]">₹{bd.driverAllowance}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">GST (18%)</span><span className="font-bold text-[#250903]">₹{bd.gstAmount}</span></div>
                                <div className="flex justify-between items-center pt-3 border-t border-[#E7DFD5]"><span className="text-[#551A0C] font-bold">Total Amount</span><span className="font-bold text-[#551A0C] text-lg">₹{flatFare}</span></div>
                              </div>
                              <div className="flex-1 bg-[#FAF6F0] p-5 rounded-2xl border border-[#E7DFD5] space-y-3">
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">Rate/Km</span><span className="font-bold text-[#250903]">₹{bd.ratePerKm}/Km</span></div>
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">No. of Days</span><span className="font-bold text-[#250903]">{bd.days} Days</span></div>
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">Min Km/Day ({bd.minKmPerDay}*{bd.days})</span><span className="font-bold text-[#250903]">{bd.chargedDistance} Km</span></div>
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">Running Distance</span><span className="font-bold text-[#250903]">{bd.runningDistance} Km</span></div>
                                <div className="flex justify-between items-center"><span className="text-[#8C6D53]">Charged Distance</span><span className="font-bold text-[#250903]">{bd.chargedDistance} Km</span></div>
                              </div>
                            </div>
                          )}

                          {isTabActive("exclusion") && (
                            <div className="text-xs text-[#6A5749] p-5 bg-[#FAF6F0] rounded-2xl border border-[#E7DFD5]">
                              <ul className="list-disc pl-5 space-y-2">
                                {exclusionsList.map((item: string, idx: number) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {isTabActive("terms") && (
                            <div className="text-xs text-[#6A5749] p-5 bg-[#FAF6F0] rounded-2xl border border-[#E7DFD5]">
                              <ul className="list-disc pl-5 space-y-2">
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
                  <div key={car.id} className="card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] hover:border-[#C89D5C] rounded-2xl shadow-sm hover:shadow-lg transition-all mb-5 overflow-hidden font-serif">
                    <div className="flex flex-col md:flex-row">

                      {/* ── Left: Image ── */}
                      <div className="relative md:w-64 shrink-0 bg-[#FAF6F0] flex items-center justify-center min-h-[180px]">
                        {/* Image with its own overflow-hidden so badges aren't clipped */}
                        <div className="absolute inset-0 overflow-hidden">
                          <Link href={`/cars/${getCarSlug(car)}`} className="block w-full h-full">
                            <CarImageSlider mainImage={car.image || '/placeholder-car.png'} galleryJson={car.gallery} alt={`${car.make} ${car.model}`} imageClassName="object-cover group-hover:scale-105 transition-transform duration-500 w-full h-full" />
                          </Link>
                        </div>
                        {/* Category badge – top left */}
                        <span className="absolute top-3 left-3 z-10 bg-[#FAF6F0]/95 border border-[#C89D5C]/40 text-[#551A0C] text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                          {car.category.replace(/\bClass\b/gi, '').trim()}
                        </span>
                        {/* Available badge – top right */}
                        <span className={`absolute top-3 right-3 z-10 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs ${car.availability ? 'bg-[#551A0C] text-[#DFB574] border border-[#C89D5C]/40' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${car.availability ? 'bg-[#DFB574]' : 'bg-red-500'}`}></span>
                          {car.availability ? 'Available' : 'Unavailable'}
                        </span>
                      </div>

                      {/* ── Center: Info + Inclusions ── */}
                      <div className="flex-1 flex flex-col justify-between">
                        {/* Top: Name + specs + features + description */}
                        <div className="p-6 border-b border-[#E7DFD5]">
                          {/* Title row */}
                          <h3 className="text-xl font-bold text-[#551A0C] leading-tight mb-1 group-hover:text-[#8C6D53] transition-colors">
                            <Link href={`/cars/${getCarSlug(car)}`}>
                              {car.make} {car.model}
                            </Link>
                          </h3>
                          {/* Specs subtitle */}
                          <p className="text-[11px] text-[#8C6D53] uppercase tracking-wider mb-3">
                            {car.seatingCapacity} Seats &nbsp;•&nbsp; {car.transmission.replace(' Gearbox', '')} &nbsp;•&nbsp; {car.fuelType}
                          </p>
                          {/* Feature pills */}
                          {car.features && car.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {car.features.map((feat: string, idx: number) => (
                                <span key={idx} className="bg-[#551A0C] text-[#DFB574] text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#C89D5C]/30">
                                  {feat}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Description */}
                          {car.content && car.content.replace(/<[^>]*>/g, '').trim() ? (
                            <div className="text-xs text-[#6A5749] leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: car.content }} />
                          ) : (
                            <p className="text-xs text-[#8C6D53]">Guaranteed private chauffeur service. Immaculate cabin and professional chauffeur.</p>
                          )}
                        </div>

                        {/* Bottom: Inclusions strip */}
                        <div className="px-6 py-3 flex flex-wrap items-center gap-4 bg-[#FAF6F0] border-t border-[#E7DFD5]">
                          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6A5749]">
                            <svg className="w-3.5 h-3.5 text-[#C89D5C]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            30 min free wait
                          </span>
                          {car._airportBreakdown?.meetAndGreet && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#6A5749]">
                              <svg className="w-3.5 h-3.5 text-[#C89D5C]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                              Meet &amp; Greet
                            </span>
                          )}
                          {car._airportBreakdown?.nightFee > 0 && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#8C6D53]">
                              <span className="text-[#C89D5C]">✦</span>
                              Night charge: ₹{car._airportBreakdown.nightFee.toLocaleString()}
                            </span>
                          )}
                          {car._airportBreakdown?.waitChargePer30Min > 0 && (
                            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#8C6D53]">
                              <span className="text-[#C89D5C]">✦</span>
                              +₹{car._airportBreakdown.waitChargePer30Min}/30min extra wait
                            </span>
                          )}
                        </div>
                      </div>

                      {/* ── Right: Fare Panel ── */}
                      <div className="shrink-0 md:w-56 bg-[#FAF6F0] border-t md:border-t-0 md:border-l border-[#E7DFD5] p-6 flex flex-col items-center justify-between">
                        <div className="text-center w-full">
                          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8C6D53] mb-2">Flat Fare</div>
                          {car._airportBreakdown?.hasFare ? (
                            <>
                              <div className="text-3xl font-black text-[#551A0C] leading-none tracking-tight">
                                ₹{flatFare.toLocaleString()}
                              </div>
                              <div className="text-[9px] text-[#8C6D53] italic mt-1 mb-3">all inclusive</div>
                              {car._airportBreakdown.nightApplies && car._airportBreakdown.nightFee > 0 && (
                                <div className="text-[9px] text-[#551A0C] bg-[#FAF6F0] border border-[#C89D5C]/30 rounded-lg px-2 py-1.5 font-bold uppercase tracking-wider">
                                  Night fee included
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="text-3xl font-black text-[#A8988A] leading-none">—</div>
                              <div className="text-[9px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 mt-2 leading-relaxed">
                                No fare configured for this zone
                              </div>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => !isAlreadyBooked && handleBook(car, flatFare, extraText)}
                          disabled={isAlreadyBooked || !atZoneId || !car._airportBreakdown?.hasFare}
                          className={`w-full mt-4 font-bold text-[10px] tracking-[0.2em] uppercase py-3.5 px-4 rounded-xl transition-all ${isAlreadyBooked || !atZoneId || !car._airportBreakdown?.hasFare
                            ? 'bg-[#E7DFD5] text-[#8C6D53] cursor-not-allowed'
                            : 'btn-luxury btn-luxury-shine text-[#DFB574] shadow-md'
                            }`}
                        >
                          {isAlreadyBooked ? 'Already Booked'
                            : !atZoneId ? 'Select Area First'
                              : !car._airportBreakdown?.hasFare ? 'Not Available'
                                : 'Reserve Transfer'}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}



              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12 border-t border-[#E7DFD5] pt-8">
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-[#E7DFD5] bg-[#FEFBF8] flex items-center justify-center text-[#551A0C] hover:border-[#C89D5C] hover:text-[#551A0C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs font-serif"
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
                      className={`w-10 h-10 rounded-xl border text-xs font-serif font-bold transition-all cursor-pointer ${currentPage === page
                        ? 'bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-md'
                        : 'border-[#E7DFD5] bg-[#FEFBF8] text-[#551A0C] hover:border-[#C89D5C]'
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
                    className="w-10 h-10 rounded-xl border border-[#E7DFD5] bg-[#FEFBF8] flex items-center justify-center text-[#551A0C] hover:border-[#C89D5C] hover:text-[#551A0C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs font-serif"
                  >
                    &rarr;
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Mobile Route Configurator Drawer */}
        {isRouteConfigOpen && (
          <>
            <div
              className="fixed inset-0 bg-[#250903]/60 backdrop-blur-sm z-[100] lg:hidden"
              onClick={() => setIsRouteConfigOpen(false)}
            />
            <div className="fixed top-0 left-0 h-full w-full max-w-sm bg-[#FEFBF8] border-r border-[#E7DFD5] shadow-2xl z-[101] flex flex-col lg:hidden font-serif">
              <div className="flex items-center justify-between p-6 border-b border-[#E7DFD5] shrink-0">
                <h2 className="font-bold text-sm text-[#551A0C] uppercase tracking-widest">Route Configurator</h2>
                <button
                  onClick={() => setIsRouteConfigOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#8C6D53] hover:text-[#551A0C] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {routeConfiguratorBody}
              </div>
              <div className="p-6 border-t border-[#E7DFD5] shrink-0">
                <button
                  onClick={() => setIsRouteConfigOpen(false)}
                  className="w-full btn-luxury btn-luxury-shine text-[#DFB574] px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
