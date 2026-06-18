'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useBookingStore } from '@/store/useBookingStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ChauffeurBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: any;
  defaultPickupDate?: Date;
}

export default function ChauffeurBookingModal({ isOpen, onClose, car, defaultPickupDate }: ChauffeurBookingModalProps) {
  const { addToCart } = useBookingStore();
  const [pickupDate, setPickupDate] = useState<Date>(defaultPickupDate || new Date(Date.now() + 86400000));
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  useEffect(() => {
    if (car?.packages?.length > 0 && !selectedPackageId) {
      setSelectedPackageId(car.packages[0].id);
    }
  }, [car, selectedPackageId]);

  if (!isOpen || !car) return null;

  const selectedPackage = car.packages?.find((p: any) => p.id === selectedPackageId) || car.packages?.[0];
  if (!selectedPackage) return null;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [h, m] = e.target.value.split(':').map(Number);
    const newDate = new Date(pickupDate);
    newDate.setHours(h, m);
    setPickupDate(newDate);
  };

  // Extract duration from package name (e.g. "8 Hours" -> 8)
  const durationMatch = selectedPackage.name.match(/^(\d+)/);
  const durationHours = durationMatch ? parseInt(durationMatch[1]) : 24;

  const returnDate = new Date(pickupDate.getTime() + durationHours * 60 * 60 * 1000);

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

  const basePrice = selectedPackage.basePrice || 0;
  const nightChargeAmount = hasNightCharge ? (car.nightCharge || 0) : 0;
  const totalFare = basePrice + nightChargeAmount;

  const handleBook = () => {
    let extra = `${selectedPackage.name} Package`;
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
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 top-[5%] md:top-[10%] bottom-[5%] md:bottom-auto md:h-[80vh] w-auto md:w-[800px] bg-[#0A0A0A] border border-white/10 rounded-3xl z-[101] shadow-2xl overflow-hidden flex flex-col custom-scrollbar">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#111111] shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            Configure Chauffeur Booking
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
          
          {/* Left Column - Car & Package */}
          <div className="flex-1 space-y-8">
            {/* Car Info */}
            <div className="flex gap-4 items-center">
              <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">
                <Image src={car.image} alt={car.model} fill className="object-cover" unoptimized />
              </div>
              <div>
                <h3 className="font-black text-xl">{car.make} {car.model}</h3>
                <p className="text-[10px] text-white/50 tracking-widest uppercase">{car.category}</p>
              </div>
            </div>

            {/* DateTime Selection */}
            <div>
              <p className="text-[10px] text-brand-neon font-bold uppercase tracking-widest mb-3">1. Select Pickup Time</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                  <DatePicker 
                    selected={pickupDate}
                    onChange={(date: Date | null) => {
                      if (date) {
                        const newDate = new Date(date);
                        newDate.setHours(pickupDate.getHours(), pickupDate.getMinutes());
                        setPickupDate(newDate);
                      }
                    }}
                    dateFormat="dd/MM/yyyy" 
                    minDate={new Date()}
                    className="w-full bg-[#111] border border-white/5 rounded-xl pl-9 pr-3 py-3 text-xs outline-none focus:border-brand-neon cursor-pointer" 
                  />
                </div>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
                  <input 
                    type="time" 
                    value={`${String(pickupDate.getHours()).padStart(2, '0')}:${String(pickupDate.getMinutes()).padStart(2, '0')}`}
                    onChange={handleTimeChange}
                    className="w-full bg-[#111] border border-white/5 rounded-xl pl-9 pr-3 py-3 text-xs outline-none focus:border-brand-neon appearance-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-white/40 mt-2">
                Return calculated based on package duration.
              </p>
            </div>

            {/* Package Selection */}
            <div>
              <p className="text-[10px] text-brand-neon font-bold uppercase tracking-widest mb-3">2. Select Rental Package</p>
              <div className="space-y-3">
                {car.packages?.map((pkg: any) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <label 
                      key={pkg.id} 
                      className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-brand-neon/5 border-brand-neon' 
                          : 'bg-[#111] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <input 
                            type="radio" 
                            name="chauffeurPackage" 
                            checked={isSelected}
                            onChange={() => setSelectedPackageId(pkg.id)}
                            className="accent-brand-neon w-4 h-4"
                          />
                          <div>
                            <div className="font-bold text-sm">{pkg.name}</div>
                            <div className="text-[10px] text-white/50">{pkg.limitValue} {pkg.type === 'KM' ? 'KM Included' : ''}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-brand-neon">₹{pkg.basePrice.toLocaleString()}</div>
                          {pkg.extraChargePerUnit && (
                            <div className="text-[9px] text-white/40">Extra KM: ₹{pkg.extraChargePerUnit}/km</div>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {car.extraHourCharge && (
                <p className="text-[10px] text-white/40 mt-3 flex items-center gap-1.5">
                  <AlertCircle size={12} className="text-yellow-500" />
                  Additional hours will be billed at ₹{car.extraHourCharge}/hr
                </p>
              )}
            </div>

          </div>

          {/* Right Column - Summary */}
          <div className="w-full md:w-[300px] shrink-0 bg-[#111] border border-white/5 rounded-2xl p-6 h-fit">
            <h3 className="font-black mb-6">Fare Breakdown</h3>

            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between text-white/70">
                <span>{selectedPackage.name} Package</span>
                <span className="font-mono">₹{basePrice.toLocaleString()}</span>
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

            <div className="pt-4 border-t border-white/10 mb-8 flex justify-between items-end">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Total Estimate</span>
              <span className="text-3xl font-black text-brand-neon">₹{totalFare.toLocaleString()}</span>
            </div>

            <div className="space-y-3 mb-8 text-[10px] text-white/60">
              <div className="flex gap-2"><Check size={14} className="text-brand-neon shrink-0" /> Professional Chauffeur Included</div>
              <div className="flex gap-2"><Check size={14} className="text-brand-neon shrink-0" /> Tolls & State Taxes Pre-paid</div>
              <div className="flex gap-2"><ShieldCheck size={14} className="text-brand-neon shrink-0" /> 100% Insured Journey</div>
            </div>

            <button 
              onClick={handleBook}
              className="w-full py-4 bg-brand-neon text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(196,240,0,0.2)] hover:shadow-[0_0_30px_rgba(196,240,0,0.4)] transition-all"
            >
              Add to Booking
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
