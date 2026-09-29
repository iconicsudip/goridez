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
      className="bg-white border border-[#E7DFD5] hover:border-[#C89D5C] focus-within:border-[#C89D5C] transition-all rounded-2xl p-4 flex flex-col shadow-[0_2px_10px_rgba(85,26,12,0.03)] relative"
    >
      <label className="text-[10px] text-[#7A6A65] mb-2 font-mono uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-2.5 text-gray-800">
        <MapPin size={16} className="text-[#C89D5C] shrink-0" />
        {readOnly ? (
          <span className="text-sm font-semibold text-gray-500 select-none">
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
            className="w-full bg-transparent text-sm font-semibold outline-none text-gray-900 placeholder-gray-400 min-w-0 font-body"
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
          <Loader2 size={14} className="text-[#C89D5C] shrink-0 animate-spin" />
        ) : query && !readOnly ? (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleClear(); }}
            className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
          >
            <X size={14} />
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
