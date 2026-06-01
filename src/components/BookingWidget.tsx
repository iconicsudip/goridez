'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserCircle, Play } from 'lucide-react';
import Image from 'next/image';
import { useBookingStore } from '@/store/useBookingStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Tab = 'SELF DRIVE' | 'WITH DRIVER' | 'ONE WAY / ROUND TRIP' | 'VILLA + CAR' | 'TOUR PACKAGES';

type CarPackage = { id: string; type: string; name: string; basePrice: number; limitValue: number | null; };
type Car = { id: string; make: string; model: string; category: string; fuelType: string; transmission: string; seatingCapacity: number; image: string; packages: CarPackage[]; };
type Villa = { id: string; name: string; startingPrice: number; image: string; occupancy: number; amenities: string; };
type Tour = { id: string; title: string; adultPrice: number; image: string; };

export default function BookingWidget({ cars = [], villas = [], tours = [], cities = [] }: { cars?: Car[], villas?: Villa[], tours?: Tour[], cities?: any[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('SELF DRIVE');
  
  // Shared state
  const router = useRouter();
  const { session, updateSession } = useBookingStore();
  const [pickupDateTime, setPickupDateTime] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 1))); // Tomorrow
  const [returnDateTime, setReturnDateTime] = useState<Date>(new Date(new Date().setDate(new Date().getDate() + 4))); // 3 days after tomorrow
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (session?.pickupDate) {
      setPickupDateTime(new Date(session.pickupDate));
    }
    if (session?.returnDate) {
      setReturnDateTime(new Date(session.returnDate));
    }
  }, [session?.pickupDate, session?.returnDate]);

  const handleDateRangeChange = (update: [Date | null, Date | null]) => {
    const [start, end] = update;
    let nextStart = pickupDateTime;
    let nextEnd = returnDateTime;

    if (start) {
      nextStart = new Date(start);
      nextStart.setHours(pickupDateTime.getHours(), pickupDateTime.getMinutes());
      setPickupDateTime(nextStart);
    }
    if (end) {
      nextEnd = new Date(end);
      nextEnd.setHours(returnDateTime.getHours(), returnDateTime.getMinutes());
      setReturnDateTime(nextEnd);
      updateSession({
        pickupDate: nextStart.toISOString(),
        returnDate: nextEnd.toISOString()
      });
    }
  };

  const handlePickupTimeChange = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(pickupDateTime);
    newDate.setHours(h, m);
    setPickupDateTime(newDate);
    updateSession({
      pickupDate: newDate.toISOString()
    });
  };

  const handleReturnTimeChange = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(returnDateTime);
    newDate.setHours(h, m);
    setReturnDateTime(newDate);
    updateSession({
      returnDate: newDate.toISOString()
    });
  };

  // Self Drive State
  const [stationType, setStationType] = useState('AIRPORT');
  const [segment, setSegment] = useState('');
  const [packageLimit, setPackageLimit] = useState<number | null>(null);
  const [selectedCarId, setSelectedCarId] = useState('');
  const [selectedPickupCity, setSelectedPickupCity] = useState('');

  // With Driver State
  const [driverSegment, setDriverSegment] = useState('SUV Series');
  const [driverPackage, setDriverPackage] = useState('Full Day');

  // One Way State
  const [pickupArea, setPickupArea] = useState('Udaipur City Center (Mewar)');
  const [dropArea, setDropArea] = useState('Ahmedabad International Airport');
  
  // Villa State
  const [selectedVillaId, setSelectedVillaId] = useState('');

  // Tour State
  const [selectedTourId, setSelectedTourId] = useState('');

  // Derived state for Self Drive
  const uniqueCategories = useMemo(() => {
    if (!cars.length) return ['SUV'];
    return Array.from(new Set(cars.map(c => c.category.toUpperCase())));
  }, [cars]);

  const activeSegment = segment || uniqueCategories[0];

  const availableCars = useMemo(() => {
    if (!cars.length) return [];
    return cars.filter(c => c.category.toUpperCase() === activeSegment);
  }, [cars, activeSegment]);

  useMemo(() => {
    if (cities.length > 0 && !selectedPickupCity) {
      setSelectedPickupCity(cities[0].name);
    }
  }, [cities, selectedPickupCity]);
  
  useMemo(() => {
    if (availableCars.length > 0 && !availableCars.find(c => c.id === selectedCarId)) {
      const firstCar = availableCars[0];
      setSelectedCarId(firstCar.id);
      if (firstCar.packages?.length > 0) {
        setPackageLimit(firstCar.packages[0].limitValue);
      }
    }
  }, [availableCars, selectedCarId]);

  useMemo(() => {
    if (villas.length > 0 && !selectedVillaId) setSelectedVillaId(villas[0].id);
  }, [villas, selectedVillaId]);

  useMemo(() => {
    if (tours.length > 0 && !selectedTourId) setSelectedTourId(tours[0].id);
  }, [tours, selectedTourId]);

  const searchDurationDays = useMemo(() => {
    if (!pickupDateTime || !returnDateTime) return 1;
    const durationHours = Math.max(1, (returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60));
    return durationHours / 24;
  }, [pickupDateTime, returnDateTime]);

  const selectedCar = availableCars.find(c => c.id === selectedCarId) || availableCars[0];
  const currentPackage = selectedCar?.packages.find(p => p.limitValue === packageLimit) || selectedCar?.packages[0];
  const selfDriveTariff = (currentPackage ? currentPackage.basePrice : 4000) * searchDurationDays;

  const driverBasePrice = useMemo(() => {
    if (driverPackage === 'Half Day') return 3000;
    if (driverPackage === 'Full Day') return 5000;
    return 5000;
  }, [driverPackage]);
  const estimatedDriverFare = driverBasePrice * searchDurationDays;

  const isRoundTrip = useMemo(() => {
    if (!returnDateTime || !pickupDateTime) return false;
    return returnDateTime.toDateString() !== pickupDateTime.toDateString();
  }, [pickupDateTime, returnDateTime]);
  const calculatedTaxiFare = isRoundTrip ? 7280 * 1.8 : 7280;

  const selectedTour = useMemo(() => {
    return tours.find(t => t.id === selectedTourId) || tours[0];
  }, [tours, selectedTourId]);
  const tourBasePrice = selectedTour ? selectedTour.adultPrice : 15000;
  const tourBaseDuration = selectedTour ? (selectedTour as any).duration || 3 : 3;
  const calculatedTourFare = useMemo(() => {
    const durationHours = Math.max(1, (returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60));
    const durationDays = durationHours / 24;
    return Math.round(tourBasePrice * (durationDays / tourBaseDuration));
  }, [tourBasePrice, tourBaseDuration, pickupDateTime, returnDateTime]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let stype: any = 'selfDrive';
    let route = `/self-drive?category=${encodeURIComponent(segment)}`;

    if (activeTab === 'WITH DRIVER') {
      stype = 'withDriver';
      route = `/chauffeur?category=${encodeURIComponent(segment)}`;
    }
    if (activeTab === 'ONE WAY / ROUND TRIP') {
      stype = 'oneWayTaxi';
      route = '/taxi';
    }
    if (activeTab === 'VILLA + CAR') {
      stype = 'villaCar';
      route = '/villas';
    }
    if (activeTab === 'TOUR PACKAGES') {
      stype = 'tours';
      route = '/tours';
    }

    // Save the search preferences
    updateSession({ 
      serviceType: stype, 
      pickupDate: pickupDateTime.toISOString(), 
      pickupTime: pickupDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
      returnDate: returnDateTime.toISOString(),
      returnTime: returnDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      driverOption: activeTab === 'WITH DRIVER',
      pickupLocation: stationType,
      selectedPackageLimit: packageLimit || undefined
    });
    
    // Redirect to the listing page so the user can actually browse and select the car
    router.push(route);
  };

  return (
    <div className="glass-panel w-full max-w-[800px] bg-[#111111]/95 border border-white/5 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8 font-body">
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-10 pb-6 border-b border-white/5">
        {(['SELF DRIVE', 'WITH DRIVER', 'ONE WAY / ROUND TRIP', 'VILLA + CAR', 'TOUR PACKAGES'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-[11px] font-black tracking-widest rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-brand-neon text-black shadow-[0_0_20px_rgba(196,240,0,0.2)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-6">
        
        {/* === SELF DRIVE TAB === */}
        {activeTab === 'SELF DRIVE' && (
          <div className="space-y-8">
            <div>
              <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Pickup Station Location</label>
              <div className="flex flex-wrap gap-3 mb-4">
                {['AIRPORT', 'RAILWAY STATION', 'HOTEL YARD', 'OFFICE', 'CUSTOM ADDRESS'].map(type => (
                  <button key={type} type="button" onClick={() => setStationType(type)} className={`px-4 py-2 text-[10px] md:text-[11px] font-black rounded transition-colors ${stationType === type ? 'bg-brand-neon text-black shadow-[0_0_10px_rgba(196,240,0,0.15)]' : 'bg-[#161616] border border-white/5 text-white/60 hover:bg-white/5'}`}>
                    {type}
                  </button>
                ))}
              </div>
              <select 
                value={selectedPickupCity} 
                onChange={(e) => setSelectedPickupCity(e.target.value)} 
                className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium appearance-none cursor-pointer"
              >
                {cities && cities.length > 0 ? (
                  cities.map((city: any) => (
                    <option key={city.id} value={city.name}>{city.name} {stationType === 'AIRPORT' ? 'Airport Area' : 'City Center'}</option>
                  ))
                ) : (
                  <option value="Maharana Pratap Airport Lodge Yard (UDR)">Maharana Pratap Airport Lodge Yard (UDR)</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Rental Period (Date Range)</label>
                <DatePicker 
                  selectsRange={true}
                  startDate={pickupDateTime}
                  endDate={returnDateTime}
                  onChange={handleDateRangeChange} 
                  dateFormat="dd/MM/yyyy" 
                  placeholderText="Select pickup & return dates"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer" 
                  wrapperClassName="w-full" portalId="datepicker-root"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Pickup Time</label>
                  <input 
                    type="time" 
                    value={`${String(pickupDateTime.getHours()).padStart(2, '0')}:${String(pickupDateTime.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => handlePickupTimeChange(e.target.value)}
                    className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Return Time</label>
                  <input 
                    type="time" 
                    value={`${String(returnDateTime.getHours()).padStart(2, '0')}:${String(returnDateTime.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => handleReturnTimeChange(e.target.value)}
                    className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Vehicle Segment</label>
              <div className="flex flex-wrap gap-3">
                {uniqueCategories.map(type => (
                  <button key={type} type="button" onClick={() => setSegment(type)} className={`px-4 py-2 text-[10px] md:text-[11px] font-black rounded transition-colors ${activeSegment === type ? 'bg-brand-neon text-black shadow-[0_0_10px_rgba(196,240,0,0.15)]' : 'bg-[#161616] border border-white/5 text-white/60 hover:bg-white/5'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8 bg-[#111111] rounded-[24px] border border-white/5 mt-4">
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Vehicle Selected Preview</label>
                <div className="relative">
                  <select value={selectedCarId} onChange={e => setSelectedCarId(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none appearance-none font-medium z-10 relative cursor-pointer">
                    {availableCars.map(c => <option key={c.id} value={c.id}>{c.make} {c.model} (starting ₹{c.packages[0]?.basePrice || 4000})</option>)}
                    {availableCars.length === 0 && <option value="">No vehicles found</option>}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Budget Package Tier</label>
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedCar?.packages?.length > 0 ? (
                    selectedCar.packages.map(pkg => (
                      <button key={pkg.id} type="button" onClick={() => setPackageLimit(pkg.limitValue)} className={`px-3 py-2 text-[11px] font-black rounded transition-colors ${packageLimit === pkg.limitValue ? 'bg-brand-neon text-black' : 'text-white/60 hover:bg-white/5'}`}>
                        {pkg.name}
                      </button>
                    ))
                  ) : (
                    <span className="text-[10px] text-white/30 italic font-mono">No packages configured for this vehicle</span>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-brand-neon hover:bg-brand-hover text-black font-black text-sm tracking-wide py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(196,240,0,0.15)] mt-6">
              <Search size={20} strokeWidth={2.5} /> SECURE RESERVATION - ₹{Math.round(selfDriveTariff * 0.3).toLocaleString()} ADVANCE HOLD
            </button>
          </div>
        )}

        {/* === WITH DRIVER TAB === */}
        {activeTab === 'WITH DRIVER' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Pickup Location Area</label>
                <div className="relative">
                  <select 
                    value={selectedPickupCity} 
                    onChange={e => setSelectedPickupCity(e.target.value)} 
                    className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none appearance-none font-medium z-10 relative cursor-pointer"
                  >
                    {cities && cities.length > 0 ? (
                      cities.map((city: any) => <option key={city.id} value={city.name}>{city.name} Transfer Yard</option>)
                    ) : (
                      <option value="Udaipur">Udaipur Airport Transfer Yard</option>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Travel Period (Date Range)</label>
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
                  placeholderText="Select start & return dates"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer" 
                  wrapperClassName="w-full" portalId="datepicker-root"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Pickup Time</label>
                  <input 
                    type="time" 
                    value={`${String(pickupDateTime.getHours()).padStart(2, '0')}:${String(pickupDateTime.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      const newDate = new Date(pickupDateTime);
                      newDate.setHours(h, m);
                      setPickupDateTime(newDate);
                    }}
                    className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Return Time</label>
                  <input 
                    type="time" 
                    value={`${String(returnDateTime.getHours()).padStart(2, '0')}:${String(returnDateTime.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(':').map(Number);
                      const newDate = new Date(returnDateTime);
                      newDate.setHours(h, m);
                      setReturnDateTime(newDate);
                    }}
                    className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Vehicle Class</label>
                  <div className="flex gap-2">
                    {uniqueCategories.slice(0, 2).map(t => (
                      <button key={t} type="button" onClick={() => setDriverSegment(t)} className={`flex-1 py-3 text-[10px] md:text-[11px] font-black rounded transition-colors ${driverSegment === t ? 'bg-brand-neon text-black shadow-[0_0_10px_rgba(196,240,0,0.15)]' : 'bg-[#161616] border border-white/5 text-white/60 hover:bg-white/5'}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Package Range</label>
                  <div className="flex gap-2">
                    {['Half Day', 'Full Day'].map(t => (
                      <button key={t} type="button" onClick={() => setDriverPackage(t)} className={`flex-1 py-3 text-[10px] md:text-[11px] font-black rounded transition-colors ${driverPackage === t ? 'bg-brand-neon text-black shadow-[0_0_10px_rgba(196,240,0,0.15)]' : 'bg-[#161616] border border-white/5 text-white/60 hover:bg-white/5'}`}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] border border-brand-neon/20 p-5 rounded-2xl flex justify-between items-center mt-2">
              <div className="flex items-center gap-3 text-white text-sm font-bold">
                <UserCircle className="text-brand-neon" size={20} /> Professional Driver Included in Upfront Fee
              </div>
              <div className="bg-[#161616] text-[#C4F000] text-[10px] px-3 py-1 font-black rounded uppercase tracking-widest border border-brand-neon/20">Vetted Driver</div>
            </div>

            <div className="bg-[#050505] p-6 rounded-2xl border border-white/5 flex justify-between items-center">
              <div className="text-sm font-bold text-white/80">Estimated Fare inclusive Taxes:</div>
              <div className="text-brand-neon font-black text-xl tracking-widest">₹{estimatedDriverFare.toLocaleString()}</div>
            </div>

            <button type="submit" className="w-full bg-brand-neon hover:bg-brand-hover text-black font-black text-sm tracking-wide py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(196,240,0,0.15)] mt-6">
              <Search size={20} strokeWidth={2.5} /> SECURE RESERVATION - ₹{Math.round(estimatedDriverFare * 0.3).toLocaleString()} ADVANCE HOLD
            </button>
          </div>
        )}

        {/* === ONE WAY / ROUND TRIP === */}
        {activeTab === 'ONE WAY / ROUND TRIP' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Pickup Area Location</label>
                <div className="relative">
                  <select value={pickupArea} onChange={e => setPickupArea(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none appearance-none font-medium z-10 relative cursor-pointer">
                    {cities && cities.length > 0 ? (
                      cities.map((city: any) => <option key={city.id} value={city.name}>{city.name} City</option>)
                    ) : (
                      <>
                        <option value="Udaipur City Center (Mewar)">Udaipur City Center (Mewar)</option>
                        <option value="Jaipur Airport">Jaipur Airport</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Destination Drop Area</label>
                <div className="relative">
                  <select value={dropArea} onChange={e => setDropArea(e.target.value)} className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none appearance-none font-medium z-10 relative cursor-pointer">
                    {cities && cities.length > 0 ? (
                      cities.map((city: any) => <option key={city.id} value={city.name}>{city.name} City</option>)
                    ) : (
                      <>
                        <option value="Ahmedabad International Airport">Ahmedabad International Airport</option>
                        <option value="Jodhpur City">Jodhpur City</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Travel Date Range</label>
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
                  placeholderText="Select travel dates"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer" 
                  wrapperClassName="w-full" portalId="datepicker-root"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Taxi Vehicle Type</label>
                <div className="relative">
                  <select className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none appearance-none font-medium z-10 relative cursor-pointer">
                    <option>Standard SUV (Base ₹6.5/km)</option>
                    <option>Luxury Sedan (Base ₹8/km)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#050505] p-6 rounded-2xl border border-white/5 flex justify-between items-center mt-4">
              <div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Fare Summary:</div>
                <div className="text-white text-sm font-bold">{isRoundTrip ? 'Round Trip (Tolls & Driver prepaid)' : 'One Way (Tolls & Driver prepaid)'}</div>
              </div>
              <div className="text-brand-neon font-black text-xl tracking-widest">₹{calculatedTaxiFare.toLocaleString()}</div>
            </div>

            <button type="submit" className="w-full bg-brand-neon hover:bg-brand-hover text-black font-black text-sm tracking-wide py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(196,240,0,0.15)] mt-6">
              <Search size={20} strokeWidth={2.5} /> SECURE RESERVATION - ₹{Math.round(calculatedTaxiFare * 0.3).toLocaleString()} ADVANCE HOLD
            </button>
          </div>
        )}

        {/* === VILLA + CAR === */}
        {activeTab === 'VILLA + CAR' && (
          <div className="space-y-6">
            <div className="flex bg-[#050505] rounded-xl overflow-hidden border border-white/5 mb-4">
              {['1 VILLA', '2 VEHICLE', '3 DRIVER', '4 GUESTS', '5 DATES', '6 RESERVE'].map((step, i) => (
                <div key={step} className={`flex-1 py-3 text-center text-[9px] font-black tracking-widest ${i === 0 ? 'bg-brand-neon text-black' : 'text-white/40'}`}>
                  {step.split(' ').map((w, j) => <div key={j}>{w}</div>)}
                </div>
              ))}
            </div>

            <div className="text-brand-neon text-[11px] font-black tracking-[0.2em] uppercase mb-2">Step 1: Select Luxury Villa</div>
            
            <div className="space-y-4 h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {villas.map((v, i) => (
                <div 
                  key={v.id} 
                  onClick={() => setSelectedVillaId(v.id)}
                  className={`p-6 rounded-[24px] border cursor-pointer transition-all flex justify-between items-center ${selectedVillaId === v.id || (i===0 && !selectedVillaId) ? 'border-brand-neon bg-[#111111] shadow-[0_0_20px_rgba(196,240,0,0.05)]' : 'border-white/5 bg-[#050505] hover:border-white/20 hover:bg-[#111111]'}`}
                >
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-widest mb-1">{v.name}</h3>
                    <div className="text-[10px] text-white/50 font-mono tracking-wider">{v.occupancy > 4 ? '4+ BHK' : '3 BHK'} • {v.amenities.includes('Pool') ? 'Private Swimming Pool' : 'Premium Stay Experience'}</div>
                  </div>
                  <div className="text-brand-neon font-black text-sm tracking-widest">
                    From ₹{v.startingPrice.toLocaleString()}/N
                  </div>
                </div>
              ))}
              {villas.length === 0 && <div className="text-center text-white/40 font-mono text-xs">No villas available.</div>}
            </div>

            <div className="flex justify-end pt-2 mb-4">
              <button type="submit" className="bg-brand-neon text-black text-[10px] font-black tracking-widest px-6 py-3 rounded-xl uppercase flex items-center gap-2 hover:bg-brand-hover transition-colors">
                NEXT STEP <Play size={12} fill="currentColor" />
              </button>
            </div>
          </div>
        )}

        {/* === TOUR PACKAGES === */}
        {activeTab === 'TOUR PACKAGES' && (
          <div className="space-y-8">
            <div>
              <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Curated Rajasthan Tour</label>
              <div className="relative">
                <select value={selectedTourId} onChange={e => setSelectedTourId(e.target.value)} className="w-full bg-[#050505] border border-brand-neon text-white rounded-xl p-4 text-sm outline-none appearance-none font-medium z-10 relative cursor-pointer shadow-[0_0_15px_rgba(196,240,0,0.05)]">
                  {tours.map(t => <option key={t.id} value={t.id}>{t.title} - ₹{t.adultPrice.toLocaleString()}</option>)}
                  {tours.length === 0 && <option value="">No tours found</option>}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[11px] font-black text-white/50 tracking-[0.2em] uppercase mb-4 block">Tour Date Range</label>
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
                  placeholderText="Select tour dates"
                  className="w-full bg-[#050505] border border-white/5 rounded-xl p-4 text-white text-sm outline-none font-medium cursor-pointer" 
                  wrapperClassName="w-full" portalId="datepicker-root"
                />
              </div>
            </div>

            <div className="bg-[#111111] p-6 md:p-8 rounded-[24px] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-4">
              <div>
                <div className="text-white font-black text-sm mb-1 uppercase tracking-wide">CERTIFIED SENIOR HISTORIAN GUIDE INCLUDED</div>
                <div className="text-brand-neon text-[10px] uppercase font-bold tracking-[0.1em]">Tolls, parking fees and entry permits completely covered</div>
              </div>
              <div className="text-white/60 font-medium text-xs font-mono">
                Starting at <span className="font-black text-xl ml-2 text-white tracking-widest">₹{calculatedTourFare.toLocaleString()}</span>
              </div>
            </div>

            <button type="submit" className="w-full bg-brand-neon hover:bg-brand-hover text-black font-black text-sm tracking-wide py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(196,240,0,0.15)] mt-6">
              <Search size={20} strokeWidth={2.5} /> SECURE RESERVATION - ₹{Math.round(calculatedTourFare * 0.3).toLocaleString()} ADVANCE HOLD
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
