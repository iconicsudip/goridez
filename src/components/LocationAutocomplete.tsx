'use client';

import { useState, useEffect, useRef } from 'react';
import { searchLocation, OSMLocation } from '@/lib/osm';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string, location?: OSMLocation) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  searchAnywhere?: boolean;
}

export default function LocationAutocomplete({
  label,
  value,
  onChange,
  placeholder = 'Search location...',
  icon = <MapPin className="text-green-700" size={16} />,
  className = '',
  searchAnywhere = false
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<OSMLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query && query.length >= 3 && query !== value) {
        setIsLoading(true);
        const data = await searchLocation(query, searchAnywhere);
        setResults(data);
        setIsOpen(true);
        setIsLoading(false);
      } else if (!query || query.length < 3) {
        setResults([]);
        setIsOpen(false);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [query, value, searchAnywhere]);

  const prevValueRef = useRef(value);

  // Sync external value changes
  useEffect(() => {
    if (value !== prevValueRef.current) {
      setQuery(value);
      prevValueRef.current = value;
    }
  }, [value]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: OSMLocation) => {
    const formattedName = loc.display_name.split(',')[0] + ', ' + (loc.display_name.split(',').pop()?.trim() || '');
    setQuery(formattedName);
    onChange(formattedName, loc);
    setIsOpen(false);
  };

  return (
    <div
      className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)] relative w-full"
      ref={wrapperRef}
    >
      {label && (
        <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 text-gray-800 relative">
        <div className="flex items-center justify-center shrink-0">
          {icon}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full bg-transparent text-sm font-semibold outline-none text-gray-900 placeholder-gray-400 min-w-0 ${className}`}
        />
        {isLoading && (
          <div className="shrink-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-gray-400" size={14} />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {results.map((loc, idx) => (
            <button
              key={`${loc.place_id}-${idx}`}
              type="button"
              onClick={() => handleSelect(loc)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start gap-3 transition-colors"
            >
              <MapPin className="text-gray-400 mt-1 shrink-0" size={14} />
              <div>
                <div className="text-sm font-semibold text-gray-900">{loc.display_name.split(',')[0]}</div>
                <div className="text-[10px] text-gray-500 line-clamp-1">{loc.display_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
