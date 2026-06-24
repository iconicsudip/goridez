// pricing.ts
//
// One calculator per bookable thing (vehicle-by-service, villa bundle, tour).
// All return the same FareResult shape so the listing UI doesn't need to
// know which formula ran underneath.

import { Vehicle, ServiceType, VillaCarBundle, TourPackage } from "./catalog";

export interface FareLine {
  label: string;
  amount: number;
}

export interface FareResult {
  total: number;
  lines: FareLine[];
  depositNote?: string; // shown separately — deposit is collected & refunded, not part of the trip cost
}

export interface BookingParams {
  km?: number; // actual / auto-measured distance
  hours?: number; // self-drive or local rental duration
  days?: number; // self-drive multi-day or villa nights
  persons?: number; // tours
  wantsPickupDrop?: boolean; // home/airport pickup-drop vs standard zone
  isNightSlot?: boolean; // pickup or drop falls 10 PM \u2013 6 AM
  addDriver?: boolean; // self-drive only: opt in to a chauffeur
}

function addOnLines(vehicle: Vehicle, params: BookingParams): FareLine[] {
  const lines: FareLine[] = [];
  if (params.wantsPickupDrop && vehicle.addOns.pickupDropFee) {
    lines.push({ label: "Pickup & drop facility", amount: vehicle.addOns.pickupDropFee });
  }
  if (params.isNightSlot && vehicle.addOns.nightCharge) {
    lines.push({ label: "Late night charge", amount: vehicle.addOns.nightCharge });
  }
  return lines;
}

export function calculateSelfDriveFare(vehicle: Vehicle, params: BookingParams): FareResult | null {
  const pricing = vehicle.pricing["self-drive"];
  if (!pricing) return null;

  const hours = params.hours ?? 12;
  const lines: FareLine[] = [];

  // Pick the closest matching package, else fall back to per-day rate for longer bookings.
  const matchedPackage = pricing.hourlyPackages.find((p) => p.hours >= hours) ?? null;

  let includedKm: number;
  if (matchedPackage) {
    lines.push({ label: matchedPackage.label, amount: matchedPackage.price });
    includedKm = matchedPackage.includedKm;
  } else {
    const days = params.days ?? Math.ceil(hours / 24);
    lines.push({ label: `${days} day${days > 1 ? "s" : ""} \u00d7 \u20b9${pricing.ratePerDay}/day`, amount: pricing.ratePerDay * days });
    includedKm = pricing.includedKmPerDay * days;
  }

  const km = params.km ?? 0;
  if (km > includedKm) {
    const extraKm = km - includedKm;
    lines.push({ label: `Extra ${extraKm} km \u00d7 \u20b9${pricing.extraKmRate}/km`, amount: Math.round(extraKm * pricing.extraKmRate) });
  }

  if (params.addDriver) {
    const days = params.days ?? 1;
    lines.push({ label: `Driver add-on \u00d7 ${days} day${days > 1 ? "s" : ""}`, amount: pricing.driverAddOnPerDay * days });
  }

  lines.push(...addOnLines(vehicle, params));

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return {
    total,
    lines,
    depositNote: `\u20b9${pricing.deposit.amount.toLocaleString("en-IN")} ${pricing.deposit.refundable ? "refundable" : "non-refundable"} deposit collected at pickup`,
  };
}

export function calculateRoundTripFare(vehicle: Vehicle, km: number, days: number, params: BookingParams = {}): FareResult | null {
  const pricing = vehicle.pricing["with-driver-roundtrip"];
  if (!pricing) return null;

  const billableKm = Math.max(km, pricing.minKmPerDay * days);
  const lines: FareLine[] = [
    {
      label: `${billableKm} km \u00d7 \u20b9${pricing.ratePerKm}/km (min ${pricing.minKmPerDay} km/day)`,
      amount: Math.round(billableKm * pricing.ratePerKm),
    },
    { label: `Driver allowance \u00d7 ${days} day${days > 1 ? "s" : ""}`, amount: pricing.driverAllowancePerDay * days },
  ];
  lines.push(...addOnLines(vehicle, params));

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, lines };
}

export function calculateLocalFare(vehicle: Vehicle, packageLabel: string, params: BookingParams = {}): FareResult | null {
  const pricing = vehicle.pricing["with-driver-local"];
  if (!pricing) return null;

  const pkg = pricing.packages.find((p) => p.label === packageLabel) ?? pricing.packages[0];
  const lines: FareLine[] = [
    { label: pkg.label, amount: pkg.price },
    { label: "Driver allowance", amount: pricing.driverAllowancePerDay },
  ];

  const extraHours = Math.max(0, (params.hours ?? pkg.hours) - pkg.hours);
  if (extraHours > 0) {
    lines.push({ label: `Extra ${extraHours} hr \u00d7 \u20b9${pricing.extraHourRate}/hr`, amount: extraHours * pricing.extraHourRate });
  }
  const extraKm = Math.max(0, (params.km ?? pkg.includedKm) - pkg.includedKm);
  if (extraKm > 0) {
    lines.push({ label: `Extra ${extraKm} km \u00d7 \u20b9${pricing.extraKmRate}/km`, amount: Math.round(extraKm * pricing.extraKmRate) });
  }

  lines.push(...addOnLines(vehicle, params));

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, lines };
}

export function calculateVillaBundleFare(bundle: VillaCarBundle, nights: number, km?: number): FareResult {
  const lines: FareLine[] = [
    { label: `Villa \u00d7 ${nights} night${nights > 1 ? "s" : ""}`, amount: bundle.villaPricePerNight * nights },
  ];
  const includedKm = bundle.carIncludedKmPerDay * nights;
  const actualKm = km ?? includedKm;
  if (actualKm > includedKm) {
    const extraKm = actualKm - includedKm;
    lines.push({ label: `Extra ${extraKm} km \u00d7 \u20b9${bundle.carExtraKmRate}/km`, amount: Math.round(extraKm * bundle.carExtraKmRate) });
  }
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return {
    total,
    lines,
    depositNote: `\u20b9${bundle.deposit.amount.toLocaleString("en-IN")} ${bundle.deposit.refundable ? "refundable" : "non-refundable"} deposit collected at check-in`,
  };
}

export function calculateTourFare(tour: TourPackage, persons: number): FareResult {
  const billablePersons = Math.max(persons, tour.minPersons);
  const lines: FareLine[] = [
    {
      label: `${billablePersons} ${billablePersons > 1 ? "persons" : "person"} \u00d7 \u20b9${tour.pricePerPerson.toLocaleString("en-IN")}`,
      amount: tour.pricePerPerson * billablePersons,
    },
  ];
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, lines };
}
