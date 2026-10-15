import { getApiBaseUrl } from './apiConfig';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'Notification' in window;
}

export async function getPushSubscriptionState(): Promise<'default' | 'granted' | 'denied' | 'unsupported'> {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function subscribeToPushNotifications(role: string = 'ADMIN', userId: string | null = null): Promise<{ success: boolean; message: string; error?: string }> {
  if (!isPushNotificationSupported()) {
    return { success: false, message: 'Push notifications are not supported on this browser/device.', error: 'UNSUPPORTED' };
  }

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission was denied or dismissed.', error: 'DENIED' };
    }

    // 2. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 3. Fetch VAPID public key from backend
    const apiBase = getApiBaseUrl();
    const keyRes = await fetch(`${apiBase}/notifications/vapid-public-key`);
    if (!keyRes.ok) {
      throw new Error('Failed to retrieve push encryption key from server.');
    }
    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      throw new Error('Server returned an empty VAPID public key.');
    }

    // 4. Subscribe to Push Manager
    const applicationServerKey = urlBase64ToUint8Array(publicKey);
    let subscription = await registration.pushManager.getSubscription();
    
    // If already subscribed, return existing or resubscribe
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any
      });
    }

    // 5. Send subscription to backend API
    const subRes = await fetch(`${apiBase}/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        role,
        userId
      })
    });

    if (!subRes.ok) {
      throw new Error('Backend failed to register device subscription.');
    }

    return {
      success: true,
      message: 'Mobile push notifications enabled! You will receive instant alerts.'
    };
  } catch (err: any) {
    console.error('⚠️ [Push Subscription Error]:', err);
    return {
      success: false,
      message: err.message || 'Failed to enable push notifications.',
      error: err.message
    };
  }
}

export async function sendTestAdminPush(): Promise<{ success: boolean; message: string }> {
  try {
    if (!isPushNotificationSupported()) {
      return { success: false, message: 'Push notifications are not supported on this browser.' };
    }

    // 1. Ensure permission is requested/granted
    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        return { success: false, message: 'Notification permission was denied in browser.' };
      }
    }

    // 2. Register device with backend push service
    try {
      await subscribeToPushNotifications('ADMIN');
    } catch (subErr) {
      console.warn('⚠️ Auto-subscription warning:', subErr);
    }

    // 3. Immediately trigger native OS notification locally so user sees it instantly
    const testTitle = '🔔 Torbit Realty Alert';
    const testOptions: NotificationOptions = {
      body: 'Your device is linked! Instant recruiter registration alerts will pop up here.',
      icon: 'https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png',
      badge: 'https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png',
      tag: 'torbit-test-alert',
      renotify: true
    };

    if ('serviceWorker' in navigator) {
      try {
        const swReg = await navigator.serviceWorker.ready;
        await swReg.showNotification(testTitle, testOptions);
      } catch (e) {
        new Notification(testTitle, testOptions);
      }
    } else {
      new Notification(testTitle, testOptions);
    }

    // 4. Also trigger backend web-push dispatch
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/notifications/test-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: testTitle,
        body: testOptions.body
      })
    });
    const data = await res.json().catch(() => ({}));

    return { 
      success: true, 
      message: data.message || '🔔 Test notification popped up in your notification bar!' 
    };
  } catch (err: any) {
    console.error('⚠️ [sendTestAdminPush Error]:', err);
    return { success: false, message: err.message || 'Failed to trigger test alert.' };
  }
}
