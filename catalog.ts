// catalog.ts
//
// Single source of truth for everything bookable on the site. The same
// vehicle shows up under Self Drive, With Driver - Round Trip, and With
// Driver - Local with a different `pricing[service]` entry each time —
// that's the "common car, price changes by category" behavior you asked for.
//
// PLACEHOLDER PRICING: every rate/fee below is a plausible placeholder so
// the math works end-to-end. Replace with your real tariff card before
// going live — I don't have your actual pricing.

export type ServiceType =
  | "self-drive"
  | "with-driver-roundtrip"
  | "with-driver-local"
  | "villa-car"
  | "tour";

export type VehicleCategory =
  | "Sedan"
  | "SUV"
  | "Premium SUV"
  | "Tempo Traveller"
  | "Luxury";

export interface Deposit {
  amount: number;
  refundable: boolean;
}

export interface AddOnCharges {
  pickupDropFee: number; // flat fee for home/airport pickup-drop outside standard zone
  nightCharge: number; // flat fee if pickup/drop falls 10 PM \u2013 6 AM
}

// ---- Per-service pricing shapes ----

export interface SelfDrivePricing {
  hourlyPackages: { label: string; hours: number; includedKm: number; price: number }[];
  ratePerDay: number; // for bookings longer than the listed packages
  includedKmPerDay: number;
  extraKmRate: number;
  deposit: Deposit;
  driverAddOnPerDay: number; // self-drive is DIY by default; driver is an optional add-on
}

export interface RoundTripPricing {
  ratePerKm: number;
  minKmPerDay: number;
  driverAllowancePerDay: number;
}

export interface LocalPricing {
  packages: { label: string; hours: number; includedKm: number; price: number }[];
  extraKmRate: number;
  extraHourRate: number;
  driverAllowancePerDay: number;
}

export interface Vehicle {
  id: string;
  name: string;
  category: VehicleCategory;
  image: string;
  seats: number;
  fuel: string;
  gearbox: string;
  features: string[];
  inclusions: string[];
  exclusions: string[];
  addOns: AddOnCharges;
  // A vehicle only appears under the services it actually offers.
  pricing: {
    "self-drive"?: SelfDrivePricing;
    "with-driver-roundtrip"?: RoundTripPricing;
    "with-driver-local"?: LocalPricing;
  };
}

export const VEHICLES: Vehicle[] = [
  {
    id: "city-verna",
    name: "Honda City / Verna",
    category: "Sedan",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 4,
    fuel: "Diesel",
    gearbox: "Manual",
    features: ["Air conditioning", "Bluetooth audio", "Power steering"],
    inclusions: ["Insurance", "Base fare as per package", "Driver allowance (chauffeured trips)"],
    exclusions: ["Toll & state tax", "Parking", "Fuel surcharge beyond limit"],
    addOns: { pickupDropFee: 300, nightCharge: 250 },
    pricing: {
      "self-drive": {
        hourlyPackages: [
          { label: "12 Hrs / 120 KM", hours: 12, includedKm: 120, price: 2200 },
          { label: "24 Hrs / 250 KM", hours: 24, includedKm: 250, price: 3000 },
        ],
        ratePerDay: 3000,
        includedKmPerDay: 250,
        extraKmRate: 9,
        deposit: { amount: 3000, refundable: true },
        driverAddOnPerDay: 600,
      },
      "with-driver-roundtrip": { ratePerKm: 13, minKmPerDay: 250, driverAllowancePerDay: 300 },
      "with-driver-local": {
        packages: [
          { label: "4 Hrs / 40 KM", hours: 4, includedKm: 40, price: 900 },
          { label: "8 Hrs / 80 KM", hours: 8, includedKm: 80, price: 1600 },
        ],
        extraKmRate: 13,
        extraHourRate: 150,
        driverAllowancePerDay: 300,
      },
    },
  },
  {
    id: "ertiga-romanio",
    name: "Ertiga / Romanio",
    category: "SUV",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 7,
    fuel: "Diesel",
    gearbox: "Manual",
    features: ["Air conditioning", "7-seater", "Roof carrier available"],
    inclusions: ["Insurance", "Base fare as per package", "Driver allowance (chauffeured trips)"],
    exclusions: ["Toll & state tax", "Parking", "Fuel surcharge beyond limit"],
    addOns: { pickupDropFee: 350, nightCharge: 300 },
    pricing: {
      "self-drive": {
        hourlyPackages: [
          { label: "12 Hrs / 120 KM", hours: 12, includedKm: 120, price: 2600 },
          { label: "24 Hrs / 250 KM", hours: 24, includedKm: 250, price: 3600 },
        ],
        ratePerDay: 3600,
        includedKmPerDay: 250,
        extraKmRate: 11,
        deposit: { amount: 4000, refundable: true },
        driverAddOnPerDay: 700,
      },
      "with-driver-roundtrip": { ratePerKm: 16, minKmPerDay: 250, driverAllowancePerDay: 300 },
      "with-driver-local": {
        packages: [
          { label: "4 Hrs / 40 KM", hours: 4, includedKm: 40, price: 1100 },
          { label: "8 Hrs / 80 KM", hours: 8, includedKm: 80, price: 1900 },
        ],
        extraKmRate: 16,
        extraHourRate: 180,
        driverAllowancePerDay: 300,
      },
    },
  },
  {
    id: "crysta-2-4",
    name: "Innova Crysta 2.4",
    category: "Premium SUV",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 7,
    fuel: "Diesel",
    gearbox: "Manual",
    features: ["Captain seats", "Air conditioning", "Extra legroom"],
    inclusions: ["Insurance", "Base fare as per package", "Driver allowance (chauffeured trips)"],
    exclusions: ["Toll & state tax", "Parking", "Fuel surcharge beyond limit"],
    addOns: { pickupDropFee: 350, nightCharge: 300 },
    pricing: {
      "with-driver-roundtrip": { ratePerKm: 18, minKmPerDay: 250, driverAllowancePerDay: 350 },
      "with-driver-local": {
        packages: [
          { label: "4 Hrs / 40 KM", hours: 4, includedKm: 40, price: 1300 },
          { label: "8 Hrs / 80 KM", hours: 8, includedKm: 80, price: 2200 },
        ],
        extraKmRate: 18,
        extraHourRate: 200,
        driverAllowancePerDay: 350,
      },
    },
  },
  {
    id: "crysta-2-8-hycross",
    name: "Innova Crysta 2.8 / Hycross",
    category: "Premium SUV",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 7,
    fuel: "Diesel",
    gearbox: "Manual",
    features: ["Captain seats", "Premium interiors", "Extra legroom"],
    inclusions: ["Insurance", "Base fare as per package", "Driver allowance (chauffeured trips)"],
    exclusions: ["Toll & state tax", "Parking", "Fuel surcharge beyond limit"],
    addOns: { pickupDropFee: 400, nightCharge: 350 },
    pricing: {
      "self-drive": {
        hourlyPackages: [
          { label: "12 Hrs / 120 KM", hours: 12, includedKm: 120, price: 3200 },
          { label: "24 Hrs / 250 KM", hours: 24, includedKm: 250, price: 4400 },
        ],
        ratePerDay: 4400,
        includedKmPerDay: 250,
        extraKmRate: 13,
        deposit: { amount: 5000, refundable: true },
        driverAddOnPerDay: 800,
      },
      "with-driver-roundtrip": { ratePerKm: 20, minKmPerDay: 250, driverAllowancePerDay: 400 },
      "with-driver-local": {
        packages: [
          { label: "4 Hrs / 40 KM", hours: 4, includedKm: 40, price: 1500 },
          { label: "8 Hrs / 80 KM", hours: 8, includedKm: 80, price: 2500 },
        ],
        extraKmRate: 20,
        extraHourRate: 220,
        driverAllowancePerDay: 400,
      },
    },
  },
  {
    id: "traveller",
    name: "Traveller",
    category: "Tempo Traveller",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 14,
    fuel: "Diesel",
    gearbox: "Manual",
    features: ["Pushback seats", "Group luggage space", "Air conditioning"],
    inclusions: ["Insurance", "Base fare as per package", "Driver allowance"],
    exclusions: ["Toll & state tax", "Parking", "Fuel surcharge beyond limit"],
    addOns: { pickupDropFee: 450, nightCharge: 400 },
    pricing: {
      "with-driver-roundtrip": { ratePerKm: 25, minKmPerDay: 250, driverAllowancePerDay: 450 },
      "with-driver-local": {
        packages: [
          { label: "8 Hrs / 80 KM", hours: 8, includedKm: 80, price: 3200 },
          { label: "12 Hrs / 120 KM", hours: 12, includedKm: 120, price: 4200 },
        ],
        extraKmRate: 25,
        extraHourRate: 280,
        driverAllowancePerDay: 450,
      },
    },
  },
  {
    id: "urbania",
    name: "Urbania",
    category: "Tempo Traveller",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80",
    seats: 14,
    fuel: "Diesel",
    gearbox: "Manual",
    features: ["Premium pushback seats", "LED lighting", "Air conditioning"],
    inclusions: ["Insurance", "Base fare as per package", "Driver allowance"],
    exclusions: ["Toll & state tax", "Parking", "Fuel surcharge beyond limit"],
    addOns: { pickupDropFee: 450, nightCharge: 400 },
    pricing: {
      "with-driver-roundtrip": { ratePerKm: 28, minKmPerDay: 250, driverAllowancePerDay: 450 },
      "with-driver-local": {
        packages: [
          { label: "8 Hrs / 80 KM", hours: 8, includedKm: 80, price: 3600 },
          { label: "12 Hrs / 120 KM", hours: 12, includedKm: 120, price: 4800 },
        ],
        extraKmRate: 28,
        extraHourRate: 320,
        driverAllowancePerDay: 450,
      },
    },
  },
  {
    id: "e-class-bmw",
    name: "Mercedes E-Class / BMW",
    category: "Luxury",
    image: "https://goridez-uploads.s3.ap-south-1.amazonaws.com/uploads/1781900724829-324657301.jpg",
    seats: 4,
    fuel: "Diesel",
    gearbox: "Automatic",
    features: ["Leather interiors", "Chauffeur in uniform", "Complimentary water"],
    inclusions: ["Insurance", "Base fare as per package", "Driver allowance"],
    exclusions: ["Toll & state tax", "Parking", "Fuel surcharge beyond limit"],
    addOns: { pickupDropFee: 600, nightCharge: 500 },
    pricing: {
      "with-driver-roundtrip": { ratePerKm: 35, minKmPerDay: 250, driverAllowancePerDay: 500 },
      "with-driver-local": {
        packages: [
          { label: "4 Hrs / 40 KM", hours: 4, includedKm: 40, price: 2800 },
          { label: "8 Hrs / 80 KM", hours: 8, includedKm: 80, price: 4800 },
        ],
        extraKmRate: 35,
        extraHourRate: 400,
        driverAllowancePerDay: 500,
      },
    },
  },
];

// ---- Villa + Car bundles ----

export interface VillaCarBundle {
  id: string;
  name: string;
  image: string;
  bedrooms: number;
  guests: number;
  villaPricePerNight: number;
  includedVehicleId: string; // references a Vehicle, chauffeur-driven by default
  carIncludedKmPerDay: number;
  carExtraKmRate: number;
  deposit: Deposit;
  features: string[];
  inclusions: string[];
  exclusions: string[];
}

export const VILLA_CAR_BUNDLES: VillaCarBundle[] = [
  {
    id: "lake-view-villa-sedan",
    name: "Lake View Villa + Sedan",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
    bedrooms: 3,
    guests: 6,
    villaPricePerNight: 9500,
    includedVehicleId: "city-verna",
    carIncludedKmPerDay: 80,
    carExtraKmRate: 13,
    deposit: { amount: 5000, refundable: true },
    features: ["Private pool", "Lake-facing balcony", "Daily housekeeping"],
    inclusions: ["Villa stay", "Chauffeured car, 80 km/day", "Breakfast"],
    exclusions: ["Other meals", "Toll & parking", "Extra km beyond 80/day"],
  },
  {
    id: "heritage-haveli-suv",
    name: "Heritage Haveli + SUV",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
    bedrooms: 4,
    guests: 8,
    villaPricePerNight: 14000,
    includedVehicleId: "crysta-2-4",
    carIncludedKmPerDay: 100,
    carExtraKmRate: 18,
    deposit: { amount: 7000, refundable: true },
    features: ["Courtyard dining", "Rooftop view", "Heritage architecture"],
    inclusions: ["Villa stay", "Chauffeured SUV, 100 km/day", "Breakfast"],
    exclusions: ["Other meals", "Toll & parking", "Extra km beyond 100/day"],
  },
];

// ---- Tour packages ----

export interface TourPackage {
  id: string;
  name: string;
  image: string;
  days: 2 | 3 | 5;
  cities: string[];
  pricePerPerson: number;
  minPersons: number;
  includedVehicleId: string;
  features: string[];
  inclusions: string[];
  exclusions: string[];
}

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "udaipur-2d",
    name: "Udaipur Heritage Weekend",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80",
    days: 2,
    cities: ["Udaipur"],
    pricePerPerson: 6500,
    minPersons: 2,
    includedVehicleId: "ertiga-romanio",
    features: ["City Palace visit", "Lake Pichola boat ride", "Local guide"],
    inclusions: ["Chauffeured car", "1 night stay", "Breakfast", "Sightseeing entry fees"],
    exclusions: ["Lunch & dinner", "Personal expenses", "Toll & parking"],
  },
  {
    id: "udaipur-mountabu-3d",
    name: "Udaipur \u2013 Mount Abu Getaway",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80",
    days: 3,
    cities: ["Udaipur", "Mount Abu"],
    pricePerPerson: 11500,
    minPersons: 2,
    includedVehicleId: "crysta-2-4",
    features: ["Dilwara Temples", "Sunset Point", "Hill-station stay"],
    inclusions: ["Chauffeured car", "2 nights stay", "Breakfast", "Sightseeing entry fees"],
    exclusions: ["Lunch & dinner", "Personal expenses", "Toll & parking"],
  },
  {
    id: "grand-rajasthan-5d",
    name: "Grand Rajasthan Circuit",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80",
    days: 5,
    cities: ["Udaipur", "Jodhpur", "Jaisalmer", "Jaipur"],
    pricePerPerson: 24500,
    minPersons: 2,
    includedVehicleId: "crysta-2-8-hycross",
    features: ["4-city circuit", "Desert camp option", "Dedicated chauffeur throughout"],
    inclusions: ["Chauffeured car", "4 nights stay", "Breakfast", "Sightseeing entry fees"],
    exclusions: ["Lunch & dinner", "Personal expenses", "Toll, parking & state tax"],
  },
];
