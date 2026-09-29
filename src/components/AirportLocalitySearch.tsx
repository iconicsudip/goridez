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
  label,
  zones,
  value,
  onChange,
  placeholder,
  airportLabel = 'Airport',
  mode = 'ANY',
}: {
  label?: string;
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
    <div
      className="bg-white border border-[#E7DFD5] hover:border-[#C89D5C] focus-within:border-[#C89D5C] transition-all rounded-2xl p-4 flex flex-col shadow-[0_2px_10px_rgba(85,26,12,0.03)] relative"
      ref={wrapperRef}
    >
      {label && (
        <label className="text-[10px] text-[#7A6A65] mb-2 font-mono uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2.5 text-gray-800 relative">
        <div className="flex items-center justify-center shrink-0">
          {value === airportLabel ? <Plane className="text-[#C89D5C]" size={16} /> : <MapPin className="text-[#C89D5C]" size={16} />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setIsOpen(true);
            if (next === '' && value !== '') {
              onChange('', '');
            }
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || 'Search airport or your area...'}
          className="w-full bg-transparent text-sm font-semibold outline-none text-gray-900 placeholder-gray-400 min-w-0 font-body"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
            aria-label="Clear"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {filtered.map((o, idx) => (
            <button
              key={`${o.zoneId}-${idx}`}
              type="button"
              onClick={() => {
                setQuery(o.locality);
                onChange(o.locality, o.zoneId);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-[#FAF6F0] border-b border-[#E7DFD5]/40 last:border-0 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
            >
              <span className="text-sm font-semibold text-[#250903] group-hover:text-[#551A0C] flex items-center gap-2">
                {o.zoneId === AIRPORT_ZONE_ID && <Plane size={14} className="text-[#C89D5C] shrink-0" />}
                {o.locality}
              </span>
              <span className="text-[9px] text-[#7A6A65] font-mono uppercase shrink-0">{o.zoneName}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl shadow-xl z-50 p-4 text-xs text-[#551A0C]/80 font-editorial italic">
          No matching serviceable area. Airport transfers are only available to/from the zones we cover.
        </div>
      )}
    </div>
  );
}
