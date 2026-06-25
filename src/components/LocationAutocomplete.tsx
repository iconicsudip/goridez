'use client';

import { useState, useEffect, useRef } from 'react';
import { searchLocation, OSMLocation } from '@/lib/osm';
import { MapPin, Search, Loader2 } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, location?: OSMLocation) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search location...',
  icon = <MapPin className="text-green-700" size={16} />,
  className = ''
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
        const data = await searchLocation(query);
        setResults(data);
        setIsOpen(true);
        setIsLoading(false);
      } else if (!query || query.length < 3) {
        setResults([]);
        setIsOpen(false);
      }
    }, 500); // 500ms debounce
    
    return () => clearTimeout(timer);
  }, [query, value]);

  // Sync external value changes
  useEffect(() => {
    if (value !== query && !isOpen) {
      setQuery(value);
    }
  }, [value, isOpen, query]);

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
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10 flex items-center justify-center">
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
          className={`w-full bg-white border border-gray-200 rounded-xl pl-12 pr-10 py-4 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors font-medium ${className}`}
        />
        {isLoading && (
          <div className="absolute right-4 z-10">
            <Loader2 className="animate-spin text-gray-400" size={16} />
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
