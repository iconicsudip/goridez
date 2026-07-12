'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Calendar, BadgeCheck, ShieldCheck, MapPin, Clock } from 'lucide-react';
import ChauffeurList from '@/components/ChauffeurList';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { useBookingStore } from '@/store/useBookingStore';

export default function ChauffeurClient({ initialCars, initialCities }: { initialCars: any[], initialCities: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, updateSession } = useBookingStore();
  const [search, setSearch] = useState('');
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [category, setCategory] = useState('All');
  const [transmission, setTransmission] = useState('Any Transmission');
  const [fuelType, setFuelType] = useState('Any Fuel Type');
  const [maxPrice, setMaxPrice] = useState(40000);
  
  const [pickupDate, setPickupDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [returnDate, setReturnDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    d.setHours(10, 0, 0, 0);
    return d;
  });
  const [isMounted, setIsMounted] = useState(false);

  // Time filters are handled natively by Ant Design DatePicker

  useEffect(() => {
    setIsMounted(true);
    
    const qPickupDate = searchParams.get('pickupDate');
    const qReturnDate = searchParams.get('returnDate');
    const qPickupCity = searchParams.get('pickupCity');

    let loadedPickup = null;
    if (qPickupDate) loadedPickup = new Date(qPickupDate);
    else if (session?.pickupDate) loadedPickup = new Date(session.pickupDate);

    let loadedReturn = null;
    if (qReturnDate) loadedReturn = new Date(qReturnDate);
    else if (session?.returnDate) loadedReturn = new Date(session.returnDate);

    const now = new Date();
    if (loadedPickup && loadedPickup.getTime() < now.getTime()) {
      loadedPickup = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    }
    if (loadedReturn && loadedPickup && loadedReturn.getTime() <= loadedPickup.getTime()) {
      loadedReturn = new Date(loadedPickup.getTime() + 4 * 24 * 60 * 60 * 1000);
    }

    if (loadedPickup) setPickupDate(loadedPickup);
    if (loadedReturn) setReturnDate(loadedReturn);

    if (qPickupCity) {
      const city = initialCities.find(c => c.name === qPickupCity);
      if (city && !selectedCityIds.includes(city.id)) {
        setSelectedCityIds([city.id]);
      }
    }
  }, [session?.pickupDate, session?.returnDate, session?.pickupCity, searchParams]);

  // Handlers removed because DatePicker handles both date and time selection natively

  const availableCategories = ['All', ...Array.from(new Set(initialCars.map(c => c.category))).filter(Boolean)];
  const availableTransmissions = Array.from(new Set(initialCars.map(c => c.transmission))).filter(Boolean);
  const availableFuelTypes = Array.from(new Set(initialCars.map(c => c.fuelType))).filter(Boolean);

  useEffect(() => {
    const queryCategory = searchParams.get('category');
    if (queryCategory) {
      const match = availableCategories.find(c => c.toLowerCase() === queryCategory.toLowerCase());
      if (match) setCategory(match);
      else setCategory(queryCategory);
    }
    const queryTrans = searchParams.get('transmission');
    if (queryTrans) setTransmission(queryTrans);
    const queryFuel = searchParams.get('fuelType');
    if (queryFuel) setFuelType(queryFuel);
    const querySearch = searchParams.get('search');
    if (querySearch) setSearch(querySearch);
    const queryCities = searchParams.get('cities');
    if (queryCities) setSelectedCityIds(queryCities.split(','));
    const queryMaxPrice = searchParams.get('maxPrice');
    if (queryMaxPrice) setMaxPrice(Number(queryMaxPrice));
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    const setParam = (key: string, value: string, isDefault: boolean) => {
      if (!isDefault && params.get(key) !== value) {
        params.set(key, value);
        changed = true;
      } else if (isDefault && params.has(key)) {
        params.delete(key);
        changed = true;
      }
    };

    setParam('category', category, category === 'All');
    setParam('transmission', transmission, transmission === 'Any Transmission');
    setParam('fuelType', fuelType, fuelType === 'Any Fuel Type');
    setParam('search', search, search === '');
    setParam('cities', selectedCityIds.join(','), selectedCityIds.length === 0);
    setParam('maxPrice', maxPrice.toString(), maxPrice === 40000);
    
    if (pickupDate) setParam('pickupDate', pickupDate.toISOString(), false);
    if (returnDate) setParam('returnDate', returnDate.toISOString(), false);

    if (changed) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [category, transmission, fuelType, search, selectedCityIds, maxPrice, pickupDate, returnDate, isMounted, router, searchParams]);

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
      
      const basePrice = (car.packages?.[0]?.basePrice || 10000) + 1200; // Adding driver fee
      const matchPrice = basePrice <= maxPrice;

      return matchSearch && matchCity && matchCategory && matchTransmission && matchFuel && matchPrice;
    });
  }, [initialCars, search, selectedCityIds, category, transmission, fuelType, maxPrice]);

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="bg-gray-100 border border-gray-200 rounded-3xl p-10 mb-10">
        <div className="text-green-700 text-[10px] font-black tracking-widest uppercase mb-4">
          Chauffeur Service
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
          ELITE CHAUFFEUR-DRIVEN <span className="text-outline-neon">MOBILITY</span>
        </h1>
        <p className="text-gray-600 max-w-2xl text-sm leading-relaxed mb-8">
          Arrive with absolute premium posture. Impeccably groomed bilingual drivers, clean luxury vehicles, state-vetted clearances, and complete fuel & tolls coordination.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 pb-8 border-t border-gray-200 mb-6">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <BadgeCheck className="text-green-700" size={18} /> Certified Drivers
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <ShieldCheck className="text-green-700" size={18} /> 100% Insured Trips
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <MapPin className="text-green-700" size={18} /> All-Inclusive Tolls
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
            <Clock className="text-green-700" size={18} /> 24/7 Priority Ingress
          </div>
        </div>

        <div className="inline-flex items-center gap-2 border border-green-300 bg-green-600/10 text-green-700 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase">
          <Sparkles size={14} /> Search Pre-set: {selectedCityIds.length === 0 ? 'All Cities' : `${selectedCityIds.length} Cities Selected`} ({pickupDate.toLocaleDateString('en-GB')} at {String(pickupDate.getHours()).padStart(2, '0')}:{String(pickupDate.getMinutes()).padStart(2, '0')})
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[320px] shrink-0 bg-gray-100 border border-gray-200 rounded-3xl p-8 h-fit lg:sticky lg:top-28">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-black text-lg">Filters & Options</h2>
            <button 
              onClick={() => {
                setSearch(''); setSelectedCityIds([]); setCategory('All'); setTransmission('Any Transmission'); setFuelType('Any Fuel Type'); setMaxPrice(40000);
              }}
              className="text-[10px] text-gray-500 uppercase tracking-widest hover:text-gray-900 transition-colors"
            >
              Reset
            </button>
          </div>

          <div className="space-y-6">
            
            {/* Date Selection */}
            <div className="space-y-4 font-sans">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Travel Date Range (Required)</label>
                <div className="relative flex items-center bg-white border border-gray-200 rounded-xl px-3 py-3 w-full">
                  <Calendar className="text-green-700 mr-2 shrink-0" size={14} />
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Search Model</label>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Mercedes, Thar, Audi..." 
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-green-600 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Choose City Coverage</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCityIds([])}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                    selectedCityIds.length === 0
                      ? 'bg-green-600/10 border-green-600 text-green-700 shadow-sm'
                      : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
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
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                        selected
                          ? 'bg-green-600/10 border-green-600 text-green-700 shadow-sm'
                          : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Category Type</label>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map(c => (
                  <button 
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                      category === c 
                        ? 'bg-green-600/10 border-green-600 text-green-700 shadow-sm' 
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Transmission</label>
              <select 
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none"
              >
                <option value="Any Transmission">Any Transmission</option>
                {availableTransmissions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Fuel Source</label>
              <select 
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none"
              >
                <option value="Any Fuel Type">Any Fuel Type</option>
                {availableFuelTypes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">Max Fare</label>
                <span className="text-sm text-green-700 font-bold">₹{maxPrice.toLocaleString()}/day</span>
              </div>
              <input 
                type="range" 
                min="3000" 
                max="80000" 
                step="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-300 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
              />
            </div>
          </div>
        </aside>

        {/* Cars List */}
        <div className="flex-1">
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-6">
            SHOWING {filteredCars.length} CHAUFFEUR VEHICLES
          </div>
          <ChauffeurList initialCars={filteredCars} pickupDate={pickupDate} returnDate={returnDate} />
        </div>

      </div>
    </div>
  );
}
