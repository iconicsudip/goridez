'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Plane, X } from 'lucide-react';

interface ZoneLite {
  id: string;
  name: string;
  localities: string[];
}

interface Option {
  zoneId: string; // 'AIRPORT' for the airport itself, otherwise the zone's id
  zoneName: string;
  locality: string;
}

export const AIRPORT_ZONE_ID = 'AIRPORT';

export default function AirportLocalitySearch({
  zones,
  value,
  onChange,
  placeholder,
  airportLabel = 'Airport',
  mode = 'ANY',
}: {
  zones: ZoneLite[];
  value: string;
  onChange: (locality: string, zoneId: string) => void;
  placeholder?: string;
  airportLabel?: string;
  mode?: 'ANY' | 'AIRPORT_ONLY' | 'LOCALITY_ONLY';
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const localityOptions: Option[] = zones.flatMap((z) => z.localities.map((l) => ({ zoneId: z.id, zoneName: z.name, locality: l })));
  const airportOption: Option = { zoneId: AIRPORT_ZONE_ID, zoneName: 'Airport', locality: airportLabel };

  const allOptions: Option[] =
    mode === 'AIRPORT_ONLY' ? [airportOption] :
    mode === 'LOCALITY_ONLY' ? localityOptions :
    [airportOption, ...localityOptions];

  const filtered = query.trim()
    ? allOptions.filter((o) => o.locality.toLowerCase().includes(query.trim().toLowerCase()))
    : allOptions;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If the user typed/deleted without picking a fresh option, snap the
        // visible text back to the last committed selection (or blank it out
        // if nothing was ever committed) instead of leaving stray free text.
        setQuery(value);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const handleClear = () => {
    setQuery('');
    onChange('', '');
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10 flex items-center justify-center">
          {value === airportLabel ? <Plane className="text-green-700" size={16} /> : <MapPin className="text-green-700" size={16} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setIsOpen(true);
            // Manually clearing the field (not just editing it) should immediately
            // reset the committed selection too, not just the visible text.
            if (next === '' && value !== '') {
              onChange('', '');
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || 'Search airport or your area...'}
          className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-10 py-4 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors font-medium"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 z-10 p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Clear"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {filtered.map((o, idx) => (
            <button
              key={`${o.zoneId}-${idx}`}
              type="button"
              onClick={() => {
                setQuery(o.locality);
                onChange(o.locality, o.zoneId);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between gap-3 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                {o.zoneId === AIRPORT_ZONE_ID && <Plane size={13} className="text-green-700 shrink-0" />}
                {o.locality}
              </span>
              <span className="text-[9px] text-gray-400 font-mono uppercase shrink-0">{o.zoneName}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 text-xs text-gray-500 font-mono">
          No matching serviceable area. Airport transfers are only available to/from the zones we cover.
        </div>
      )}
    </div>
  );
}
