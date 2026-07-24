"use client";

/**
 * TaxiBookingWidget
 * ------------------
 * 3-tab taxi search widget (Local Rental / One Way / Round Trip), modeled on
 * Bharat Taxi's booking engine, restyled for GoRidez's dark/gold look.
 *
 * Current business rule baked in: every trip originates from Udaipur.
 * The pickup city is shown as a fixed badge, not a dropdown — there is
 * nothing to select because you don't run pickups from other cities yet.
 * If that changes later, swap <FixedCityBadge /> back for <SelectWithIcon />
 * using HOME_CITY as the controlled value.
 *
 * INTEGRATION
 * 1. Drop this file + taxiData.ts into e.g. /components/taxi/
 * 2. Import and render it on your homepage hero and/or at the top of /taxi:
 *      import TaxiBookingWidget from "@/components/taxi/TaxiBookingWidget";
 *      <TaxiBookingWidget />
 * 3. By default, submitting pushes the user to:
 *      /taxi?type=local&package=8-80&pickup=2026-07-01T09:00
 *      /taxi?type=oneway&to=jaipur&pickup=...
 *      /taxi?type=roundtrip&to=jaipur&stop=pushkar&pickup=...&return=...
 *    (from=udaipur is implicit and not sent, since it's the only option.)
 *    Read these searchParams on your /taxi page to filter cars / show fares.
 *    Or pass an `onSearch` prop to handle it yourself instead of navigating.
 * 4. Swap CITIES / LOCAL_PACKAGES / INCLUSIONS / EXCLUSIONS in taxiData.ts
 *    for your real data and real fare policy copy.
 * 5. T&C: the "termsHref" prop points at /terms (your existing footer link).
 *    The search button is disabled until the box is checked.
 *
 * Requires: Tailwind CSS, lucide-react, Next.js App Router (useRouter from next/navigation).
 */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CalendarClock,
  Plus,
  X,
  Search,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { CITIES, HOME_CITY, LOCAL_PACKAGES, ROUNDTRIP_PACKAGES, INCLUSIONS, EXCLUSIONS } from "./taxiData";

type TripType = "local" | "oneway" | "roundtrip";

const TABS: { id: TripType; label: string }[] = [
  { id: "local", label: "Local Rental" },
  { id: "oneway", label: "One Way" },
  { id: "roundtrip", label: "Round Trip" },
];

interface TaxiBookingWidgetProps {
  defaultTab?: TripType;
  basePath?: string;
  termsHref?: string;
  onSearch?: (params: Record<string, string>) => void;
}

export default function TaxiBookingWidget({
  defaultTab = "local",
  basePath = "/taxi",
  termsHref = "/terms",
  onSearch,
}: TaxiBookingWidgetProps) {
  const router = useRouter();
  const [tab, setTab] = useState<TripType>(defaultTab);

  const [to, setTo] = useState("");
  const [extraStop, setExtraStop] = useState(""); // round trip only, max 1
  const [pkg, setPkg] = useState(LOCAL_PACKAGES[0].value);
  const [rtPkg, setRtPkg] = useState(ROUNDTRIP_PACKAGES[0].value);
  const [pickup, setPickup] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  const cityOptions = useMemo(() => CITIES, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!agreedToTerms) return setError("Please accept the Terms & Conditions to continue.");

    if (tab === "local") {
      if (!pickup) return setError("Please select a pickup date & time.");
    }
    if (tab === "oneway") {
      if (!to || !pickup) return setError("Please select a destination and pickup time.");
    }
    if (tab === "roundtrip") {
      if (!to || !pickup || !returnDate)
        return setError("Please select a destination, pickup time and return date.");
    }

    const params: Record<string, string> = { type: tab, pickup };
    if (tab === "local") {
      params.package = pkg;
    } else {
      params.to = to;
      if (tab === "roundtrip") {
        params.package = rtPkg;
        if (extraStop) params.stop = extraStop;
        params.return = returnDate;
      }
    }

    if (onSearch) {
      onSearch(params);
      return;
    }
    const qs = new URLSearchParams(params).toString();
    router.push(`${basePath}?${qs}`);
  }

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-gray-300 bg-[#13161A]/90 backdrop-blur-md shadow-2xl shadow-black/40">
      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-300 px-2 pt-2 gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setError("");
            }}
            className={`relative whitespace-nowrap px-4 py-3 text-sm font-medium tracking-wide transition-colors rounded-t-lg ${
              tab === t.id ? "text-[#C9A463]" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-[#C9A463] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        {/* Fixed pickup city — every trip starts from Udaipur */}
        <div className="mb-4 flex items-center justify-between rounded-lg border border-[#C9A463]/30 bg-[#C9A463]/10 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm text-[#E4C988]">
            <MapPin size={15} />
            <span>
              Pickup from <span className="font-semibold">{HOME_CITY.label}</span>
            </span>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">
            Only pickup point
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {tab === "local" && (
            <>
              <Field span="sm:col-span-6" label="Package">
                <select value={pkg} onChange={(e) => setPkg(e.target.value)} className={selectClass}>
                  {LOCAL_PACKAGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field span="sm:col-span-6" label="Pickup Date & Time">
                <input
                  type="datetime-local"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className={selectClass}
                />
              </Field>
            </>
          )}

          {tab === "oneway" && (
            <>
              <Field span="sm:col-span-6" label="To">
                <SelectWithIcon
                  icon={<MapPin size={16} />}
                  value={to}
                  onChange={setTo}
                  placeholder="Destination city"
                  options={cityOptions}
                />
              </Field>
              <Field span="sm:col-span-6" label="Pickup Date & Time">
                <input
                  type="datetime-local"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className={selectClass}
                />
              </Field>
            </>
          )}

          {tab === "roundtrip" && (
            <>
              <Field span="sm:col-span-6" label="To">
                <div className="flex gap-2">
                  <SelectWithIcon
                    icon={<MapPin size={16} />}
                    value={to}
                    onChange={setTo}
                    placeholder="Destination city"
                    options={cityOptions}
                  />
                  {!extraStop ? (
                    <button
                      type="button"
                      onClick={() => setExtraStop(" ")}
                      aria-label="Add another destination"
                      title="Add another destination (max 1)"
                      className="shrink-0 h-11 w-11 grid place-items-center rounded-lg border border-dashed border-gray-400 text-zinc-400 hover:text-[#C9A463] hover:border-[#C9A463]/50 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  ) : null}
                </div>
              </Field>

              <Field span="sm:col-span-6" label="Pickup Date & Time">
                <input
                  type="datetime-local"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className={selectClass}
                />
              </Field>

              {extraStop ? (
                <Field span="sm:col-span-6" label="Extra Stop">
                  <div className="flex gap-2">
                    <SelectWithIcon
                      icon={<MapPin size={16} />}
                      value={extraStop.trim()}
                      onChange={(v) => setExtraStop(v)}
                      placeholder="Select stop"
                      options={cityOptions}
                    />
                    <button
                      type="button"
                      onClick={() => setExtraStop("")}
                      aria-label="Remove extra stop"
                      className="shrink-0 h-11 w-11 grid place-items-center rounded-lg border border-white/15 text-zinc-400 hover:text-red-400 hover:border-red-400/40 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </Field>
              ) : null}

              <Field span="sm:col-span-6" label="Return Date">
                <div className="relative">
                  <CalendarClock
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className={`${selectClass} pl-9`}
                  />
                </div>
              </Field>

              <Field span="sm:col-span-6" label="Price Package">
                <select value={rtPkg} onChange={(e) => setRtPkg(e.target.value)} className={selectClass}>
                  {ROUNDTRIP_PACKAGES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
        </div>

        {/* Inclusions / Exclusions */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-gray-300 bg-white/[0.03] p-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Included
            </p>
            <ul className="space-y-1.5">
              {INCLUSIONS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-zinc-300">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Not Included
            </p>
            <ul className="space-y-1.5">
              {EXCLUSIONS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-zinc-300">
                  <XCircle size={14} className="mt-0.5 shrink-0 text-red-400/80" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Terms & Conditions */}
        <label className="mt-4 flex items-start gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-white/30 bg-transparent accent-[#C9A463]"
          />
          <span>
            I agree to the{" "}
            <a href={termsHref} className="text-[#C9A463] hover:underline" target="_blank" rel="noopener noreferrer">
              Terms &amp; Conditions
            </a>{" "}
            and fare policy above.
          </span>
        </label>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#C9A463] px-8 py-3 text-sm font-semibold tracking-wide text-[#13161A] hover:bg-[#d9b677] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Search size={16} />
          Search Cabs
        </button>
      </form>
    </div>
  );
}

/* ---------- small UI helpers (kept local so this file drops in standalone) ---------- */

const selectClass =
  "w-full h-11 rounded-lg border border-white/15 bg-[#0E1114] px-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#C9A463]/60 focus:ring-1 focus:ring-[#C9A463]/40 transition-colors";

function Field({
  label,
  span,
  children,
}: {
  label: string;
  span: string;
  children: React.ReactNode;
}) {
  return (
    <div className={span}>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectWithIcon({
  icon,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
        {icon}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${selectClass} pl-9 appearance-none`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
