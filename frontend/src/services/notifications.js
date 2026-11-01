/**
 * Web Push Notifications Service for LifeOS PWA
 */

export const isPushSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
};

export const getNotificationPermission = () => {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    return { granted: false, reason: 'Notifications not supported on this browser/device' };
  }

  try {
    const permission = await Notification.requestPermission();
    return {
      granted: permission === 'granted',
      permission,
    };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false, error };
  }
};

export const sendLocalNotification = (title, body, tag = 'lifeos-alert') => {
  if (!isPushSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const options = {
      body,
      icon: '/pwa-192x192.png',
      badge: '/favicon-64x64.png',
      tag,
      vibrate: [100, 50, 100],
      data: {
        url: window.location.origin,
      },
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
    return true;
  } catch (e) {
    console.warn('Failed to send notification:', e);
    return false;
  }
};

export const registerPushSubscription = async (supabase, userId) => {
  if (!isPushSupported() || !supabase || !userId) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // In production with VAPID key:
      // subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
    }

    if (subscription) {
      await supabase
        .from('profiles')
        .update({ push_subscription: subscription, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    return subscription;
  } catch (err) {
    console.warn('Push registration note (VAPID optional in local mode):', err);
    return null;
  }
};

