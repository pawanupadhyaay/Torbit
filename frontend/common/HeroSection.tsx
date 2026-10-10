'use client';
import React, { useState } from 'react';
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
import { DEPARTMENT_CATEGORIES } from '@/lib/constants';
import CustomFilterSelect from './CustomFilterSelect';

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

  const categoryList: string[] = categories && categories.length > 0
    ? categories.map((c: any) => typeof c === 'string' ? c : c.name)
    : (DEPARTMENT_CATEGORIES as unknown as string[]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="relative bg-[#0c1424] text-white py-6 sm:py-10 lg:py-14 font-['Helvetica',Arial,sans-serif] z-20">
      {/* Background Architectural Panoramic Real Estate Skyline Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero-bg.jpg')`
          }}
        />
        {/* Premium dark gradient overlay: darker on the left for text legibility, open on the right for cityscape & sunset */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070e1c]/88 via-[#070e1c]/60 to-[#070e1c]/30" />
        {/* Top and bottom subtle vignette to smoothly integrate with header and page flow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070e1c]/45 via-transparent to-[#070e1c]/65" />
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          
          {/* ========================================================= */}
          {/* LEFT HERO COLUMN (7 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[11px] sm:text-xs font-semibold text-[#b2c359] mb-2 sm:mb-3">
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 14 }} />
                <span>India&apos;s #1 Dedicated Real Estate Job Portal</span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-['Helvetica',Arial,sans-serif] font-bold text-white tracking-tight leading-[1.2]">
                Find Your Next Career in <span className="text-[#b2c359]">Real Estate</span>
              </h1>
              
              <p className="text-xs sm:text-base text-gray-300 font-normal mt-1.5 sm:mt-2.5 max-w-xl leading-relaxed">
                Connect directly with India&apos;s premier developers, builders, and infrastructure enterprises.
              </p>
            </div>

            {/* Clean Multi-Filter Search Bar */}
            <form 
              id="hero-search" 
              onSubmit={handleSearchSubmit} 
              className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl space-y-2 text-[#080809] border border-gray-100 font-['Helvetica',Arial,sans-serif]"
            >
              {/* Row 1: Keyword, Location, Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 relative z-20">
                {/* 1. Keyword */}
                <div className="flex items-center px-3 py-2.5 sm:py-3 bg-gray-50/80 rounded-xl border border-gray-200 min-h-[44px] sm:min-h-[48px]">
                  <SearchOutlinedIcon className="text-gray-400 mr-2 flex-shrink-0" sx={{ fontSize: 18 }} />
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Job title, skills, keyword..."
                    className="w-full text-xs sm:text-[13.5px] leading-tight font-normal text-[#080809] focus:outline-none placeholder-gray-400 bg-transparent"
                  />
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
                    className="w-full min-h-[44px] sm:min-h-[48px] bg-[#b2c359] hover:bg-[#9eb047] text-white font-['Helvetica',Arial,sans-serif] font-bold text-xs sm:text-[14px] uppercase px-4 py-2.5 sm:py-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] whitespace-nowrap cursor-pointer"
                  >
                    <span>SEARCH</span>
                    <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            </form>

            {/* Trending Keywords */}
            <div className="flex items-center gap-1.5 pt-0.5 text-xs text-gray-400 overflow-x-auto pb-1 scrollbar-none flex-nowrap sm:flex-wrap">
              <span className="font-semibold text-gray-300 shrink-0 text-[11px] sm:text-xs">Trending:</span>
              {['Sales & BD', 'Marketing', 'Civil Engineering', 'Architecture', 'Legal'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const fullCat = DEPARTMENT_CATEGORIES.find(c => c.toLowerCase().includes(tag.toLowerCase().split(' ')[0])) || tag;
                    setCategory(fullCat);
                    router.push(`/jobs?category=${encodeURIComponent(fullCat)}`);
                  }}
                  className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white transition shrink-0 text-[10.5px] sm:text-xs active:scale-95"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT ROLE SELECTION CARD (5 Cols - Desktop Only) */}
          {/* ========================================================= */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-[#080809] shadow-2xl border border-gray-100">
              
              <div className="text-left mb-4 sm:mb-5">
                <h3 className="text-lg sm:text-xl font-['Helvetica',Arial,sans-serif] font-bold tracking-tight text-gray-900">
                  Get Started on Torbit
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                  Choose how you want to use the platform today:
                </p>
              </div>

              <div className="space-y-3 sm:space-y-3.5">
                {/* 1. Job Seeker Option */}
                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('JOB_SEEKER', 'REGISTER')}
                    className="w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-[#b2c359] bg-gray-50/60 hover:bg-lime-50/40 transition group flex items-center justify-between gap-3 shadow-xs cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-lime-100 text-[#b2c359] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <PersonOutlineOutlinedIcon className="text-[#b2c359]" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-lime-950">
                          I&apos;m a Job Seeker
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                          Browse 500+ verified real estate roles
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 group-hover:border-[#b2c359] flex items-center justify-center text-gray-400 group-hover:text-[#b2c359] group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 15 }} />
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/register?role=seeker"
                    className="w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-[#b2c359] bg-gray-50/60 hover:bg-lime-50/40 transition group flex items-center justify-between gap-3 shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-lime-100 text-[#b2c359] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <PersonOutlineOutlinedIcon className="text-[#b2c359]" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-lime-950">
                          I&apos;m a Job Seeker
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                          Browse 500+ verified real estate roles
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 group-hover:border-[#b2c359] flex items-center justify-center text-gray-400 group-hover:text-[#b2c359] group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 15 }} />
                    </div>
                  </Link>
                )}

                {/* 2. Recruiter / Employer Option */}
                {onOpenAuth ? (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('RECRUITER', 'REGISTER')}
                    className="w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-slate-800 bg-gray-50/60 hover:bg-slate-50 transition group flex items-center justify-between gap-3 shadow-xs cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <CorporateFareOutlinedIcon className="text-white" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-black">
                          I&apos;m an Employer / Builder
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                          Post vacancies &amp; hire verified talent
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 group-hover:border-slate-900 flex items-center justify-center text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 15 }} />
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/register?role=recruiter"
                    className="w-full text-left p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-slate-800 bg-gray-50/60 hover:bg-slate-50 transition group flex items-center justify-between gap-3 shadow-xs active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-xs">
                        <CorporateFareOutlinedIcon className="text-white" sx={{ fontSize: 22 }} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-black">
                          I&apos;m an Employer / Builder
                        </h4>
                        <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                          Post vacancies &amp; hire verified talent
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-200 group-hover:border-slate-900 flex items-center justify-center text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition flex-shrink-0">
                      <NorthEastOutlinedIcon sx={{ fontSize: 15 }} />
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