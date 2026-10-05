'use client';
import React from 'react';
import Link from 'next/link';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { ChevronRight, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const quickLinks = [
    { title: 'Privacy Policy', href: 'https://torbitrealty.com/privacy-policy/' },
    { title: 'Disclaimer', href: 'https://torbitrealty.com/disclaimer/' },
    { title: 'Shipping Policy', href: 'https://torbitrealty.com/shipping-policy/' },
    { title: 'Return & Refund Policy', href: 'https://torbitrealty.com/return-refund-policy/' },
    { title: 'Cancellation Policy', href: 'https://torbitrealty.com/cancellation-policy/' },
    { title: 'Terms Of Use', href: 'https://torbitrealty.com/terms-of-use/' }
  ];

  const portalLinks = [
    { title: 'Explore Job Categories', href: '/categories' },
    { title: 'Search All Jobs', href: '/jobs' },
    { title: 'Post a Job', href: '/register?role=RECRUITER' },
    { title: 'Candidate Portal', href: '/register?role=JOB_SEEKER' },
    { title: 'Torbit Main Website', href: 'https://torbitrealty.com', external: true }
  ];

  return (
    <footer className="w-full bg-[#080809] text-white border-t border-gray-900/90 mt-auto font-['Helvetica',Arial,sans-serif] relative overflow-hidden">
      
      {/* 1. Top Trust Points Strip (4 Equal Columns in Single Row, Perfectly Fitted on Mobile & Desktop) */}
      <div className="border-b border-white/5 bg-black/60 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto px-2 sm:px-8 grid grid-cols-4 items-center justify-between gap-1 sm:gap-6 text-[10px] sm:text-[13px] font-bold w-full text-center">
          
          {/* 1. Verified */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white">
            <StarRoundedIcon className="text-[#FBBF24] shrink-0" sx={{ fontSize: { xs: 14, sm: 16 } }} />
            <span className="whitespace-nowrap sm:hidden">Verified</span>
            <span className="whitespace-nowrap hidden sm:inline">100% Verified Jobs</span>
          </div>

          {/* 2. Easy Apply */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white">
            <ShieldOutlinedIcon className="text-[#b2c359] shrink-0" sx={{ fontSize: { xs: 14, sm: 16 } }} />
            <span className="whitespace-nowrap sm:hidden">Easy Apply</span>
            <span className="whitespace-nowrap hidden sm:inline">Secure &amp; Easy Apply</span>
          </div>

          {/* 3. Top Hiring */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white">
            <BusinessCenterOutlinedIcon className="text-[#D97706] shrink-0" sx={{ fontSize: { xs: 14, sm: 16 } }} />
            <span className="whitespace-nowrap sm:hidden">Top Hiring</span>
            <span className="whitespace-nowrap hidden sm:inline">Top Hiring Companies</span>
          </div>

          {/* 4. Free */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white">
            <DescriptionOutlinedIcon className="text-cyan-400 shrink-0" sx={{ fontSize: { xs: 14, sm: 16 } }} />
            <span className="whitespace-nowrap sm:hidden">100% Free</span>
            <span className="whitespace-nowrap hidden sm:inline">Free for Candidates</span>
          </div>

        </div>
      </div>

      {/* 2. Main Footer Body (Mobile-Optimized 2-Col Links & Desktop Multi-Col) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-7 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-7 lg:gap-12 items-start">
          
          {/* Col 1: Torbit Logo + Social Icons */}
          <div className="md:col-span-5 space-y-3.5 sm:space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group" title="Torbit Realty Jobs">
              <div className="bg-white rounded-xl px-3 py-1.5 flex items-center shadow-xs border border-white/10 group-hover:opacity-95 transition-opacity">
                <img
                  src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
                  alt="Torbit Realty"
                  className="h-7 sm:h-9 w-auto object-contain"
                />
              </div>
              <span className="bg-[#b2c359] text-[#080809] text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase">
                JOBS
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed hidden sm:block">
              India&apos;s leading platform for verified career opportunities, connecting talented professionals with top hiring employers across the country.
            </p>

            {/* Social Media Circular Buttons */}
            <div className="flex items-center gap-2.5 pt-0.5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/torbitrealty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Torbit on Facebook"
                className="w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#b2c359] hover:text-[#080809] text-slate-300 flex items-center justify-center transition-all duration-200 border border-white/5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/torbitrealty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Torbit on Instagram"
                className="w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#b2c359] hover:text-[#080809] text-slate-300 flex items-center justify-center transition-all duration-200 border border-white/5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* X (Twitter) */}
              <a
                href="https://x.com/torbitrealty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Torbit on X"
                className="w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#b2c359] hover:text-[#080809] text-slate-300 flex items-center justify-center transition-all duration-200 border border-white/5 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/torbitrealty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Torbit on LinkedIn"
                className="w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#b2c359] hover:text-[#080809] text-slate-300 flex items-center justify-center transition-all duration-200 border border-white/5 shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@torbitrealty"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to Torbit on YouTube"
                className="w-9 h-9 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-[#b2c359] hover:text-[#080809] text-slate-300 flex items-center justify-center transition-all duration-200 border border-white/5 shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links Section: 2 Columns on Mobile, Side-by-Side on Desktop */}
          <div className="md:col-span-7 grid grid-cols-2 gap-5 sm:gap-10 pt-2 sm:pt-0">
            {/* Quick Links */}
            <div className="space-y-2.5 sm:space-y-3.5">
              <h4 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Quick Links
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-[13px] font-medium text-slate-200">
                {quickLinks.map((link) => (
                  <li key={link.title}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 py-0.5 hover:text-[#b2c359] transition-all duration-150"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#b2c359] group-hover:translate-x-0.5 transition-transform shrink-0" />
                      <span>{link.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portal Navigation */}
            <div className="space-y-2.5 sm:space-y-3.5">
              <h4 className="text-base sm:text-xl font-bold text-white tracking-tight">
                Job Portal
              </h4>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-[13px] font-medium text-slate-200">
                {portalLinks.map((link) => (
                  <li key={link.title}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-1.5 py-0.5 hover:text-[#b2c359] transition-all duration-150"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#b2c359] group-hover:translate-x-0.5 transition-transform shrink-0" />
                        <span>{link.title}</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 py-0.5 hover:text-[#b2c359] transition-all duration-150"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#b2c359] group-hover:translate-x-0.5 transition-transform shrink-0" />
                        <span>{link.title}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Copyright & Back-to-Top Bar */}
      <div className="border-t border-white/5 bg-black py-4 pb-20 sm:pb-4 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-3 text-left">
          
          <div className="text-[10px] sm:text-xs text-slate-400 flex items-center flex-wrap gap-y-0.5 gap-x-1.5 sm:gap-x-2 leading-tight">
            <span>© 2026 <strong className="text-[#b2c359] font-semibold">Torbit.</strong> All Rights Reserved.</span>
            <span className="text-slate-600">|</span>
            <span>Powered by <strong className="text-white font-semibold">Omrie Digital</strong></span>
          </div>

          {/* Scroll to Top Trigger */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="w-8 h-8 rounded-full bg-white hover:bg-[#b2c359] text-[#080809] flex items-center justify-center transition-all duration-200 shadow-md cursor-pointer group active:scale-90 shrink-0 border border-amber-100"
          >
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform text-[#080809]" />
          </button>
        </div>
      </div>

    </footer>
  );
}
