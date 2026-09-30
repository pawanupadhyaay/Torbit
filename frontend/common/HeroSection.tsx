'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import NorthEastOutlinedIcon from '@mui/icons-material/NorthEastOutlined';
import { DEPARTMENT_CATEGORIES } from '@/lib/constants';

interface HeroSectionProps {
  categories?: Array<{ name: string; [key: string]: any } | string>;
  onSearch: (params: { q: string; location: string; category: string; jobType: string }) => void;
  onOpenAuth: (role?: 'JOB_SEEKER' | 'RECRUITER' | null, tab?: 'LOGIN' | 'REGISTER') => void;
}

export default function HeroSection({ categories, onSearch, onOpenAuth }: HeroSectionProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('All Locations');
  const [category, setCategory] = useState('All Categories');

  const categoryList: string[] = categories && categories.length > 0
    ? categories.map((c: any) => typeof c === 'string' ? c : c.name)
    : (DEPARTMENT_CATEGORIES as unknown as string[]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ q: keyword, location, category, jobType: 'All Job Types' });
  };

  return (
    <div className="relative bg-[#0c1424] text-white overflow-hidden py-10 lg:py-14 font-['Helvetica',Arial,sans-serif]">
      {/* Background Architectural Skyline Image with Subtle Vignette Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-20 mix-blend-luminosity"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c1424] via-[#0c1424]/95 to-[#0c1424]/80 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ========================================================= */}
          {/* LEFT HERO COLUMN (7 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-semibold text-[#94C322] mb-3">
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />
                <span>India&apos;s #1 Dedicated Real Estate Job Portal</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-['Helvetica',Arial,sans-serif] font-bold text-white tracking-tight leading-[1.15]">
                Find Your Next Career in <span className="text-[#94C322]">Real Estate</span>
              </h1>
              
              <p className="text-sm sm:text-base text-gray-300 font-normal mt-2.5 max-w-xl leading-relaxed">
                Connect directly with India&apos;s premier developers, builders, and infrastructure enterprises.
              </p>
            </div>

            {/* Clean Multi-Filter Search Bar (Single Row on Desktop with Generous Height & 14px Typography) */}
            <form 
              id="hero-search" 
              onSubmit={handleSearchSubmit} 
              className="bg-white p-2 sm:p-1.5 rounded-2xl shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-1.5 text-[#080809] border border-gray-100 items-center font-['Helvetica',Arial,sans-serif]"
            >
              {/* Keyword */}
              <div className="sm:col-span-1 lg:col-span-4 flex items-center px-3.5 py-3 sm:py-3.5 bg-gray-50/80 lg:bg-transparent rounded-xl lg:rounded-none border lg:border-0 border-gray-200 min-h-[50px] sm:min-h-[54px]">
                <SearchOutlinedIcon className="text-gray-400 mr-2.5 flex-shrink-0" sx={{ fontSize: 18 }} />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Job title, skills, keyword..."
                  className="w-full text-[14px] leading-[26px] font-normal text-[#080809] focus:outline-none placeholder-gray-400 bg-transparent"
                />
              </div>

              {/* Location */}
              <div className="sm:col-span-1 lg:col-span-3 flex items-center px-3.5 py-3 sm:py-3.5 bg-gray-50/80 lg:bg-transparent rounded-xl lg:rounded-none border lg:border-0 border-gray-200 lg:border-l border-gray-200 min-h-[50px] sm:min-h-[54px]">
                <LocationOnOutlinedIcon className="text-gray-400 mr-2.5 flex-shrink-0" sx={{ fontSize: 18 }} />
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-[14px] leading-[26px] font-normal text-[#080809] focus:outline-none bg-transparent cursor-pointer"
                >
                  <option>All Locations</option>
                  <option>Gurugram, Haryana</option>
                  <option>Noida, Uttar Pradesh</option>
                  <option>Delhi NCR</option>
                  <option>Mumbai, Maharashtra</option>
                  <option>Bengaluru, Karnataka</option>
                  <option>Pune, Maharashtra</option>
                  <option>Hyderabad, Telangana</option>
                </select>
              </div>

              {/* Category */}
              <div className="sm:col-span-1 lg:col-span-3 flex items-center px-3.5 py-3 sm:py-3.5 bg-gray-50/80 lg:bg-transparent rounded-xl lg:rounded-none border lg:border-0 border-gray-200 lg:border-l border-gray-200 min-h-[50px] sm:min-h-[54px]">
                <LayersOutlinedIcon className="text-gray-400 mr-2.5 flex-shrink-0" sx={{ fontSize: 18 }} />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-[14px] leading-[26px] font-normal text-[#080809] focus:outline-none bg-transparent truncate cursor-pointer"
                >
                  <option>All Categories</option>
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-1 lg:col-span-2 h-full flex items-center">
                <button
                  type="submit"
                  className="w-full h-full min-h-[50px] sm:min-h-[54px] bg-[#94C322] hover:bg-[#82ad1b] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-4 py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] whitespace-nowrap"
                >
                  <span>SEARCH</span>
                  <ArrowForwardOutlinedIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </form>

            {/* Trending Keywords */}
            <div className="flex items-center gap-2 pt-1 text-xs text-gray-400 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
              <span className="font-semibold text-gray-300 shrink-0">Trending:</span>
              {['Sales & BD', 'Marketing', 'Civil Engineering', 'Architecture', 'Legal'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const fullCat = DEPARTMENT_CATEGORIES.find(c => c.toLowerCase().includes(tag.toLowerCase().split(' ')[0])) || tag;
                    setCategory(fullCat);
                    onSearch({ q: keyword, location, category: fullCat, jobType: 'All Job Types' });
                  }}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shrink-0 text-[11px] sm:text-xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT ROLE SELECTION CARD (5 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 text-[#080809] shadow-2xl border border-gray-100">
              
              <div className="text-left mb-5">
                <h3 className="text-xl font-['Helvetica',Arial,sans-serif] font-bold tracking-tight text-gray-900">
                  Get Started on Torbit
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Choose how you want to use the platform today:
                </p>
              </div>

              <div className="space-y-3.5">
                {/* 1. Job Seeker Option */}
                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('JOB_SEEKER', 'REGISTER')}
                    className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-[#94C322] bg-gray-50/60 hover:bg-lime-50/40 transition group flex items-center justify-between gap-3 shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-lime-100 text-[#94C322] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <PersonOutlineOutlinedIcon className="text-[#94C322]" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-lime-950">
                          I&apos;m a Job Seeker
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Browse 500+ verified real estate roles
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 group-hover:border-[#94C322] flex items-center justify-center text-gray-400 group-hover:text-[#94C322] group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 16 }} />
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/register?role=seeker"
                    className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-[#94C322] bg-gray-50/60 hover:bg-lime-50/40 transition group flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-lime-100 text-[#94C322] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <PersonOutlineOutlinedIcon className="text-[#94C322]" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-lime-950">
                          I&apos;m a Job Seeker
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Browse 500+ verified real estate roles
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 group-hover:border-[#94C322] flex items-center justify-center text-gray-400 group-hover:text-[#94C322] group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 16 }} />
                    </div>
                  </Link>
                )}

                {/* 2. Recruiter / Employer Option */}
                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('RECRUITER', 'REGISTER')}
                    className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-slate-800 bg-gray-50/60 hover:bg-slate-50 transition group flex items-center justify-between gap-3 shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <CorporateFareOutlinedIcon className="text-white" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-black">
                          I&apos;m an Employer / Builder
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Post vacancies &amp; hire verified talent
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 group-hover:border-slate-900 flex items-center justify-center text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 16 }} />
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/register?role=recruiter"
                    className="w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-slate-800 bg-gray-50/60 hover:bg-slate-50 transition group flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <CorporateFareOutlinedIcon className="text-white" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-black">
                          I&apos;m an Employer / Builder
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Post vacancies &amp; hire verified talent
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 group-hover:border-slate-900 flex items-center justify-center text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 16 }} />
                    </div>
                  </Link>
                )}
              </div>

              {/* Login Link at Bottom */}
              <div className="text-center pt-5 mt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <span>Already have an account?</span>
                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth(null, 'LOGIN')}
                    className="text-[#94C322] hover:text-[#82ad1b] font-bold hover:underline transition cursor-pointer"
                  >
                    Sign In →
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="text-[#94C322] hover:text-[#82ad1b] font-bold hover:underline transition"
                  >
                    Sign In →
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