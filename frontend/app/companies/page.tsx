'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import AuthModal from '@/common/AuthModal';
import MobileBottomBar from '@/common/MobileBottomBar';
import {
  Search,
  Building2,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
  MapPin,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface CompanyBrand {
  name: string;
  logo?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

const DEFAULT_COMPANIES: CompanyBrand[] = [
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
  }
];

export default function CompaniesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<CompanyBrand[]>(DEFAULT_COMPANIES);
  const [companyJobCounts, setCompanyJobCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  // Auth modal state for Header triggers
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const handleOpenAuth = (role?: any, tab?: any) => {
    if (role) setAuthRole(role);
    if (tab) setAuthTab(tab);
    setAuthOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch configured companies from admin settings
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error('Settings fetch failed');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.settings?.specialJobCompanies && Array.isArray(data.settings.specialJobCompanies)) {
          const normalized: CompanyBrand[] = data.settings.specialJobCompanies
            .map((c: any) => {
              if (typeof c === 'string') {
                const trimmed = c.trim();
                return { name: trimmed, logo: trimmed.slice(0, 8).toUpperCase(), logoUrl: '', websiteUrl: '' };
              }
              const name = (c.name || '').trim();
              return {
                name,
                logo: c.logo || (name ? name.slice(0, 8).toUpperCase() : ''),
                logoUrl: c.logoUrl || '',
                websiteUrl: c.websiteUrl || ''
              };
            })
            .filter((c: any) => c && c.name);

          if (normalized.length > 0) {
            setCompanies(normalized);
          }
        }
      })
      .catch(() => {
        // Fallback to default companies
      });

    // 2. Fetch live jobs to count vacancies per company
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.jobs && Array.isArray(data.jobs)) {
          const map = new Map<string, number>();
          data.jobs.forEach((j: any) => {
            const compName = (j.company?.companyName || '').toLowerCase().trim();
            if (compName) {
              map.set(compName, (map.get(compName) || 0) + 1);
            }
          });
          setCompanyJobCounts(map);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter companies based on search
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    const q = searchTerm.toLowerCase().trim();
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-20 lg:pb-0 font-['Helvetica',Arial,sans-serif]">
      <Header onOpenAuth={handleOpenAuth} />

      {/* Top Hero Section */}
      <section className="bg-[#0c1424] text-white py-8 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b2c359_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#b2c359] font-semibold">Top Hiring Companies</span>
          </div>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b2c359]/20 text-[#b2c359] text-xs font-bold mb-3 border border-[#b2c359]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>VERIFIED REAL ESTATE ENTERPRISES</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Top Hiring <span className="text-[#b2c359]">Companies &amp; Builders</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Explore exclusive career opportunities with India&apos;s most reputed builders, developers, and real estate enterprises. Apply directly through the portal with full confidentiality.
            </p>
          </div>

          {/* Search Box */}
          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search builder, developer, or company name..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b2c359] focus:bg-white/15 transition shadow-lg"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Enterprise Brands ({filteredCompanies.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any company to see all active job listings and vacancies
            </p>
          </div>

          <Link
            href="/jobs"
            className="text-xs font-bold text-[#658A0D] hover:text-[#b2c359] inline-flex items-center gap-1 transition"
          >
            <span>Browse All Jobs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center min-h-[260px] shadow-xs">
            <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#b2c359] rounded-full animate-spin mb-3"></div>
            <h3 className="text-sm font-bold text-slate-800">Loading enterprise brands...</h3>
            <p className="text-xs text-slate-400 mt-1">Connecting to verified employers and active positions</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">No Companies Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No enterprise brands match &quot;{searchTerm}&quot;.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredCompanies.map((c, index) => {
              const count = companyJobCounts.get(c.name.toLowerCase().trim()) || 0;

              return (
                <div
                  key={`${c.name}-${index}`}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#b2c359] hover:shadow-lg transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header with Logo and Verified Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                        {c.logoUrl ? (
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="max-h-12 max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const sibling = e.currentTarget.parentElement?.querySelector('.fallback-badge');
                              if (sibling) (sibling as HTMLElement).style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span
                          style={{ display: c.logoUrl ? 'none' : 'flex' }}
                          className="fallback-badge w-full h-full items-center justify-center text-xs font-black text-slate-700 bg-slate-100 rounded"
                        >
                          {c.logo || (c.name ? c.name.slice(0, 8).toUpperCase() : 'CO')}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Builder</span>
                      </span>
                    </div>

                    {/* Company Name and Details */}
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#658A0D] transition leading-tight">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>Real Estate &amp; Infrastructure Enterprise</span>
                      </p>
                    </div>

                    {/* Open Positions Counter */}
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Active Portal Openings:</span>
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                        {count > 0 ? `${count} Openings` : 'Explore Jobs'}
                      </span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/jobs?company=${encodeURIComponent(c.name)}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold text-xs rounded-xl shadow-xs transition group-hover:shadow-md cursor-pointer"
                    >
                      <span>View Open Jobs</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {c.websiteUrl && (
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Visit official careers website"
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-10 sm:mt-14 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl border border-slate-800">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-[#b2c359] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Recruitment Portal</span>
            </div>
            <h3 className="text-base sm:text-xl font-extrabold text-white">
              Are you an authorized recruiter at an enterprise developer?
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Post verified openings directly to over 50,000 active real estate professionals.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center shrink-0">
            <Link
              href="/register?role=recruiter"
              className="bg-[#b2c359] hover:bg-[#9eb047] text-slate-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap text-center"
            >
              Post Developer Jobs
            </Link>
            <Link
              href="/jobs"
              className="border border-slate-700 hover:border-slate-500 bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition whitespace-nowrap text-center"
            >
              All Openings
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomBar onOpenAuth={handleOpenAuth} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultRole={authRole}
        defaultTab={authTab}
      />
    </div>
  );
}
