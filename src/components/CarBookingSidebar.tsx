'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, Navigation, Compass, ChevronDown, Search, X } from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { useBookingStore } from '@/store/useBookingStore';
import LocationAutocomplete from '@/components/LocationAutocomplete';
import { calculatePackagePricing, getPackageDurationHours } from '@/lib/utils';

interface Package {
  id: string;
  name: string;
  type: string;
  basePrice: number;
  limitValue: number | null;
  extraChargePerUnit: number | null;
  deposit: number;
}

interface CarBookingSidebarProps {
  car: any;
  packages: Package[];
  cities: any[];
}

export default function CarBookingSidebar({ car, packages, cities }: CarBookingSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || searchParams.get('cities')?.split(',')[0] || '');
  const [pickupLocation, setPickupLocation] = useState(() => {
    const initialCityId = searchParams.get('city') || searchParams.get('cities')?.split(',')[0] || '';
    return searchParams.get('pickupLocation') || searchParams.get('pickupCity') || cities.find(c => c.id === initialCityId)?.name || '';
  });
  const [dropLocation, setDropLocation] = useState(searchParams.get('dropLocation') || searchParams.get('dropCity') || '');
  
  const [pickupDateTime, setPickupDateTime] = useState<Date>(() => {
    const pickupParam = searchParams.get('pickupDate');
    if (pickupParam) {
      const d = new Date(pickupParam);
      if (!isNaN(d.getTime())) {
        return d.getTime() < Date.now() ? new Date() : d;
      }
    }
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  
  const [returnDateTime, setReturnDateTime] = useState<Date>(() => {
    const returnParam = searchParams.get('returnDate');
    if (returnParam) {
      const d = new Date(returnParam);
      if (!isNaN(d.getTime())) {
        const ms = d.getTime() - pickupDateTime.getTime();
        const rawHours = ms / (1000 * 60 * 60);
        const snappedHours = rawHours < 18 ? 12 : 24;
        return new Date(pickupDateTime.getTime() + snappedHours * 60 * 60 * 1000);
      }
    }
    // Default to exactly 24 hours after pickupDateTime
    return new Date(pickupDateTime.getTime() + 24 * 60 * 60 * 1000);
  });

  const priceInfo = useMemo(() => {
    const ms = returnDateTime.getTime() - pickupDateTime.getTime();
    const hours = ms / (1000 * 60 * 60);
    const result = calculatePackagePricing(packages, hours);
    const daysCount = Math.ceil(hours / 24);

    console.log('[CarBookingSidebar] priceInfo debug:', {
      pickupDateTime,
      returnDateTime,
      hours,
      result,
      daysCount
    });

    return {
      ...result,
      hours,
      days: daysCount
    };
  }, [pickupDateTime, returnDateTime, packages]);

  const usedPackageIds = priceInfo.usedPkgIds;
  const totalEstimate = priceInfo.basePrice;
  const isMultipleOf12 = Math.abs(priceInfo.hours - Math.round(priceInfo.hours / 12) * 12) < 0.05;

  const handleBooking = () => {
    const currentPackage = priceInfo.selectedPkg || packages[0];
      
    if (!currentPackage) {
      alert('Please select a valid package.');
      return;
    }

    const { addToCart, updateSession } = useBookingStore.getState();
    
    updateSession({
      pickupDate: pickupDateTime.toISOString(),
      returnDate: returnDateTime.toISOString(),
      pickupCity: cities.find(c => c.id === selectedCity)?.name || '',
      pickupStation: pickupLocation,
      dropStation: dropLocation
    });

    addToCart({
      serviceType: 'selfDrive',
      referenceId: car.id,
      packageId: currentPackage.id,
      title: `${car.make} ${car.model}`,
      image: car.image || '',
      price: priceInfo.basePrice,
      deposit: currentPackage.deposit || 0,
      extraInfo: `${priceInfo.extraInfo}`,
      pickupStation: pickupLocation,
      dropStation: dropLocation
    });

    router.push('/cart');
  };

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 lg:sticky lg:top-28">
      <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
        <span className="text-green-600">/</span> TRIP DETAILS
      </h2>

      <div className="space-y-6">
        
        {/* Pickup & Drop Location Selection */}
        <div className="space-y-4">
          <div className="relative">
            <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Pickup Location</label>
            <LocationAutocomplete
              value={pickupLocation}
              onChange={(name, loc) => {
                setPickupLocation(name);
                const match = cities.find(c => 
                  c.name.toLowerCase() === name.toLowerCase() || 
                  (loc && c.name.toLowerCase().includes(loc.display_name.split(',')[0].toLowerCase()))
                );
                if (match) {
                  setSelectedCity(match.id);
                } else if (cities.length > 0 && !selectedCity) {
                  setSelectedCity(cities[0].id);
                }
              }}
              placeholder="Search pickup hotel, airport, station..."
              className="font-bold text-gray-900 !py-3.5"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Drop Location</label>
            <LocationAutocomplete
              value={dropLocation}
              onChange={(name) => setDropLocation(name)}
              placeholder="Search drop hotel, airport, station..."
              className="font-bold text-gray-900 !py-3.5"
              searchAnywhere={true}
            />
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2 flex justify-between">
            <span>Travel Date Range (Required)</span>
            {priceInfo.hours > 0 && (
              <span className="text-green-700 font-bold font-mono">
                {Math.round(priceInfo.hours * 10) / 10} Hours Selected
              </span>
            )}
          </label>
          <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3.5 w-full">
            <ConfigProvider
              theme={{
                token: {
                  colorPrimary: '#15803d',
                  borderRadius: 12,
                  fontSize: 11,
                  controlHeight: 40,
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
              <DatePicker.RangePicker
                showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                format="DD-MM-YYYY - h:mm a"
                value={[pickupDateTime ? dayjs(pickupDateTime) : null, returnDateTime ? dayjs(returnDateTime) : null]}
                onChange={(dates) => {
                  if (dates && dates[0]) {
                    const start = dates[0].toDate();
                    let end = dates[1] ? dates[1].toDate() : null;
                    if (end) {
                      const ms = end.getTime() - start.getTime();
                      const rawHours = ms / (1000 * 60 * 60);
                      const snappedHours = rawHours < 18 ? 12 : 24;
                      end = new Date(start.getTime() + snappedHours * 60 * 60 * 1000);
                    } else {
                      end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
                    }
                    setPickupDateTime(start);
                    setReturnDateTime(end);
                  }
                }}
                variant="borderless"
                className="w-full text-xs font-semibold text-gray-900 !p-0 cursor-pointer"
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
                    if (current && pickupDateTime && current.isSame(dayjs(pickupDateTime), 'day')) {
                      const p = dayjs(pickupDateTime);
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
            </ConfigProvider>
          </div>
        </div>

        {/* Packages Selection */}
        {isMultipleOf12 && packages && packages.filter(pkg => pkg.name === '12 Hours' || pkg.name === '24 Hours').length > 0 && (
          <div>
            <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2 flex justify-between">
              <span>Active Rental Package</span>
              <span className="text-gray-400 font-mono text-[9px] normal-case">
                (Decomposition: {priceInfo.extraInfo})
              </span>
            </label>
            <div className="space-y-3 pointer-events-none">
              {packages
                .filter(pkg => pkg.name === '12 Hours' || pkg.name === '24 Hours')
                .map(pkg => {
                  const isSelected = usedPackageIds.has(pkg.id);
                const part = priceInfo.breakdownParts.find(p => p.pkgName === pkg.name);
                const countLabel = part && part.count > 0 ? ` (${part.count}x)` : '';

                return (
                  <div 
                    key={pkg.id} 
                    className={`p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${isSelected ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-200 bg-gray-50/50 opacity-60'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white'}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-green-600" />}
                      </div>
                      <div className="font-black text-sm text-gray-900">{pkg.name}{countLabel}</div>
                    </div>
                    <div className="font-bold text-green-700 text-sm">₹{pkg.basePrice.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Detailed Breakdown */}
        {isMultipleOf12 && totalEstimate > 0 && (() => {
          const currentPackage = packages?.[0];
          const durationLabel = priceInfo.extraInfo;
          const basePrice = totalEstimate;
          const gstAmount = Math.round(basePrice * 0.18);
          const depositAmount = currentPackage?.deposit || 0;
          const grossTotal = basePrice + gstAmount + depositAmount;
          const advanceHold = Math.round((basePrice + gstAmount) * 0.3);
          const balanceDue = (basePrice + gstAmount) - advanceHold + depositAmount;

          return (
            <div className="bg-gray-900 rounded-3xl p-6 text-white mt-6 space-y-4 shadow-xl border border-white/5 font-mono text-[11px] uppercase tracking-wider">
              <div className="text-[10px] font-black text-green-400 tracking-widest pb-2 border-b border-white/10">— PRICE STRUCTURE</div>
              
              <div className="flex justify-between text-gray-400">
                <span>Rental Rate ({durationLabel})</span>
                <span className="text-white font-bold">₹{basePrice.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-gray-400">
                <span>GST (18%)</span>
                <span className="text-white font-bold">₹{gstAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Refundable Deposit</span>
                <span className="text-green-400 font-bold">₹{depositAmount.toLocaleString()}</span>
              </div>

              <div className="border-t border-dashed border-white/10 pt-3 flex justify-between text-xs font-bold text-white">
                <span>Gross Total</span>
                <span>₹{grossTotal.toLocaleString()}</span>
              </div>

              <div className="bg-white/5 rounded-2xl p-4 space-y-2 mt-2">
                <div className="flex justify-between text-[10px] font-black text-green-400 tracking-widest">
                  <span>Advance Hold (30%)</span>
                  <span>₹{advanceHold.toLocaleString()}</span>
                </div>
                <div className="text-[9px] text-gray-500 font-medium font-sans">Pay now to confirm booking</div>
                
                <div className="w-full h-px bg-white/5 my-2"></div>

                <div className="flex justify-between text-[10px] text-gray-300">
                  <span>Pay at Delivery (70% + Deposit)</span>
                  <span className="font-bold">₹{balanceDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {isMultipleOf12 && (
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleBooking}
              className="w-full bg-green-600 hover:bg-[#8dbb00] text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-green-600/20 cursor-pointer"
            >
              CONFIRM BOOKING
            </button>
          </div>
        )}

        {!isMultipleOf12 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed font-bold text-center">
            ⚠️ Rental duration must be a multiple of 12 hours (e.g. 12 Hours, 24 Hours, 36 Hours, etc.). Please adjust your travel date range.
          </div>
        )}

      </div>
    </div>
  );
}
