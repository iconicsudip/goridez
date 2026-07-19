'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, X } from 'lucide-react';

interface LocationLite {
  id: string;
  name: string;
  price: number;
}

export default function SelfDriveLocationSearch({
  label,
  locations,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  locations: LocationLite[];
  value: string;
  onChange: (name: string, locationId: string, price: number) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', '', 0);
  };

  return (
    <div
      className="bg-white border border-brand-border hover:border-brand-gold/50 transition-colors rounded-xl p-4 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.03)] relative"
      ref={wrapperRef}
    >
      {label && (
        <label className="text-xs text-gray-500 mb-2 font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-gray-800 w-full text-left"
      >
        <MapPin className="text-green-700 shrink-0" size={16} />
        <span className={`flex-1 text-sm font-semibold min-w-0 truncate ${value ? 'text-gray-900' : 'text-gray-400 font-normal'}`}>
          {value || placeholder || 'Select a location...'}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="text-gray-400 hover:text-red-500 shrink-0 transition-colors"
            aria-label="Clear"
          >
            <X size={14} />
          </span>
        )}
        <ChevronDown className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={16} />
      </button>

      {isOpen && locations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
          {locations.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                onChange(l.name, l.id, l.price);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center justify-between gap-3 transition-colors ${l.name === value ? 'bg-green-600/5' : ''}`}
            >
              <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                {l.name === value && <Check size={13} className="text-green-700 shrink-0" />}
                {l.name}
              </span>
              <span className="text-xs text-green-700 font-bold shrink-0">₹{l.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && locations.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 text-xs text-gray-500 font-mono">
          No pickup/drop locations configured for this city yet.
        </div>
      )}
    </div>
  );
}
