'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, Navigation, Compass, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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
  
  const [rentalType, setRentalType] = useState<'Day' | 'Hour'>('Day');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || searchParams.get('cities')?.split(',')[0] || '');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  
  const [pickupDateTime, setPickupDateTime] = useState<Date>(() => {
    const pickupParam = searchParams.get('pickupDate');
    if (pickupParam) {
      const d = new Date(pickupParam);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date();
    d.setHours(10, 0, 0, 0);
    return d;
  });
  
  const [returnDateTime, setReturnDateTime] = useState<Date>(() => {
    const returnParam = searchParams.get('returnDate');
    if (returnParam) {
      const d = new Date(returnParam);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  });

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  useEffect(() => {
    if (packages && packages.length > 0 && rentalType === 'Hour') {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, rentalType]);

  const totalEstimate = useMemo(() => {
    if (rentalType === 'Hour') {
      const pkg = packages.find(p => p.id === selectedPackageId);
      return pkg ? pkg.basePrice : 0;
    } else {
      const ms = returnDateTime.getTime() - pickupDateTime.getTime();
      let days = Math.ceil(ms / (1000 * 60 * 60 * 24));
      if (days <= 0) days = 1;
      const dailyPrice = packages?.[0]?.basePrice || 2500;
      return days * dailyPrice;
    }
  }, [rentalType, selectedPackageId, pickupDateTime, returnDateTime, packages]);

  const handleBooking = () => {
    router.push('/checkout');
  };

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 lg:sticky lg:top-28">
      <h2 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
        <span className="text-green-600">/</span> TRIP DETAILS
      </h2>

      <div className="space-y-6">
        
        {/* Rental Type Toggle */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <label className="text-[10px] font-black tracking-widest uppercase text-gray-500">Rental Basis</label>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setRentalType('Day')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${rentalType === 'Day' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Multi-Day
            </button>
            <button 
              onClick={() => setRentalType('Hour')}
              className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${rentalType === 'Hour' ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Hourly
            </button>
          </div>
        </div>

        {/* City Selection */}
        <div className="relative">
          <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Select Location</label>
          <div 
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer hover:border-green-600 transition-colors"
            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              <span className={`text-sm font-bold ${selectedCity ? 'text-gray-900' : 'text-gray-400'}`}>
                {selectedCity ? cities.find(c => c.id === selectedCity)?.name : 'Choose Pickup City'}
              </span>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isCityDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsCityDropdownOpen(false)}
              ></div>
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                {cities.length > 0 ? (
                  cities.map(city => (
                    <div 
                      key={city.id}
                      className="px-4 py-3 hover:bg-green-50 cursor-pointer text-sm font-bold text-gray-900 border-b border-gray-100 last:border-0 flex items-center gap-2 transition-colors"
                      onClick={() => {
                        setSelectedCity(city.id);
                        setIsCityDropdownOpen(false);
                      }}
                    >
                      <MapPin size={14} className="text-green-600" />
                      {city.name}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm font-medium text-gray-500">No cities available</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Pickup Date</label>
            <DatePicker 
              selected={pickupDateTime}
              onChange={(date: Date | null) => {
                if (date) {
                  const newDate = new Date(date);
                  newDate.setHours(pickupDateTime.getHours(), pickupDateTime.getMinutes());
                  setPickupDateTime(newDate);
                }
              }} 
              dateFormat="dd-MM-yyyy" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-green-600 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Time</label>
            <input 
              type="time" 
              value={`${String(pickupDateTime.getHours()).padStart(2, '0')}:${String(pickupDateTime.getMinutes()).padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                const newDate = new Date(pickupDateTime);
                newDate.setHours(h, m);
                setPickupDateTime(newDate);
              }}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-green-600 transition-colors"
            />
          </div>
        </div>

        {rentalType === 'Day' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Return Date</label>
              <DatePicker 
                selected={returnDateTime}
                onChange={(date: Date | null) => {
                  if (date) {
                    const newDate = new Date(date);
                    newDate.setHours(returnDateTime.getHours(), returnDateTime.getMinutes());
                    setReturnDateTime(newDate);
                  }
                }} 
                dateFormat="dd-MM-yyyy" 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-green-600 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Time</label>
              <input 
                type="time" 
                value={`${String(returnDateTime.getHours()).padStart(2, '0')}:${String(returnDateTime.getMinutes()).padStart(2, '0')}`}
                onChange={(e) => {
                  const [h, m] = e.target.value.split(':').map(Number);
                  const newDate = new Date(returnDateTime);
                  newDate.setHours(h, m);
                  setReturnDateTime(newDate);
                }}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-900 outline-none focus:border-green-600 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Packages (Hourly Only) */}
        {rentalType === 'Hour' && packages && packages.length > 0 && (
          <div>
            <label className="text-[10px] font-black tracking-widest uppercase text-gray-500 block mb-2">Select Duration Package</label>
            <div className="space-y-3">
              {packages.map(pkg => (
                <div 
                  key={pkg.id} 
                  onClick={() => setSelectedPackageId(pkg.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedPackageId === pkg.id ? 'border-green-600 bg-green-50' : 'border-white bg-white hover:border-gray-200'}`}
                >
                  <div className="font-black text-sm text-gray-900">{pkg.name}</div>
                  <div className="font-bold text-green-700">₹{pkg.basePrice.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl p-6 text-white mt-8 shadow-xl">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-black tracking-widest uppercase text-gray-400">Total Estimate</span>
            <span className="text-2xl font-black text-green-400">₹{totalEstimate.toLocaleString()}</span>
          </div>
          <div className="text-[10px] text-gray-500 font-medium">Excluding taxes & tolls</div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            onClick={handleBooking}
            className="w-full bg-[#f05c36] hover:bg-[#d94a28] text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg shadow-[#f05c36]/20"
          >
            CONFIRM BOOKING
          </button>
        </div>

      </div>
    </div>
  );
}
