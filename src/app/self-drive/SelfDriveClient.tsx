'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, Calendar } from 'lucide-react';
import SelfDriveList from '@/components/SelfDriveList';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useBookingStore } from '@/store/useBookingStore';

export default function SelfDriveClient({ initialCars, initialCities }: { initialCars: any[], initialCities: any[] }) {
  const searchParams = useSearchParams();
  const { session, updateSession } = useBookingStore();
  const [search, setSearch] = useState('');
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [category, setCategory] = useState('All');
  const [transmission, setTransmission] = useState('Any Transmission');
  const [fuelType, setFuelType] = useState('Any Fuel Type');
  const [maxPrice, setMaxPrice] = useState(40000);
  
  const [pickupDate, setPickupDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [returnDate, setReturnDate] = useState<Date | null>(new Date(Date.now() + 4 * 86400000));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const qPickupDate = searchParams.get('pickupDate');
    const qReturnDate = searchParams.get('returnDate');
    const qPickupCity = searchParams.get('pickupCity');

    if (qPickupDate) setPickupDate(new Date(qPickupDate));
    else if (session?.pickupDate) setPickupDate(new Date(session.pickupDate));

    if (qReturnDate) setReturnDate(new Date(qReturnDate));
    else if (session?.returnDate) setReturnDate(new Date(session.returnDate));

    const finalCity = qPickupCity || session?.pickupCity;
    if (finalCity) {
      const city = initialCities.find(c => c.name === finalCity);
      if (city && !selectedCityIds.includes(city.id)) {
        setSelectedCityIds([city.id]);
      }
    }
  }, [session?.pickupDate, session?.returnDate, session?.pickupCity, searchParams]);

  const handleDateRangeChange = (update: [Date | null, Date | null]) => {
    const [start, end] = update;
    let nextStart = pickupDate;
    let nextEnd = returnDate;

    if (start) {
      nextStart = new Date(start);
      nextStart.setHours(pickupDate.getHours(), pickupDate.getMinutes());
      setPickupDate(nextStart);
    }
    if (end) {
      nextEnd = new Date(end);
      nextEnd.setHours(returnDate ? returnDate.getHours() : 10, returnDate ? returnDate.getMinutes() : 0);
      setReturnDate(nextEnd);
      updateSession({
        pickupDate: nextStart.toISOString(),
        returnDate: nextEnd.toISOString()
      });
    } else {
      setReturnDate(null);
    }
  };

  const handlePickupTimeChange = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(pickupDate);
    newDate.setHours(h, m);
    setPickupDate(newDate);
    updateSession({
      pickupDate: newDate.toISOString()
    });
  };

  const handleReturnTimeChange = (timeStr: string) => {
    if (!returnDate) return;
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(returnDate);
    newDate.setHours(h, m);
    setReturnDate(newDate);
    updateSession({
      returnDate: newDate.toISOString()
    });
  };

  const availableCategories = ['All', ...Array.from(new Set(initialCars.map(c => c.category))).filter(Boolean)];
  const availableTransmissions = Array.from(new Set(initialCars.map(c => c.transmission))).filter(Boolean);
  const availableFuelTypes = Array.from(new Set(initialCars.map(c => c.fuelType))).filter(Boolean);

  useEffect(() => {
    const queryCategory = searchParams.get('category');
    if (queryCategory) {
      // Find case-insensitive match from available categories or fallback to 'All'
      const match = availableCategories.find(c => c.toLowerCase() === queryCategory.toLowerCase());
      if (match) setCategory(match);
      else setCategory(queryCategory); // Allow it to filter even if it's exact match needed
    }
  }, [searchParams]);

  function toggleCity(id: string) {
    setSelectedCityIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  const filteredCars = useMemo(() => {
    return initialCars.filter((car) => {
      const matchSearch = car.make.toLowerCase().includes(search.toLowerCase()) || car.model.toLowerCase().includes(search.toLowerCase());
      const matchCity = selectedCityIds.length === 0 ? true : (car.cityId && selectedCityIds.includes(car.cityId));
      const matchCategory = category === 'All' ? true : car.category.toLowerCase().includes(category.toLowerCase());
      const matchTransmission = transmission === 'Any Transmission' ? true : car.transmission.toLowerCase() === transmission.toLowerCase();
      const matchFuel = fuelType === 'Any Fuel Type' ? true : car.fuelType.toLowerCase() === fuelType.toLowerCase();
      
      const basePrice = car.packages?.[0]?.basePrice || 12000;
      const matchPrice = basePrice <= maxPrice;

      return matchSearch && matchCity && matchCategory && matchTransmission && matchFuel && matchPrice;
    });
  }, [initialCars, search, selectedCityIds, category, transmission, fuelType, maxPrice]);

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-10 mb-10">
        <div className="text-brand-neon text-[10px] font-black tracking-widest uppercase mb-4">
          Self Drive Freedom
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
          SOVEREIGN CAR RENTAL <span className="text-outline-neon">FLEET</span>
        </h1>
        <p className="text-white/60 max-w-2xl text-sm leading-relaxed mb-8">
          Premium driving, independent schedules, and zero limitations. Select dynamic mileage tiers with 100% security deposit guarantee.
        </p>
        <div className="inline-flex items-center gap-2 border border-brand-neon/30 bg-brand-neon/10 text-brand-neon px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase">
          <Sparkles size={14} /> Search Pre-set: {selectedCityIds.length === 0 ? 'All Cities' : `${selectedCityIds.length} Cities Selected`} ({pickupDate.toLocaleDateString('en-GB')} - {returnDate ? returnDate.toLocaleDateString('en-GB') : 'Select Return'})
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0 bg-[#111111] border border-white/5 rounded-3xl p-8 h-fit sticky top-28">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-black text-lg">Filters & Options</h2>
            <button 
              onClick={() => {
                setSearch(''); setSelectedCityIds([]); setCategory('All'); setTransmission('Any Transmission'); setFuelType('Any Fuel Type'); setMaxPrice(40000);
              }}
              className="text-[10px] text-white/40 uppercase tracking-widest hover:text-white transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Date Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">Rental Period (Date Range)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-neon pointer-events-none" size={14} />
                  <DatePicker 
                    selectsRange={true}
                    startDate={pickupDate}
                    endDate={returnDate}
                    onChange={handleDateRangeChange} 
                    dateFormat="dd/MM/yyyy" 
                    placeholderText="Select pickup & return dates"
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl pl-9 pr-3 py-3 text-xs outline-none focus:border-brand-neon transition-colors cursor-pointer" 
                    wrapperClassName="w-full" portalId="datepicker-root"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1.5">Pickup Time</label>
                  <input 
                    type="time" 
                    value={`${String(pickupDate.getHours()).padStart(2, '0')}:${String(pickupDate.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => handlePickupTimeChange(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-neon"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1.5">Return Time</label>
                  <input 
                    type="time" 
                    value={returnDate ? `${String(returnDate.getHours()).padStart(2, '0')}:${String(returnDate.getMinutes()).padStart(2, '0')}` : '10:00'}
                    onChange={(e) => handleReturnTimeChange(e.target.value)}
                    disabled={!returnDate}
                    className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-brand-neon disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">Search Model</label>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Mercedes, Thar, Audi..." 
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-neon transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">Choose City Coverage</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCityIds([])}
                  className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors border ${
                    selectedCityIds.length === 0
                      ? 'bg-brand-neon/10 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(196,240,0,0.08)]'
                      : 'bg-[#1A1A1A] border-white/5 text-white/50 hover:bg-[#222]'
                  }`}
                >
                  All Cities
                </button>
                {initialCities.map((c: any) => {
                  const selected = selectedCityIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCity(c.id)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors border ${
                        selected
                          ? 'bg-brand-neon/10 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(196,240,0,0.08)]'
                          : 'bg-[#1A1A1A] border-white/5 text-white/50 hover:bg-[#222]'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">Category Type</label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(c => (
                  <button 
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-3 py-1.5 rounded text-[10px] font-bold transition-colors border ${
                      category === c 
                        ? 'bg-brand-neon/10 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(196,240,0,0.08)]' 
                        : 'bg-[#1A1A1A] border-white/5 text-white/60 hover:bg-[#222]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">Transmission</label>
              <select 
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none appearance-none"
              >
                <option value="Any Transmission">Any Transmission</option>
                {availableTransmissions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest mb-3">Fuel Source</label>
              <select 
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3 text-sm outline-none appearance-none"
              >
                <option value="Any Fuel Type">Any Fuel Type</option>
                {availableFuelTypes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-[10px] text-white/50 font-bold uppercase tracking-widest">Max Rent (120K)</label>
                <span className="text-brand-neon text-[10px] font-bold">₹{maxPrice.toLocaleString()}/day</span>
              </div>
              <input 
                type="range" 
                min="2000" 
                max="80000" 
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1 bg-[#1A1A1A] rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-brand-neon [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-start gap-2 text-brand-neon text-[10px] uppercase tracking-widest">
                <span className="shrink-0 mt-0.5">ℹ</span>
                <p className="text-white/40 leading-relaxed normal-case tracking-normal">
                  Security deposit is fully returned when returned undamaged.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Cars List */}
        <div className="flex-1">
          <div className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em] mb-6">
            SHOWING {filteredCars.length} WHEELS AVAILABLE
          </div>
          <SelfDriveList initialCars={filteredCars} pickupDate={pickupDate} returnDate={returnDate} />
        </div>

      </div>
    </div>
  );
}
