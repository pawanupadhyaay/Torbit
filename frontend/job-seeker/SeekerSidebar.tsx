'use client';
import React from 'react';
import Link from 'next/link';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

interface SeekerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appliedCount: number;
  profileName?: string;
  profileEmail?: string;
  profileScore?: number;
  avatarUrl?: string;
}

export default function SeekerSidebar({
  activeTab,
  setActiveTab,
  appliedCount,
  profileName = '',
  profileEmail = '',
  profileScore = 0,
  avatarUrl
}: SeekerSidebarProps) {
  const cleanName = profileName && profileName !== 'Registered Candidate' ? profileName : (profileEmail ? profileEmail.split('@')[0] : '');
  const initials = (cleanName || profileEmail || 'JS')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('torbit_remember_me');
    localStorage.removeItem('torbit_last_active_role');
    localStorage.removeItem('torbit_session_saved_at');
    try { sessionStorage.clear(); } catch (e) {}
    window.location.href = '/?view=home';
  };

  const navItems = [
    {
      id: 'OVERVIEW',
      label: 'Dashboard',
      icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} className={activeTab === 'OVERVIEW' ? 'text-[#b2c359]' : 'text-amber-400'} />,
      hasActiveDot: true
    },
    {
      id: 'PROFILE',
      label: 'My Profile',
      icon: <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} className="text-blue-400" />,
      badge: `${profileScore}%`,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'BROWSE',
      label: 'Browse Jobs',
      icon: <SearchOutlinedIcon sx={{ fontSize: 20 }} className="text-teal-400" />
    },
    {
      id: 'APPLICATIONS',
      label: 'Applied Jobs',
      icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 20 }} className="text-[#b2c359]" />,
      badge: appliedCount > 0 ? appliedCount : null,
      badgeColor: 'bg-[#DC2626] text-white'
    },
    {
      id: 'ALERTS',
      label: 'Job Alerts',
      icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} className="text-amber-400" />
    }
  ];

  return (
    <aside className="hidden md:flex w-64 lg:w-72 bg-[#16181D] text-gray-300 flex-col justify-between shrink-0 border-r border-gray-800 select-none font-['Helvetica',Arial,sans-serif] sticky top-0 h-screen z-30">
      <nav className="px-5 pt-7 pb-4 space-y-2 overflow-y-auto flex-1">
        <div className="px-3.5 text-[11px] font-extrabold tracking-wider text-[#94A3B8] uppercase mb-2">
          CANDIDATE WORKSPACE
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-[#b2c359]/15 text-[#b2c359] font-black shadow-xs'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.hasActiveDot && (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                      isActive ? 'bg-[#b2c359] shadow-[0_0_8px_#b2c359]' : 'bg-transparent'
                    }`}
                  />
                )}
                {item.icon}
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  suppressHydrationWarning
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="p-4 border-t border-gray-800/80 bg-[#121418] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profileName}
              className="w-9 h-9 rounded-xl object-cover border border-[#b2c359]/50 shadow-xs shrink-0"
            />
          ) : (
            <div suppressHydrationWarning className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 text-[#b2c359] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
              {initials || 'JS'}
            </div>
          )}
          <div className="min-w-0">
            {cleanName ? (
              <>
                <div suppressHydrationWarning className="text-[13px] font-bold text-white truncate leading-tight">
                  {cleanName}
                </div>
                <div suppressHydrationWarning className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                  {profileEmail}
                </div>
              </>
            ) : (
              <div className="space-y-1.5 py-0.5">
                <div className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
                <div className="h-2.5 w-28 bg-gray-900 rounded animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Log Out"
          className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/15 transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
        </button>
      </div>
    </aside>
  );
}
