'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import AuthModal from '@/common/AuthModal';
import MobileBottomBar from '@/common/MobileBottomBar';
import JobFilterBar from '@/common/JobFilterBar';
import { DEPARTMENT_CATEGORIES } from '@/lib/constants';
import { 
  Search, 
  ArrowRight, 
  Briefcase, 
  Compass, 
  Layers, 
  DollarSign, 
  Home, 
  HardHat, 
  Megaphone, 
  Users, 
  Scale, 
  Code, 
  Sparkles, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const getCategoryIcon = (name: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('market') || n.includes('digital')) return Megaphone;
  if (n.includes('construct') || n.includes('project') || n.includes('civil') || n.includes('quality') || n.includes('hse')) return HardHat;
  if (n.includes('property') || n.includes('estate') || n.includes('leasing') || n.includes('facility')) return Home;
  if (n.includes('finance') || n.includes('account') || n.includes('invest') || n.includes('valuation')) return DollarSign;
  if (n.includes('human') || n.includes('hr') || n.includes('recruit') || n.includes('admin') || n.includes('relations') || n.includes('customer')) return Users;
  if (n.includes('it') || n.includes('tech') || n.includes('proptech') || n.includes('product')) return Code;
  if (n.includes('legal') || n.includes('complian') || n.includes('law') || n.includes('liaison') || n.includes('approvals')) return Scale;
  if (n.includes('architect') || n.includes('design') || n.includes('land')) return Layers;
  if (n.includes('strategy') || n.includes('leadership') || n.includes('advisory') || n.includes('research')) return Compass;
  return Briefcase;
};

const getCategoryColor = (name: string) => {
  const n = (name || '').toLowerCase();
  if (n.includes('sales') || n.includes('pre-sales')) return '#10B981';
  if (n.includes('market') || n.includes('digital') || n.includes('creative')) return '#F97316';
  if (n.includes('construct') || n.includes('project') || n.includes('land')) return '#0D9488';
  if (n.includes('property') || n.includes('leasing') || n.includes('facility')) return '#EA580C';
  if (n.includes('finance') || n.includes('account') || n.includes('invest') || n.includes('valuation')) return '#2563EB';
  if (n.includes('human') || n.includes('hr') || n.includes('admin')) return '#EC4899';
  if (n.includes('it') || n.includes('tech') || n.includes('proptech')) return '#6366F1';
  if (n.includes('legal') || n.includes('liaison')) return '#8B5CF6';
  if (n.includes('architect') || n.includes('design')) return '#14B8A6';
  if (n.includes('strategy') || n.includes('leadership')) return '#F59E0B';
  return '#10B981';
};

export default function CategoriesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriesData, setCategoriesData] = useState<Array<{ id: string; name: string; jobCount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'JOB_SEEKER' | 'RECRUITER' | null>(null);
  const [authTab, setAuthTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/jobs');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategoriesData(data.categories);
          } else {
            const built = (DEPARTMENT_CATEGORIES as unknown as string[]).map((catName, idx) => ({
              id: `cat-${idx}`,
              name: catName,
              jobCount: 0
            }));
            setCategoriesData(built);
          }
        }
      } catch (e) {
        const built = (DEPARTMENT_CATEGORIES as unknown as string[]).map((catName, idx) => ({
          id: `cat-${idx}`,
          name: catName,
          jobCount: 0
        }));
        setCategoriesData(built);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterJobType, setFilterJobType] = useState('All Job Types');
  const [filterWorkMode, setFilterWorkMode] = useState('All Work Modes');

  const allCategoriesMap = new Map<string, number>();
  (DEPARTMENT_CATEGORIES as unknown as string[]).forEach(name => {
    allCategoriesMap.set(name, 0);
  });
  categoriesData.forEach(c => {
    allCategoriesMap.set(c.name, c.jobCount || 0);
  });

  const fullCategoryList = Array.from(allCategoriesMap.entries()).map(([name, jobCount], idx) => ({
    id: `cat-${idx}`,
    name,
    jobCount
  }));

  const filteredList = fullCategoryList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesCategory = filterCategory === 'All Categories' || c.name.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleFilterSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (filterLocation && filterLocation !== 'All Locations') params.set('location', filterLocation);
    if (filterCategory && filterCategory !== 'All Categories') params.set('category', filterCategory);
    if (filterJobType && filterJobType !== 'All Job Types') params.set('jobType', filterJobType);
    if (filterWorkMode && filterWorkMode !== 'All Work Modes') params.set('workMode', filterWorkMode);

    const qs = params.toString();
    router.push(qs ? `/jobs?${qs}` : '/jobs');
  };

  const handleOpenAuth = (role: 'JOB_SEEKER' | 'RECRUITER' | null = null, tab: 'LOGIN' | 'REGISTER' = 'LOGIN') => {
    setAuthRole(role);
    setAuthTab(tab);
    setAuthOpen(true);
  };

  const handleAuthSuccess = (user: any) => {
    if (user?.role === 'JOB_SEEKER') {
      const seekerId = user.seekerProfile?.id || (user.id ? `TOR-JS-${user.id.slice(-6).toUpperCase()}` : 'TOR-JS-ME');
      const pendingJobId = typeof window !== 'undefined' ? (sessionStorage.getItem('torbit_pending_apply_job_id') || localStorage.getItem('torbit_pending_apply_job_id')) : null;
      if (pendingJobId) {
        try {
          sessionStorage.removeItem('torbit_pending_apply_job_id');
          localStorage.removeItem('torbit_pending_apply_job_id');
        } catch (e) {}
        window.location.href = `/seeker/dashboard/${seekerId}?applyJobId=${encodeURIComponent(pendingJobId)}`;
      } else {
        window.location.href = `/seeker/dashboard/${seekerId}`;
      }
    } else if (user?.role === 'RECRUITER' || user?.role === 'COMPANY') {
      const recId = user.companyProfile?.gstNumber || user.companyProfile?.id || user.id;
      window.location.href = recId ? `/recruiter/dashboard/${recId}` : '/recruiter/dashboard';
    } else if (user?.role === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/jobs?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-20 lg:pb-0 font-['Helvetica',Arial,sans-serif]">
      <Header onOpenAuth={handleOpenAuth} />

      {/* Hero / Header Banner */}
      <section className="bg-[#0c1424] text-white py-6 sm:py-10 lg:py-12 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-15 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c1424] via-[#0c1424]/95 to-[#0c1424]/85 z-0" />

        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5 sm:mb-3">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#b2c359] font-semibold">Job Categories</span>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Explore <span className="text-[#b2c359]">Job Categories</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-normal">
              Browse verified vacancies across top companies, recruiters, and industry leaders.
            </p>
          </div>

          {/* Integrated Multi-Filter Search Bar */}
          <div className="mt-4 sm:mt-6">
            <JobFilterBar
              keyword={searchTerm}
              setKeyword={setSearchTerm}
              location={filterLocation}
              setLocation={setFilterLocation}
              category={filterCategory}
              setCategory={setFilterCategory}
              jobType={filterJobType}
              setJobType={setFilterJobType}
              workMode={filterWorkMode}
              setWorkMode={setFilterWorkMode}
              onSubmit={handleFilterSubmit}
              id="categories-filter-bar"
            />
          </div>
        </div>
      </section>

      {/* Main Categories Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-base sm:text-xl font-bold text-slate-900">
              All Job Categories {searchTerm ? `("${searchTerm}")` : ''}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Showing {filteredList.length} verified specializations
            </p>
          </div>

          <Link
            href="/jobs"
            className="text-xs sm:text-sm font-bold text-[#9eb047] hover:text-[#b2c359] flex items-center gap-1 transition shrink-0"
          >
            <span>All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Categories Grid Cards: 2 Columns on Mobile, 4 on Desktop */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center min-h-[260px] shadow-xs">
            <div className="w-10 h-10 border-[3px] border-slate-200 border-t-[#b2c359] rounded-full animate-spin mb-3"></div>
            <h3 className="text-sm font-bold text-slate-800">Loading career categories...</h3>
            <p className="text-xs text-slate-400 mt-1">Fetching verified specializations and real-time openings</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-md mx-auto">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">No categories found</h3>
            <p className="text-xs text-slate-500 mt-1">No specializations matched &quot;{searchTerm}&quot;.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
            {filteredList.map((cat) => {
              const IconComponent = getCategoryIcon(cat.name);
              const color = getCategoryColor(cat.name);

              return (
                <div
                  key={cat.id || cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="bg-white hover:bg-lime-50/40 p-3 sm:p-4 rounded-2xl border border-slate-200/80 hover:border-[#b2c359] shadow-2xs hover:shadow-xs transition-all duration-200 group cursor-pointer flex flex-col justify-between active:scale-[0.98]"
                >
                  <div>
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition group-hover:scale-105 shrink-0"
                        style={{ backgroundColor: `${color}15`, color: color }}
                      >
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-[#b2c359] group-hover:text-[#080809] transition">
                        {cat.jobCount} {cat.jobCount === 1 ? 'Job' : 'Jobs'}
                      </span>
                    </div>

                    {/* Category Title */}
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#9eb047] transition leading-snug line-clamp-2 min-h-[34px]">
                      {cat.name}
                    </h3>
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-[#9eb047] group-hover:text-[#b2c359]">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner (Mobile Responsive) */}
        <div className="mt-8 sm:mt-12 bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[#b2c359] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Job Portal</span>
            </div>
            <h3 className="text-sm sm:text-lg font-bold">
              Looking for talent in these categories?
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 max-w-xl">
              Post verified openings directly to top active job seekers.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
            <Link
              href="/register?role=recruiter"
              className="flex-1 sm:flex-none bg-[#b2c359] hover:bg-[#9eb047] text-[#080809] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-xs whitespace-nowrap text-center"
            >
              Post a Job
            </Link>
            <Link
              href="/jobs"
              className="flex-1 sm:flex-none border border-slate-700 hover:border-slate-500 bg-slate-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition whitespace-nowrap text-center"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <MobileBottomBar onOpenAuth={handleOpenAuth} />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultRole={authRole}
        defaultTab={authTab}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
