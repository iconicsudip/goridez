'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShieldCheck, ChevronRight, ChevronLeft, Check, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { useBookingStore } from '@/store/useBookingStore';

export default function VillaComboPage({ initialVillas, cities, initialCars = [] }: { initialVillas: any[], cities: any[], initialCars?: any[] }) {
  const router = useRouter();
  const { session, updateSession, addToCart } = useBookingStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);
  
  const filteredVillas = initialVillas.filter(v => 
    selectedCityIds.length === 0 || (v.cityId && selectedCityIds.includes(v.cityId))
  );

  const [selectedVilla, setSelectedVilla] = useState<string | null>(filteredVillas[0]?.id || null);
  const [selectedCar, setSelectedCar] = useState<string | null>(initialCars[0]?.id || null);
  const [driverOption, setDriverOption] = useState<boolean>(true);
  const [pickupOption, setPickupOption] = useState<string>('Udaipur Railway Terminal Concierge');
  const [pickupDate, setPickupDate] = useState<Date>(new Date(Date.now() + 86400000));
  const [returnDate, setReturnDate] = useState<Date | null>(new Date(Date.now() + 4 * 86400000));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (session?.pickupDate) {
      setPickupDate(new Date(session.pickupDate));
    }
    if (session?.returnDate) {
      setReturnDate(new Date(session.returnDate));
    }
  }, [session?.pickupDate, session?.returnDate]);

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

  const [guests, setGuests] = useState(4);
  
  const durationHours = pickupDate && returnDate 
    ? Math.max(1, (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60))
    : 24;
  const duration = durationHours / 24;

  const activeVilla = filteredVillas.find(v => v.id === selectedVilla) || filteredVillas[0];
  const activeCar = initialCars.find(c => c.id === selectedCar) || initialCars[0];

  const isVillaAlreadyBooked = activeVilla?.bookings && activeVilla.bookings.length > 0 && activeVilla.bookings.some((b: any) => {
    if (b.status === 'CANCELLED') return false;
    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);
    const currentStart = pickupDate;
    const currentEnd = returnDate || pickupDate;
    return currentStart <= bEnd && currentEnd >= bStart;
  });

  const isCarAlreadyBooked = activeCar?.bookings && activeCar.bookings.length > 0 && activeCar.bookings.some((b: any) => {
    if (b.status === 'CANCELLED') return false;
    const bStart = new Date(b.startDate);
    const bEnd = new Date(b.endDate);
    const currentStart = pickupDate;
    const currentEnd = returnDate || pickupDate;
    return currentStart <= bEnd && currentEnd >= bStart;
  });

  const isComboBooked = isVillaAlreadyBooked || isCarAlreadyBooked;

  const isStepDisabled = 
    (currentStep === 1 && isVillaAlreadyBooked) ||
    (currentStep === 2 && isCarAlreadyBooked) ||
    (currentStep === 3 && (isVillaAlreadyBooked || isCarAlreadyBooked)) ||
    (currentStep === 4 && (isVillaAlreadyBooked || isCarAlreadyBooked));

  let forwardBtnText = 'Forward';
  if (currentStep === 1 && isVillaAlreadyBooked) forwardBtnText = 'Villa Booked';
  else if (currentStep === 2 && isCarAlreadyBooked) forwardBtnText = 'Car Booked';
  else if ((currentStep === 3 || currentStep === 4) && (isVillaAlreadyBooked || isCarAlreadyBooked)) {
    forwardBtnText = 'Resolve Conflict First';
  }

  function toggleCity(id: string) {
    setSelectedCityIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  }

  function handleNext() {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  }
  
  function handlePrev() {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  }

  function handleBook() {
    let extra = `${duration.toFixed(1)} Nights • ${driverOption ? 'With Chauffeur' : 'Self Drive'} • ${guests} Guests`;
    if (pickupDate && returnDate) {
      extra += ` • ${pickupDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })} - ${returnDate.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}`;
    }

    addToCart({
      serviceType: 'villaCar',
      referenceId: activeVilla?.id,
      title: `${activeVilla?.name} + ${activeCar?.model}`,
      image: activeVilla?.image || '',
      price: finalTotal,
      deposit: 0,
      extraInfo: extra
    });
  }

  const villaTotal = activeVilla ? Math.round(activeVilla.startingPrice * duration) : 0;
  const carDaily = activeCar ? (activeCar.packages?.[0]?.basePrice || 12000) : 12000;
  const carTotal = Math.round(carDaily * duration);
  const driverFee = driverOption ? Math.round(2000 * duration) : 0;
  const grossTotal = villaTotal + carTotal + driverFee;
  const discount = duration >= 3 ? Math.round(grossTotal * 0.15) : 0;
  const finalTotal = grossTotal - discount;

  const steps = [
    { n: 1, l: 'Villa' },
    { n: 2, l: 'Luxury Car' },
    { n: 3, l: 'Chauffeur' },
    { n: 4, l: 'Pickup' },
    { n: 5, l: 'Review' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-body pt-24 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-10 mb-10">
          <div className="text-green-700 text-[10px] font-black tracking-widest uppercase mb-4">
            Sensational Combo Offers
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            VILLA + LUXURY CAR <span className="text-outline-neon">PACKAGES</span>
          </h1>
          <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">
            Integrated premium stays. We combine five-star private heritage villas with self drive or driver-attended luxury SUVs. Enjoy an automatic <span className="text-green-700 font-bold">15% bundle reduction</span>.
          </p>
        </div>

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Wizard Panel */}
          <div className="flex-1 bg-gray-100 border border-gray-200 rounded-3xl p-8 flex flex-col">
            
            {/* Progress Bar */}
            <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-6 overflow-x-auto custom-scrollbar">
              {steps.map((step, i) => {
                const isCompleted = currentStep > step.n;
                const isActive = currentStep === step.n;
                return (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-green-600 text-white' : isCompleted ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {isCompleted ? <Check size={10} /> : step.n}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive || isCompleted ? 'text-green-700' : 'text-gray-500'}`}>
                      {step.l}
                    </span>
                    {i < 4 && <ChevronRight size={12} className={`mx-2 ${isActive || isCompleted ? 'text-gray-500' : 'text-gray-400'}`} />}
                  </div>
                );
              })}
            </div>

            {/* Step 1: Villa */}
            {currentStep === 1 && (
              <>
                <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-6">
                  <div>
                    <h2 className="text-xl font-black mb-1">Step 1: Choose Your Ultimate Villa</h2>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest">Heritage havelis & infinity lakeview mansions</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCityIds([])}
                      className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        selectedCityIds.length === 0
                          ? 'bg-green-600/10 border-green-600 text-green-700 shadow-sm'
                          : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-white/30 hover:text-gray-900/80'
                      }`}
                    >
                      All Cities
                    </button>
                    {cities?.map((c: any) => {
                      const selected = selectedCityIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          onClick={() => toggleCity(c.id)}
                          className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                            selected
                              ? 'bg-green-600/10 border-green-600 text-green-700 shadow-sm'
                              : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-white/30 hover:text-gray-900/80'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 mb-10 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
                  {filteredVillas.map((villa) => {
                    const isSelected = selectedVilla === villa.id;
                    const parsedAmenities = villa.amenities ? JSON.parse(villa.amenities).join(" • ") : "";

                    const isVillaBooked = villa.bookings && villa.bookings.length > 0 && villa.bookings.some((b: any) => {
                      if (b.status === 'CANCELLED') return false;
                      const bStart = new Date(b.startDate);
                      const bEnd = new Date(b.endDate);
                      const currentStart = pickupDate;
                      const currentEnd = returnDate || pickupDate;
                      return currentStart <= bEnd && currentEnd >= bStart;
                    });

                    return (
                      <div 
                        key={villa.id} 
                        onClick={() => setSelectedVilla(villa.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-colors flex gap-6 items-center ${
                          isVillaBooked
                            ? (isSelected ? 'border-red-500 bg-[#220B0B]' : 'border-red-500/20 bg-[#160B0B] hover:border-red-500/40')
                            : (isSelected ? 'border-green-600 bg-[#16160A]' : 'border-gray-200 bg-white hover:border-gray-400')
                        }`}
                      >
                        <div className="relative w-[140px] h-[90px] rounded-xl overflow-hidden shrink-0 border border-gray-300">
                          <Image src={villa.image} alt={villa.name} fill className="object-cover" unoptimized />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            {isVillaBooked ? (
                              <div className="text-[9px] text-red-500 font-bold uppercase tracking-widest mb-1">UNAVAILABLE (BOOKED)</div>
                            ) : (
                              <div className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">{villa.name.toLowerCase().includes('palace') ? 'LAKE VIEW STAY' : 'HERITAGE STAY'}</div>
                            )}
                            <div className="text-[9px] text-gray-500 font-mono">Max: {villa.occupancy} Guests</div>
                          </div>
                          <h3 className="font-black text-sm uppercase mb-1">{villa.name}</h3>
                          <div className="text-[9px] text-gray-500 font-mono mb-3">Location: {villa.location || 'Premium Destination'}</div>
                          <p className="text-[9px] text-gray-600 font-mono leading-relaxed line-clamp-1">
                            Amenities: {parsedAmenities}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-green-700 font-bold text-sm">₹{villa.startingPrice.toLocaleString()}<span className="text-gray-500 text-[9px]">/night</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Step 2: Car */}
            {currentStep === 2 && (
              <>
                <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-6">
                  <div>
                    <h2 className="text-xl font-black mb-1">Step 2: Choose Accompanied Luxury Car</h2>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest">Self drive or Chauffeur drive fleet</p>
                  </div>
                </div>

                <div className="space-y-4 mb-10 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[500px]">
                  {initialCars.map((car) => {
                    const isSelected = selectedCar === car.id;
                    const price = car.packages?.[0]?.basePrice || 12000;

                    const isCarBooked = car.bookings && car.bookings.length > 0 && car.bookings.some((b: any) => {
                      if (b.status === 'CANCELLED') return false;
                      const bStart = new Date(b.startDate);
                      const bEnd = new Date(b.endDate);
                      const currentStart = pickupDate;
                      const currentEnd = returnDate || pickupDate;
                      return currentStart <= bEnd && currentEnd >= bStart;
                    });

                    return (
                      <div 
                        key={car.id} 
                        onClick={() => setSelectedCar(car.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-colors flex flex-col md:flex-row gap-6 items-center ${
                          isCarBooked
                            ? (isSelected ? 'border-red-500 bg-[#220B0B]' : 'border-red-500/20 bg-[#160B0B] hover:border-red-500/40')
                            : (isSelected ? 'border-green-600 bg-[#16160A]' : 'border-gray-200 bg-white hover:border-gray-400')
                        }`}
                      >
                        <div className="relative w-full md:w-[140px] h-[90px] rounded-xl overflow-hidden shrink-0 border border-gray-300">
                          <Image src={car.image} alt={car.model} fill className="object-cover" unoptimized />
                        </div>
                        
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-2">
                            {isCarBooked ? (
                              <div className="text-[9px] text-red-500 font-bold uppercase tracking-widest mb-1">UNAVAILABLE (BOOKED)</div>
                            ) : (
                              <div className="text-[9px] text-green-700 font-bold uppercase tracking-widest mb-1">{car.category} CLASS</div>
                            )}
                            <div className="text-[9px] text-gray-500 font-mono">{car.transmission} • {car.fuelType}</div>
                          </div>
                          <h3 className="font-black text-sm uppercase mb-1">{car.make} {car.model}</h3>
                          <div className="text-[9px] text-green-700 font-mono mb-3">Fuel / Toll Surcharges prepaid</div>
                        </div>

                        <div className="text-right shrink-0 w-full md:w-auto">
                          <div className="text-gray-900 font-bold text-sm">₹{price.toLocaleString()}<span className="text-gray-500 text-[9px]">/day</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Step 3: Chauffeur */}
            {currentStep === 3 && (
              <>
                <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-6">
                  <div>
                    <h2 className="text-xl font-black mb-1">Step 3: Chauffeur & Driver Attendance</h2>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest">Would you like an elite regional driver to serve you?</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 flex-1">
                  <div 
                    onClick={() => setDriverOption(false)}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col ${
                      !driverOption ? 'border-green-600 bg-[#16160A]' : 'border-gray-200 bg-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <h3 className="font-black text-sm mb-3">Self-Drive Package</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed mb-6">
                      I prefer to drive myself. Requires submission of original driving license at entry and ₹5,000 to ₹10,000 security deposit.
                    </p>
                    <div className="text-green-700 font-bold text-xs mt-auto">₹0 Driver Fee</div>
                  </div>

                  <div 
                    onClick={() => setDriverOption(true)}
                    className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col ${
                      driverOption ? 'border-green-600 bg-[#16160A]' : 'border-gray-200 bg-gray-100 hover:border-gray-400'
                    }`}
                  >
                    <h3 className="font-black text-sm mb-3">Dedicated Private Chauffeur</h3>
                    <p className="text-[10px] text-gray-500 leading-relaxed mb-6">
                      Accompanied by a vetted English speaking regional expert. Zero security deposit required, and zero self drive liabilities.
                    </p>
                    <div className="text-green-700 font-bold text-xs mt-auto">₹2,000 / day fee</div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Pickup */}
            {currentStep === 4 && (
              <>
                <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-6">
                  <div>
                    <h2 className="text-xl font-black mb-1">Step 4: Premium Pickup & Logistic Options</h2>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest">We sync with your itinerary for VIP arrivals</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {[
                    { title: 'Airport Premium Meet & Greet', desc: 'Driver welcomes you at luggage terminus with customized name flyers.' },
                    { title: 'Taj / Oberoi Hotel Direct Delivery', desc: 'We deliver both vehicle and keys directly to your hotel valet.' },
                    { title: 'Udaipur Railway Terminal Concierge', desc: 'Drop off coordinates synced at coach arrival platforms.' }
                  ].map((opt, i) => (
                    <div 
                      key={i}
                      onClick={() => setPickupOption(opt.title)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex gap-4 items-center ${
                        pickupOption === opt.title ? 'border-green-600 bg-[#16160A]' : 'border-gray-200 bg-gray-100 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${pickupOption === opt.title ? 'border-green-600 bg-green-600' : 'border-gray-400'}`}>
                        {pickupOption === opt.title && <Check size={10} className="text-black" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm mb-1">{opt.title}</div>
                        <div className="text-[10px] text-gray-500">{opt.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <>
                <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-6">
                  <div>
                    <h2 className="text-xl font-black mb-1">Step 5: Master Package Review</h2>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest">Your bespoke dual-service package details</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                  {isComboBooked && (
                    <div className="bg-[#220B0B] border border-red-500/50 rounded-2xl p-5 mb-4 text-xs text-red-200 font-mono flex flex-col gap-2">
                      <div className="font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                        <span>⚠️ Combo Booking Conflict</span>
                      </div>
                      <p>
                        One or more items in your selection are already reserved for the chosen date range:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        {isVillaAlreadyBooked && <li>Villa <strong>{activeVilla?.name}</strong> is booked.</li>}
                        {isCarAlreadyBooked && <li>Luxury Car <strong>{activeCar?.make} {activeCar?.model}</strong> is booked.</li>}
                      </ul>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Please adjust check-in/check-out dates or select alternative stays/vehicles.
                      </p>
                    </div>
                  )}

                  <div className="bg-white border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
                    <div>
                      <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-2">Selected Stay Components</div>
                      <div className="text-green-700 font-black text-sm mb-1">{activeVilla?.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{activeVilla?.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-bold text-xs">₹{activeVilla?.startingPrice.toLocaleString()}/night</div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
                    <div>
                      <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-2">Selected Companion Wheels</div>
                      <div className="text-green-700 font-black text-sm mb-1">{activeCar?.make} {activeCar?.model}</div>
                      <div className="text-[10px] text-gray-500 font-mono">Type: {activeCar?.category} ({activeCar?.transmission})</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-bold text-xs">₹{carDaily.toLocaleString()}/day</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-2">Driver Selection</div>
                      <div className="text-gray-900 font-bold text-xs flex items-center gap-1.5"><Check size={12} className="text-green-700" /> {driverOption ? 'Full-time Private Chauffeur' : 'Self-Drive (No Driver)'}</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                      <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest mb-2">Logistic Pickup</div>
                      <div className="text-gray-900 font-bold text-xs truncate" title={pickupOption}>{pickupOption}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bottom Navigation */}
            <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-auto">
              {currentStep > 1 ? (
                <button onClick={handlePrev} className="flex items-center gap-2 text-[10px] bg-gray-100 px-4 py-2 rounded-lg text-gray-600 font-bold uppercase tracking-widest hover:text-gray-900 hover:bg-gray-200 transition-colors">
                  <ChevronLeft size={14} /> Previous Step
                </button>
              ) : <div></div>}
              
              <div className="text-[10px] text-gray-500 font-mono">Step <span className="text-gray-900 font-bold">{currentStep}</span> of 5</div>
              
              {currentStep < 5 ? (
                <button 
                  onClick={handleNext}
                  disabled={isStepDisabled}
                  className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                    isStepDisabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none'
                      : 'bg-green-600 hover:bg-brand-hover text-black shadow-[0_0_15px_rgba(196,240,0,0.15)]'
                  }`}
                >
                  {forwardBtnText} <ChevronRight size={14} />
                </button>
              ) : (
                <button 
                  onClick={handleBook}
                  disabled={isComboBooked}
                  className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors ${
                    isComboBooked 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                      : 'bg-green-600 hover:bg-brand-hover text-black shadow-[0_0_20px_rgba(196,240,0,0.3)]'
                  }`}
                >
                  {isComboBooked ? 'Combo Unavailable' : 'Finalize Combo & Book'}
                </button>
              )}
            </div>

          </div>

          {/* Right Ledger Panel */}
          <div className="w-full lg:w-[400px] shrink-0 bg-gray-100 border border-gray-200 rounded-3xl p-8 h-fit">
            
            <div className="flex items-center gap-2 text-green-700 text-[9px] font-black tracking-widest uppercase mb-2">
              <ShieldCheck size={14} /> Live Cost Receipt
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight mb-8">DUAL COMBO LEDGER</h2>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Stay Date Range</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-green-700 pointer-events-none" size={14} />
                  <DatePicker 
                    selectsRange={true}
                    startDate={pickupDate}
                    endDate={returnDate}
                    onChange={handleDateRangeChange} 
                    dateFormat="dd/MM/yyyy" 
                    placeholderText="Select Check-in & Check-out dates"
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-3 text-xs outline-none focus:border-green-600 transition-colors cursor-pointer font-medium" 
                    wrapperClassName="w-full" portalId="datepicker-root"
                  />
                </div>
                {isComboBooked && (
                  <div className="mt-2 bg-[#220B0B] border border-red-500/20 rounded-xl p-3 text-[10px] text-red-400 font-mono">
                    ⚠️ Selected stay components or companion wheels are already booked on these dates.
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Check-in Time</label>
                  <input 
                    type="time" 
                    value={`${String(pickupDate.getHours()).padStart(2, '0')}:${String(pickupDate.getMinutes()).padStart(2, '0')}`}
                    onChange={(e) => handlePickupTimeChange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-1">Check-out Time</label>
                  <input 
                    type="time" 
                    value={returnDate ? `${String(returnDate.getHours()).padStart(2, '0')}:${String(returnDate.getMinutes()).padStart(2, '0')}` : '10:00'}
                    onChange={(e) => handleReturnTimeChange(e.target.value)}
                    disabled={!returnDate}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-900 outline-none focus:border-green-600 font-mono disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Guests</label>
              <select 
                value={guests} 
                onChange={(e) => setGuests(parseInt(e.target.value))}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-xs outline-none appearance-none font-medium cursor-pointer">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                  <option key={g} value={g}>{g} Guests</option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 font-mono text-[10px] mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-gray-600">
                    <div>Villa: {activeVilla?.name || 'Selected Villa'}</div>
                    <div className="text-gray-400 text-[8px]">(₹{activeVilla?.startingPrice?.toLocaleString()} x {duration.toFixed(1)} nights)</div>
                  </div>
                  <div className="text-gray-900 font-bold">₹{villaTotal.toLocaleString()}</div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div className="text-gray-600">
                    <div>Car: {activeCar ? `${activeCar.make} ${activeCar.model}` : 'Selected Car'}</div>
                    <div className="text-gray-400 text-[8px]">(₹{carDaily.toLocaleString()} x {duration.toFixed(1)} days)</div>
                  </div>
                  <div className="text-gray-900 font-bold">₹{carTotal.toLocaleString()}</div>
                </div>

                <div className="flex justify-between items-start">
                  <div className="text-gray-600">Driver Allowance Fee</div>
                  <div className="text-gray-900 font-bold">₹{driverFee.toLocaleString()}</div>
                </div>
              </div>

              <div className="border-t border-gray-300 my-4 pt-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-gray-900/80 font-bold">Gross Combined total</div>
                  <div className="text-gray-900 font-bold">₹{grossTotal.toLocaleString()}</div>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-start text-green-700">
                    <div className="font-bold">15% Bundle Discount applied</div>
                    <div className="font-bold">- ₹{discount.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between items-center">
                <div className="text-gray-900/80 font-bold uppercase tracking-widest text-[9px]">Combined Fares</div>
                <div className="text-green-700 font-black text-lg">₹{finalTotal.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-[#2A2A0A] rounded-xl p-4 flex gap-3 text-[9px] text-gray-500 leading-relaxed font-mono">
              <div className="text-green-700 mt-0.5"><ShieldCheck size={14} /></div>
              <div><strong className="text-gray-900">₹0 Liability protection:</strong> Driver option completely waives the security deposit requirement. Rest easy!</div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
