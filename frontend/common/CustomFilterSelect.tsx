'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomFilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  dropdownWidth?: string;
  searchable?: boolean;
}

export default function CustomFilterSelect({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Select option',
  className = '',
  dropdownWidth,
}: CustomFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return opt;
  });

  // Selected label
  const selectedOption = normalizedOptions.find((o) => o.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value || placeholder;

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? 'z-[70]' : 'z-10'} ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 sm:py-3 bg-gray-50/80 hover:bg-white focus:bg-white rounded-xl border border-gray-200 focus:border-[#b2c359] focus:ring-2 focus:ring-[#b2c359]/20 min-h-[44px] sm:min-h-[48px] transition cursor-pointer text-left text-[#080809]"
      >
        <div className="flex items-center min-w-0 mr-2">
          {icon && <span className="text-gray-400 mr-2 shrink-0 flex items-center">{icon}</span>}
          <span className="text-xs sm:text-[13.5px] font-normal truncate">
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#b2c359]' : ''
          }`}
        />
      </button>

      {/* Modern Themed Floating Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-[80] bg-white rounded-xl shadow-2xl border border-gray-200/90 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            dropdownWidth ? dropdownWidth : 'w-full min-w-[220px]'
          }`}
        >
          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 px-1 dropdown-scrollbar">
            {normalizedOptions.length === 0 ? (
              <div className="px-3.5 py-2.5 text-xs text-gray-400 text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-[13px] rounded-lg my-0.5 flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#b2c359]/20 text-[#2f4204] font-bold'
                        : 'text-gray-700 hover:bg-slate-50 hover:text-gray-900 font-normal'
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#658A0D] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
