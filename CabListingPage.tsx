"use client";

/**
 * CabListingPage
 * ---------------
 * The results screen TaxiBookingWidget's search lands on. Reads the same
 * query params the widget builds (type, to, stop, pickup, return, package),
 * auto-computes distance (see distance.ts) and a price per vehicle (see
 * fare.ts), and lists the fleet sorted cheapest-first — same structure as
 * Bharat Taxi's post-search cab list.
 *
 * INTEGRATION (Next.js App Router)
 *   // app/taxi/page.tsx
 *   import CabListingPage from "@/components/taxi/CabListingPage";
 *   export default function Page({ searchParams }: { searchParams: Record<string,string> }) {
 *     return <CabListingPage searchParams={searchParams} />;
 *   }
 *
 * If searchParams is empty (first visit, no search yet), render your
 * TaxiBookingWidget instead — this component assumes a search already ran.
 */

import { useMemo, useState } from "react";
import { Gauge, Users, Fuel, Settings2, ChevronDown, MapPin } from "lucide-react";
import { CAR_FLEET, FleetCar, CITIES, HOME_CITY } from "./taxiData";
import { getOneWayDistanceKm, getRoundTripDistanceKm, cityLabel } from "./distance";
import { calculateLocalFare, calculateOneWayFare, calculateRoundTripFare, FareResult } from "./fare";

interface CabListingPageProps {
  searchParams: Record<string, string | undefined>;
}

export default function CabListingPage({ searchParams }: CabListingPageProps) {
  const { type = "local", to = "", stop, pickup = "", return: returnDate = "", package: pkg = "8-80" } =
    searchParams;

  const distance = useMemo(() => {
    if (type === "oneway") return getOneWayDistanceKm(to);
    if (type === "roundtrip") return getRoundTripDistanceKm(to, stop);
    return null; // local rental has no point-to-point distance
  }, [type, to, stop]);

  const fares: { car: FleetCar; fare: FareResult }[] = useMemo(() => {
    return CAR_FLEET.map((car) => {
      let fare: FareResult;
      if (type === "local") {
        fare = calculateLocalFare(car, pkg);
      } else if (type === "oneway") {
        fare = calculateOneWayFare(car, distance?.km ?? 0);
      } else {
        fare = calculateRoundTripFare(car, distance?.km ?? 0, pickup, returnDate);
      }
      return { car, fare };
    }).sort((a, b) => a.fare.total - b.fare.total);
  }, [type, pkg, distance, pickup, returnDate]);

  const routeLabel =
    type === "local"
      ? `${HOME_CITY.label} local`
      : type === "oneway"
        ? `${HOME_CITY.label} \u2192 ${cityLabel(to)}`
        : `${HOME_CITY.label} \u2192 ${cityLabel(to)}${stop ? ` \u2192 ${cityLabel(stop)}` : ""} \u2192 ${HOME_CITY.label}`;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Trip summary banner */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-300 bg-[#13161A] px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-zinc-200">
          <MapPin size={16} className="text-[#C9A463]" />
          <span className="font-medium">{routeLabel}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          {distance && (
            <span>
              ~{distance.km} km
              {distance.isEstimate && <span className="text-zinc-500"> (approx.)</span>}
            </span>
          )}
          {pickup && <span>{new Date(pickup).toLocaleString()}</span>}
          {type === "roundtrip" && returnDate && <span>Return {returnDate}</span>}
        </div>
      </div>

      {/* Car list */}
      <div className="space-y-3">
        {fares.map(({ car, fare }) => (
          <CarFareCard key={car.id} car={car} fare={fare} />
        ))}
      </div>
    </div>
  );
}

function CarFareCard({ car, fare }: { car: FleetCar; fare: FareResult }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div className="rounded-xl border border-gray-300 bg-[#13161A] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <img
          src={car.image}
          alt={car.name}
          className="h-24 w-full sm:w-36 rounded-lg object-cover shrink-0"
        />

        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-[#C9A463] mb-0.5">{car.category}</p>
          <h3 className="text-base font-semibold text-zinc-100">{car.name}</h3>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Settings2 size={13} /> {car.gearbox}
            </span>
            <span className="flex items-center gap-1">
              <Fuel size={13} /> {car.fuel}
            </span>
            <span className="flex items-center gap-1">
              <Users size={13} /> {car.seats} seats
            </span>
            {fare.km != null && (
              <span className="flex items-center gap-1">
                <Gauge size={13} /> {fare.km} km billed
              </span>
            )}
          </div>
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
            Book this cab
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowBreakdown((s) => !s)}
        className="mt-3 flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
      >
        Fare breakdown
        <ChevronDown size={13} className={`transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
      </button>
      {showBreakdown && (
        <div className="mt-2 space-y-1 border-t border-gray-300 pt-2">
          {fare.lines.map((line) => (
            <div key={line.label} className="flex justify-between text-xs text-zinc-400">
              <span>{line.label}</span>
              <span>₹{line.amount.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
