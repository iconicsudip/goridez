'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, Navigation, Compass, ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { useBookingStore } from '@/store/useBookingStore';
import LocationField from '@/components/LocationField';
import AirportLocalitySearch, { AIRPORT_ZONE_ID } from '@/components/AirportLocalitySearch';
import SelfDriveLocationSearch from '@/components/SelfDriveLocationSearch';
import { calculatePackagePricing, getPackageDurationHours } from '@/lib/utils';
import { calculateRoute, resolveLocationData, getFallbackDistanceKm, OSMLocation } from '@/lib/osm';

const UDAIPUR_CITY: OSMLocation = {
  place_id: -2,
  display_name: 'Udaipur, Rajasthan, India',
  lat: '24.5854',
  lon: '73.7125',
  type: 'city'
};

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

export default function UnifiedCarBookingSidebar({
  car,
  packages = [],
  taxiSettings = [],
  airportZones = [],
  selfDriveLocations = [],
  airportName = 'the Airport'
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // --- Shared State ---
  const [isMounted, setIsMounted] = useState(false);
  const [bookingMode, setBookingMode] = useState<'SELF_DRIVE' | 'ROUND_TRIP' | 'AIRPORT_TRANSFER'>('SELF_DRIVE');

  // --- Date States ---
  const [pickupDate, setPickupDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [returnDate, setReturnDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 25, 0, 0, 0);
    return d;
  });

  // --- Self-Drive States ---
  // Pickup/drop are picked from the admin-curated SelfDriveLocation list for this car's city, not free text.
  const [sdPickup, setSdPickup] = useState({ name: '', locationId: '', price: 0 });
  const [sdDrop, setSdDrop] = useState({ name: '', locationId: '', price: 0 });
  const sdLocations = selfDriveLocations.filter((l: any) => l.cityId === car.cityId);

  // --- Round Trip States ---
  const [destLocations, setDestLocations] = useState<{name: string, data?: OSMLocation}[]>([{ name: '' }]);
  const [rtDistance, setRtDistance] = useState(0);
  const [rtDuration, setRtDuration] = useState(0);
  const [isCalculatingRt, setIsCalculatingRt] = useState(false);

  // --- Airport Transfer States ---
  const [atPickup, setAtPickup] = useState({ name: '', zoneId: '' });
  const [atDrop, setAtDrop] = useState({ name: '', zoneId: '' });

  // Init from URL Params
  useEffect(() => {
    setIsMounted(true);
    
    // Dates
    const qPickupDate = searchParams.get('pickupDate');
    const qReturnDate = searchParams.get('returnDate');
    if (qPickupDate) setPickupDate(new Date(qPickupDate));
    if (qReturnDate) setReturnDate(new Date(qReturnDate));

    // Mode
    const qMode = searchParams.get('mode');
    if (qMode === 'ROUND_TRIP' || qMode === 'AIRPORT_TRANSFER') {
      setBookingMode(qMode as any);
    } else {
      // Default based on car capabilities if possible, otherwise SELF_DRIVE
      const hasSelfDrive = car.serviceTypes?.includes('SELF_DRIVE') ?? true;
      if (!hasSelfDrive && car.serviceTypes?.includes('TAXI')) setBookingMode('ROUND_TRIP');
      else setBookingMode('SELF_DRIVE');
    }

    // SD Pickup/Drop — try to match an incoming city/location param to one of
    // this car's admin-defined self-drive locations by name.
    const qPickupCity = searchParams.get('pickupLocation') || searchParams.get('pickupCity');
    if (qPickupCity) {
      const match = sdLocations.find((l: any) => l.name.toLowerCase() === qPickupCity.toLowerCase());
      if (match) setSdPickup({ name: match.name, locationId: match.id, price: match.price });
    }

    const qDropCity = searchParams.get('dropLocation') || searchParams.get('dropCity');
    if (qDropCity) {
      const match = sdLocations.find((l: any) => l.name.toLowerCase() === qDropCity.toLowerCase());
      if (match) setSdDrop({ name: match.name, locationId: match.id, price: match.price });
    }

    // RT Destinations
    if (qMode === 'ROUND_TRIP' && qDropCity) {
      const parts = qDropCity.includes('|')
        ? qDropCity.split('|').map((d: string) => d.trim()).filter(Boolean)
        : [qDropCity.trim()];
      if (parts.length > 0) setDestLocations(parts.map((p: string) => ({ name: p })));
    }

    // AT Zones
    const qAtPickupName = searchParams.get('atPickupName');
    const qAtPickupZoneId = searchParams.get('atPickupZoneId');
    const qAtDropName = searchParams.get('atDropName');
    const qAtDropZoneId = searchParams.get('atDropZoneId');
    if (qAtPickupName && qAtPickupZoneId) setAtPickup({ name: qAtPickupName, zoneId: qAtPickupZoneId });
    if (qAtDropName && qAtDropZoneId) setAtDrop({ name: qAtDropName, zoneId: qAtDropZoneId });
  }, []);

  // Sync Search Params silently
  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('mode', bookingMode);
    window.history.replaceState({}, '', `?${params.toString()}`);
  }, [bookingMode]);

  // Round Trip Route Calculator
  useEffect(() => {
    let active = true;
    if (bookingMode !== 'ROUND_TRIP') return;

    const fetchRoute = async () => {
      setIsCalculatingRt(true);
      let totalKm = 0;
      let totalDur = 0;
      let currentLoc = UDAIPUR_CITY;

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
        currentLoc = dest.data!;
      }
      
      if (validDests.length > 0) {
        const returnRoute = await calculateRoute(currentLoc.lon, currentLoc.lat, UDAIPUR_CITY.lon, UDAIPUR_CITY.lat);
        const returnKm = returnRoute ? Math.ceil(returnRoute.distance / 1000) : getFallbackDistanceKm(currentLoc, UDAIPUR_CITY);

        totalKm += returnKm;
      }
      
      if (active) {
        setRtDistance(Math.ceil(totalKm / 2));
        setRtDuration(oneWayDur);
        setIsCalculatingRt(false);
      }
    };
    
    fetchRoute();
    return () => { active = false; };
  }, [destLocations, bookingMode]);


  // ── PRICING ENGINES ────────────────────────────

  // Self-Drive
  const sdPriceInfo = useMemo(() => {
    if (!returnDate) return null;
    const ms = returnDate.getTime() - pickupDate.getTime();
    const hours = ms / (1000 * 60 * 60);
    const result = calculatePackagePricing(packages, hours);
    const locationSurcharge = (sdPickup.price || 0) + (sdDrop.price || 0);
    return { ...result, hours, days: Math.ceil(hours / 24), locationSurcharge };
  }, [pickupDate, returnDate, packages, sdPickup, sdDrop]);

  // Round Trip
  const rtPriceInfo = useMemo(() => {
    if (!returnDate) return null;
    const ms = returnDate.getTime() - pickupDate.getTime();
    const durationDays = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    
    const setting = taxiSettings.find((s: any) => s.vehicleCategory.toLowerCase() === car.category.toLowerCase()) || {
      roundTripRatePerKm: packages?.[0]?.extraChargePerUnit || 13,
      roundTripMinKmPerDay: 250,
      driverAllowancePerDay: car.driverAllowanceOut || 350
    };

    const runningDistance = rtDistance * 2;
    const billableKm = Math.max(runningDistance, setting.roundTripMinKmPerDay * durationDays);
    const basicFare = Math.round(billableKm * setting.roundTripRatePerKm);
    const driverAllowance = setting.driverAllowancePerDay * durationDays;
    const gstAmount = Math.round(basicFare * 0.18);
    const flatFare = basicFare + driverAllowance + gstAmount;

    return { flatFare, basicFare, driverAllowance, gstAmount, days: durationDays, billableKm };
  }, [pickupDate, returnDate, rtDistance, car, taxiSettings]);

  // Airport Transfer
  const atPriceInfo = useMemo(() => {
    const atPickupIsAirport = atPickup.zoneId === AIRPORT_ZONE_ID;
    const atDropIsAirport = atDrop.zoneId === AIRPORT_ZONE_ID;
    const targetZoneId = atPickupIsAirport ? atDrop.zoneId : atPickup.zoneId;
    const atZone = airportZones.find((z: any) => z.id === targetZoneId);

    const zoneFare = atZone?.fares?.find((f: any) => normalizeVehicleCategory(f.vehicleCategory) === normalizeVehicleCategory(car.category));
    const nightApplies = isNightTime(pickupDate);
    const nightFee = nightApplies ? (zoneFare?.nightFee || 0) : 0;
    const basePrice = zoneFare ? (atPickupIsAirport ? zoneFare.pickupPrice : zoneFare.dropPrice) : 0;
    const flatFare = basePrice + nightFee;

    return { flatFare, basePrice, nightApplies, nightFee, hasFare: !!zoneFare, atZone };
  }, [pickupDate, atPickup, atDrop, airportZones, car]);


  // ── HANDLERS ──────────────────────────────────
  const handleBooking = () => {
    const { addToCart, updateSession } = useBookingStore.getState();

    if (bookingMode === 'SELF_DRIVE') {
      const currentPackage = sdPriceInfo?.selectedPkg || packages[0];
      if (!currentPackage) { alert('Please select a valid package.'); return; }
      if (sdLocations.length > 0 && (!sdPickup.locationId || !sdDrop.locationId)) {
        alert('Please select a pickup and drop location.'); return;
      }

      const totalPrice = sdPriceInfo!.basePrice + sdPriceInfo!.locationSurcharge;

      updateSession({
        bookingMode,
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate?.toISOString(),
        pickupCity: car.city?.name || '',
        pickupStation: sdPickup.name,
        dropStation: sdDrop.name
      });
      addToCart({
        serviceType: 'selfDrive',
        referenceId: car.id,
        packageId: currentPackage.id,
        title: `${car.make} ${car.model}`,
        image: car.image || '',
        price: totalPrice,
        deposit: currentPackage.deposit || 0,
        extraInfo: sdPriceInfo!.extraInfo,
        pickupStation: sdPickup.name,
        dropStation: sdDrop.name,
        cityId: car.cityId || undefined,
        pickupPrice: sdPickup.price,
        dropPrice: sdDrop.price
      });
    } else if (bookingMode === 'ROUND_TRIP') {
      if (!rtPriceInfo) return;
      const validDests = destLocations.filter(d => d.name.trim());
      if (validDests.length === 0) { alert('Please specify a destination.'); return; }

      const destStr = validDests.map(d => d.name).join('|');
      
      updateSession({
        bookingMode,
        pickupDate: pickupDate.toISOString(),
        returnDate: returnDate?.toISOString(),
        pickupCity: 'Udaipur',
        dropCity: destStr
      });
      addToCart({
        serviceType: 'roundTripTaxi',
        referenceId: car.id,
        title: `${car.make} ${car.model}`,
        image: car.image || '',
        price: rtPriceInfo.flatFare,
        deposit: Math.round(rtPriceInfo.flatFare * 0.3), // 30% advance
        extraInfo: `Round Trip: Udaipur -> ${validDests.map(d => d.name).join(' -> ')} (${rtPriceInfo.days} Days)`,
        pickupStation: 'Udaipur',
        dropStation: validDests[validDests.length-1].name
      });
    } else if (bookingMode === 'AIRPORT_TRANSFER') {
      if (!atPriceInfo?.hasFare) { alert('Service not available for this zone.'); return; }
      const atPickupIsAirport = atPickup.zoneId === AIRPORT_ZONE_ID;
      
      updateSession({
        bookingMode,
        pickupDate: pickupDate.toISOString(),
        pickupStation: atPickup.name,
        dropStation: atDrop.name
      });
      addToCart({
        serviceType: 'airportTransfer',
        referenceId: car.id,
        title: `${car.make} ${car.model}`,
        image: car.image || '',
        price: atPriceInfo.flatFare,
        deposit: Math.round(atPriceInfo.flatFare * 0.3),
        extraInfo: `Airport Transfer: ${atPickup.name} -> ${atDrop.name}`,
        pickupStation: atPickup.name,
        dropStation: atDrop.name
      });
    }

    router.push('/cart');
  };

  const updateDestination = (idx: number, val: string) => {
    const newDests = [...destLocations];
    newDests[idx].name = val;
    newDests[idx].data = undefined;
    setDestLocations(newDests);
  };
  const addDestination = () => {
    if (destLocations.length < 3) setDestLocations([...destLocations, { name: '' }]);
  };
  const removeDestination = (idx: number) => {
    setDestLocations(destLocations.filter((_, i) => i !== idx));
  };


  if (!isMounted) return <div className="bg-gray-100 rounded-3xl p-8 h-96 animate-pulse"></div>;

  const hasSelfDrive = car.serviceTypes?.includes('SELF_DRIVE');
  const hasTaxi = car.serviceTypes?.includes('TAXI') || car.serviceTypes?.includes('WITH_DRIVER');

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-3xl p-6 md:p-8 lg:sticky lg:top-28">
      {/* TABS */}
      <div className="flex bg-gray-200/50 p-1.5 rounded-2xl mb-8 overflow-x-auto hide-scrollbar">
        {hasSelfDrive && (
          <button
            onClick={() => setBookingMode('SELF_DRIVE')}
            className={`flex-1 py-3 px-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all min-w-max ${
              bookingMode === 'SELF_DRIVE' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Self Drive
          </button>
        )}
        {hasTaxi && (
          <>
            <button
              onClick={() => setBookingMode('ROUND_TRIP')}
              className={`flex-1 py-3 px-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all min-w-max ${
                bookingMode === 'ROUND_TRIP' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Round Trip
            </button>
            <button
              onClick={() => setBookingMode('AIRPORT_TRANSFER')}
              className={`flex-1 py-3 px-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl transition-all min-w-max ${
                bookingMode === 'AIRPORT_TRANSFER' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Transfer
            </button>
          </>
        )}
      </div>

      <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
        <span className="text-green-600">/</span> TRIP DETAILS
      </h2>

      <div className="space-y-5">
        
        {/* === LOCATION FIELDS === */}
        {bookingMode === 'SELF_DRIVE' && (
          <>
            <div>
              <SelfDriveLocationSearch
                label="Pickup Location"
                locations={sdLocations}
                value={sdPickup.name}
                onChange={(name, locationId, price) => setSdPickup({ name, locationId, price })}
                placeholder="Select pickup location..."
              />
            </div>
            <div>
              <SelfDriveLocationSearch
                label="Drop Location"
                locations={sdLocations}
                value={sdDrop.name}
                onChange={(name, locationId, price) => setSdDrop({ name, locationId, price })}
                placeholder="Select drop location..."
              />
            </div>
          </>
        )}

        {bookingMode === 'ROUND_TRIP' && (
          <>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Pickup Location</label>
              <LocationField label="" value="Udaipur, Rajasthan" onChange={() => {}} readOnly />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Destinations</label>
              <div className="space-y-2">
                {destLocations.map((dest, idx) => {
                  const rightBtn = (
                    <div className="flex items-center gap-1">
                      {idx === destLocations.length - 1 && destLocations.length < 3 ? (
                        <button type="button" onClick={addDestination} className="text-brand-gold hover:text-[#8dbb00] p-1"><span className="text-lg leading-none">+</span></button>
                      ) : (idx > 0 || destLocations.length > 1) ? (
                        <button type="button" onClick={() => removeDestination(idx)} className="text-red-400 hover:text-red-600 p-1"><span className="text-lg leading-none">×</span></button>
                      ) : null}
                    </div>
                  );
                  return (
                    <LocationField
                      key={idx}
                      label={`Stop ${idx + 1}`}
                      value={dest.name}
                      onChange={(name, loc) => {
                        const newDests = [...destLocations];
                        newDests[idx] = { name, data: loc };
                        setDestLocations(newDests);
                      }}
                      placeholder="Search destination..."
                      searchAnywhere={true}
                      rightElement={rightBtn}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {bookingMode === 'AIRPORT_TRANSFER' && (
          <>
            <div>
              <AirportLocalitySearch
                label="Pickup Location"
                zones={airportZones}
                airportLabel={airportName}
                value={atPickup.name}
                onChange={(name, zoneId) => {
                  setAtPickup({ name, zoneId });
                  if (zoneId === AIRPORT_ZONE_ID && atDrop.zoneId === AIRPORT_ZONE_ID) setAtDrop({ name: '', zoneId: '' });
                }}
                placeholder="Search pickup..."
              />
            </div>
            <div>
              <AirportLocalitySearch
                label="Drop Location"
                zones={airportZones}
                airportLabel={airportName}
                value={atDrop.name}
                onChange={(name, zoneId) => {
                  setAtDrop({ name, zoneId });
                  if (zoneId === AIRPORT_ZONE_ID && atPickup.zoneId === AIRPORT_ZONE_ID) setAtPickup({ name: '', zoneId: '' });
                }}
                placeholder="Search drop..."
              />
            </div>
          </>
        )}

        {/* === DATE SELECTION === */}
        <div className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)] relative w-full">
          <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider flex justify-between">
            <span>{bookingMode === 'AIRPORT_TRANSFER' ? 'Pickup Date & Time' : 'Travel Date Range'}</span>
            {bookingMode === 'SELF_DRIVE' && sdPriceInfo && sdPriceInfo.hours > 0 && (
              <span className="text-green-700 font-bold text-xs">
                {Math.round(sdPriceInfo.hours * 10) / 10} Hrs
              </span>
            )}
          </label>
          <div className="w-full">
            <ConfigProvider theme={{ token: { colorPrimary: '#15803d', borderRadius: 12, fontSize: 13 } }}>
              {bookingMode === 'AIRPORT_TRANSFER' ? (
                <DatePicker
                  showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                  format="DD-MM-YYYY - h:mm a"
                  value={dayjs(pickupDate)}
                  onChange={(val) => { if (val) setPickupDate(val.toDate()); }}
                  className="w-full font-bold text-gray-900 border-none shadow-none p-0 outline-none hover:bg-transparent focus:bg-transparent"
                  allowClear={false}
                />
              ) : (
                <DatePicker.RangePicker
                  showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                  format="DD-MM-YYYY - h:mm a"
                  value={returnDate ? [dayjs(pickupDate), dayjs(returnDate)] : null}
                  onChange={(vals) => {
                    if (vals && vals[0]) setPickupDate(vals[0].toDate());
                    if (vals && vals[1]) setReturnDate(vals[1].toDate());
                  }}
                  className="w-full font-bold text-gray-900 border-none shadow-none p-0 outline-none"
                  allowClear={false}
                />
              )}
            </ConfigProvider>
          </div>
        </div>

        {/* === PRICING STRUCTURE === */}
        {bookingMode === 'SELF_DRIVE' && sdPriceInfo && (
          <div className="bg-gray-900 text-white rounded-2xl p-6 mt-8 font-mono shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Price Structure (SD)
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between text-gray-300">
                <span>RENTAL RATE ({sdPriceInfo.extraInfo})</span>
                <span>₹{sdPriceInfo.basePrice.toLocaleString()}</span>
              </div>
              {sdPriceInfo.locationSurcharge > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>PICKUP/DROP CHARGE</span>
                  <span>₹{sdPriceInfo.locationSurcharge.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>REFUNDABLE DEPOSIT</span>
                <span>₹{(sdPriceInfo.selectedPkg?.deposit || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-800 my-5"></div>
            <div className="flex justify-between items-end mb-8">
              <div className="text-[10px] text-gray-400 tracking-widest font-black uppercase">Gross Total</div>
              <div className="text-2xl font-black text-green-400">₹{(sdPriceInfo.basePrice + sdPriceInfo.locationSurcharge + (sdPriceInfo.selectedPkg?.deposit || 0)).toLocaleString()}</div>
            </div>

            <button onClick={handleBooking} className="w-full bg-green-600 hover:bg-green-500 text-white font-sans font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all active:scale-[0.98]">
              Book Now
            </button>
          </div>
        )}

        {bookingMode === 'ROUND_TRIP' && rtPriceInfo && (
          <div className="bg-gray-900 text-white rounded-2xl p-6 mt-8 font-mono shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Price Structure (RT)
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between text-gray-300">
                <span>BASIC FARE ({rtPriceInfo.billableKm} KM)</span>
                <span>₹{rtPriceInfo.basicFare.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>DRIVER ALLOWANCE</span>
                <span>₹{rtPriceInfo.driverAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GST (18%)</span>
                <span>₹{rtPriceInfo.gstAmount.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-800 my-5"></div>
            <div className="flex justify-between items-end mb-8">
              <div className="text-[10px] text-gray-400 tracking-widest font-black uppercase">Gross Total</div>
              <div className="text-2xl font-black text-green-400">
                {isCalculatingRt ? <Loader2 size={16} className="animate-spin inline" /> : `₹${rtPriceInfo.flatFare.toLocaleString()}`}
              </div>
            </div>

            <button onClick={handleBooking} disabled={isCalculatingRt} className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-sans font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all active:scale-[0.98]">
              Book Now
            </button>
          </div>
        )}

        {bookingMode === 'AIRPORT_TRANSFER' && atPriceInfo && (
          <div className="bg-gray-900 text-white rounded-2xl p-6 mt-8 font-mono shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Price Structure (AT)
            </div>

            {!atPriceInfo.hasFare ? (
              <div className="text-red-400 text-xs py-4 text-center">Service not available for this vehicle in the selected zone.</div>
            ) : (
              <>
                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex justify-between text-gray-300">
                    <span>TRANSFER RATE</span>
                    <span>₹{atPriceInfo.basePrice.toLocaleString()}</span>
                  </div>
                  {atPriceInfo.nightApplies && (
                    <div className="flex justify-between text-gray-400">
                      <span>NIGHT CHARGE</span>
                      <span>₹{atPriceInfo.nightFee.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-800 my-5"></div>
                <div className="flex justify-between items-end mb-8">
                  <div className="text-[10px] text-gray-400 tracking-widest font-black uppercase">Gross Total</div>
                  <div className="text-2xl font-black text-green-400">₹{atPriceInfo.flatFare.toLocaleString()}</div>
                </div>

                <button onClick={handleBooking} className="w-full bg-green-600 hover:bg-green-500 text-white font-sans font-black uppercase tracking-widest text-[11px] py-4 rounded-xl transition-all active:scale-[0.98]">
                  Book Now
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
