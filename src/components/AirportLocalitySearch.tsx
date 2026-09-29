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
      className="bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] focus-within:border-[#C89D5C] focus-within:ring-2 focus-within:ring-[#C89D5C]/20 transition-all rounded-2xl p-3.5 flex flex-col shadow-xs relative group"
      ref={wrapperRef}
    >
      {label && (
        <label className="text-[10px] text-[#8C6D53] mb-1.5 font-bold uppercase tracking-[0.2em] select-none">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2.5 text-[#250903] relative">
        <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shrink-0 group-focus-within:border-[#C89D5C]/70 group-focus-within:bg-[#551A0C]/5 transition-colors">
          {value === airportLabel ? <Plane size={15} /> : <MapPin size={15} />}
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
          className="w-full bg-transparent text-sm font-bold outline-none text-[#250903] placeholder-[#8C6D53]/50 min-w-0"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[#8C6D53]/60 hover:text-[#551A0C] shrink-0 transition-colors p-1"
            aria-label="Clear"
          >
            <X size={15} />
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
