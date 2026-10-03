'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'NEWS', href: '/news' },
    { label: 'INTERVIEWS', href: '/interviews' },
    { label: 'REPORTS', href: '/reports' },
    { label: 'GUEST ARTICLES', href: '/guest-articles' },
    { label: 'E MAGAZINE', href: '/e-magazine' },
    { label: 'TORBIT INSIGHTS', href: '/insights' },
    { label: 'PROPERTY GUIDE', href: '/property-guide' },
  ];

  return (
    <nav className="bg-[#b2c359] text-[#080809] sticky top-0 z-40 shadow-xs font-['Helvetica',Arial,sans-serif]">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-1 font-normal text-[14px] leading-[26px] tracking-[0px] text-[#080809]">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3.5 py-2.5 hover:bg-[#9eb047] text-[#080809] transition whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
          <div className="relative group">
            <button className="flex items-center gap-0.5 px-3 py-2.5 hover:bg-[#9eb047] text-[#080809] transition">
              <span>MORE</span>
              <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
          <div className="relative group">
            <button className="flex items-center gap-0.5 px-3 py-2.5 hover:bg-[#9eb047] text-[#080809] transition">
              <span>KNOW TORBIT</span>
              <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center justify-between w-full py-2">
          <span className="font-normal text-[14px] leading-[26px] tracking-[0px] text-[#080809]">TORBIT PORTAL MENU</span>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 text-[#080809] hover:text-black flex items-center"
          >
            {mobileOpen ? <CloseOutlinedIcon sx={{ fontSize: 24 }} /> : <MenuOutlinedIcon sx={{ fontSize: 24 }} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#b2c359] text-[#080809] px-4 py-3 space-y-1 text-[14px] leading-[26px] tracking-[0px] font-normal border-t border-lime-600">
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-1 hover:text-black transition"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2.5 border-t border-lime-700 flex flex-col gap-2 font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase">
            <Link href="/seeker/dashboard" className="bg-[#111827] text-white text-center py-2.5 rounded-lg">
              Job Seeker Portal
            </Link>
            <Link href="/recruiter/dashboard" className="bg-white text-[#111827] text-center py-2.5 rounded-lg">
              Recruiter Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
