'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Check, Award, ShieldAlert } from 'lucide-react';

interface CarPackage {
  id: string;
  type: string;
  name: string;
  basePrice: number;
  limitValue: number | null;
  extraChargePerUnit: number | null;
  deposit: number;
}

interface Car {
  id: string;
  make: string;
  model: string;
  category: string;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  image: string;
  packages: CarPackage[];
  bookings?: any[];
}

interface CompareSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCar: Car;
  allCars: Car[];
  onSelectCar: (carId: string) => void;
  pickupDate?: Date;
  returnDate?: Date | null;
}

const SPEC_DATA: Record<string, any> = {
  'S-Class': {
    engine: '3.0L L6 Turbo',
    power: '367 HP',
    luggage: '450 Liters (3 Large Bags)',
    clearance: '130 mm',
    efficiency: '10.5 km/l',
    safety: '5 Star Euro NCAP',
    features: 'Active Air Suspension • Soft Close Doors • Burmester 3D Surround Sound • Rear Executive Seats',
  },
  '5 Series': {
    engine: '2.0L TwinPower Turbo',
    power: '252 HP',
    luggage: '530 Liters (3 Medium Bags)',
    clearance: '140 mm',
    efficiency: '14.8 km/l',
    safety: '5 Star Euro NCAP',
    features: 'Adaptive LED Headlights • Harmon Kardon Audio • Gesture Control • Sport Seats',
  },
  'Innova Crysta': {
    engine: '2.4L GD Diesel',
    power: '150 HP',
    luggage: '300 Liters (5 Bags with rear seats folded)',
    clearance: '178 mm',
    efficiency: '12.0 km/l',
    safety: '5 Star ASEAN NCAP',
    features: 'Captain Seats • Rear AC Control • Touchscreen Infotainment • Eco & Power Drive Modes',
  },
  'Thar Roxx': {
    engine: '2.2L mHawk Diesel',
    power: '172 HP',
    luggage: '400 Liters (2 Large Bags)',
    clearance: '226 mm',
    efficiency: '11.5 km/l',
    safety: '5 Star Global NCAP',
    features: 'Shift-on-the-Fly 4WD • Panoramic Sunroof • Adventure Statistics Display • Washable Interiors',
  },
  'Velar': {
    engine: '2.0L Ingenium Petrol',
    power: '247 HP',
    luggage: '579 Liters (4 Bags)',
    clearance: '213 mm',
    efficiency: '11.2 km/l',
    safety: '5 Star Euro NCAP',
    features: 'Touch Pro Duo Screens • Meridian Sound • Deployable Door Handles • Electronic Air Suspension',
  },
  'Fortuner': {
    engine: '2.8L Diesel',
    power: '201 HP',
    luggage: '296 Liters (all 3 rows up)',
    clearance: '220 mm',
    efficiency: '10.0 km/l',
    safety: '5 Star ANCAP',
    features: 'Dual Zone Auto AC • 18-inch Alloy Wheels • Active Traction Control • Ventilated Front Seats',
  },
};

export function getCarSpecs(make: string, model: string, category: string) {
  const key = Object.keys(SPEC_DATA).find(
    k => model.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(model.toLowerCase())
  );
  if (key) return SPEC_DATA[key];

  // Return intelligent fallback specs based on category
  const isSUV = category.toLowerCase().includes('suv') || model.toLowerCase().includes('fortuner') || model.toLowerCase().includes('thar');
  return {
    engine: isSUV ? '2.5L Turbo Diesel' : '2.0L Turbo Petrol',
    power: isSUV ? '180 HP' : '190 HP',
    luggage: isSUV ? '450 Liters' : '400 Liters',
    clearance: isSUV ? '210 mm' : '140 mm',
    efficiency: isSUV ? '12.5 km/l' : '13.5 km/l',
    safety: '5 Star Rating',
    features: 'Touchscreen Infotainment • Premium Leather Seats • Cruise Control • Dynamic Driving Modes',
  };
}

export default function CompareSpecsModal({
  isOpen,
  onClose,
  selectedCar,
  allCars,
  onSelectCar,
  pickupDate,
  returnDate,
}: CompareSpecsModalProps) {
  const comparisonOptions = useMemo(() => {
    return allCars.filter(c => c.id !== selectedCar.id);
  }, [allCars, selectedCar]);

  const [compareCarId, setCompareCarId] = useState<string>('');

  const activeCompareCar = useMemo(() => {
    if (compareCarId) {
      return allCars.find(c => c.id === compareCarId);
    }
    return comparisonOptions[0] || null;
  }, [compareCarId, comparisonOptions, allCars]);

  if (!isOpen) return null;

  const carASpecs = getCarSpecs(selectedCar.make, selectedCar.model, selectedCar.category);
  const carBSpecs = activeCompareCar
    ? getCarSpecs(activeCompareCar.make, activeCompareCar.model, activeCompareCar.category)
    : null;

  const isCarABooked = selectedCar.bookings && selectedCar.bookings.length > 0 && selectedCar.bookings.some((booking: any) => {
    if (booking.status === 'CANCELLED') return false;
    const bStart = new Date(booking.startDate);
    const bEnd = new Date(booking.endDate);
    const currentStart = pickupDate || new Date();
    const currentEnd = returnDate || new Date();
    return currentStart <= bEnd && currentEnd >= bStart;
  });

  const isCarBBooked = activeCompareCar && activeCompareCar.bookings && activeCompareCar.bookings.length > 0 && activeCompareCar.bookings.some((booking: any) => {
    if (booking.status === 'CANCELLED') return false;
    const bStart = new Date(booking.startDate);
    const bEnd = new Date(booking.endDate);
    const currentStart = pickupDate || new Date();
    const currentEnd = returnDate || new Date();
    return currentStart <= bEnd && currentEnd >= bStart;
  });

  const carAPackage = selectedCar.packages?.[0];
  const carBPackage = activeCompareCar?.packages?.[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-fade-in">
      <div className="bg-gray-100 border border-gray-300 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-200 flex justify-between items-center bg-[#0C0C0C]">
          <div>
            <span className="text-[10px] text-green-700 font-black tracking-widest uppercase mb-1 block">Fidelity Fleet Intelligence</span>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">Compare Vehicle Specifications</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-gray-300 bg-white/5 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-3 gap-4 items-stretch">

            {/* Column 1: Labels placeholder */}
            <div className="flex flex-col justify-end pb-4 font-mono text-[9px] text-gray-500 uppercase tracking-wider font-bold">
              SPECIFICATION METRIC
            </div>

            {/* Column 2: Selected Car Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center relative">
              <div className="absolute top-3 left-3 bg-green-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
                SELECTED
              </div>
              <div className="relative w-full h-[90px] mb-3">
                <Image src={selectedCar.image} alt={selectedCar.model} fill className="object-cover" unoptimized />
              </div>
              <h3 className="font-black text-sm uppercase text-gray-900 truncate max-w-full">
                {selectedCar.make} {selectedCar.model}
              </h3>
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                {selectedCar.category} Class
              </span>
            </div>

            {/* Column 3: Comparison Selector / Car Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center relative">
              <div className="absolute top-3 left-3 w-40 text-left">
                <select
                  value={compareCarId}
                  onChange={(e) => setCompareCarId(e.target.value)}
                  className="bg-white/90 border border-gray-300 rounded-lg px-2 py-1 text-[10px] text-gray-900 outline-none w-full cursor-pointer font-bold uppercase tracking-wider focus:border-green-600"
                >
                  <option value="" disabled>Select comparison</option>
                  {comparisonOptions.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.make} {c.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative w-full h-[90px] mt-6 mb-3">
                {activeCompareCar ? (
                  <Image src={activeCompareCar.image} alt={activeCompareCar.model} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-mono">
                    No image available
                  </div>
                )}
              </div>
              {activeCompareCar && (
                <>
                  <h3 className="font-black text-sm uppercase text-gray-900 truncate max-w-full">
                    {activeCompareCar.make} {activeCompareCar.model}
                  </h3>
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                    {activeCompareCar.category} Class
                  </span>
                </>
              )}
            </div>

          </div>

          {/* Specs Rows Grid */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden font-mono text-[11px]">
            {[
              { label: 'Transmission System', valA: selectedCar.transmission, valB: activeCompareCar?.transmission },
              { label: 'Propulsion Fuel', valA: selectedCar.fuelType, valB: activeCompareCar?.fuelType },
              { label: 'Seating Capacity', valA: `${selectedCar.seatingCapacity} Passengers`, valB: activeCompareCar ? `${activeCompareCar.seatingCapacity} Passengers` : '' },
              { label: 'Engine Size / Layout', valA: carASpecs.engine, valB: carBSpecs?.engine },
              { label: 'Maximum Power', valA: carASpecs.power, valB: carBSpecs?.power },
              { label: 'Luggage Storage Capacity', valA: carASpecs.luggage, valB: carBSpecs?.luggage },
              { label: 'Clearance Height', valA: carASpecs.clearance, valB: carBSpecs?.clearance },
              { label: 'Fuel efficiency', valA: carASpecs.efficiency, valB: carBSpecs?.efficiency },
              { label: 'Safety Rating standard', valA: carASpecs.safety, valB: carBSpecs?.safety },
              { label: 'Refundable Security Hold', valA: carAPackage ? `₹${carAPackage.deposit.toLocaleString()}` : 'Contact Support', valB: carBPackage ? `₹${carBPackage.deposit.toLocaleString()}` : 'Contact Support' },
              { label: 'Excess Distance Premium', valA: carAPackage?.extraChargePerUnit ? `₹${carAPackage.extraChargePerUnit}/KM` : 'Included', valB: carBPackage?.extraChargePerUnit ? `₹${carBPackage.extraChargePerUnit}/KM` : 'Included' },
            ].map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 gap-4 p-4 border-b border-gray-200 last:border-0 ${i % 2 === 0 ? 'bg-[#151515]' : 'bg-[#0E0E0E]'}`}
              >
                <div className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{row.label}</div>
                <div className="text-gray-900 font-medium">{row.valA}</div>
                <div className="text-gray-900 font-medium">{row.valB || '-'}</div>
              </div>
            ))}

            {/* Special Features Row */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-[#1C1C12] border-t border-gray-300">
              <div className="text-green-700 font-black uppercase tracking-wider text-[10px]">
                Premium Package Features
              </div>
              <div className="text-gray-900/80 leading-relaxed text-[10px]">
                {carASpecs.features}
              </div>
              <div className="text-gray-900/80 leading-relaxed text-[10px]">
                {carBSpecs?.features || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-4 bg-[#0C0C0C]">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            Close Comparison
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (!isCarABooked) {
                  onSelectCar(selectedCar.id);
                  onClose();
                }
              }}
              disabled={isCarABooked}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCarABooked
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-green-600 text-white hover:bg-brand-hover shadow-[0_0_15px_rgba(196,240,0,0.2)]'
                }`}
            >
              {isCarABooked ? 'Selected Booked' : `Choose ${selectedCar.model}`}
            </button>

            {activeCompareCar && (
              <button
                onClick={() => {
                  if (!isCarBBooked) {
                    onSelectCar(activeCompareCar.id);
                    onClose();
                  }
                }}
                disabled={isCarBBooked}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isCarBBooked
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  }`}
              >
                {isCarBBooked ? 'Compare Booked' : `Choose ${activeCompareCar.model}`}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
