'use client';
import React from 'react';
import {
  LayoutDashboard,
  Plus,
  FileText,
  Inbox,
  Building2,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  iconColor?: string;
  badge?: number | string | null;
}

interface RecruiterSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isApproved: boolean;
  companyName?: string;
  workEmail?: string;
  applicantCount?: number;
}

export default function RecruiterSidebar({
  activeTab,
  setActiveTab,
  isApproved,
  companyName = '',
  workEmail = '',
  applicantCount = 0
}: RecruiterSidebarProps) {
  const cleanCompanyName = companyName.replace(/\bDIgital\b/g, 'Digital');
  const initials = (cleanCompanyName || workEmail || 'CP')
    .substring(0, 2)
    .toUpperCase();

  const menuItems: SidebarItem[] = [
    {
      id: 'OVERVIEW',
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-gray-400'
    },
    {
      id: 'CREATE_JOB',
      label: '+ Create Job',
      icon: Plus,
      iconColor: 'text-[#b2c359]'
    },
    {
      id: 'JOBS',
      label: 'My Job Listings',
      icon: FileText,
      iconColor: 'text-slate-200'
    },
    {
      id: 'APPLICANTS',
      label: 'Applications',
      icon: Inbox,
      iconColor: 'text-amber-500',
      badge: applicantCount > 0 ? applicantCount : null
    },
    {
      id: 'PROFILE',
      label: 'Company Profile',
      icon: Building2,
      iconColor: 'text-slate-300'
    },
    {
      id: 'SETTINGS',
      label: 'Settings',
      icon: Settings,
      iconColor: 'text-cyan-400'
    }
  ];

  return (
    <aside className="hidden md:flex w-64 lg:w-72 bg-[#16181D] text-gray-300 flex-col justify-between shrink-0 border-r border-gray-800 select-none min-h-screen sticky top-0 h-screen z-20 font-['Helvetica',Arial,sans-serif]">
      {/* Navigation List */}
      <nav className="px-5 pt-7 pb-4 space-y-2 overflow-y-auto flex-1">
        <div className="px-3.5 text-[11px] font-extrabold tracking-wider text-[#94A3B8] uppercase mb-2">
          RECRUITER WORKSPACE
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-[#b2c359]/15 text-[#b2c359] font-black shadow-xs'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-white/5 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#b2c359]' : item.iconColor || 'text-gray-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive
                      ? 'bg-[#b2c359] text-[#080809]'
                      : 'bg-[#DC2626] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Company Bottom User Row matching Admin & Seeker Sidebars */}
      <div className="p-4 border-t border-gray-800/80 bg-[#121418] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 text-[#b2c359] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
            {initials || 'CP'}
          </div>
          <div className="min-w-0">
            {cleanCompanyName ? (
              <>
                <div className="text-[13px] font-bold text-white truncate leading-tight">
                  {cleanCompanyName}
                </div>
                <div className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
                  {workEmail}
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
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('torbit_remember_me');
              localStorage.removeItem('torbit_last_active_role');
              localStorage.removeItem('torbit_session_saved_at');
              try { sessionStorage.clear(); } catch (e) {}
              window.location.href = '/?view=home';
            }
          }}
          title="Sign Out / Logout"
          className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/15 transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
