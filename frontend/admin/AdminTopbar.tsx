'use client';
import React from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

interface AdminTopbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  activeTab: string;
  pendingCount: number;
}

export default function AdminTopbar({
  searchQuery,
  setSearchQuery,
  onRefresh,
  activeTab,
  pendingCount
}: AdminTopbarProps) {
  const [notificationMenuOpen, setNotificationMenuOpen] = React.useState(false);
  const [pushGranted, setPushGranted] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushGranted(Notification.permission === 'granted');
    }
  }, []);
  const getTabTitle = () => {
    switch (activeTab) {
      case 'OVERVIEW': return 'Enterprise Console Overview';
      case 'APPROVALS': return 'Company KYC Moderation Queue';
      case 'COMPANIES': return 'Registered Builders & Employers Directory';
      case 'SEEKERS': return 'Real Estate Candidate Master Pool';
      case 'JOBS': return 'Job Listings Governance & Feature Control';
      case 'CATEGORIES': return 'Real Estate Categories Master';
      case 'ANALYTICS': return 'Hiring & CTC Intelligence';
      default: return 'Admin Console';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200/90 px-6 flex items-center justify-between sticky top-0 z-30 font-['Helvetica',Arial,sans-serif]">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-gray-900 tracking-tight">{getTabTitle()}</h1>
            <span className="bg-lime-50 text-[#9eb047] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-lime-200">
              PROD
            </span>
          </div>
          <span className="text-[11px] text-gray-400">Torbit Realty Enterprise Suite</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-64 md:w-80">
          <SearchOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, GSTIN, candidate, job..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#b2c359] focus:bg-white transition"
          />
        </div>

        <button
          onClick={onRefresh}
          title="Refresh Live Data"
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition border border-gray-200 flex items-center justify-center"
        >
          <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
        </button>

        <div className="relative">
          <button
            onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
            title="Notifications"
            className={`p-2 rounded-xl transition border flex items-center justify-center relative cursor-pointer ${
              notificationMenuOpen
                ? 'bg-gray-900 text-[#b2c359] border-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border-gray-200'
            }`}
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {pendingCount}
              </span>
            )}
          </button>

          {/* Notification Popover */}
          {notificationMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">Push & System Alerts</span>
                  <span className="bg-[#b2c359]/20 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded">LIVE</span>
                </div>
                <button
                  onClick={() => setNotificationMenuOpen(false)}
                  className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Push Status Box */}
              <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-700">📱 Mobile/Tablet Push:</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    pushGranted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {pushGranted ? 'ACTIVATED' : 'NOT LINKED'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {pushGranted
                    ? 'This browser will receive instant alerts in the device notification bar when recruiters register.'
                    : 'Link this device to get alerts in your notification bar even when browser is closed.'}
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  {!pushGranted ? (
                    <button
                      onClick={async () => {
                        const { subscribeToPushNotifications } = await import('./lib/pushNotifications');
                        const res = await subscribeToPushNotifications('ADMIN');
                        if (res.success) setPushGranted(true);
                      }}
                      className="w-full bg-[#080809] hover:bg-black text-[#b2c359] text-[11px] font-bold py-1.5 rounded-lg transition"
                    >
                      Enable Push on This Device
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const { sendTestAdminPush } = await import('./lib/pushNotifications');
                        await sendTestAdminPush();
                      }}
                      className="w-full bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 text-[11px] font-bold py-1.5 rounded-lg transition shadow-xs"
                    >
                      Send Test Alert to Phone
                    </button>
                  )}
                </div>
              </div>

              {/* KYC Pending reminder */}
              {pendingCount > 0 ? (
                <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  <div className="text-[11px] font-bold">⚠️ {pendingCount} Recruiter(s) Awaiting KYC Approval</div>
                  <div className="text-[10px] text-amber-700 mt-0.5">Review credentials & GST in the moderation queue.</div>
                </div>
              ) : (
                <div className="mt-3 text-center py-2 text-[11px] text-gray-400">
                  No pending recruiter moderation tasks. All clear!
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 rounded-xl bg-[#080809] text-[#b2c359] flex items-center justify-center text-xs font-bold shadow-xs">
            SA
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-gray-900 leading-none">Super Admin</div>
            <div className="text-[10px] text-emerald-600 font-bold leading-none mt-0.5">Authorized</div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('adminToken');
              localStorage.removeItem('adminUser');
              try { sessionStorage.clear(); } catch (e) {}
              window.location.href = '/?view=home';
            }}
            title="Sign Out"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1 cursor-pointer"
          >
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
    </header>
  );
}