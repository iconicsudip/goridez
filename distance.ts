// distance.ts
//
// AUTO KM MEASUREMENT
// --------------------
// getDistanceKm() is what the listing page calls instead of asking the
// customer to type a distance. Right now it reads from the static
// DISTANCE_FROM_UDAIPUR_KM table in taxiData.ts (instant, free, no API key,
// accurate enough for a fixed list of ~11 destinations).
//
// WHEN TO UPGRADE TO LIVE DATA
// Once you add destinations beyond this fixed list, or want exact road
// distance for the "extra stop" leg in round trips, swap the body of
// getDistanceKm() for a call to a server route that hits Google Maps
// Distance Matrix API (you cannot call Google Maps directly from the
// browser with a server key — proxy it through your own API route).
//
// Example server route (app/api/distance/route.ts):
//
//   import { NextRequest, NextResponse } from "next/server";
//
//   export async function GET(req: NextRequest) {
//     const origin = req.nextUrl.searchParams.get("origin");
//     const destination = req.nextUrl.searchParams.get("destination");
//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${process.env.GOOGLE_MAPS_SERVER_KEY}`;
//     const res = await fetch(url);
//     const data = await res.json();
//     const km = data.rows?.[0]?.elements?.[0]?.distance?.value / 1000;
//     return NextResponse.json({ km });
//   }
//
// Then getDistanceKm() becomes:
//   const res = await fetch(`/api/distance?origin=Udaipur&destination=${cityLabel}`);
//   const { km } = await res.json();

import { DISTANCE_FROM_UDAIPUR_KM, CITIES } from "./taxiData";

export interface DistanceResult {
  km: number;
  isEstimate: boolean; // true = from static table, false = would mean live API result
}

function cityLabel(value: string): string {
  return CITIES.find((c) => c.value === value)?.label ?? value;
}

/**
 * One-way distance from Udaipur to a destination city.
 * Returns null if the city isn't in the static table yet.
 */
export function getOneWayDistanceKm(toCityValue: string): DistanceResult | null {
  const km = DISTANCE_FROM_UDAIPUR_KM[toCityValue];
  if (km == null) return null;
  return { km, isEstimate: true };
}

/**
 * Round trip distance: Udaipur -> destination [-> extra stop] -> Udaipur.
 * Without live routing data we approximate the extra-stop leg as roughly
 * 1.3x the straight Udaipur distance difference — flagged isEstimate so the
 * UI can show "approx." next to it. Replace with live API for an exact figure.
 */
export function getRoundTripDistanceKm(
  toCityValue: string,
  extraStopValue?: string
): DistanceResult | null {
  const toKm = DISTANCE_FROM_UDAIPUR_KM[toCityValue];
  if (toKm == null) return null;

  if (!extraStopValue) {
    return { km: toKm * 2, isEstimate: true };
  }

  const stopKm = DISTANCE_FROM_UDAIPUR_KM[extraStopValue];
  if (stopKm == null) return { km: toKm * 2, isEstimate: true };

  // Rough heuristic for the inter-city leg until live routing is wired in.
  const interCityLeg = Math.round(Math.abs(toKm - stopKm) * 1.3 + 40);
  return { km: toKm + interCityLeg + stopKm, isEstimate: true };
}

export { cityLabel };
