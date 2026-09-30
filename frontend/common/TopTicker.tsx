'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

export default function TopTicker() {
  const [forumCount] = useState(3256);

  return (
    <div className="bg-[#111827] text-xs text-gray-300 border-b border-gray-800 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 overflow-hidden">
        {/* Left Side News Ticker */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <span className="bg-[#94C322] text-[#111827] font-extrabold px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
            NEWS :
          </span>
          <div className="text-gray-200 truncate text-[11px] min-w-0 flex-1">
            <span>TAN for TDS from October 1</span>
            <span className="text-[#94C322] mx-1.5">•</span>
            <span className="text-gray-300">Viksit Bharat 2047 real estate infrastructure surge</span>
          </div>
        </div>

        {/* Right Side Forum & User Info */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link 
            href="/forum" 
            className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded text-white text-[11px] font-medium transition"
          >
            <span className="hidden sm:inline">Forum</span>
            <span className="sm:hidden">Forum</span>
            <span className="bg-[#DC2626] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {forumCount}
            </span>
          </Link>

          {/* Desktop User Info & Socials */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-300">
            <span className="font-semibold text-white tracking-wide">TORBIT REALTY</span>
            <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 15, color: '#9CA3AF' }} />
          </div>

          <div className="hidden lg:flex items-center gap-2 text-gray-400 pl-2 border-l border-gray-700">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-[#94C322] transition flex items-center">
              <FacebookIcon sx={{ fontSize: 14 }} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-[#94C322] transition flex items-center">
              <LinkedInIcon sx={{ fontSize: 14 }} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter" className="hover:text-[#94C322] transition flex items-center">
              <TwitterIcon sx={{ fontSize: 14 }} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[#94C322] transition flex items-center">
              <InstagramIcon sx={{ fontSize: 14 }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
