'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { searchLocation, OSMLocation } from '@/lib/osm';

export default function LocationField({
  label,
  value,
  onChange,
  placeholder = 'Search city or area...',
  readOnly = false,
  searchAnywhere = false,
  rightElement = null,
}: {
  label: string;
  value: string;
  onChange: (name: string, loc?: OSMLocation) => void;
  placeholder?: string;
  readOnly?: boolean;
  searchAnywhere?: boolean;
  rightElement?: React.ReactNode;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<OSMLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value → local query
  const prevValue = useRef(value);
  useEffect(() => {
    if (value !== prevValue.current) {
      setQuery(value);
      prevValue.current = value;
    }
  }, [value]);

  // Debounced OSM search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchLocation(query, searchAnywhere);
      setResults(data);
      setIsOpen(data.length > 0);
      setIsLoading(false);
    }, 450);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, searchAnywhere]);

  // Click outside closes
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (loc: OSMLocation) => {
    const parts = loc.display_name.split(',');
    const name = parts.length > 1
      ? `${parts[0].trim()}, ${parts[1].trim()}`
      : parts[0].trim();
    setQuery(name);
    onChange(name, loc);
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className="bg-[#FEFBF8] border border-[#E7DFD5] hover:border-[#C89D5C] focus-within:border-[#C89D5C] focus-within:ring-2 focus-within:ring-[#C89D5C]/20 transition-all rounded-2xl p-3.5 flex flex-col shadow-xs relative group"
    >
      <label className="text-[10px] text-[#8C6D53] mb-1.5 font-bold uppercase tracking-[0.2em] select-none">
        {label}
      </label>
      <div className="flex items-center gap-2.5 text-[#250903]">
        <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] border border-[#E7DFD5] flex items-center justify-center text-[#C89D5C] shrink-0 group-focus-within:border-[#C89D5C]/70 group-focus-within:bg-[#551A0C]/5 transition-colors">
          <MapPin size={15} />
        </div>
        {readOnly ? (
          <span className="text-sm font-bold text-[#551A0C] select-none truncate">
            {value || placeholder}
          </span>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // If user clears the field, reset parent too
              if (!e.target.value) onChange('');
            }}
            onFocus={() => { if (results.length > 0) setIsOpen(true); }}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm font-bold outline-none text-[#250903] placeholder-[#8C6D53]/50 min-w-0"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        )}
        {rightElement ? (
          <div className="shrink-0 flex items-center justify-center">
            {rightElement}
          </div>
        ) : isLoading ? (
          <Loader2 size={15} className="text-[#C89D5C] shrink-0 animate-spin" />
        ) : query && !readOnly ? (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
            className="text-[#8C6D53]/60 hover:text-[#551A0C] shrink-0 transition-colors p-1"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {/* OSM Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-[#FEFBF8] border border-[#E7DFD5] rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((loc, idx) => (
            <button
              key={`${loc.place_id}-${idx}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(loc); }}
              className="w-full text-left px-4 py-3 hover:bg-[#FAF6F0] border-b border-[#E7DFD5]/40 last:border-0 flex items-start gap-3 transition-colors group cursor-pointer"
            >
              <MapPin size={14} className="text-[#C89D5C] group-hover:text-[#551A0C] mt-0.5 shrink-0 transition-colors" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#250903] truncate group-hover:text-[#551A0C]">
                  {loc.display_name.split(',')[0]}
                </div>
                <div className="text-[10px] text-[#7A6A65] truncate mt-0.5 font-mono">
                  {loc.display_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
