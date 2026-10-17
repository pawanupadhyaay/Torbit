'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import NorthEastOutlinedIcon from '@mui/icons-material/NorthEastOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { DEPARTMENT_CATEGORIES } from '@/lib/constants';
import CustomFilterSelect from './CustomFilterSelect';

export interface JobSuggestionItem {
  title: string;
  type: 'ROLE' | 'COMPANY' | 'SEARCH';
  badge?: string;
  subtitle?: string;
}

const POPULAR_REAL_ESTATE_ROLES = [
  { title: 'Sales Manager - Real Estate', category: 'Sales & BD' },
  { title: 'Pre-Sales Executive', category: 'Pre-Sales' },
  { title: 'Inside Sales Specialist', category: 'Pre-Sales' },
  { title: 'Real Estate Investment Advisor', category: 'Advisory' },
  { title: 'Channel Partner (CP) Manager', category: 'Sales & BD' },
  { title: 'Business Development Manager', category: 'Sales & BD' },
  { title: 'Digital Marketing Specialist', category: 'Marketing' },
  { title: 'Performance Marketing Manager', category: 'Marketing' },
  { title: 'Influencer Marketing Executive', category: 'Marketing' },
  { title: 'Civil Site Engineer', category: 'Projects & Construction' },
  { title: 'Project Head - Construction', category: 'Projects & Construction' },
  { title: 'Billing & Estimation Engineer', category: 'Projects & Construction' },
  { title: 'Senior Project Manager', category: 'Projects & Construction' },
  { title: 'Architect & Urban Designer', category: 'Architecture & Design' },
  { title: 'Interior Design Lead', category: 'Architecture & Design' },
  { title: 'Leasing Manager - Commercial', category: 'Leasing' },
  { title: 'Retail Leasing Specialist', category: 'Leasing' },
  { title: 'Property & Facility Manager', category: 'Property Management' },
  { title: 'CRM & Customer Experience Lead', category: 'CRM & Relations' },
  { title: 'Customer Relations Executive', category: 'CRM & Relations' },
  { title: 'Legal Counsel - RERA Compliance', category: 'Legal' },
  { title: 'Land Due Diligence & Legal Head', category: 'Legal' },
  { title: 'Real Estate Financial Analyst', category: 'Finance & Accounts' },
  { title: 'Accounts & Taxation Manager', category: 'Finance & Accounts' },
  { title: 'Land Acquisition Specialist', category: 'Land Acquisition' },
  { title: 'Government Liaison Officer', category: 'Liaison & Approvals' },
  { title: 'Quality Control (QA/QC) Engineer', category: 'Quality Assurance' },
  { title: 'HR & Talent Acquisition Lead', category: 'Human Resources' },
  { title: 'PropTech Product Manager', category: 'PropTech / Product' },
  { title: 'Real Estate Content & Video Creator', category: 'Content & Creative' },
];

const POPULAR_COMPANIES = [
  'DLF Limited',
  'Godrej Properties',
  'SOBHA Realty',
  'EMAAR India',
  'Prestige Group',
  'Puravankara',
  'Tata Housing',
  'Oberoi Realty',
  'Brigade Group',
  'Lodha Group',
  'Mahindra Lifespaces',
  'Shapoorji Pallonji Real Estate'
];

interface HeroSectionProps {
  categories?: Array<{ name: string; [key: string]: any } | string>;
  onSearch?: (params: { q: string; location: string; category: string; jobType: string; workMode: string }) => void;
  onOpenAuth: (role?: 'JOB_SEEKER' | 'RECRUITER' | null, tab?: 'LOGIN' | 'REGISTER') => void;
}

export default function HeroSection({ categories, onSearch, onOpenAuth }: HeroSectionProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('All Locations');
  const [category, setCategory] = useState('All Categories');
  const [jobType, setJobType] = useState('All Job Types');
  const [workMode, setWorkMode] = useState('All Work Modes');

  // Autocomplete suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [realJobs, setRealJobs] = useState<Array<{ title: string; category?: string; company?: string }>>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load real jobs from session snapshot & API to keep suggestions accurate
  useEffect(() => {
    try {
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem('torbitHomeSnapshot') : null;
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.jobs && Array.isArray(parsed.jobs)) {
          setRealJobs(parsed.jobs.map((j: any) => ({
            title: j.title || '',
            category: j.department || j.category || '',
            company: j.company?.companyName || ''
          })));
        }
      }
    } catch (e) {}

    const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL)
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
      : '/api';

    fetch(`${apiBase}/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error('Jobs fetch error');
        return res.json();
      })
      .then((data) => {
        if (data?.jobs && Array.isArray(data.jobs)) {
          setRealJobs(data.jobs.map((j: any) => ({
            title: j.title || '',
            category: j.department || j.category || '',
            company: j.company?.companyName || ''
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Compute matched suggestions dynamically
  const suggestions = useMemo<JobSuggestionItem[]>(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return [];

    const results: JobSuggestionItem[] = [];
    const seen = new Set<string>();

    // 1. Direct search item at top
    results.push({
      title: keyword.trim(),
      type: 'SEARCH',
      badge: 'Press Enter',
      subtitle: `Search all jobs for "${keyword.trim()}"`
    });
    seen.add(q);

    // 2. Real database job titles
    for (const job of realJobs) {
      const title = job.title?.trim();
      if (title && !seen.has(title.toLowerCase()) && title.toLowerCase().includes(q)) {
        seen.add(title.toLowerCase());
        results.push({
          title,
          type: 'ROLE',
          badge: job.category || 'Active Job',
          subtitle: job.company ? `Hiring at ${job.company}` : 'Verified Opening'
        });
        if (results.length >= 8) break;
      }
    }

    // 3. Standard curated Real Estate Job Roles
    if (results.length < 8) {
      for (const role of POPULAR_REAL_ESTATE_ROLES) {
        if (!seen.has(role.title.toLowerCase()) && (role.title.toLowerCase().includes(q) || role.category.toLowerCase().includes(q))) {
          seen.add(role.title.toLowerCase());
          results.push({
            title: role.title,
            type: 'ROLE',
            badge: role.category,
            subtitle: 'Real Estate Career Role'
          });
          if (results.length >= 8) break;
        }
      }
    }

    // 4. Popular Real Estate Companies (if query matches company)
    if (results.length < 8) {
      for (const comp of POPULAR_COMPANIES) {
        if (!seen.has(comp.toLowerCase()) && comp.toLowerCase().includes(q)) {
          seen.add(comp.toLowerCase());
          results.push({
            title: comp,
            type: 'COMPANY',
            badge: 'Top Employer',
            subtitle: 'Explore developer jobs'
          });
          if (results.length >= 8) break;
        }
      }
    }

    return results;
  }, [keyword, realJobs]);

  const handleSelectSuggestion = (item: JobSuggestionItem) => {
    setKeyword(item.title);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    const params = new URLSearchParams();
    if (item.type === 'COMPANY') {
      params.set('company', item.title);
    } else {
      params.set('q', item.title);
    }
    if (location && location !== 'All Locations') params.set('location', location);
    if (category && category !== 'All Categories') params.set('category', category);
    if (jobType && jobType !== 'All Job Types') params.set('jobType', jobType);
    if (workMode && workMode !== 'All Work Modes') params.set('workMode', workMode);

    if (onSearch) {
      onSearch({ 
        q: item.type === 'COMPANY' ? '' : item.title, 
        location, 
        category, 
        jobType, 
        workMode 
      });
    }

    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : '/jobs');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setShowSuggestions(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const renderHighlightedText = (text: string, query: string) => {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return (
      <>
        {before}
        <span className="font-bold text-[#697d10] bg-lime-100/80 rounded-xs px-0.5">{match}</span>
        {after}
      </>
    );
  };

  const categoryList: string[] = categories && categories.length > 0
    ? categories.map((c: any) => typeof c === 'string' ? c : c.name)
    : (DEPARTMENT_CATEGORIES as unknown as string[]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSelectSuggestion(suggestions[selectedIndex]);
      return;
    }

    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location && location !== 'All Locations') params.set('location', location);
    if (category && category !== 'All Categories') params.set('category', category);
    if (jobType && jobType !== 'All Job Types') params.set('jobType', jobType);
    if (workMode && workMode !== 'All Work Modes') params.set('workMode', workMode);

    if (onSearch) {
      onSearch({ q: keyword, location, category, jobType, workMode });
    }

    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : '/jobs');
  };

  return (
    <div className="relative bg-[#0c1424] text-white py-7 sm:py-12 lg:py-16 font-['Helvetica',Arial,sans-serif] z-20">
      {/* Background Architectural Panoramic Real Estate Skyline Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <picture className="absolute inset-0 block w-full h-full">
          <source media="(max-width: 767px)" srcSet="/hero-bg-mobile.webp" type="image/webp" />
          <source media="(min-width: 768px)" srcSet="/hero-bg.webp" type="image/webp" />
          <img
            src="/hero-bg.jpg"
            alt="Real Estate Skyline"
            className="w-full h-full object-cover object-center transition-transform duration-1000 scale-[1.01] pointer-events-none"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        {/* Balanced cinematic gradient overlay: keeps skyline vivid and warm while text stays razor-sharp */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060c18]/88 via-[#060c18]/55 to-[#060c18]/25" />
        {/* Top and bottom subtle vignette to smoothly integrate with header and page flow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060c18]/45 via-transparent to-[#060c18]/65" />
      </div>

      <div className="max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-center">
          
          {/* ========================================================= */}
          {/* LEFT HERO COLUMN (8 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#060c18]/70 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold text-[#c7dd3c] mb-2 sm:mb-3 shadow-md">
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />
                <span>India&apos;s #1 Dedicated Real Estate Job Portal</span>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-[34px] 2xl:text-[38px] font-['Helvetica',Arial,sans-serif] font-black text-white tracking-tight leading-tight whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                Find Your Next Career in <span className="text-[#c7dd3c] whitespace-nowrap drop-shadow-[0_2px_12px_rgba(199,221,60,0.4)]">Real Estate</span>
              </h1>
              
              <p className="text-xs sm:text-sm lg:text-[14.5px] xl:text-[15.5px] text-slate-100 font-medium mt-1.5 sm:mt-2.5 max-w-none lg:whitespace-nowrap leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                Connect directly with India&apos;s premier developers, builders, and infrastructure enterprises.
              </p>
            </div>

            {/* Clean Multi-Filter Search Bar with Frosted Glass */}
            <form 
              id="hero-search" 
              onSubmit={handleSearchSubmit} 
              className="relative z-30 bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] space-y-2.5 text-[#080809] border border-white/80 font-['Helvetica',Arial,sans-serif]"
            >
              {/* Row 1: Keyword, Location, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 relative z-20">
                {/* 1. Keyword with Industry-Standard Autocomplete Suggestions */}
                <div ref={searchContainerRef} className="relative z-30">
                  <div className="flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 focus-within:bg-white focus-within:border-[#b2c359] focus-within:ring-2 focus-within:ring-[#b2c359]/20 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px] transition">
                    <SearchOutlinedIcon className="text-gray-400 mr-2 flex-shrink-0" sx={{ fontSize: 18 }} />
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => {
                        setKeyword(e.target.value);
                        setShowSuggestions(true);
                        setSelectedIndex(-1);
                      }}
                      onFocus={() => {
                        if (keyword.trim().length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Job title, skills, keyword..."
                      className="w-full text-xs sm:text-[13.5px] leading-tight font-normal text-[#080809] focus:outline-none placeholder-gray-400 bg-transparent"
                      autoComplete="off"
                    />
                    {keyword && (
                      <button
                        type="button"
                        onClick={() => {
                          setKeyword('');
                          setShowSuggestions(false);
                          setSelectedIndex(-1);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition p-0.5 rounded-full hover:bg-gray-100 flex items-center justify-center shrink-0 cursor-pointer"
                        title="Clear keyword"
                      >
                        <CloseOutlinedIcon sx={{ fontSize: 16 }} />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Suggestions Popover */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-[#080809] animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-1.5">
                        <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                          <span>Suggested Roles & Companies</span>
                          <span>{suggestions.length} matches</span>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-0.5 custom-scrollbar">
                          {suggestions.map((item, idx) => {
                            const isSelected = selectedIndex === idx;
                            return (
                              <button
                                key={`${item.type}-${item.title}-${idx}`}
                                type="button"
                                onMouseEnter={() => setSelectedIndex(idx)}
                                onClick={() => handleSelectSuggestion(item)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-lime-50 text-gray-950 border border-[#b2c359]/40'
                                    : 'hover:bg-slate-50 text-gray-800 border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    item.type === 'COMPANY' 
                                      ? 'bg-amber-50 text-amber-700' 
                                      : item.type === 'SEARCH'
                                      ? 'bg-lime-100 text-[#697d10]'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {item.type === 'COMPANY' ? (
                                      <CorporateFareOutlinedIcon sx={{ fontSize: 16 }} />
                                    ) : item.type === 'SEARCH' ? (
                                      <SearchOutlinedIcon sx={{ fontSize: 16 }} />
                                    ) : (
                                      <WorkOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                                    )}
                                  </div>

                                  <div className="min-w-0">
                                    <div className="text-xs sm:text-[13px] font-medium truncate">
                                      {renderHighlightedText(item.title, keyword.trim())}
                                    </div>
                                    {item.subtitle && (
                                      <div className="text-[10px] text-gray-400 truncate">
                                        {item.subtitle}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="shrink-0 flex items-center gap-1.5">
                                  {item.badge && (
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                      item.type === 'COMPANY'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                        : item.type === 'SEARCH'
                                        ? 'bg-lime-100 text-[#697d10] border border-lime-200/60'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200/60'
                                    }`}>
                                      {item.badge}
                                    </span>
                                  )}
                                  <NorthEastOutlinedIcon sx={{ fontSize: 13 }} className="text-gray-300 group-hover:text-gray-500" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Location */}
                <CustomFilterSelect
                  value={location}
                  onChange={setLocation}
                  options={[
                    'All Locations',
                    'Gurugram, Haryana',
                    'Noida, Uttar Pradesh',
                    'Delhi NCR',
                    'Mumbai, Maharashtra',
                    'Bengaluru, Karnataka',
                    'Pune, Maharashtra',
                    'Hyderabad, Telangana'
                  ]}
                  icon={<LocationOnOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
                  placeholder="All Locations"
                />

                {/* 3. Category */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <CustomFilterSelect
                    value={category}
                    onChange={setCategory}
                    options={['All Categories', ...categoryList.filter((cat) => cat !== 'All Categories')]}
                    icon={<LayersOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
                    placeholder="All Categories"
                  />
                </div>
              </div>

              {/* Row 2: Job Type, Work Mode, SEARCH CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 items-center relative z-10">
                {/* 4. Job Type */}
                <CustomFilterSelect
                  value={jobType}
                  onChange={setJobType}
                  options={['All Job Types', 'Full Time', 'Part Time', 'Contract', 'Internship']}
                  icon={<WorkOutlineOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
                  placeholder="All Job Types"
                />

                {/* 5. Work Mode */}
                <CustomFilterSelect
                  value={workMode}
                  onChange={setWorkMode}
                  options={['All Work Modes', 'On-site', 'Hybrid', 'Remote']}
                  icon={<HomeWorkOutlinedIcon className="text-gray-400" sx={{ fontSize: 18 }} />}
                  placeholder="All Work Modes"
                />

                {/* 6. SEARCH CTA */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <button
                    type="submit"
                    className="w-full min-h-[44px] sm:min-h-[48px] bg-[#b2c359] hover:bg-[#a1b34a] text-slate-950 font-['Helvetica',Arial,sans-serif] font-black text-xs sm:text-[14px] uppercase px-4 py-2.5 sm:py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md active:scale-[0.99] whitespace-nowrap cursor-pointer"
                  >
                    <span>SEARCH</span>
                    <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            </form>

            {/* Trending Keywords */}
            <div className="relative z-10 flex items-center gap-1.5 pt-1 text-xs overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
              <span className="font-bold text-white shrink-0 text-[11px] sm:text-xs drop-shadow-sm">Trending:</span>
              {['Sales & BD', 'Marketing', 'Civil Engineering', 'Architecture', 'Legal'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const fullCat = DEPARTMENT_CATEGORIES.find(c => c.toLowerCase().includes(tag.toLowerCase().split(' ')[0])) || tag;
                    setCategory(fullCat);
                    router.push(`/jobs?category=${encodeURIComponent(fullCat)}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950/60 backdrop-blur-md border border-white/20 text-slate-200 hover:text-white hover:bg-white/20 hover:border-white/40 transition shrink-0 text-[10.5px] sm:text-xs active:scale-95 shadow-xs font-medium"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT ROLE SELECTION CARD (4 Cols - Desktop Only) */}
          {/* ========================================================= */}
          <div className="hidden lg:block lg:col-span-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-[#080809] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] border border-white/80 w-full max-w-[380px] xl:max-w-[400px] ml-auto">
              
              <div className="text-left mb-4 sm:mb-4.5">
                <h3 className="text-base sm:text-lg xl:text-xl font-['Helvetica',Arial,sans-serif] font-bold tracking-tight text-gray-900">
                  Get Started on Torbit
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Choose how you want to use the platform today:
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {/* 1. Job Seeker Option */}
                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('JOB_SEEKER', 'REGISTER')}
                    className="w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-[#b2c359] bg-gray-50/60 hover:bg-lime-50/40 transition group flex items-center justify-between gap-2.5 shadow-xs cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-lime-100 text-[#b2c359] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <PersonOutlineOutlinedIcon className="text-[#b2c359]" sx={{ fontSize: 20 }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-lime-950 truncate">
                          I&apos;m a Job Seeker
                        </h4>
                        <p className="text-[10.5px] sm:text-[11.5px] text-gray-500 mt-0.5 truncate">
                          Browse 500+ verified real estate roles
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 group-hover:border-[#b2c359] flex items-center justify-center text-gray-400 group-hover:text-[#b2c359] group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 13 }} />
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/register?role=seeker"
                    className="w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-[#b2c359] bg-gray-50/60 hover:bg-lime-50/40 transition group flex items-center justify-between gap-2.5 shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-lime-100 text-[#b2c359] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <PersonOutlineOutlinedIcon className="text-[#b2c359]" sx={{ fontSize: 20 }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-lime-950 truncate">
                          I&apos;m a Job Seeker
                        </h4>
                        <p className="text-[10.5px] sm:text-[11.5px] text-gray-500 mt-0.5 truncate">
                          Browse 500+ verified real estate roles
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 group-hover:border-[#b2c359] flex items-center justify-center text-gray-400 group-hover:text-[#b2c359] group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 13 }} />
                    </div>
                  </Link>
                )}

                {/* 2. Recruiter / Employer Option */}
                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('RECRUITER', 'REGISTER')}
                    className="w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-slate-800 bg-gray-50/60 hover:bg-slate-50 transition group flex items-center justify-between gap-2.5 shadow-xs cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <CorporateFareOutlinedIcon className="text-white" sx={{ fontSize: 20 }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-black truncate">
                          I&apos;m an Employer / Builder
                        </h4>
                        <p className="text-[10.5px] sm:text-[11.5px] text-gray-500 mt-0.5 truncate">
                          Post vacancies &amp; hire verified talent
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 group-hover:border-slate-900 flex items-center justify-center text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 13 }} />
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/register?role=recruiter"
                    className="w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-slate-800 bg-gray-50/60 hover:bg-slate-50 transition group flex items-center justify-between gap-2.5 shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <CorporateFareOutlinedIcon className="text-white" sx={{ fontSize: 20 }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-black truncate">
                          I&apos;m an Employer / Builder
                        </h4>
                        <p className="text-[10.5px] sm:text-[11.5px] text-gray-500 mt-0.5 truncate">
                          Post vacancies &amp; hire verified talent
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border border-gray-200 group-hover:border-slate-900 flex items-center justify-center text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 13 }} />
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}