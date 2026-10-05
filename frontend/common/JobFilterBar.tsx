'use client';
import React from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { DEPARTMENT_CATEGORIES } from '@/lib/constants';

export const FILTER_LOCATIONS = [
  'All Locations',
  'Gurugram, Haryana',
  'Noida, Uttar Pradesh',
  'Delhi NCR',
  'Mumbai, Maharashtra',
  'Bengaluru, Karnataka',
  'Pune, Maharashtra',
  'Hyderabad, Telangana',
  'Kolkata, West Bengal',
  'Chennai, Tamil Nadu',
  'Ahmedabad, Gujarat',
  'Pan India'
];

interface JobFilterBarProps {
  keyword: string;
  setKeyword: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  jobType: string;
  setJobType: (val: string) => void;
  workMode: string;
  setWorkMode: (val: string) => void;
  categoriesList?: string[];
  locationsList?: string[];
  onSubmit?: (e?: React.FormEvent) => void;
  className?: string;
  id?: string;
}

export default function JobFilterBar({
  keyword,
  setKeyword,
  location,
  setLocation,
  category,
  setCategory,
  jobType,
  setJobType,
  workMode,
  setWorkMode,
  categoriesList,
  locationsList = FILTER_LOCATIONS,
  onSubmit,
  className = '',
  id = 'hero-search'
}: JobFilterBarProps) {
  const catList: string[] = categoriesList && categoriesList.length > 0
    ? categoriesList
    : (DEPARTMENT_CATEGORIES as unknown as string[]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form 
      id={id}
      onSubmit={handleSubmit} 
      className={`bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl space-y-2 text-[#080809] border border-gray-100 font-['Helvetica',Arial,sans-serif] ${className}`}
    >
      {/* Row 1: Keyword, Location, Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {/* 1. Keyword */}
        <div className="flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px] focus-within:border-[#b2c359] focus-within:bg-white transition">
          <SearchOutlinedIcon className="text-gray-400 mr-2 shrink-0" sx={{ fontSize: 18 }} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Job title, skills, keyword..."
            className="w-full text-xs sm:text-[13.5px] leading-tight font-normal text-[#080809] focus:outline-none placeholder-gray-400 bg-transparent"
          />
        </div>

        {/* 2. Location */}
        <div className="flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px] focus-within:border-[#b2c359] focus-within:bg-white transition">
          <LocationOnOutlinedIcon className="text-gray-400 mr-2 shrink-0" sx={{ fontSize: 18 }} />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full text-xs sm:text-[13.5px] font-normal text-[#080809] focus:outline-none bg-transparent cursor-pointer truncate"
          >
            {locationsList.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
            {location && location !== 'All Locations' && !locationsList.includes(location) && (
              <option value={location}>{location}</option>
            )}
          </select>
        </div>

        {/* 3. Category */}
        <div className="sm:col-span-2 lg:col-span-1 flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px] focus-within:border-[#b2c359] focus-within:bg-white transition">
          <LayersOutlinedIcon className="text-gray-400 mr-2 shrink-0" sx={{ fontSize: 18 }} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs sm:text-[13.5px] font-normal text-[#080809] focus:outline-none bg-transparent truncate cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            {catList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            {category && category !== 'All Categories' && !catList.includes(category) && (
              <option value={category}>{category}</option>
            )}
          </select>
        </div>
      </div>

      {/* Row 2: Job Type, Work Mode, SEARCH CTA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-center">
        {/* 4. Job Type */}
        <div className="flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px] focus-within:border-[#b2c359] focus-within:bg-white transition">
          <WorkOutlineOutlinedIcon className="text-gray-400 mr-2 shrink-0" sx={{ fontSize: 18 }} />
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full text-xs sm:text-[13.5px] font-normal text-[#080809] focus:outline-none bg-transparent truncate cursor-pointer"
          >
            <option value="All Job Types">All Job Types</option>
            <option value="Full Time">Full Time</option>
            <option value="Part Time">Part Time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* 5. Work Mode */}
        <div className="flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px] focus-within:border-[#b2c359] focus-within:bg-white transition">
          <HomeWorkOutlinedIcon className="text-gray-400 mr-2 shrink-0" sx={{ fontSize: 18 }} />
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="w-full text-xs sm:text-[13.5px] font-normal text-[#080809] focus:outline-none bg-transparent truncate cursor-pointer"
          >
            <option value="All Work Modes">All Work Modes</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        {/* 6. SEARCH CTA */}
        <div className="sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="w-full min-h-[44px] sm:min-h-[48px] bg-[#b2c359] hover:bg-[#9eb047] text-white font-['Helvetica',Arial,sans-serif] font-bold text-xs sm:text-[14px] uppercase px-4 py-2.5 sm:py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] whitespace-nowrap cursor-pointer"
          >
            <span>SEARCH</span>
            <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </form>
  );
}
