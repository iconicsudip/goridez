'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, MapPin, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useBookingStore } from '@/store/useBookingStore';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { calculatePackagePricing, getPackageDurationHours } from '@/lib/utils';

interface ChauffeurBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: any;
  defaultPickupDate?: Date;
}

export default function ChauffeurBookingModal({ isOpen, onClose, car, defaultPickupDate }: ChauffeurBookingModalProps) {
  const { addToCart } = useBookingStore();
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState<Date>(() => {
    const defaultDate = defaultPickupDate || new Date(Date.now() + 86400000);
    return defaultDate.getTime() < Date.now() ? new Date() : defaultDate;
  });
  const [returnDate, setReturnDate] = useState<Date>(() => {
    const defaultDate = defaultPickupDate || new Date(Date.now() + 86400000);
    const start = defaultDate.getTime() < Date.now() ? new Date() : defaultDate;
    return new Date(start.getTime() + 24 * 60 * 60 * 1000);
  });
  const priceInfo = useMemo(() => {
    const ms = returnDate.getTime() - pickupDate.getTime();
    const hours = ms / (1000 * 60 * 60);
    const result = calculatePackagePricing(car?.packages || [], hours);
    return {
      ...result,
      hours
    };
  }, [pickupDate, returnDate, car]);

  const usedPackageIds = priceInfo.usedPkgIds;
  const selectedPackage = priceInfo.selectedPkg;
  const selectedPackageId = selectedPackage ? selectedPackage.id : '';
  const durationHours = selectedPackage ? getPackageDurationHours(selectedPackage) : 24;

  if (!isOpen || !car) return null;

  const isMultipleOf12 = Math.abs(priceInfo.hours - Math.round(priceInfo.hours / 12) * 12) < 0.05;
  if (isMultipleOf12 && !selectedPackage) return null;

  // Check Night Charge Overlap
  let hasNightCharge = false;
  if (car.nightCharge && car.nightChargeStart && car.nightChargeEnd) {
    const [startH] = car.nightChargeStart.split(':').map(Number);
    const [endH] = car.nightChargeEnd.split(':').map(Number);

    let nightStart = startH;
    let nightEnd = endH < startH ? endH + 24 : endH;

    const currentStart = pickupDate.getHours() + pickupDate.getMinutes() / 60;
    const currentEnd = currentStart + durationHours;

    // Check overlap between [currentStart, currentEnd] and [nightStart, nightEnd]
    // Also check overlap if current span goes into next day e.g. [currentStart, currentEnd] vs [nightStart-24, nightEnd-24]
    if (
      (currentStart < nightEnd && currentEnd > nightStart) ||
      (currentStart < (nightEnd + 24) && currentEnd > (nightStart + 24)) ||
      (currentStart < (nightEnd - 24) && currentEnd > (nightStart - 24))
    ) {
      hasNightCharge = true;
    }
  }

  const basePrice = priceInfo.basePrice || 0;
  const nightChargeAmount = hasNightCharge ? (car.nightCharge || 0) : 0;
  const totalFare = basePrice + nightChargeAmount;

  const handleBook = () => {
    if (!selectedPackage) return;
    const multiples = Math.floor(priceInfo.hours / durationHours);
    let extra = multiples > 1 ? `${multiples}x ${selectedPackage.name} Package` : `${selectedPackage.name} Package`;
    extra += ` • ${pickupDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })} - ${returnDate.toLocaleString('en-GB', { timeStyle: 'short' })}`;

    useBookingStore.getState().updateSession({
      pickupDate: pickupDate.toISOString(),
      returnDate: returnDate.toISOString()
    });

    addToCart({
      serviceType: 'withDriver',
      referenceId: car.id,
      title: `${car.make} ${car.model} (Chauffeur)`,
      image: car.image || '',
      price: totalFare,
      deposit: selectedPackage.deposit || 0,
      extraInfo: extra
    });
    onClose();
    router.push('/cart');
  };

  return (
    <>
      <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-[5%] md:top-[10%] bottom-[5%] md:bottom-auto md:h-[80vh] w-auto md:w-[800px] bg-white border border-gray-300 rounded-3xl z-[101] shadow-2xl overflow-hidden flex flex-col custom-scrollbar">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-100 shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            Configure Chauffeur Booking
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">

          {/* Left Column - Car & Package */}
          <div className="flex-1 space-y-8">
            {/* Car Info */}
            <div className="flex gap-4 items-center">
              <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200">
                <Image src={car.image} alt={car.model} fill className="object-cover p-1" unoptimized />
              </div>
              <div>
                <h3 className="font-black text-xl">{car.make} {car.model}</h3>
                <p className="text-[10px] text-gray-500 tracking-widest uppercase">{car.category}</p>
              </div>
            </div>

            {/* DateTime Selection */}
            <div>
              <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-3">1. Select Travel Date Range</p>
              <div className="relative flex items-center bg-gray-100 border border-gray-200 rounded-xl px-3 py-3 w-full">
                <Calendar className="text-gray-500 mr-2 shrink-0" size={14} />
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
                  <DatePicker.RangePicker
                    showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                    format="DD/MM/YYYY - h:mm a"
                    value={[pickupDate ? dayjs(pickupDate) : null, returnDate ? dayjs(returnDate) : null]}
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
                        setPickupDate(start);
                        setReturnDate(end);
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
                </ConfigProvider>
              </div>
            </div>

            {/* Package Selection */}
            {isMultipleOf12 && selectedPackage && (
              <div>
                <p className="text-[10px] text-green-700 font-bold uppercase tracking-widest mb-3">2. Active Rental Package</p>
                <div className="space-y-3 pointer-events-none">
                  {car.packages?.filter((pkg: any) => pkg.name === '12 Hours' || pkg.name === '24 Hours').map((pkg: any) => {
                    const isSelected = selectedPackageId === pkg.id;

                    // Calculate dynamic price based on total hours
                    const ms = returnDate.getTime() - pickupDate.getTime();
                    const hours = ms / (1000 * 60 * 60);
                    const pkgDailyPrice = pkg.basePrice;

                    let pkgPrice = 0;
                    if (hours < 24) {
                      const dMatch = pkg.name.match(/^(\d+)/);
                      const pkgHours = dMatch ? parseInt(dMatch[1]) : 24;
                      const twelveHourPrice = pkgHours === 12 ? pkg.basePrice : pkg.basePrice * 0.6;
                      pkgPrice = twelveHourPrice;
                    } else {
                      const days = Math.floor(hours / 24);
                      pkgPrice = days * pkgDailyPrice;
                    }

                    return (
                      <div
                        key={pkg.id}
                        className={`p-4 rounded-xl border transition-all ${isSelected
                            ? 'bg-green-600/5 border-green-600 shadow-sm'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="chauffeurPackage"
                              checked={isSelected}
                              readOnly
                              className="accent-green-700 w-4 h-4"
                            />
                            <div>
                              <div className="font-bold text-sm text-gray-900">{pkg.name}</div>
                              <div className="text-[10px] text-gray-500">{pkg.limitValue} {pkg.type === 'KM' ? 'KM Included' : ''}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-green-700">₹{pkgPrice.toLocaleString()}</div>
                            {pkg.extraChargePerUnit && (
                              <div className="text-[9px] text-gray-500">Extra KM: ₹{pkg.extraChargePerUnit}/km</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {car.extraHourCharge && (
                  <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-yellow-500" />
                    Additional hours will be billed at ₹{car.extraHourCharge}/hr
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Right Column - Summary */}
          <div className="w-full md:w-[300px] shrink-0 bg-gray-100 border border-gray-200 rounded-2xl p-6 h-fit">
            {isMultipleOf12 && selectedPackage ? (
              <>
                <h3 className="font-black mb-6">Fare Breakdown</h3>

                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between text-gray-650 font-medium">
                    <span>
                      {Math.floor(priceInfo.hours / durationHours) > 1
                        ? `${Math.floor(priceInfo.hours / durationHours)}x ${selectedPackage.name}`
                        : selectedPackage.name} Package
                    </span>
                    <span className="font-mono text-gray-900 font-bold">₹{basePrice.toLocaleString()}</span>
                  </div>

                  {hasNightCharge && (
                    <div className="flex justify-between text-yellow-400">
                      <span className="flex items-center gap-1.5">
                        Night Charge
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-yellow-400/30">
                          {car.nightChargeStart} - {car.nightChargeEnd}
                        </span>
                      </span>
                      <span className="font-mono">+₹{nightChargeAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-300 mb-8 flex justify-between items-end">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Estimate</span>
                  <span className="text-3xl font-black text-green-700">₹{totalFare.toLocaleString()}</span>
                </div>

                <div className="space-y-3 mb-8 text-[10px] text-gray-600">
                  <div className="flex gap-2"><Check size={14} className="text-green-700 shrink-0" /> Professional Chauffeur Included</div>
                  <div className="flex gap-2"><Check size={14} className="text-green-700 shrink-0" /> Tolls & State Taxes Pre-paid</div>
                  <div className="flex gap-2"><ShieldCheck size={14} className="text-green-700 shrink-0" /> 100% Insured Journey</div>
                </div>

                <button
                  onClick={handleBook}
                  className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(196,240,0,0.2)] hover:shadow-[0_0_30px_rgba(196,240,0,0.4)] transition-all"
                >
                  Add to Booking
                </button>
              </>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed font-bold text-center">
                ⚠️ Rental duration must be a multiple of 12 hours (e.g. 12 Hours, 24 Hours, 36 Hours, etc.). Please adjust your travel date range.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
