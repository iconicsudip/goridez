'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Search, ShieldCheck } from 'lucide-react';

export default function CarBookingSidebar({ car, deliveryCharge }: { car: any, deliveryCharge: any }) {
  const router = useRouter();
  const { session, addToCart } = useBookingStore();
  const [mounted, setMounted] = useState(false);

  const [pickupDateTime, setPickupDateTime] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [returnDateTime, setReturnDateTime] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 4)));
  
  const [pickupStation, setPickupStation] = useState('CITY_CENTER');
  const [dropStation, setDropStation] = useState('CITY_CENTER');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  useEffect(() => {
    setMounted(true);
    if (session?.pickupDate) setPickupDateTime(new Date(session.pickupDate));
    if (session?.returnDate) setReturnDateTime(new Date(session.returnDate));
    if (session?.pickupLocation) {
        if (session.pickupLocation === 'AIRPORT') setPickupStation('AIRPORT');
        else if (session.pickupLocation === 'RAILWAY STATION') setPickupStation('RAILWAY');
    }
    
    if (car.packages && car.packages.length > 0) {
      if (session?.selectedPackageLimit) {
        const pkg = car.packages.find((p: any) => p.limitValue === session.selectedPackageLimit);
        if (pkg) setSelectedPackageId(pkg.id);
        else setSelectedPackageId(car.packages[0].id);
      } else {
        setSelectedPackageId(car.packages[0].id);
      }
    }
  }, [session, car.packages]);

  const searchDurationDays = useMemo(() => {
    if (!pickupDateTime || !returnDateTime) return 1;
    const durationHours = Math.max(1, (returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60));
    return Math.ceil(durationHours / 24) || 1;
  }, [pickupDateTime, returnDateTime]);

  const selectedPackage = car.packages?.find((p: any) => p.id === selectedPackageId) || car.packages?.[0];
  const packageBasePrice = selectedPackage ? selectedPackage.basePrice * searchDurationDays : 0;

  const getStationFee = (stationType: string, isDrop: boolean) => {
    if (!deliveryCharge) return 0;
    if (stationType === 'AIRPORT') return isDrop ? deliveryCharge.airportDrop : deliveryCharge.airportPickup;
    if (stationType === 'RAILWAY') return isDrop ? deliveryCharge.railwayDrop : deliveryCharge.railwayPickup;
    return 0; // City Center or custom
  };

  const isLateNight = (date: Date) => {
    if (!deliveryCharge) return false;
    const hours = date.getHours();
    const startHour = parseInt(deliveryCharge.lateNightStart.split(':')[0]) || 22;
    const endHour = parseInt(deliveryCharge.lateNightEnd.split(':')[0]) || 6;
    
    if (startHour > endHour) {
      return hours >= startHour || hours < endHour;
    }
    return hours >= startHour && hours < endHour;
  };

  const pickupFee = getStationFee(pickupStation, false);
  const dropFee = getStationFee(dropStation, true);
  const lateNightSurcharge = (isLateNight(pickupDateTime) ? 500 : 0) + (isLateNight(returnDateTime) ? 500 : 0);

  const totalFare = packageBasePrice + pickupFee + dropFee + lateNightSurcharge;
  const advanceHold = Math.round(totalFare * 0.3);

  const handleBook = () => {
    if (!selectedPackage) return;
    
    let extraInfo = `${selectedPackage.limitValue ? `${selectedPackage.limitValue} KM limit` : 'Unlimited KM'} | ${searchDurationDays} Days`;
    if (pickupFee > 0) extraInfo += ` | ${pickupStation} Pickup (+₹${pickupFee})`;
    if (dropFee > 0) extraInfo += ` | ${dropStation} Drop (+₹${dropFee})`;
    if (lateNightSurcharge > 0) extraInfo += ` | Late Night Fee (+₹${lateNightSurcharge})`;

    addToCart({
      serviceType: 'selfDrive',
      referenceId: car.id,
      packageId: selectedPackage.id,
      title: `${car.make} ${car.model}`,
      image: car.image,
      price: totalFare,
      deposit: selectedPackage.deposit,
      extraInfo,
      pickupStation,
      dropStation,
      deliveryFee: pickupFee + dropFee + lateNightSurcharge
    });
    router.push('/checkout');
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#111111] border border-white/5 rounded-3xl p-6 shadow-2xl sticky top-28">
      <h2 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
        <span className="text-brand-neon">/</span> Trip Details
      </h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block mb-1">Rental Period</label>
          <DatePicker 
            selectsRange={true}
            startDate={pickupDateTime}
            endDate={returnDateTime}
            onChange={(update: [Date | null, Date | null]) => {
              const [start, end] = update;
              if (start) {
                const newStart = new Date(start);
                newStart.setHours(pickupDateTime.getHours(), pickupDateTime.getMinutes());
                setPickupDateTime(newStart);
              }
              if (end) {
                const newEnd = new Date(end);
                newEnd.setHours(returnDateTime.getHours(), returnDateTime.getMinutes());
                setReturnDateTime(newEnd);
              }
            }} 
            dateFormat="dd/MM/yyyy" 
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-neon"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block mb-1">Pickup Time</label>
            <input 
              type="time" 
              value={`${String(pickupDateTime.getHours()).padStart(2, '0')}:${String(pickupDateTime.getMinutes()).padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                const newDate = new Date(pickupDateTime);
                newDate.setHours(h, m);
                setPickupDateTime(newDate);
              }}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-neon appearance-none"
            />
          </div>
          <div>
            <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block mb-1">Return Time</label>
            <input 
              type="time" 
              value={`${String(returnDateTime.getHours()).padStart(2, '0')}:${String(returnDateTime.getMinutes()).padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                const newDate = new Date(returnDateTime);
                newDate.setHours(h, m);
                setReturnDateTime(newDate);
              }}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-neon appearance-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block mb-1">Pickup From</label>
                <select value={pickupStation} onChange={(e) => setPickupStation(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-2 py-3 text-xs text-white outline-none focus:border-brand-neon appearance-none">
                    <option value="CITY_CENTER">City Center</option>
                    <option value="AIRPORT">Airport</option>
                    <option value="RAILWAY">Railway Station</option>
                </select>
            </div>
            <div>
                <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block mb-1">Drop At</label>
                <select value={dropStation} onChange={(e) => setDropStation(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-2 py-3 text-xs text-white outline-none focus:border-brand-neon appearance-none">
                    <option value="CITY_CENTER">City Center</option>
                    <option value="AIRPORT">Airport</option>
                    <option value="RAILWAY">Railway Station</option>
                </select>
            </div>
        </div>

        {car.packages && car.packages.length > 0 && (
          <div>
            <label className="text-[9px] text-white/40 font-mono uppercase tracking-widest block mb-2">Select Package</label>
            <div className="space-y-2">
              {car.packages.map((pkg: any) => (
                <div 
                  key={pkg.id} 
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedPackageId === pkg.id ? 'border-brand-neon bg-brand-neon/5' : 'border-white/5 bg-black hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider">{pkg.name}</div>
                      <div className="text-[9px] text-white/50">{pkg.limitValue ? `${pkg.limitValue} KM/day` : 'Unlimited'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-brand-neon">₹{(pkg.basePrice * searchDurationDays).toLocaleString()}</div>
                      <div className="text-[8px] text-white/40">for {searchDurationDays} days</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-2 mb-6">
        <div className="flex justify-between text-[10px] text-white/60 font-mono uppercase">
          <span>Base Fare ({searchDurationDays} days)</span>
          <span>₹{packageBasePrice.toLocaleString()}</span>
        </div>
        {pickupFee > 0 && (
          <div className="flex justify-between text-[10px] text-brand-neon/80 font-mono uppercase">
            <span>Pickup Fee ({pickupStation})</span>
            <span>+₹{pickupFee.toLocaleString()}</span>
          </div>
        )}
        {dropFee > 0 && (
          <div className="flex justify-between text-[10px] text-brand-neon/80 font-mono uppercase">
            <span>Drop Fee ({dropStation})</span>
            <span>+₹{dropFee.toLocaleString()}</span>
          </div>
        )}
        {lateNightSurcharge > 0 && (
          <div className="flex justify-between text-[10px] text-brand-neon/80 font-mono uppercase">
            <span>Late Night Surcharge</span>
            <span>+₹{lateNightSurcharge.toLocaleString()}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black pt-2 border-t border-white/10">
          <span>TOTAL ESTIMATE</span>
          <span>₹{totalFare.toLocaleString()}</span>
        </div>
        {selectedPackage && (
          <div className="flex items-center gap-1.5 text-[9px] text-emerald-500 justify-end pt-1">
            <ShieldCheck size={10} /> Refundable Deposit: ₹{selectedPackage.deposit.toLocaleString()}
          </div>
        )}
      </div>

      <button 
        onClick={handleBook}
        disabled={!selectedPackage}
        className="w-full bg-brand-neon hover:bg-brand-hover text-black font-black text-xs tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(196,240,0,0.15)] disabled:opacity-50 uppercase"
      >
        <Search size={16} strokeWidth={2.5} /> ADD TO CART - ₹{advanceHold.toLocaleString()} ADVANCE
      </button>
    </div>
  );
}
