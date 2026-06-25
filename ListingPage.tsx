"use client";

/**
 * ListingPage
 * ------------
 * One listing UI for all five services. Pass `service` + the params your
 * search widget collected (km / hours / days / persons / dates) and it
 * renders the right card type with auto-calculated pricing.
 *
 *   <ListingPage service="self-drive" params={{ hours: 24, km: 0 }} />
 *   <ListingPage service="with-driver-roundtrip" params={{ km: 405, days: 2 }} />
 *   <ListingPage service="with-driver-local" params={{ packageLabel: "8 Hrs / 80 KM" }} />
 *   <ListingPage service="villa-car" params={{ days: 2 }} />
 *   <ListingPage service="tour" params={{ persons: 2 }} />
 *
 * Category filter chips are derived from whatever's actually in the catalog
 * for that service, so adding a new vehicle/category needs no UI changes.
 */

import { useMemo, useState } from "react";
import { Users, Fuel, Settings2, ChevronDown, BedDouble, MapPin as MapPinIcon, CalendarDays } from "lucide-react";
import {
  ServiceType,
  Vehicle,
  VEHICLES,
  VILLA_CAR_BUNDLES,
  TOUR_PACKAGES,
  VillaCarBundle,
  TourPackage,
} from "./catalog";
import {
  calculateSelfDriveFare,
  calculateRoundTripFare,
  calculateLocalFare,
  calculateVillaBundleFare,
  calculateTourFare,
  FareResult,
  BookingParams,
} from "./pricing";

type ListingService = ServiceType;

interface ListingPageProps {
  service: ListingService;
  params: BookingParams & { packageLabel?: string };
  termsHref?: string;
}

const SERVICE_LABEL: Record<ListingService, string> = {
  "self-drive": "Self Drive",
  "with-driver-roundtrip": "With Driver \u2013 Round Trip",
  "with-driver-local": "With Driver \u2013 Local",
  "villa-car": "Villa + Car",
  tour: "Rajasthan Tours",
};

export default function ListingPage({ service, params, termsHref = "/terms" }: ListingPageProps) {
  const [category, setCategory] = useState<string>("All");

  const isVehicleService = service === "self-drive" || service === "with-driver-roundtrip" || service === "with-driver-local";

  const vehicleItems = useMemo(() => {
    if (!isVehicleService) return [];
    return VEHICLES.filter((v) => v.pricing[service as "self-drive" | "with-driver-roundtrip" | "with-driver-local"]);
  }, [service, isVehicleService]);

  const categories = useMemo(() => {
    if (!isVehicleService) return [];
    return Array.from(new Set(vehicleItems.map((v) => v.category)));
  }, [vehicleItems, isVehicleService]);

  const filteredVehicles = useMemo(() => {
    if (category === "All") return vehicleItems;
    return vehicleItems.filter((v) => v.category === category);
  }, [vehicleItems, category]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#C9A463]">
          {SERVICE_LABEL[service]}
        </h2>
        <span className="text-xs text-zinc-500">
          {service === "tour" ? `${TOUR_PACKAGES.length} packages` : service === "villa-car" ? `${VILLA_CAR_BUNDLES.length} bundles` : `${filteredVehicles.length} vehicles`}
        </span>
      </div>

      {isVehicleService && categories.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {["All", ...categories].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                category === c
                  ? "border-[#C9A463] bg-[#C9A463]/10 text-[#C9A463]"
                  : "border-white/15 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {isVehicleService &&
          filteredVehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} service={service} params={params} termsHref={termsHref} />
          ))}

        {service === "villa-car" &&
          VILLA_CAR_BUNDLES.map((b) => (
            <VillaCard key={b.id} bundle={b} days={params.days ?? 1} km={params.km} termsHref={termsHref} />
          ))}

        {service === "tour" &&
          TOUR_PACKAGES.map((t) => (
            <TourCard key={t.id} tour={t} persons={params.persons ?? t.minPersons} termsHref={termsHref} />
          ))}
      </div>
    </div>
  );
}

/* ---------------- shared card shell ---------------- */

function CardShell({
  image,
  eyebrow,
  title,
  specs,
  fare,
  depositNote,
  features,
  inclusions,
  exclusions,
  termsHref,
  extraToggles,
}: {
  image: string;
  eyebrow: string;
  title: string;
  specs: React.ReactNode;
  fare: FareResult;
  depositNote?: string;
  features: string[];
  inclusions: string[];
  exclusions: string[];
  termsHref: string;
  extraToggles?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-300 bg-[#13161A] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <img src={image} alt={title} className="h-24 w-full sm:w-36 rounded-lg object-cover shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-[#C9A463] mb-0.5">{eyebrow}</p>
          <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">{specs}</div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 sm:text-right shrink-0">
          <div>
            <p className="text-lg font-semibold text-zinc-50">₹{fare.total.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-zinc-500">all-inclusive est.</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-[#C9A463] px-5 py-2 text-sm font-semibold text-[#13161A] hover:bg-[#d9b677] transition-colors"
          >
            Book now
          </button>
        </div>
      </div>

      {extraToggles && <div className="mt-3 flex flex-wrap gap-4">{extraToggles}</div>}

      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="mt-3 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
      >
        Fare breakdown & details
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 space-y-3 border-t border-gray-300 pt-3">
          <div className="space-y-1">
            {fare.lines.map((line) => (
              <div key={line.label} className="flex justify-between text-xs text-zinc-400">
                <span>{line.label}</span>
                <span>₹{line.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          {depositNote && <p className="text-xs text-amber-400/80">{depositNote}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <DetailList title="Features" items={features} />
            <DetailList title="Included" items={inclusions} />
            <DetailList title="Not included" items={exclusions} />
          </div>

          <p className="text-[11px] text-zinc-500">
            <a href={termsHref} target="_blank" rel="noopener noreferrer" className="text-[#C9A463] hover:underline">
              Terms &amp; Conditions
            </a>{" "}
            apply.
          </p>
        </div>
      )}
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className="text-xs text-zinc-400">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- vehicle card (self-drive / round trip / local) ---------------- */

function VehicleCard({
  vehicle,
  service,
  params,
  termsHref,
}: {
  vehicle: Vehicle;
  service: ListingService;
  params: BookingParams & { packageLabel?: string };
  termsHref: string;
}) {
  const [wantsPickupDrop, setWantsPickupDrop] = useState(false);
  const [isNightSlot, setIsNightSlot] = useState(Boolean(params.isNightSlot));
  const [addDriver, setAddDriver] = useState(false);

  const effectiveParams: BookingParams = { ...params, wantsPickupDrop, isNightSlot, addDriver };

  let fare: FareResult | null = null;
  if (service === "self-drive") fare = calculateSelfDriveFare(vehicle, effectiveParams);
  if (service === "with-driver-roundtrip") fare = calculateRoundTripFare(vehicle, params.km ?? 0, params.days ?? 1, effectiveParams);
  if (service === "with-driver-local") fare = calculateLocalFare(vehicle, params.packageLabel ?? "", effectiveParams);

  if (!fare) return null;

  return (
    <CardShell
      image={vehicle.image}
      eyebrow={vehicle.category}
      title={vehicle.name}
      specs={
        <>
          <span className="flex items-center gap-1">
            <Settings2 size={13} /> {vehicle.gearbox}
          </span>
          <span className="flex items-center gap-1">
            <Fuel size={13} /> {vehicle.fuel}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> {vehicle.seats} seats
          </span>
        </>
      }
      fare={fare}
      depositNote={fare.depositNote}
      features={vehicle.features}
      inclusions={vehicle.inclusions}
      exclusions={vehicle.exclusions}
      termsHref={termsHref}
      extraToggles={
        <>
          <ToggleChip label="Pickup & drop facility" checked={wantsPickupDrop} onChange={setWantsPickupDrop} />
          <ToggleChip label="Late night (10 PM\u20136 AM)" checked={isNightSlot} onChange={setIsNightSlot} />
          {service === "self-drive" && (
            <ToggleChip label="Add a driver" checked={addDriver} onChange={setAddDriver} />
          )}
        </>
      }
    />
  );
}

function ToggleChip({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-zinc-400">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-[#C9A463]"
      />
      {label}
    </label>
  );
}

/* ---------------- villa + car card ---------------- */

function VillaCard({ bundle, days, km, termsHref }: { bundle: VillaCarBundle; days: number; km?: number; termsHref: string }) {
  const fare = calculateVillaBundleFare(bundle, days, km);
  return (
    <CardShell
      image={bundle.image}
      eyebrow={`${bundle.bedrooms} BHK \u00b7 Sleeps ${bundle.guests}`}
      title={bundle.name}
      specs={
        <>
          <span className="flex items-center gap-1">
            <BedDouble size={13} /> {bundle.bedrooms} bedrooms
          </span>
          <span className="flex items-center gap-1">
            <MapPinIcon size={13} /> {bundle.carIncludedKmPerDay} km/day included
          </span>
        </>
      }
      fare={fare}
      depositNote={fare.depositNote}
      features={bundle.features}
      inclusions={bundle.inclusions}
      exclusions={bundle.exclusions}
      termsHref={termsHref}
    />
  );
}

/* ---------------- tour card ---------------- */

function TourCard({ tour, persons, termsHref }: { tour: TourPackage; persons: number; termsHref: string }) {
  const fare = calculateTourFare(tour, persons);
  return (
    <CardShell
      image={tour.image}
      eyebrow={`${tour.days} Days \u00b7 ${tour.cities.join(" \u2013 ")}`}
      title={tour.name}
      specs={
        <span className="flex items-center gap-1">
          <CalendarDays size={13} /> Min {tour.minPersons} persons
        </span>
      }
      fare={fare}
      features={tour.features}
      inclusions={tour.inclusions}
      exclusions={tour.exclusions}
      termsHref={termsHref}
    />
  );
}
