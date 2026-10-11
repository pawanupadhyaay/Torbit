'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface DepartmentSelectProps {
  value: string;
  onChange: (val: string) => void;
  categories: string[];
  placeholder?: string;
  className?: string;
}

export default function DepartmentSelect({
  value,
  onChange,
  categories,
  placeholder = 'Select Department / Category',
  className = '',
}: DepartmentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter categories by search term
  const filtered = categories.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const handleSelect = (cat: string) => {
    onChange(cat);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className={`w-full h-11 sm:h-10 px-3.5 border rounded-xl text-xs sm:text-sm text-left flex items-center justify-between transition font-medium cursor-pointer ${
          isOpen
            ? 'border-[#b2c359] ring-2 ring-[#b2c359]/20 bg-white'
            : 'border-slate-200 hover:border-slate-300 bg-white'
        }`}
      >
        <span className={`truncate mr-2 ${value ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#b2c359]' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="px-2.5 pb-2 border-b border-slate-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search department..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#b2c359] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto px-1.5 pt-1 dropdown-scrollbar">
            {filtered.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400">
                No matching departments found
              </div>
            ) : (
              filtered.map((cat) => {
                const isSelected = cat === value;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-[13px] rounded-lg my-0.5 flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#b2c359]/20 text-[#2f4204] font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <span className="truncate pr-2">{cat}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#658A0D] shrink-0" />}
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
