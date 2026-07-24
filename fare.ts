// fare.ts
//
// Turns (trip type + distance + dates + car) into a priced breakdown.
// All rates pulled from CAR_FLEET in taxiData.ts — edit there, not here.

import { FleetCar, LOCAL_PACKAGES, ROUNDTRIP_PACKAGES } from "./taxiData";

export interface FareLine {
  label: string;
  amount: number;
}

export interface FareResult {
  total: number;
  lines: FareLine[];
  km: number | null;
  days: number;
}

const MIN_KM_PER_DAY_ROUND_TRIP = 250; // common outstation minimum-km guarantee

function daysBetween(pickupISO: string, returnISO?: string): number {
  if (!returnISO) return 1;
  const start = new Date(pickupISO);
  const end = new Date(returnISO);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

export function calculateLocalFare(car: FleetCar, packageValue: string): FareResult {
  const pkg = LOCAL_PACKAGES.find((p) => p.value === packageValue) ?? LOCAL_PACKAGES[0];
  // Local packages are flat-rate by KM bracket baked into the package name
  // (e.g. "8-80" = 8 hrs / 80 km). Use the bracket km * rate as the base fare.
  const bracketKm = Number(pkg.value.split("-")[1] ?? 40);
  const base = bracketKm * car.ratePerKm;
  const lines: FareLine[] = [
    { label: `${pkg.label} package`, amount: base },
    { label: "Driver allowance", amount: car.driverAllowancePerDay },
  ];
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, lines, km: bracketKm, days: 1 };
}

export function calculateOneWayFare(car: FleetCar, km: number): FareResult {
  const base = Math.round(km * car.ratePerKm);
  const lines: FareLine[] = [
    { label: `${km} km \u00d7 \u20b9${car.ratePerKm}/km`, amount: base },
    { label: "Driver allowance", amount: car.driverAllowancePerDay },
  ];
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, lines, km, days: 1 };
}

export function calculateRoundTripFare(
  car: FleetCar,
  km: number,
  pickupISO: string,
  returnISO: string,
  packageValue: string = "250-km"
): FareResult {
  const days = daysBetween(pickupISO, returnISO);
  const pkg = ROUNDTRIP_PACKAGES.find((p) => p.value === packageValue) ?? ROUNDTRIP_PACKAGES[0];
  
  let ratePerKm = car.ratePerKm;
  if (pkg.discountPercent > 0) {
    ratePerKm = Math.round(car.ratePerKm * (1 - pkg.discountPercent / 100) * 100) / 100;
  }

  let billableKm: number;
  let base: number;
  const lines: FareLine[] = [];

  if (pkg.isUnlimited) {
    billableKm = Math.max(km, 400 * days);
    base = Math.round(400 * ratePerKm * days);
    lines.push({
      label: `${pkg.label} (${days} day${days > 1 ? "s" : ""})`,
      amount: base,
    });
  } else {
    billableKm = Math.max(km, pkg.minKmPerDay * days);
    base = Math.round(billableKm * ratePerKm);
    lines.push({
      label: `${billableKm} km \u00d7 \u20b9${ratePerKm}/km (${pkg.label})`,
      amount: base,
    });
  }

  lines.push({
    label: `Driver allowance \u00d7 ${days} day${days > 1 ? "s" : ""}`,
    amount: car.driverAllowancePerDay * days,
  });

  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { total, lines, km: billableKm, days };
}
