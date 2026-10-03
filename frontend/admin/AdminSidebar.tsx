'use client';
import React from 'react';
import Link from 'next/link';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number | null;
  badgeColor?: string;
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
}

export default function AdminSidebar({ activeTab, setActiveTab, pendingCount }: AdminSidebarProps) {
  const menuGroups: MenuGroup[] = [
    {
      group: 'MODERATION & OPERATIONS',
      items: [
        { id: 'OVERVIEW', label: 'Console Overview', icon: DashboardOutlinedIcon, badge: null },
        {
          id: 'APPROVALS',
          label: 'KYC Approvals Queue',
          icon: VerifiedUserOutlinedIcon,
          badge: pendingCount > 0 ? `${pendingCount} Pending` : null,
          badgeColor: 'bg-amber-500 text-slate-950 font-bold'
        },
        { id: 'COMPANIES', label: 'Company Directory', icon: CorporateFareOutlinedIcon, badge: null },
        { id: 'SEEKERS', label: 'Candidate Pool', icon: PeopleAltOutlinedIcon, badge: null },
        { id: 'JOBS', label: 'Job Governance', icon: WorkOutlineOutlinedIcon, badge: null },
      ]
    },
    {
      group: 'DOMAIN TAXONOMY',
      items: [
        { id: 'CATEGORIES', label: 'RE Categories', icon: LayersOutlinedIcon, badge: null },
        { id: 'ANALYTICS', label: 'Hiring & CTC Trends', icon: TrendingUpOutlinedIcon, badge: null },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#080809] text-slate-200 flex flex-col shrink-0 border-r border-slate-800/90 select-none min-h-screen font-['Helvetica',Arial,sans-serif] sticky top-0 h-screen z-30">
      {/* Brand & Logo */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex items-center justify-between gap-2">
            <div className="bg-white rounded-lg px-2.5 py-1 flex items-center shadow-xs">
              <img
                src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
                alt="Torbit Realty"
                className="h-6 w-auto object-contain max-w-[130px]"
              />
            </div>
            <span className="bg-[#b2c359] text-[#080809] text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase shrink-0">
              ADMIN
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">Enterprise Master Console</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="px-3.5 text-[12px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              {group.group}
            </div>
            {group.items.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-bold transition-all duration-150 tracking-wide ${
                    isActive
                      ? 'bg-[#b2c359] text-[#080809] font-black shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent sx={{ fontSize: 19 }} className={isActive ? 'text-[#080809]' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-slate-950 text-white' : 'bg-slate-800 text-slate-300')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* External Portal Links */}
      <div className="p-3 border-t border-slate-800/80 space-y-1">
        <Link
          href="/"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition"
        >
          <div className="flex items-center gap-2">
            <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} className="text-[#b2c359]" />
            <span>Torbit Job Portal</span>
          </div>
          <span className="text-[10px] text-slate-400">↗</span>
        </Link>
      </div>

      {/* Admin Profile Bottom */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800 text-[#b2c359] flex items-center justify-center text-xs font-bold shrink-0">
            SA
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">Super Admin</div>
            <div className="text-[10px] text-slate-400 truncate">admin@torbit.in</div>
          </div>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('torbit_remember_me');
            localStorage.removeItem('torbit_last_active_role');
            localStorage.removeItem('torbit_session_saved_at');
            try { sessionStorage.clear(); } catch (e) {}
            window.location.href = '/?view=home';
          }}
          title="Logout Admin"
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition cursor-pointer"
        >
          <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </aside>
  );
}