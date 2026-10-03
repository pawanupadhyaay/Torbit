'use client';
import React, { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';

interface PopularCategoriesProps {
  categories?: Array<{ id?: string; name: string; jobCount?: number; iconColor?: string }>;
  onSelectCategory?: (name: string) => void;
}

const getCategoryIcon = (name: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('market') || n.includes('digital')) return CampaignOutlinedIcon;
  if (n.includes('construct') || n.includes('project') || n.includes('civil')) return EngineeringOutlinedIcon;
  if (n.includes('property') || n.includes('estate') || n.includes('leasing')) return HomeWorkOutlinedIcon;
  if (n.includes('finance') || n.includes('account')) return CalculateOutlinedIcon;
  if (n.includes('human') || n.includes('hr') || n.includes('recruit')) return GroupsOutlinedIcon;
  if (n.includes('it') || n.includes('tech') || n.includes('information')) return LaptopMacOutlinedIcon;
  if (n.includes('legal') || n.includes('complian') || n.includes('law')) return BalanceOutlinedIcon;
  return WorkOutlineOutlinedIcon;
};

const getCategoryColor = (name: string, fallbackColor?: string) => {
  if (fallbackColor && fallbackColor !== '#b2c359') return fallbackColor;
  const n = (name || '').toLowerCase();
  if (n.includes('sales')) return '#10B981';
  if (n.includes('market')) return '#F97316';
  if (n.includes('construct') || n.includes('project')) return '#0D9488';
  if (n.includes('property')) return '#EA580C';
  if (n.includes('finance') || n.includes('account')) return '#2563EB';
  if (n.includes('human') || n.includes('hr')) return '#EC4899';
  if (n.includes('it') || n.includes('tech') || n.includes('information')) return '#6366F1';
  if (n.includes('legal')) return '#8B5CF6';
  return '#10B981';
};

export default function PopularCategories({ categories, onSelectCategory }: PopularCategoriesProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultList = [
    { id: '1', name: 'Sales & Business Development', jobCount: 128, iconColor: '#10B981' },
    { id: '2', name: 'Marketing', jobCount: 96, iconColor: '#F97316' },
    { id: '3', name: 'Projects & Construction', jobCount: 89, iconColor: '#0D9488' },
    { id: '4', name: 'Property Management', jobCount: 64, iconColor: '#EA580C' },
    { id: '5', name: 'Finance & Accounts', jobCount: 52, iconColor: '#2563EB' },
    { id: '6', name: 'Human Resources', jobCount: 41, iconColor: '#EC4899' },
    { id: '7', name: 'Information Technology', jobCount: 38, iconColor: '#6366F1' },
    { id: '8', name: 'Legal', jobCount: 30, iconColor: '#8B5CF6' },
  ];

  const displayList = categories && categories.length > 0 ? categories.slice(0, 10) : defaultList;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryCardClick = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
    router.push(`/jobs?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="popular-categories" className="py-2 font-['Helvetica',Arial,sans-serif]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base sm:text-lg font-['Helvetica',Arial,sans-serif] font-bold text-[#111827] truncate">
            Popular Categories
          </h3>
          <p className="text-[11px] sm:text-xs text-gray-500 font-['Helvetica',Arial,sans-serif] truncate">
            Explore highest-demand career streams
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Prev / Next Slider Controls (visible on tablet/desktop) */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              aria-label="Previous categories"
              className="w-7 h-7 rounded-full bg-white hover:bg-lime-50 border border-gray-200 hover:border-[#b2c359] flex items-center justify-center text-gray-600 hover:text-[#b2c359] transition shadow-xs cursor-pointer"
            >
              <ChevronLeftOutlinedIcon sx={{ fontSize: 18 }} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              aria-label="Next categories"
              className="w-7 h-7 rounded-full bg-white hover:bg-lime-50 border border-gray-200 hover:border-[#b2c359] flex items-center justify-center text-gray-600 hover:text-[#b2c359] transition shadow-xs cursor-pointer"
            >
              <ChevronRightOutlinedIcon sx={{ fontSize: 18 }} />
            </button>
          </div>

          <Link 
            href="/categories"
            className="font-['Helvetica',Arial,sans-serif] font-bold text-xs sm:text-[14px] leading-tight uppercase text-[#b2c359] hover:text-[#9eb047] flex items-center gap-0.5 sm:gap-1 transition"
          >
            <span>VIEW ALL</span>
            <ArrowForwardOutlinedIcon sx={{ fontSize: 15 }} />
          </Link>
        </div>
      </div>

      {/* 1 Single Horizontal Row with perfectly uniform cards and touch snapping */}
      <div 
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-none px-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayList.map((cat) => {
          const IconComponent = getCategoryIcon(cat.name);
          const color = getCategoryColor(cat.name, cat.iconColor);

          return (
            <button
              key={cat.id || cat.name}
              type="button"
              onClick={() => handleCategoryCardClick(cat.name)}
              className="snap-start flex-shrink-0 w-[122px] sm:w-[130px] lg:flex-1 bg-white hover:bg-lime-50/50 p-3 rounded-2xl border border-gray-100 hover:border-[#b2c359] shadow-2xs hover:shadow-xs transition group text-left flex flex-col justify-between min-h-[120px] active:scale-[0.98] cursor-pointer"
            >
              {/* Top Icon Box */}
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center transition group-hover:scale-105 flex-shrink-0"
                style={{ backgroundColor: `${color}18`, color: color }}
              >
                <IconComponent sx={{ fontSize: 20 }} />
              </div>

              {/* Bottom Text Block with Uniform 32px Title Height */}
              <div className="w-full mt-2.5">
                <div className="h-[32px] flex items-start overflow-hidden">
                  <h4 className="font-bold text-[11px] sm:text-xs text-gray-900 group-hover:text-[#b2c359] line-clamp-2 leading-[15px] transition">
                    {cat.name}
                  </h4>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium whitespace-nowrap">
                  ({cat.jobCount || 0} Jobs)
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}