'use client';
import React, { useState, useEffect } from 'react';
import { isPushNotificationSupported, getPushSubscriptionState, subscribeToPushNotifications, sendTestAdminPush } from '@/lib/pushNotifications';
import SmartphoneOutlinedIcon from '@mui/icons-material/SmartphoneOutlined';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';

export default function MobileNotificationBanner() {
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<string>('default');
  const [loading, setLoading] = useState<boolean>(false);
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSup = isPushNotificationSupported();
      setSupported(isSup);
      if (isSup) {
        getPushSubscriptionState().then((perm) => {
          setPermission(perm);
          if (perm === 'granted') {
            subscribeToPushNotifications('ADMIN').catch(() => {});
          }
        });
      }
      const isDismissed = localStorage.getItem('torbit_push_banner_dismissed') === 'true';
      if (isDismissed) setDismissed(true);
    }
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await subscribeToPushNotifications('ADMIN');
      if (res.success) {
        setPermission('granted');
        setStatusMessage('Mobile & tablet push notifications activated for this device.');
      } else {
        setStatusMessage(`Warning: ${res.message}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTestLoading(true);
    setStatusMessage(null);
    try {
      const res = await sendTestAdminPush();
      setStatusMessage(res.success ? '🔔 Test notification sent to your notification bar!' : `⚠️ ${res.message}`);
    } catch (err: any) {
      setStatusMessage(`❌ ${err.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('torbit_push_banner_dismissed', 'true');
  };

  const handleRestore = () => {
    setDismissed(false);
    localStorage.removeItem('torbit_push_banner_dismissed');
  };

  // If dismissed, show a sleek minimized reminder bar so the user can easily re-open it
  if (dismissed) {
    return (
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 text-white rounded-xl text-xs border border-slate-800 my-2 shadow-xs">
        <div className="flex items-center gap-2">
          <NotificationsActiveOutlinedIcon sx={{ fontSize: 16 }} className="text-[#b2c359]" />
          <span className="text-[11px] text-slate-300">
            Recruiter Push Alerts: <strong className="text-white">{permission === 'granted' ? 'Active' : 'Not Configured'}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleRestore}
          className="text-[11px] text-[#b2c359] hover:underline font-bold cursor-pointer"
        >
          Configure Alerts →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 via-neutral-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-800/90 relative overflow-hidden font-['Helvetica',Arial,sans-serif] my-2 transition-all">
      {/* Decorative accent glow */}
      <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#b2c359]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#b2c359]/15 text-[#b2c359] border border-[#b2c359]/30 flex items-center justify-center shrink-0 shadow-xs">
            {permission === 'granted' ? (
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 24 }} />
            ) : (
              <SmartphoneOutlinedIcon sx={{ fontSize: 24 }} />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Mobile & Tablet Recruiter Push Notifications
              </h3>
              {permission === 'granted' ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircleOutlinedIcon sx={{ fontSize: 12 }} />
                  ACTIVE ON THIS DEVICE
                </span>
              ) : permission === 'denied' ? (
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  BLOCKED IN BROWSER
                </span>
              ) : (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  OFFLINE / CLICK TO ENABLE
                </span>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {permission === 'granted'
                ? '✅ This device will receive instant native notifications in the notification bar whenever a recruiter registers or posts a job.'
                : permission === 'denied'
                ? '⚠️ Notifications are currently blocked by your browser. Click the lock/site settings icon in your browser URL bar and change Notifications to "Allow".'
                : 'Turn on push alerts to receive instant notifications in your mobile/tablet notification bar the moment a new recruiter registers on Torbit Realty.'}
            </p>

            {statusMessage && (
              <p className="text-xs text-[#b2c359] font-medium mt-1.5 animate-fadeIn">
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {permission === 'granted' ? (
            <button
              type="button"
              onClick={handleTest}
              disabled={testLoading}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition border border-white/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <NotificationsActiveOutlinedIcon sx={{ fontSize: 16 }} />
              <span>{testLoading ? 'Sending Alert...' : 'Test Alert Now'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleEnable}
              disabled={loading || permission === 'denied'}
              className="bg-[#b2c359] hover:bg-[#a1b248] active:scale-95 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <NotificationsOutlinedIcon sx={{ fontSize: 16 }} />
              <span>{loading ? 'Activating...' : 'Enable Mobile Push'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDismiss}
            title="Minimize Banner"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition hover:bg-white/10 cursor-pointer"
          >
            <CloseOutlinedIcon sx={{ fontSize: 16 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
