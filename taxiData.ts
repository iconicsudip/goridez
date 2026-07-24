// taxiData.ts
// Placeholder data for the taxi booking widget.
// Replace CITIES with a real API call (e.g. /api/cities) when you wire this in.

export interface City {
  value: string;
  label: string;
}

// All pickups currently originate from Udaipur only.
export const HOME_CITY: City = { value: "udaipur", label: "Udaipur" };

// Destinations reachable from Udaipur. Udaipur itself is excluded here —
// it's the fixed pickup point, not a selectable destination.
export const CITIES: City[] = [
  { value: "jaipur", label: "Jaipur" },
  { value: "jodhpur", label: "Jodhpur" },
  { value: "jaisalmer", label: "Jaisalmer" },
  { value: "mount-abu", label: "Mount Abu" },
  { value: "pushkar", label: "Pushkar" },
  { value: "ajmer", label: "Ajmer" },
  { value: "kota", label: "Kota" },
  { value: "udaipur-airport", label: "Udaipur Airport (UDR)" },
  { value: "delhi", label: "Delhi" },
  { value: "ahmedabad", label: "Ahmedabad" },
  { value: "mumbai", label: "Mumbai" },
];

export interface LocalPackage {
  value: string;
  label: string;
  hint: string; // shown as small caption
}

export const LOCAL_PACKAGES: LocalPackage[] = [
  { value: "4-40", label: "4 Hrs / 40 KM", hint: "Half day, in-city" },
  { value: "8-80", label: "8 Hrs / 80 KM", hint: "Full day, in-city" },
  { value: "12-120", label: "12 Hrs / 120 KM", hint: "Extended day" },
  { value: "full-day", label: "Full Day (24 Hrs)", hint: "Round-the-clock" },
];

export interface RoundTripPackage {
  value: string;
  label: string;
  minKmPerDay: number;
  discountPercent: number; // e.g. 0% for standard 250km, 5% off rate for 300km, 10% off for 350km
  isUnlimited?: boolean;
  hint: string;
}

export const ROUNDTRIP_PACKAGES: RoundTripPackage[] = [
  { value: "250-km", label: "250 KM / Day (Standard)", minKmPerDay: 250, discountPercent: 0, hint: "Standard 250 Km daily limit" },
  { value: "300-km", label: "300 KM / Day (Executive)", minKmPerDay: 300, discountPercent: 5, hint: "300 Km limit, 5% off rate/km" },
  { value: "350-km", label: "350 KM / Day (Deluxe)", minKmPerDay: 350, discountPercent: 10, hint: "350 Km limit, 10% off rate/km" },
  { value: "unlimited", label: "Unlimited KM (Freedom)", minKmPerDay: 400, discountPercent: 0, isUnlimited: true, hint: "Flat daily rate, zero extra km fee" },
];

// Placeholder fare policy copy — edit to match your actual terms.
export const INCLUSIONS = [
  "Base fare for package KM / Hrs",
  "Driver allowance",
  "Fuel cost within package limit",
];

export const EXCLUSIONS = [
  "Toll tax & state tax",
  "Parking charges",
  "Night allowance (10 PM \u2013 6 AM)",
  "Extra KM / Hr beyond package",
];

// Fleet reused from your homepage vehicle collection, extended with outstation
// taxi pricing fields. ratePerKm / driverAllowancePerDay are PLACEHOLDERS —
// replace with your real per-km tariff card before going live.
export interface FleetCar {
  id: string;
  name: string;
  category: "Sedan" | "SUV" | "Premium SUV" | "Tempo Traveller" | "Luxury";
  image: string;
  seats: number;
  fuel: string;
  gearbox: string;
  ratePerKm: number;
  driverAllowancePerDay: number;
}

export const CAR_FLEET: FleetCar[] = [
  {
    id: "city-verna",
    name: "Honda City / Verna",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 4,
    fuel: "Diesel",
    gearbox: "Manual",
    ratePerKm: 13,
    driverAllowancePerDay: 300,
  },
  {
    id: "ertiga-romanio",
    name: "Ertiga / Romanio",
    category: "SUV",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 7,
    fuel: "Diesel",
    gearbox: "Manual",
    ratePerKm: 16,
    driverAllowancePerDay: 300,
  },
  {
    id: "innova-2-5",
    name: "Innova 2.5",
    category: "SUV",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 7,
    fuel: "Diesel",
    gearbox: "Manual",
    ratePerKm: 17,
    driverAllowancePerDay: 350,
  },
  {
    id: "crysta-2-4",
    name: "Innova Crysta 2.4",
    category: "Premium SUV",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 7,
    fuel: "Diesel",
    gearbox: "Manual",
    ratePerKm: 18,
    driverAllowancePerDay: 350,
  },
  {
    id: "crysta-2-8-hycross",
    name: "Innova Crysta 2.8 / Hycross",
    category: "Premium SUV",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 7,
    fuel: "Diesel",
    gearbox: "Manual",
    ratePerKm: 20,
    driverAllowancePerDay: 400,
  },
  {
    id: "traveller",
    name: "Traveller",
    category: "Tempo Traveller",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 14,
    fuel: "Diesel",
    gearbox: "Manual",
    ratePerKm: 25,
    driverAllowancePerDay: 450,
  },
  {
    id: "urbania",
    name: "Urbania",
    category: "Tempo Traveller",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 14,
    fuel: "Diesel",
    gearbox: "Manual",
    ratePerKm: 28,
    driverAllowancePerDay: 450,
  },
  {
    id: "e-class-bmw",
    name: "Mercedes E-Class / BMW",
    category: "Luxury",
    image: "https://goridez-uploads.s3.ap-south-1.amazonaws.com/uploads/1781900724829-324657301.jpg",
    seats: 4,
    fuel: "Diesel",
    gearbox: "Automatic",
    ratePerKm: 35,
    driverAllowancePerDay: 500,
  },
];

// Approximate one-way road distance from Udaipur, in KM.
// PLACEHOLDER table for offline/dev use — see distance.ts for how to replace
// this with live Google Maps Distance Matrix results.
export const DISTANCE_FROM_UDAIPUR_KM: Record<string, number> = {
  jaipur: 405,
  jodhpur: 250,
  jaisalmer: 480,
  "mount-abu": 165,
  pushkar: 285,
  ajmer: 280,
  kota: 285,
  "udaipur-airport": 25,
  delhi: 660,
  ahmedabad: 260,
  mumbai: 740,
};
