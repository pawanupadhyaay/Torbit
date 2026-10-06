'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import MailOutlineOutlinedIcon from '@mui/icons-material/MailOutlineOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';

export interface CompanyBrandItem {
  name: string;
  logo?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

const DEFAULT_TOP_COMPANIES: CompanyBrandItem[] = [
  { 
    name: 'DLF Limited', 
    logo: 'DLF', 
    logoUrl: 'https://res.cloudinary.com/dcpqrvjh0/image/upload/e_trim/v1783861188/DLF_LOGO_uvd2ry.jpg',
    websiteUrl: 'https://www.dlf.in/career-page'
  },
  { 
    name: 'Godrej Properties', 
    logo: 'GODREJ', 
    logoUrl: 'https://res.cloudinary.com/dcpqrvjh0/image/upload/e_trim/v1783863242/godrej_propertiess_pbywng.jpg',
    websiteUrl: 'https://careers.godrejindustries.com/in/en/godrejproperties'
  },
  { 
    name: 'SOBHA Realty', 
    logo: 'SOBHA', 
    logoUrl: 'https://varanyam.vercel.app/sobha_logo.png',
    websiteUrl: 'https://www.sobha.com/careers/'
  },
  { 
    name: 'EMAAR India', 
    logo: 'EMAAR', 
    logoUrl: 'https://res.cloudinary.com/dcpqrvjh0/image/upload/e_trim/v1783865314/emaar_ak4iw2.jpg',
    websiteUrl: 'https://www.emaar.com/en/careers'
  },
  { 
    name: 'Prestige Group', 
    logo: 'PRESTIGE', 
    logoUrl: '',
    websiteUrl: 'https://jobs.prestigeconstructions.com/'
  },
  { 
    name: 'Puravankara', 
    logo: 'PURVA', 
    logoUrl: '',
    websiteUrl: 'https://www.puravankara.com/careers'
  },
];

export default function RightSidebar({ onOpenAuth }: { onOpenAuth: (role?: any, tab?: any) => void }) {
  const [alertEmail, setAlertEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [topCompanies, setTopCompanies] = useState<CompanyBrandItem[]>(DEFAULT_TOP_COMPANIES);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load settings');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.settings?.specialJobCompanies && Array.isArray(data.settings.specialJobCompanies)) {
          const normalized: CompanyBrandItem[] = data.settings.specialJobCompanies
            .map((c: any) => {
              if (typeof c === 'string') {
                return { name: c, logo: c.slice(0, 8).toUpperCase(), logoUrl: '', websiteUrl: '' };
              }
              return {
                name: c.name,
                logo: c.logo || (c.name ? c.name.slice(0, 8).toUpperCase() : ''),
                logoUrl: c.logoUrl || '',
                websiteUrl: c.websiteUrl || ''
              };
            })
            .filter((c: any) => c && c.name);

          if (normalized.length > 0) {
            setTopCompanies(normalized);
          }
        }
      })
      .catch(() => {
        // Keep DEFAULT_TOP_COMPANIES
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail) setSubscribed(true);
  };

  return (
    <aside className="space-y-4 sm:space-y-5 py-2 sm:py-4">
      {/* 1. Job Market Insights Widget */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#b2c359]" />
          <h4 className="font-['Helvetica',Arial,sans-serif] font-bold text-sm text-gray-900">Job Market Insights</h4>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <div className="text-base font-black text-gray-900">500+</div>
            <div className="text-[10px] text-gray-500 font-semibold uppercase">Active Jobs</div>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <div className="text-base font-black text-gray-900">250+</div>
            <div className="text-[10px] text-gray-500 font-semibold uppercase">Companies</div>
          </div>
          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <div className="text-base font-black text-gray-900">10K+</div>
            <div className="text-[10px] text-gray-500 font-semibold uppercase">Applications</div>
          </div>
        </div>
      </div>

      {/* 2. Get Job Alerts Widget */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <MailOutlineOutlinedIcon className="text-[#b2c359]" sx={{ fontSize: 18 }} />
          <h4 className="font-['Helvetica',Arial,sans-serif] font-bold text-sm text-gray-900">Get Job Alerts</h4>
        </div>
        <p className="text-xs text-gray-500 mb-3">Get the latest real estate jobs in your inbox daily.</p>

        {subscribed ? (
          <div className="bg-lime-50 text-lime-800 p-3 rounded-xl text-xs flex items-center gap-2 font-medium border border-lime-200">
            <CheckCircleOutlineOutlinedIcon className="text-[#b2c359]" sx={{ fontSize: 18 }} />
            <span>Subscribed successfully!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              required
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#b2c359] focus:bg-white transition"
            />
            <button
              type="submit"
              className="w-full bg-[#b2c359] hover:bg-[#9eb047] active:scale-[0.98] text-white font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              SUBSCRIBE
            </button>
          </form>
        )}
      </div>

      {/* 3. Top Hiring Companies Widget */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-['Helvetica',Arial,sans-serif] font-bold text-sm text-gray-900">Top Hiring Companies</h4>
          <Link
            href="/companies"
            className="font-['Helvetica',Arial,sans-serif] font-bold text-[12px] leading-[14px] tracking-[0px] uppercase text-[#b2c359] hover:text-[#84b21d] hover:underline cursor-pointer"
          >
            VIEW ALL
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {topCompanies.slice(0, 6).map((c, index) => {
            return (
              <Link
                key={`${c.name}-${index}`}
                href={`/jobs?company=${encodeURIComponent(c.name)}`}
                title={`View ${c.name} Jobs on Portal`}
                className="bg-slate-50 hover:bg-lime-50/60 p-2 rounded-xl border border-slate-200/80 hover:border-[#b2c359]/60 flex flex-col items-center justify-center text-center transition cursor-pointer group min-h-[72px] shadow-2xs block"
              >
                <div className="h-7 w-full flex items-center justify-center mb-1">
                  {c.logoUrl ? (
                    <img 
                      src={c.logoUrl} 
                      alt={c.name} 
                      className="max-h-6 max-w-[88%] object-contain group-hover:scale-105 transition-transform" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const sibling = e.currentTarget.nextElementSibling;
                        if (sibling) (sibling as HTMLElement).style.display = 'inline';
                      }}
                    />
                  ) : null}
                  <span 
                    style={{ display: c.logoUrl ? 'none' : 'inline' }}
                    className="text-xs font-black text-gray-700 group-hover:text-[#b2c359]"
                  >
                    {c.logo || (c.name ? c.name.slice(0, 8).toUpperCase() : '')}
                  </span>
                </div>
                <span className="text-[9px] text-gray-600 group-hover:text-gray-900 mt-0.5 truncate max-w-full font-semibold block">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Promo Banner Card */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-800 text-white p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-[#080809]">
        <div className="relative z-10 space-y-2.5">
          <h4 className="font-black text-base leading-tight">Build Your Career in Real Estate</h4>
          <p className="text-xs text-gray-300 leading-relaxed font-normal">
            Join the fastest growing industry and be a part of India's real estate transformation.
          </p>
          {onOpenAuth ? (
            <button
              type="button"
              onClick={() => onOpenAuth('JOB_SEEKER', 'REGISTER')}
              className="bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-4 py-2.5 rounded-lg transition shadow inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Opportunities</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
            </button>
          ) : (
            <Link
              href="/register?role=seeker"
              className="bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-['Helvetica',Arial,sans-serif] font-bold text-[14px] leading-[14px] tracking-[0px] uppercase px-4 py-2.5 rounded-lg transition shadow inline-flex items-center gap-1.5"
            >
              <span>Explore Opportunities</span>
              <ArrowForwardOutlinedIcon sx={{ fontSize: 16 }} />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}