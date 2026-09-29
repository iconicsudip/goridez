'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Calendar, SlidersHorizontal, X, LayoutGrid, List, Search, Shield, Award, Clock, MapPin, RotateCcw, CheckCircle2 } from 'lucide-react';
import SelfDriveList from '@/components/SelfDriveList';
import { DatePicker, ConfigProvider } from 'antd';
import dayjs from 'dayjs';
import { useBookingStore } from '@/store/useBookingStore';

const DATE_PICKER_THEME = {
  token: {
    colorPrimary: '#551A0C',
    borderRadius: 10,
    fontSize: 12,
  },
  components: {
    DatePicker: {
      cellWidth: 32,
      cellHeight: 24,
      timeColumnWidth: 54,
      timeCellHeight: 24,
    },
  },
};

export default function SelfDriveClient({ initialCars, initialCities }: { initialCars: any[], initialCities: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateSession } = useBookingStore();
  const [search, setSearch] = useState('');
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  const [category, setCategory] = useState('All');
  const [transmission, setTransmission] = useState('Any Transmission');
  const [fuelType, setFuelType] = useState('Any Fuel Type');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'recommended' | 'priceAsc' | 'priceDesc' | 'seats'>('recommended');

  const [pickupDate, setPickupDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return d;
  });
  const [returnDate, setReturnDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return new Date(d.getTime() + 12 * 60 * 60 * 1000);
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const qPickupDate = searchParams.get('pickupDate');
    const qReturnDate = searchParams.get('returnDate');
    const qPickupCity = searchParams.get('pickupCity');

    let loadedPickup = qPickupDate ? new Date(qPickupDate) : null;
    let loadedReturn = qReturnDate ? new Date(qReturnDate) : null;

    const now = new Date();
    if (loadedPickup && loadedPickup.getTime() < now.getTime()) {
      loadedPickup = new Date(now.getTime() + 60 * 60 * 1000);
    }
    if (loadedReturn && loadedPickup && loadedReturn.getTime() <= loadedPickup.getTime()) {
      loadedReturn = new Date(loadedPickup.getTime() + 12 * 60 * 60 * 1000);
    }

    if (loadedPickup) setPickupDate(loadedPickup);
    if (loadedReturn) setReturnDate(loadedReturn);

    if (qPickupCity) {
      const city = initialCities.find(c => c.name === qPickupCity);
      if (city && !selectedCityIds.includes(city.id)) {
        setSelectedCityIds([city.id]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(initialCars.map(c => c.category))).filter(Boolean)];
  }, [initialCars]);

  const availableTransmissions = useMemo(() => {
    return Array.from(new Set(initialCars.map(c => c.transmission))).filter(Boolean);
  }, [initialCars]);

  const availableFuelTypes = useMemo(() => {
    return Array.from(new Set(initialCars.map(c => c.fuelType))).filter(Boolean);
  }, [initialCars]);

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
  }, [availableCategories, searchParams]);

  useEffect(() => {
    if (!isMounted) return;

    const timeout = setTimeout(() => {
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

      if (pickupDate) setParam('pickupDate', pickupDate.toISOString(), false);
      if (returnDate) setParam('returnDate', returnDate.toISOString(), false);

      if (changed) {
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, transmission, fuelType, search, selectedCityIds, pickupDate, returnDate, isMounted, router]);

  useEffect(() => {
    document.body.style.overflow = isFiltersOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFiltersOpen]);

  function toggleCity(id: string) {
    setSelectedCityIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  function resetFilters() {
    setSearch('');
    setSelectedCityIds([]);
    setCategory('All');
    setTransmission('Any Transmission');
    setFuelType('Any Fuel Type');
    setSortBy('recommended');
  }

  const filteredCars = useMemo(() => {
    const list = initialCars.filter((car) => {
      const matchSearch = car.make.toLowerCase().includes(search.toLowerCase()) || car.model.toLowerCase().includes(search.toLowerCase());
      const matchCity = selectedCityIds.length === 0 ? true : (car.cityId && selectedCityIds.includes(car.cityId));
      const matchCategory = category === 'All' ? true : car.category.toLowerCase() === category.toLowerCase();
      const matchTransmission = transmission === 'Any Transmission' ? true : car.transmission.toLowerCase() === transmission.toLowerCase();
      const matchFuel = fuelType === 'Any Fuel Type' ? true : car.fuelType.toLowerCase() === fuelType.toLowerCase();

      return matchSearch && matchCity && matchCategory && matchTransmission && matchFuel;
    });

    if (sortBy === 'priceAsc') {
      return [...list].sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0));
    }
    if (sortBy === 'priceDesc') {
      return [...list].sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0));
    }
    if (sortBy === 'seats') {
      return [...list].sort((a, b) => (b.seatingCapacity || 0) - (a.seatingCapacity || 0));
    }

    return list;
  }, [initialCars, search, selectedCityIds, category, transmission, fuelType, sortBy]);

  const activeFilterCount = (category !== 'All' ? 1 : 0) +
    (selectedCityIds.length > 0 ? 1 : 0) +
    (transmission !== 'Any Transmission' ? 1 : 0) +
    (fuelType !== 'Any Fuel Type' ? 1 : 0) +
    (search !== '' ? 1 : 0);

  const filterControls = (
    <div className="space-y-6 text-left">
      {/* Date Range Selector */}
      <div className="space-y-5">
        <div>
          <label className="block text-[10px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2.5">
            Travel Schedule (Required)
          </label>
          <div className="relative flex items-center bg-[#FEFBF8] border border-[#E7DFD5] rounded-xl px-3 py-3 w-full shadow-xs">
            <Calendar className="text-[#C89D5C] mr-2 shrink-0" size={16} />
            <ConfigProvider theme={DATE_PICKER_THEME}>
              <DatePicker.RangePicker
                showTime={{ format: 'h:mm a', use12Hours: true, minuteStep: 30 }}
                format="DD/MM/YYYY - h:mm a"
                value={[pickupDate ? dayjs(pickupDate) : null, returnDate ? dayjs(returnDate) : null]}
                onChange={(dates) => {
                  if (dates && dates[0]) {
                    const start = dates[0].toDate();
                    let end = dates[1] ? dates[1].toDate() : new Date(start.getTime() + 12 * 60 * 60 * 1000);
                    if ((end.getTime() - start.getTime()) < 12 * 60 * 60 * 1000) {
                      end = new Date(start.getTime() + 12 * 60 * 60 * 1000);
                    }
                    setPickupDate(start);
                    setReturnDate(end);
                    updateSession({
                      pickupDate: start.toISOString(),
                      returnDate: end.toISOString()
                    });
                  } else {
                    setReturnDate(null);
                    updateSession({ returnDate: null });
                  }
                }}
                placeholder={['Pickup Date & Time', 'Return Date & Time']}
                variant="borderless"
                className="w-full text-xs font-semibold cursor-pointer text-[#250903] !p-0"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </ConfigProvider>
          </div>
        </div>

        {/* Model Search */}
        <div>
          <label className="block text-[10px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2.5">
            Search Model or Brand
          </label>
          <div className="relative flex items-center">
            <Search className="absolute left-3 text-[#8C6D53]" size={15} />
            <input
              type="text"
              placeholder="e.g. Swift, Fortuner, Thar, Scorpio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FEFBF8] border border-[#E7DFD5] rounded-xl pl-9 pr-8 py-2.5 text-xs text-[#250903] outline-none focus:border-[#C89D5C] placeholder:text-[#8C6D53]/50 shadow-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 text-xs text-[#8C6D53] hover:text-[#551A0C] cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-[10px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2.5">
            Hub City Coverage
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCityIds([])}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                selectedCityIds.length === 0
                  ? 'bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-xs'
                  : 'bg-[#FAF6F0] border-[#E7DFD5] text-[#551A0C]/70 hover:border-[#C89D5C] hover:text-[#551A0C]'
              }`}
            >
              All Hubs
            </button>
            {initialCities.map(c => {
              const isSelected = selectedCityIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleCity(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-xs'
                      : 'bg-[#FAF6F0] border-[#E7DFD5] text-[#551A0C]/70 hover:border-[#C89D5C] hover:text-[#551A0C]'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[10px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2.5">
            Vehicle Class
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableCategories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                  category === c
                    ? 'bg-[#551A0C] border-[#551A0C] text-[#DFB574] shadow-xs'
                    : 'bg-[#FAF6F0] border-[#E7DFD5] text-[#551A0C]/70 hover:border-[#C89D5C] hover:text-[#551A0C]'
                }`}
              >
                {c === 'All' ? 'All Classes' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Transmission Filter */}
        <div>
          <label className="block text-[10px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2.5">
            Transmission
          </label>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="w-full bg-[#FEFBF8] border border-[#E7DFD5] rounded-xl px-4 py-2.5 text-xs text-[#250903] outline-none focus:border-[#C89D5C] shadow-xs cursor-pointer"
          >
            <option value="Any Transmission">Any Transmission</option>
            {availableTransmissions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Fuel Filter */}
        <div>
          <label className="block text-[10px] text-[#8C6D53] font-bold uppercase tracking-[0.2em] mb-2.5">
            Fuel Propulsion
          </label>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="w-full bg-[#FEFBF8] border border-[#E7DFD5] rounded-xl px-4 py-2.5 text-xs text-[#250903] outline-none focus:border-[#C89D5C] shadow-xs cursor-pointer"
          >
            <option value="Any Fuel Type">Any Fuel Type</option>
            {availableFuelTypes.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Escrow Guarantee Note */}
        <div className="pt-4 border-t border-[#E7DFD5]">
          <div className="flex items-start gap-2.5 text-[#C89D5C] text-xs bg-[#FAF6F0] p-3.5 rounded-xl border border-[#C89D5C]/30">
            <Shield size={18} className="shrink-0 mt-0.5 text-[#DFB574]" />
            <p className="text-[#8C6D53] leading-relaxed text-[11px]">
              <strong className="text-[#551A0C] font-semibold block mb-0.5">100% Refundable Security Escrow.</strong>
              All deposits are strictly held in escrow and returned promptly once vehicle is returned in good order.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto pt-2 pb-24">
      {/* ── Grand Royal Panorama Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-[#250903] text-white p-8 md:p-12 xl:p-14 mb-10 border border-[#C89D5C]/30 shadow-2xl">
        {/* Subtle Warm Atmospheric Glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-radial from-[#C89D5C]/20 via-[#551A0C]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-radial from-[#DFB574]/15 via-transparent to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[#DFB574] text-[11px] font-bold tracking-[0.25em] uppercase mb-4 px-3.5 py-1.5 rounded-full bg-[#170501]/80 border border-[#C89D5C]/40 backdrop-blur-md">
              <Sparkles size={13} className="text-[#DFB574]" />
              <span>ATELIER OF RAJASTHAN MOBILITY</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight mb-4">
              ROYAL SELF-DRIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89D5C] via-[#DFB574] to-[#C89D5C]">COLLECTION</span>
            </h1>

            <p className="text-[#FAF6F0]/80 text-sm md:text-base leading-relaxed max-w-2xl font-normal">
              Autonomous journeys across Rajasthan with zero limitations. Premium mechanical inspection, white-glove doorstep delivery, and 100% security deposit guarantee.
            </p>
          </div>

          {/* Active Journey Status Pod */}
          <div className="bg-[#170501]/80 backdrop-blur-md border border-[#C89D5C]/40 rounded-2xl p-5 md:p-6 xl:w-[380px] shrink-0 shadow-xl">
            <div className="text-[10px] text-[#C89D5C] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
              <Clock size={13} /> ACTIVE JOURNEY SCHEDULE
            </div>

            <div className="space-y-2 text-xs border-b border-[#C89D5C]/20 pb-3 mb-3">
              <div className="flex justify-between">
                <span className="text-[#FAF6F0]/60">Pickup:</span>
                <span className="font-bold text-[#DFB574]">{pickupDate.toLocaleDateString('en-GB')} at {dayjs(pickupDate).format('h:mm A')}</span>
              </div>
              {returnDate && (
                <div className="flex justify-between">
                  <span className="text-[#FAF6F0]/60">Return:</span>
                  <span className="font-bold text-[#DFB574]">{returnDate.toLocaleDateString('en-GB')} at {dayjs(returnDate).format('h:mm A')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#FAF6F0]/60">Hub Territory:</span>
                <span className="font-bold text-white">{selectedCityIds.length === 0 ? 'All Rajasthan Hubs' : `${selectedCityIds.length} Hubs Selected`}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#DFB574]">
              <CheckCircle2 size={14} className="text-[#C89D5C] shrink-0" />
              <span>30% Advance hold locks in vehicle instantly</span>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Royal Distinction */}
        <div className="mt-10 pt-6 border-t border-[#C89D5C]/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#551A0C] border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Fully Insured</div>
              <div className="text-[10px] text-[#FAF6F0]/60">Zero Depreciation Risk</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#551A0C] border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Doorstep Reach</div>
              <div className="text-[10px] text-[#FAF6F0]/60">Within 60 Mins to Hotel/Airport</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#551A0C] border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] shrink-0">
              <Award size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">Zero Hidden Fees</div>
              <div className="text-[10px] text-[#FAF6F0]/60">GST Transparent Invoicing</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#551A0C] border border-[#C89D5C]/40 flex items-center justify-center text-[#DFB574] shrink-0">
              <RotateCcw size={16} />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">100% Escrow Return</div>
              <div className="text-[10px] text-[#FAF6F0]/60">Instant Refund Guarantee</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Category Pill Bar & View Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl p-3 md:px-5 md:py-3.5 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {availableCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                category === c
                  ? 'bg-[#551A0C] text-[#DFB574] shadow-md border border-[#551A0C]'
                  : 'bg-[#FAF6F0] border border-[#E7DFD5] text-[#551A0C]/80 hover:border-[#C89D5C] hover:text-[#551A0C]'
              }`}
            >
              {c === 'All' ? 'All Fleet' : c}
            </button>
          ))}
        </div>

        {/* View Switcher & Sort Selector */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7DFD5]">
          <div className="flex items-center bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#551A0C] text-[#DFB574] shadow-xs'
                  : 'text-[#8C6D53] hover:text-[#551A0C]'
              }`}
              title="Wide Ledger View"
            >
              <List size={15} />
              <span className="hidden md:inline">Ledger</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#551A0C] text-[#DFB574] shadow-xs'
                  : 'text-[#8C6D53] hover:text-[#551A0C]'
              }`}
              title="Showroom Grid View"
            >
              <LayoutGrid size={15} />
              <span className="hidden md:inline">Grid</span>
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#FAF6F0] border border-[#E7DFD5] text-[#551A0C] text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl outline-none focus:border-[#C89D5C] shadow-xs cursor-pointer"
            >
              <option value="recommended">Featured Order</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="seats">Most Spacious (Seats)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Split Layout: Sidebar & Content ── */}
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-10 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[320px] xl:w-[350px] shrink-0 card-luxury border-classic-frame bg-[#FEFBF8] border-[#E7DFD5] rounded-3xl p-7 h-fit lg:sticky lg:top-28 shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#E7DFD5]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-[#C89D5C]" />
              <h2 className="font-bold text-sm text-[#551A0C] tracking-wide uppercase">Filters & Refinements</h2>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[10px] text-[#C89D5C] uppercase tracking-widest hover:text-[#551A0C] transition-colors font-bold cursor-pointer"
              >
                Reset All ({activeFilterCount})
              </button>
            )}
          </div>
          {!isFiltersOpen && filterControls}
        </aside>

        {/* Cars Showcase Container */}
        <div className="flex-1 min-w-0 w-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6 bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl px-5 py-3.5 shadow-xs">
            <div className="text-xs text-[#8C6D53] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="text-[#C89D5C]">✦</span>
              <span>Showing {filteredCars.length} royal carriages available</span>
            </div>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setIsFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#FAF6F0] border border-[#E7DFD5] rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#551A0C] shadow-xs cursor-pointer"
            >
              <SlidersHorizontal size={14} className="text-[#C89D5C]" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Cars List / Grid */}
          <SelfDriveList
            initialCars={filteredCars}
            pickupDate={pickupDate}
            returnDate={returnDate}
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {isFiltersOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#250903]/60 backdrop-blur-sm z-[100] lg:hidden"
            onClick={() => setIsFiltersOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-full max-w-sm bg-[#FEFBF8] border-r border-[#E7DFD5] shadow-2xl z-[101] flex flex-col lg:hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#E7DFD5] shrink-0">
              <h2 className="font-bold text-base text-[#551A0C] uppercase tracking-wide">Filters & Refinements</h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="w-9 h-9 rounded-full bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#8C6D53] hover:text-[#551A0C] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {filterControls}
            </div>
            <div className="p-6 border-t border-[#E7DFD5] shrink-0 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 border border-[#E7DFD5] text-[#551A0C] px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#FAF6F0] transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="flex-1 btn-luxury btn-luxury-shine bg-[#551A0C] text-[#DFB574] px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer border border-[#C89D5C]/40"
              >
                View {filteredCars.length} Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
