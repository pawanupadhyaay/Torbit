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
  companyName = 'DLF Limited',
  workEmail = 'hr@dlf.in',
  applicantCount = 0
}: RecruiterSidebarProps) {
  const cleanCompanyName = companyName.replace(/\bDIgital\b/g, 'Digital');

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
      iconColor: 'text-[#94C322]'
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
    <aside className="hidden md:flex w-64 sm:w-72 bg-[#080809] text-gray-300 flex-col justify-between shrink-0 border-r border-gray-800/90 select-none min-h-screen sticky top-0 h-screen z-20 font-['Helvetica',Arial,sans-serif]">
      {/* Navigation List */}
      <nav className="p-4 space-y-1.5 overflow-y-auto flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-bold transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-[#94C322] text-[#080809] font-black shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#080809]' : item.iconColor || 'text-gray-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`w-5 h-5 rounded-full text-[11px] font-black flex items-center justify-center shadow-xs shrink-0 ${
                    isActive
                      ? 'bg-[#080809] text-white'
                      : 'bg-[#94C322] text-[#080809]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Company Bottom User Row matching Admin Sidebar */}
      <div className="p-4 border-t border-gray-800/80 bg-[#121418] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 text-[#94C322] font-black flex items-center justify-center text-xs shadow-xs shrink-0">
            {cleanCompanyName.substring(0, 2).toUpperCase() || 'DL'}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-white truncate leading-tight">
              {cleanCompanyName}
            </div>
            <div className="text-[11px] text-gray-400 truncate leading-tight mt-0.5">
              {workEmail}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
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
