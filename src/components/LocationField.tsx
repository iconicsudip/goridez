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
      className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)] relative"
    >
      <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-2 text-gray-800">
        <MapPin size={16} className="text-green-600 shrink-0" />
        {readOnly ? (
          <span className="text-sm font-semibold text-gray-400 select-none">
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
            className="w-full bg-transparent text-sm font-semibold outline-none text-gray-900 placeholder-gray-400 min-w-0"
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
          <Loader2 size={14} className="text-gray-400 shrink-0 animate-spin" />
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
        <div className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((loc, idx) => (
            <button
              key={`${loc.place_id}-${idx}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(loc); }}
              className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors group"
            >
              <MapPin size={14} className="text-gray-400 group-hover:text-green-600 mt-0.5 shrink-0 transition-colors" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {loc.display_name.split(',')[0]}
                </div>
                <div className="text-[10px] text-gray-400 truncate mt-0.5">
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
