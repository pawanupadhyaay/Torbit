'use client';
import React from 'react';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

export default function Footer() {
  return (
    <footer className="w-full bg-[#080809] text-white py-4 sm:py-5 pb-20 sm:pb-5 border-t border-gray-900/80 mt-auto font-['Helvetica',Arial,sans-serif] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 text-xs sm:text-[13px] lg:text-[14px] font-bold">
        <div className="flex items-center gap-2 text-white">
          <StarRoundedIcon className="text-[#FBBF24] shrink-0" sx={{ fontSize: 18 }} />
          <span className="truncate">100% Verified Jobs</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <ShieldOutlinedIcon className="text-[#94C322] shrink-0" sx={{ fontSize: 18 }} />
          <span className="truncate">Secure &amp; Easy Apply</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <BusinessCenterOutlinedIcon className="text-[#D97706] shrink-0" sx={{ fontSize: 18 }} />
          <span className="truncate">Top RE Builders</span>
        </div>
        <div className="flex items-center gap-2 text-white">
          <DescriptionOutlinedIcon className="text-cyan-400 shrink-0" sx={{ fontSize: 18 }} />
          <span className="truncate">Free for Candidates</span>
        </div>
      </div>
    </footer>
  );
}
