'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

interface MobileBottomBarProps {
  onOpenAuth?: (role?: 'JOB_SEEKER' | 'RECRUITER' | null, tab?: 'LOGIN' | 'REGISTER') => void;
  onSearchFocus?: () => void;
}

export default function MobileBottomBar({ onOpenAuth }: MobileBottomBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        setCurrentUser(JSON.parse(stored));
      } else {
        const adminStored = localStorage.getItem('adminUser');
        const adminToken = localStorage.getItem('adminToken');
        if (adminStored && adminToken) {
          setCurrentUser(JSON.parse(adminStored));
        }
      }
    } catch (e) {}
  }, []);

  const role = currentUser?.role;
  const isRecruiter = role === 'RECRUITER';
  const isAdmin = role === 'ADMIN';

  const dashboardUrl = isRecruiter
    ? '/recruiter/dashboard'
    : isAdmin
    ? '/admin/dashboard'
    : '/seeker/dashboard';

  const postJobUrl = isRecruiter
    ? '/recruiter/dashboard?tab=post-job'
    : isAdmin
    ? '/admin/dashboard'
    : '/register?role=recruiter';

  const handleAccountClick = () => {
    if (currentUser) {
      router.push(dashboardUrl);
    } else if (onOpenAuth) {
      onOpenAuth(null, 'LOGIN');
    } else {
      router.push('/login');
    }
  };

  const isHomeActive = pathname === '/' || pathname === '';
  const isJobsActive = pathname?.startsWith('/jobs');
  const isExploreActive = pathname?.startsWith('/categories');
  const isAccountActive = pathname?.includes('dashboard');

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 pt-1 pb-1.5 sm:py-2 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] font-['Helvetica',Arial,sans-serif] select-none">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] active:scale-95 transition group ${
            isHomeActive ? 'text-[#9eb047]' : 'text-slate-700 hover:text-[#b2c359]'
          }`}
        >
          <HomeOutlinedIcon className={isHomeActive ? 'text-[#9eb047]' : 'text-slate-700 group-hover:text-[#b2c359]'} sx={{ fontSize: 22 }} />
          <span className={`text-[10px] sm:text-[10.5px] font-bold mt-0.5 tracking-tight ${isHomeActive ? 'text-[#9eb047]' : ''}`}>
            Home
          </span>
        </Link>

        {/* 2. Jobs */}
        <Link
          href="/jobs"
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] active:scale-95 transition group ${
            isJobsActive ? 'text-[#9eb047]' : 'text-slate-700 hover:text-[#b2c359]'
          }`}
        >
          <SearchOutlinedIcon className={isJobsActive ? 'text-[#9eb047]' : 'text-slate-700 group-hover:text-[#b2c359]'} sx={{ fontSize: 22 }} />
          <span className={`text-[10px] sm:text-[10.5px] font-bold mt-0.5 tracking-tight ${isJobsActive ? 'text-[#9eb047]' : ''}`}>
            Jobs
          </span>
        </Link>

        {/* 3. Center CTA: Post Job */}
        <Link
          href={postJobUrl}
          className="flex flex-col items-center justify-center -mt-5 bg-[#080809] text-white p-2.5 rounded-full shadow-xl border-[2.5px] border-white hover:bg-slate-900 active:scale-90 transition group"
          aria-label="Post a Job"
        >
          <AddCircleOutlineOutlinedIcon className="text-[#b2c359] group-hover:scale-110 transition" sx={{ fontSize: 22 }} />
          <span className="text-[9px] font-black text-[#b2c359] mt-0.5 leading-none uppercase tracking-wider">POST</span>
        </Link>

        {/* 4. Explore / Categories */}
        <Link
          href="/categories"
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] active:scale-95 transition group ${
            isExploreActive ? 'text-[#9eb047]' : 'text-slate-700 hover:text-[#b2c359]'
          }`}
        >
          <GridViewOutlinedIcon className={isExploreActive ? 'text-[#9eb047]' : 'text-slate-700 group-hover:text-[#b2c359]'} sx={{ fontSize: 22 }} />
          <span className={`text-[10px] sm:text-[10.5px] font-bold mt-0.5 tracking-tight ${isExploreActive ? 'text-[#9eb047]' : ''}`}>
            Explore
          </span>
        </Link>

        {/* 5. Account */}
        <button
          type="button"
          onClick={handleAccountClick}
          className={`flex flex-col items-center justify-center p-1 min-w-[54px] active:scale-95 transition group cursor-pointer ${
            isAccountActive ? 'text-[#9eb047]' : 'text-slate-700 hover:text-[#b2c359]'
          }`}
        >
          <PersonOutlineOutlinedIcon className={isAccountActive ? 'text-[#9eb047]' : 'text-slate-700 group-hover:text-[#b2c359]'} sx={{ fontSize: 22 }} />
          <span className={`text-[10px] sm:text-[10.5px] font-bold mt-0.5 tracking-tight ${isAccountActive ? 'text-[#9eb047]' : ''}`}>
            {currentUser ? 'Account' : 'Login'}
          </span>
        </button>
      </div>
    </div>
  );
}
